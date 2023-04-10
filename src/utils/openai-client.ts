import { CallbackManager } from "langchain/callbacks";
import { LLMResult } from "langchain/schema";
import { OpenAI } from "langchain/llms";
import { getSettings } from "../config/settings";

const { openAIApiKey } = getSettings();

if (!openAIApiKey) {
  throw new Error("Missing OpenAI Credentials");
}

const callbackManager = CallbackManager.fromHandlers({
  handleLLMEnd: async (output: LLMResult) => {
    console.log("token usage:", JSON.stringify(output.llmOutput?.tokenUsage, null, 2));
  },
});

export const openai = new OpenAI({
  temperature: 0.1,
  maxTokens: 500,
  openAIApiKey: openAIApiKey,
  callbackManager,
});
