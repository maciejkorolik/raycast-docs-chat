import { getPreferenceValues } from "@raycast/api";

type Settings = {
  openAIApiKey: string;
  pineconeApiKey: string;
  pineconeEnvironment: string;
};

export const getSettings = (): Settings => {
  const raycastSettings = getPreferenceValues<Settings>();
  return {
    openAIApiKey: process.env.OPENAI_API_KEY || raycastSettings.openAIApiKey,
    pineconeApiKey: process.env.PINECONE_API_KEY || raycastSettings.pineconeApiKey,
    pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || raycastSettings.pineconeEnvironment,
  };
};
