import { VectorDBQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeStore } from "langchain/vectorstores";
import { openai } from "@/utils/openai-client";
import { pinecone } from "@/utils/pinecone-client";
import { PINECONE_INDEX_NAME } from "@/config/pinecone";

export async function getAnswer(question: string): any {
  if (!question) {
    return;
  }

  try {
    // OpenAI recommends replacing newlines with spaces for best results
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");

    const index = pinecone.Index(PINECONE_INDEX_NAME);
    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({}), {
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
