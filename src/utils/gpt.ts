import { VectorDBQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeStore } from "langchain/vectorstores";
import { openai } from "./openai-client";
import { pinecone } from "./pinecone-client";
import { PINECONE_INDEX_NAME } from "../config/pinecone";
import { getSettings } from "../config/settings";

export async function getAnswer(question: string): any {
  if (!question) {
    return;
  }

  const { openAIApiKey } = getSettings();

  try {
    const extendedQuery = `${question} Provide answer in markdown format, include code examples if needed.`;

    // OpenAI recommends replacing newlines with spaces for best results
    const sanitizedQuestion = extendedQuery.trim().replaceAll("\n", " ");

    const index = (await pinecone).Index(PINECONE_INDEX_NAME);
    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({ openAIApiKey }), {
      pineconeIndex: index,
      textKey: "text",
    });

    const model = openai;
    // create the chain
    const chain = VectorDBQAChain.fromLLM(model, vectorStore, { k: 5, returnSourceDocuments: true });

    //Ask a question
    const response = await chain.call({
      max_k: 5,
      query: sanitizedQuestion,
    });
    console.log(Object.keys(response));
    return response;
  } catch (error) {
    console.log(error);
  }
}
