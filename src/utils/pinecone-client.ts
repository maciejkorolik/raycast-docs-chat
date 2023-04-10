import { PineconeClient } from "@pinecone-database/pinecone";
import { getSettings } from "../config/settings";

const { pineconeApiKey, pineconeEnvironment } = getSettings();

async function initPinecone() {
  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment: pineconeEnvironment,
      apiKey: pineconeApiKey,
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
