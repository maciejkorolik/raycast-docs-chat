import { getPreferenceValues } from "@raycast/api";
import { OpenAI } from "langchain/llms";

const { openAiApiKey } = getPreferenceValues();

if (!process.env.OPENAI_API_KEY && !openAiApiKey) {
  throw new Error("Missing OpenAI Credentials");
}

export const openai = new OpenAI({
  temperature: 0,
  maxTokens: 500,
  openAIApiKey: process.env.OPENAI_API_KEY || openAiApiKey,
});
