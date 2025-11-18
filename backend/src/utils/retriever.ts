import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { EMB_MODEL, GOOGLE_API_KEY } from "../config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import logger from "./logger";

let retrieverInstance: ReturnType<
  typeof MemoryVectorStore.prototype.asRetriever
> | null = null;

export const createRetriever = async (
  erDiagram: string,
  documentation: string
) => {
  // Combine sources
  const rawText: Document[] = [
    new Document({ pageContent: erDiagram, metadata: { source: "ERD" } }),
    new Document({ pageContent: documentation, metadata: { source: "Docs" } }),
  ];

  // 1. Split text into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });
  const docs = await splitter.splitDocuments(rawText);

  // 2. Create embeddings. use your own embedding model
  logger.info("retriever: creating embeddings", { model: EMB_MODEL });
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: GOOGLE_API_KEY,
    model: EMB_MODEL,
  });

  // 3. Store in a simple in-memory vector store
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

  retrieverInstance = vectorStore.asRetriever({ k: 3 });
  logger.info("retriever: created vector store and retriever", {
    docs: docs.length,
  });
  return retrieverInstance;
};

export const getRetriever = () => {
  if (!retrieverInstance) {
    logger.error("retriever: getRetriever called before initialization");
    throw new Error("Retriever not initialized. Call createRetriever() first.");
  }
  return retrieverInstance;
};
