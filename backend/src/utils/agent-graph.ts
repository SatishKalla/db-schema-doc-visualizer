import { END, START, StateGraph, Annotation } from "@langchain/langgraph";
import { chatModel } from "./ai-models";
import { getRetriever } from "./retriever";
import { getDbConnection } from "./db-connection";
import {
  prepareAgentBaseSystemPrompt,
  prepareAgentSummaryPrompt,
} from "./prompts";

const keyWords = [
  "table",
  "column",
  "database",
  "schema",
  "row / record",
  "primary key / foreign key / key",
  "join",
  "query / sql / select / insert / update / delete",
  "where / group by / order by",
  "index",
  "view",
  "trigger / procedure / function",
  "transaction / commit / rollback",
  "fetch / retrieve / extract / list / data",
  "indexing",
  "normalization",
  "denormalization",
  "constraints",
  "indexes",
  "partitioning",
  "replication",
  "sharding",
  "caching",
  "optimization",
  "performance",
  "indexing strategy",
  "query optimization",
  "database design",
  "ER diagram",
  "data modeling",
  "data integrity",
  "data consistency",
  "data redundancy",
  "data warehouse",
  "data mart",
  "OLTP",
  "OLAP",
  "NoSQL",
  "SQL",
  "relational",
  "non-relational",
  "document store",
  "key-value store",
  "graph database",
  "column-family store",
  "time-series database",
  "wide-column store",
  "NewSQL",
  "ACID",
  "BASE",
  "CAP theorem",
  "eventual consistency",
  "strong consistency",
  "event sourcing",
  "CQRS",
  "sharding key",
  "replica set",
  "leader",
  "follower",
  "read replica",
  "write ahead log",
  "write behind",
  "eventual consistency",
  "strong consistency",
  "linearizable consistency",
  "serializable isolation",
  "read uncommitted",
  "read committed",
  "repeatable read",
  "snapshot isolation",
  "optimistic concurrency",
  "pessimistic concurrency",
  "locking",
  "deadlock",
  "livelock",
  "starvation",
  "concurrency control",
  "transaction isolation",
  "distributed transaction",
  "two-phase commit",
  "saga pattern",
  "compensating transaction",
  "idempotency",
  "exactly-once delivery",
  "at-least-once delivery",
  "at-most-once delivery",
  "eventual consistency",
  "strong consistency",
  "linearizable consistency",
  "serializable isolation",
  "read uncommitted",
  "read committed",
  "repeatable read",
  "snapshot isolation",
  "optimistic concurrency",
  "pessimistic concurrency",
  "locking",
  "deadlock",
  "livelock",
  "starvation",
  "concurrency control",
  "transaction isolation",
  "distributed transaction",
  "two-phase commit",
  "saga pattern",
  "compensating transaction",
  "idempotency",
  "exactly-once delivery",
  "at-least-once delivery",
  "at-most-once delivery",
];

const GraphStateAnnotation = Annotation.Root({
  input: Annotation<string>(),
  output: Annotation<string>(),
  isDbQuestion: Annotation<boolean>(),
  intent: Annotation<string>(),
  confidence: Annotation<number>(),
  sql: Annotation<string>(),
  queryResult: Annotation<any>(),
  database: Annotation<string>(),
});

type GraphStateAnnotation = typeof GraphStateAnnotation.State;

