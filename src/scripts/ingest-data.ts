import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeStore } from "langchain/vectorstores";
import { pinecone } from "../utils/pinecone-client";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import ora from "ora";
import { fileURLToPath } from "url";
import { PINECONE_INDEX_NAME } from "../config/pinecone";
import { processMarkDownFiles } from "../utils/helpers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIR_NAME = "docs-source";
const outputPath = path.resolve(__dirname, `../../${DIR_NAME}`);

async function downloadFilesFromRepo(repoUrl: string, localPath: string, spinner: ora.Ora) {
  const response = await fetch(repoUrl);
  const files = await response.json();

  for (const file of files) {
    const filePath = path.join(localPath, file.name);

    if (file.type === "file" && file.name.endsWith(".md")) {
      const fileResponse = await fetch(file.download_url);
      const content = await fileResponse.text();

      // Save the .md file to the output folder
      fs.writeFileSync(filePath, content);
      spinner.stopAndPersist({ symbol: "✔", text: `Downloaded: ${file.path}` });
      spinner.start();
    } else if (file.type === "dir") {
      // Create the directory if it doesn't exist
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
      }

      // Recursively download files from the subdirectory
      await downloadFilesFromRepo(file.url, filePath, spinner);
    }
  }
}

async function downloadDocs() {
  const repoUrl = "https://api.github.com/repos/vercel/next.js/contents/docs?ref=canary";
  // Create the output folder if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }

  const spinner = ora("Downloading files...").start();
  try {
    await downloadFilesFromRepo(repoUrl, outputPath, spinner);
    spinner.succeed("Files downloaded successfully");
  } catch (error) {
    spinner.fail("Failed to download files");
    throw new Error(error);
  }
}

async function ingestData() {
  const spinner = ora("Ingesting files...").start();

  try {
    /*load raw docs from the markdown files in the directory */
    spinner.text = "Processing markdown files...";
    const rawDocs = await processMarkDownFiles(DIR_NAME, spinner);
    spinner.stopAndPersist({ symbol: "✔", text: "Files processed" });
    spinner.start();

    /* Split text into chunks */
    spinner.text = "Splitting text into chunks...";
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    spinner.stopAndPersist({ symbol: "✔", text: "Text splitted into chunks" });
    spinner.start();

    /*create and store the embeddings in the vectorStore*/
    spinner.text = "Creating embeddings...";
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    await PineconeStore.fromDocuments(docs, embeddings, { textKey: "text", pineconeIndex: index });
    spinner.stopAndPersist({ symbol: "✔", text: "Embeddings created" });
    spinner.succeed("Ingestion complete");
  } catch (error) {
    spinner.fail("Failed to ingest your data");
    console.log(error);
    throw new Error(error);
  }
}

async function main() {
  if (!fs.existsSync(outputPath)) {
    await downloadDocs();
  }
  await ingestData();
}

(async () => {
  await main();
})();
