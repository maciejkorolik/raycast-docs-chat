import { VectorDBQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeStore } from "langchain/vectorstores";
import { getPreferenceValues } from "@raycast/api";
import { openai } from "./openai-client";
import { pinecone } from "./pinecone-client";
import { PINECONE_INDEX_NAME } from "../config/pinecone";

export async function getAnswer(question: string): any {
  if (!question) {
    return;
  }

  const { openAiApiKey } = getPreferenceValues();

  try {
    // OpenAI recommends replacing newlines with spaces for best results
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");

    const index = (await pinecone).Index(PINECONE_INDEX_NAME);
    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({ openAIApiKey: openAiApiKey }), {
      pineconeIndex: index,
      textKey: "text",
    });

    const model = openai;
    // create the chain
    const chain = VectorDBQAChain.fromLLM(model, vectorStore, { k: 1, returnSourceDocuments: true });

    //Ask a question
    const response = await chain.call({
      query: sanitizedQuestion,
    });

    console.log("response", response);
    return response.text;
  } catch (error) {
    console.log(error);
  }
}