// 1. Classify
const classifyNode = async (state: GraphStateAnnotation) => {
  const userMessage = state.input;

  // Few-shot prompt instructing the model to return strict JSON only.
  const prompt = `You are an assistant that ONLY answers whether a user query is related to database structure, SQL queries, ER diagrams, or performance issues.
  Return VALID JSON only with keys: isDbQuestion (true|false), intent (short tag), confidence (number between 0 and 1).

  Examples:
  Q: "List the tables in the database"
  A: {"isDbQuestion": true, "intent": "list_tables", "confidence": 0.99}

  Q: "How do I write a join between orders and customers to get the customer name?"
  A: {"isDbQuestion": true, "intent": "generate_query", "confidence": 0.98}

  Q: "My queries are slow after adding new rows; what could be the issue?"
  A: {"isDbQuestion": true, "intent": "performance_investigation", "confidence": 0.95}

  Q: "What's the weather today?"
  A: {"isDbQuestion": false, "intent": "other", "confidence": 0.99}

  Now classify the following query and return JSON only.
  Q: "${userMessage.replace(/\n/g, " ").replace(/"/g, '\\"')}"`;

  try {
    const res = await chatModel.invoke(prompt);
    const raw =
      typeof res.content === "string" ? res.content : String(res.content);

    // Extract JSON object from model response defensively
    let parsed: any = null;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(raw.trim());
    }

    const isDbQuestion = Boolean(parsed.isDbQuestion);
    const intent =
      typeof parsed.intent === "string" ? parsed.intent : "unknown";
    const confidence =
      typeof parsed.confidence === "number" ? parsed.confidence : 0;

    // If model is uncertain, fallback to retriever+keyword heuristic
    if (confidence < 0.5) {
      try {
        const retriever = getRetriever();
        const docs = await retriever.invoke(userMessage);
        const hasRelevantDocs =
          Array.isArray(docs) &&
          docs.length > 0 &&
          docs.some((d) => d.pageContent && d.pageContent.trim().length > 20);

        if (hasRelevantDocs) return { isDbQuestion: true, intent, confidence };

        const keywordMatch = keyWords.some((keyword) =>
          userMessage.toLowerCase().includes(keyword)
        );
        return { isDbQuestion: keywordMatch, intent, confidence };
      } catch (err) {
        return { isDbQuestion: false };
      }
    }

    return { isDbQuestion, intent, confidence };
  } catch (err) {
    // On any error, fallback to retriever+keyword; if that fails, return false
    try {
      const retriever = getRetriever();
      const docs = await retriever.invoke(userMessage);
      const hasRelevantDocs =
        Array.isArray(docs) &&
        docs.length > 0 &&
        docs.some((d) => d.pageContent && d.pageContent.trim().length > 20);

      if (hasRelevantDocs)
        return { isDbQuestion: true, intent: "unknown", confidence: 0 };

      const keywordMatch = keyWords.some((keyword) =>
        userMessage.toLowerCase().includes(keyword)
      );
      return { isDbQuestion: keywordMatch, intent: "unknown", confidence: 0 };
    } catch (err2) {
      return { isDbQuestion: false, intent: "unknown", confidence: 0 };
    }
  }
};

// 2. Retrieve docs
const retrieveNode = async (state: GraphStateAnnotation) => {
  const userMessage = state.input;
  const intent = (state.intent || "unknown").toLowerCase();
  const retriever = getRetriever();
  const docs = await retriever.invoke(userMessage);

  const context =
    Array.isArray(docs) && docs.length > 0
      ? docs.map((d) => d.pageContent).join("\n\n")
      : "";

  // Base instruction describing desired outputs
  let instruction = prepareAgentBaseSystemPrompt(state.database);

  // Intent-specific guidance
  if (
    intent.includes("generate") ||
    intent.includes("query") ||
    intent.includes("join")
  ) {
    instruction +=
      "\n\nIf the user asks for a query, return a clear, runnable SQL snippet (labelled as SQL) followed by a short explanation of the logic and any assumptions.";
  } else if (
    intent.includes("performance") ||
    intent.includes("perf") ||
    intent.includes("investigation")
  ) {
    instruction +=
      "\n\nIf the user asks about performance, list likely causes, how the schema or queries might be responsible, and prioritized remediation steps (indexes, query rewrite, partitioning, etc.).";
  } else if (
    intent.includes("list") ||
    intent.includes("schema") ||
    intent.includes("er")
  ) {
    instruction +=
      "\n\nIf the user asks to list schema elements, prefer concise bullet lists or table-like markdown describing tables and key columns.";
  }

  return {
    input: `${instruction}\n\nIntent: ${intent}\n\nDatabase documentation and ER diagram info:\n\n${context}\n\nQuestion: ${state.input}`,
  };
};

