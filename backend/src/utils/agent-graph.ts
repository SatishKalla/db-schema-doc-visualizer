import { END, START, StateGraph, Annotation } from "@langchain/langgraph";
import { chatModel } from "./ai-models";
import { getRetriever } from "./retriever";

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
];

const GraphStateAnnotation = Annotation.Root({
  input: Annotation<string>(),
  output: Annotation<string>(),
  isDbQuestion: Annotation<boolean>(),
});

type GraphStateAnnotation = typeof GraphStateAnnotation.State;

// 1. Classify
const classifyNode = async (state: GraphStateAnnotation) => {
  const userMessage = state.input;

  const isDbQuestion = keyWords.some((keyword) =>
    userMessage.toLowerCase().includes(keyword)
  );

  return { isDbQuestion };
};

// 2. Retrieve docs
const retrieveNode = async (state: GraphStateAnnotation) => {
  const userMessage = state.input;
  const retriever = getRetriever();
  const docs = await retriever.invoke(userMessage);
  const context = docs.map((d) => d.pageContent).join("\n\n");
  return {
    input: `Use the following database documentation and ER diagram info:\n\n${context}\n\nQuestion: ${state.input}`,
  };
};

// 3. Answer with context
const agentNode = async (state: GraphStateAnnotation) => {
  const input = state.input;
  const response = await chatModel.invoke(input);
  return { output: response.content };
};

// 4. Fallback if not DB-related
const fallbackNode = async () => {
  return {
    output: "⚠️ I can only answer select database-related questions.",
  };
};

const workflow = new StateGraph(GraphStateAnnotation)
  .addNode("classify", classifyNode)
  .addNode("retrieve", retrieveNode)
  .addNode("agent", agentNode)
  .addNode("fallback", fallbackNode)
  .addEdge(START, "classify")
  .addConditionalEdges("classify", (state) =>
    state.isDbQuestion ? "retrieve" : "fallback"
  )
  .addEdge("retrieve", "agent")
  .addEdge("agent", END)
  .addEdge("fallback", END);

const agentGraph = workflow.compile();

export default agentGraph;
