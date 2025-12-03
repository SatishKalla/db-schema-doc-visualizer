import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { EMB_MODEL, GOOGLE_API_KEY } from "../config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { supabase } from "../clients/supabase-client";
import logger from "./logger";

class CustomSupabaseVectorStore extends SupabaseVectorStore {
  async similaritySearchVectorWithScore(
    query: number[],
    k: number,
    filter?: any
  ) {
    const matchThreshold = (this.filter as any)?.score_threshold || 0;
    const filterObj = {
      ...((this.filter as any)?.filter || {}),
      match_threshold: matchThreshold,
    };
    const { data, error } = await (this as any).client.rpc("match_documents", {
      filter: filterObj,
      match_count: k,
      query_embedding: query,
    });
    if (error) throw error;
    return data.map((row: any) => [
      new Document({ pageContent: row.content, metadata: row.metadata }),
      row.similarity,
    ]);
  }
}

const retrieverInstances: Record<
  string,
  ReturnType<typeof SupabaseVectorStore.prototype.asRetriever>
> = {};

const getTableName = (databaseId: string) => `vectors_${databaseId}`;

const ensureTableExists = async (tableName: string) => {
  const { error } = await supabase.rpc("create_vectors_table_if_not_exists", {
    p_table_name: tableName,
  });
  if (error && !error.message.includes("already exists")) {
    logger.error("retriever: failed to create table", { error, tableName });
    throw error;
  }
};

export const createRetriever = async (data: string, databaseId: string) => {
  const tableName = getTableName(databaseId);
  await ensureTableExists(tableName);

  // Create document from combined data
  const rawText: Document[] = [
    new Document({
      pageContent: data,
      metadata: { source: "Combined", databaseId },
    }),
  ];

  // 1. Split text into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });
  const docs = await splitter.splitDocuments(rawText);

  // 2. Create embeddings. use your own embedding model
  logger.info("retriever: creating embeddings", {
    model: EMB_MODEL,
    databaseId,
  });
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: GOOGLE_API_KEY,
    model: EMB_MODEL,
  });

  // 3. Store in Supabase vector store with pgvector
  const vectorStore = await CustomSupabaseVectorStore.fromDocuments(
    docs,
    embeddings,
    {
      client: supabase,
      tableName,
    }
  );
  (vectorStore as any).filter = { filter: { table_name: tableName } };

  retrieverInstances[databaseId] = vectorStore.asRetriever({ k: 3 });
  logger.info("retriever: created persistent vector store and retriever", {
    docs: docs.length,
    databaseId,
  });
  return retrieverInstances[databaseId];
};

export const getRetriever = async (databaseId: string) => {
  if (!retrieverInstances[databaseId]) {
    const tableName = getTableName(databaseId);
    await ensureTableExists(tableName);

    logger.info("retriever: initializing retriever from persistent store", {
      databaseId,
    });
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: GOOGLE_API_KEY,
      model: EMB_MODEL,
    });
    const vectorStore = await CustomSupabaseVectorStore.fromExistingIndex(
      embeddings,
      {
        client: supabase,
        tableName,
      }
    );
    (vectorStore as any).filter = { filter: { table_name: tableName } };
    retrieverInstances[databaseId] = vectorStore.asRetriever({ k: 3 });
  }
  return retrieverInstances[databaseId];
};

export const updateRetrieverWithQA = async (
  question: string,
  answer: string,
  databaseId: string
) => {
  const tableName = getTableName(databaseId);
  await ensureTableExists(tableName);

  const doc = new Document({
    pageContent: `Q: ${question}\nA: ${answer}`,
    metadata: { source: "QA", databaseId },
  });

  logger.info("retriever: updating with Q&A", { databaseId });
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: GOOGLE_API_KEY,
    model: EMB_MODEL,
  });

  // Append to existing store
  await CustomSupabaseVectorStore.fromDocuments([doc], embeddings, {
    client: supabase,
    tableName,
  });

  // Invalidate instance to reload next time
  delete retrieverInstances[databaseId];
};