// 3. Answer with context
const agentNode = async (state: GraphStateAnnotation) => {
  const input = state.input; // retrieveNode already prepared the full prompt
  const response = await chatModel.invoke(input);

  // Normalize to string
  const out =
    typeof response.content === "string"
      ? response.content
      : String(response.content);

  // Try to extract SQL snippet from the model output (```sql ... ``` or SQL: ...)
  let sql = "";
  const codeFenceMatch = out.match(/```sql[\s\S]*?```/i);
  if (codeFenceMatch) {
    sql = codeFenceMatch[0]
      .replace(/```sql/i, "")
      .replace(/```/g, "")
      .trim();
  } else {
    const sqlLabelMatch = out.match(/SQL:\s*([\s\S]*)/i);
    if (sqlLabelMatch && sqlLabelMatch[1]) sql = sqlLabelMatch[1].trim();
  }

  // Only allow simple SELECT statements to be executed for safety
  const safeSql = sql && /^\s*select\b/i.test(sql) ? sql : "";

  return { output: out, sql: safeSql };
};

// 4. Execute SQL and summarize results
const executeNode = async (state: GraphStateAnnotation) => {
  const sql = state.sql;
  if (!sql) {
    // Nothing to execute — pass through the agent output
    return { output: state.output };
  }

  try {
    // prefer explicit database from state, fallback to empty (getDbConnection will use global db)
    const dbName = (state.database || "").trim();

    const db = getDbConnection(dbName);

    const res = await db.raw(sql);

    let rows: any[] = [];
    if (Array.isArray(res)) {
      rows = res[0] || [];
    } else if (res && res.rows) {
      rows = res.rows;
    } else if (typeof res === "object") {
      rows = res.rows || res[0] || [];
    }

    const sample = JSON.stringify(rows);

    const summaryPrompt = prepareAgentSummaryPrompt(sql, sample);

    const summaryRes = await chatModel.invoke(summaryPrompt);
    const summary =
      typeof summaryRes.content === "string"
        ? summaryRes.content
        : String(summaryRes.content);

    return { queryResult: rows, output: summary };
  } catch (err: any) {
    const errMsg = `⚠️ Failed to execute SQL: ${err?.message ?? String(err)}`;
    return { output: `${state.output}\n\n${errMsg}` };
  }
};

// 4. Fallback if not DB-related
const fallbackNode = async (state: GraphStateAnnotation) => {
  const intent = state?.intent || "";
  // Provide a helpful fallback that nudges the user to rephrase or give examples
  const base = "⚠️ I can only answer selected database-related questions.";

  const help =
    " If your question is about SQL, schema design, ER diagrams, or performance, try rephrasing (e.g., 'create a join query between orders and customers' or 'why are queries on table X slow?').";

  // If classifier saw a DB-like intent but low confidence, give a slightly different hint
  if (intent) {
    return { output: base + help };
  }

  return { output: base };
};

const workflow = new StateGraph(GraphStateAnnotation)
  .addNode("classify", classifyNode)
  .addNode("retrieve", retrieveNode)
  .addNode("agent", agentNode)
  .addNode("execute", executeNode)
  .addNode("fallback", fallbackNode)
  .addEdge(START, "classify")
  .addConditionalEdges("classify", (state) =>
    state.isDbQuestion ? "retrieve" : "fallback"
  )
  .addEdge("retrieve", "agent")
  .addEdge("agent", "execute")
  .addEdge("execute", END)
  .addEdge("fallback", END);

const agentGraph = workflow.compile();

export default agentGraph;
