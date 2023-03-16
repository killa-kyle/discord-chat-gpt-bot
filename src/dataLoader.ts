import { getEmbedding } from "./openAI";

// loadDocument is a function that takes in a pdf, csv, or txt file and returns an array of strings no longer than 800 characters
export const loadDocument = async (file) => {
    const fileReader = new FileReader();
    fileReader.readAsText(file);
    return new Promise((resolve, reject) => {
      fileReader.onload = async () => { // Add async keyword here
        const fileContent = fileReader.result as string;
        const fileContentArray = fileContent.split("\n");
        const fileContentArrayChunks = [] as string[];
        const chunkSize = 800; // Set the desired chunk size
        for (let i = 0; i < fileContentArray.length; i += chunkSize) {
          const chunk  = fileContentArray.slice(i, i + chunkSize);
          fileContentArrayChunks.push(chunk.join(""));
        }
        const embeddings = await Promise.all(fileContentArrayChunks.map(getEmbedding)); // Use Promise.all() to wait for all embeddings to finish
        resolve(embeddings);
      };
      fileReader.onerror = () => {
        reject(fileReader.error);
      };
    });
  };