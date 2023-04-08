import { PineconeClient } from "@pinecone-database/pinecone";
import { getPreferenceValues } from "@raycast/api";

const { pineconeApiKey, pineconeEnvironment } = getPreferenceValues();

async function initPinecone() {
  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT || pineconeEnvironment,
      apiKey: process.env.PINECONE_API_KEY || pineconeApiKey,
    });

    return pinecone;
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

async function initPineconeClient() {
  const pinecone = await initPinecone();
  return pinecone;
}

export const pinecone = initPineconeClient();
