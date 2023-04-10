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

    const advancedQuery = `
    I will ask you a question abut Next.js. Please answer it as best you can based on the provided documentation. Provide answer in markdown format, include code examples if needed.
    The question is: ${sanitizedQuestion}
    `;

    const index = (await pinecone).Index(PINECONE_INDEX_NAME);
    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({ openAIApiKey: openAiApiKey }), {
      pineconeIndex: index,
      textKey: "text",
    });

    const model = openai;
    // create the chain
    const chain = VectorDBQAChain.fromLLM(model, vectorStore, { k: 5, returnSourceDocuments: true });

    //Ask a question
    const response = await chain.call({
      max_k: 5,
      query: advancedQuery,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
}
