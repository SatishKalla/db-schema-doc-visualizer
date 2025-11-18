import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { chatModel } from "../utils/ai-models";
import agentGraph from "../utils/agent-graph";
import logger from "../utils/logger";

async function checkAIConnection() {
  try {
    logger.info("checkAIConnection: starting AI connection check");
    const response = await chatModel.invoke([
      new SystemMessage("You are a helpful assistant."),
      new HumanMessage("Explain how AI works in a few words."),
    ]);
    logger.info("checkAIConnection: received response from AI");
    return response.content;
  } catch (error) {
    logger.error("checkAIConnection: error", { error });
    throw new Error(`AI connection check failed: ${JSON.stringify(error)}`);
  }
}

async function runAgentFlow(question: string, database: string) {
  try {
    logger.info("runAgentFlow: starting", { question, database });
    const state: any = { input: question, database: database };

    const response = await agentGraph.invoke(state);
    logger.info("runAgentFlow: agent flow completed");
    return response;
  } catch (error) {
    logger.error("runAgentFlow: error", { error, question, database });
    throw new Error(`Agent flow execution failed: ${JSON.stringify(error)}`);
  }
}

export { checkAIConnection, runAgentFlow };
