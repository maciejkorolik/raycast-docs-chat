import { OpenAI } from "langchain/llms";
import { getSettings } from "../config/settings";

const { openAIApiKey } = getSettings();

if (!openAIApiKey) {
  throw new Error("Missing OpenAI Credentials");
}

export const openai = new OpenAI({
  temperature: 0.1,
  maxTokens: 500,
  openAIApiKey: openAIApiKey,
});
