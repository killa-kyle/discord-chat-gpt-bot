const fs = require("fs")
const crypto = require("crypto");

function encodeToSHA256(data) {
    const hash = crypto
      .createHash("sha256")
      .update(data)
      .digest("hex");
    return hash;
  }

function createDb(dbName = "db") {
    try {
        if (!fs.existsSync(dbName + ".json")) {
            fs.writeFileSync(dbName + ".json", JSON.stringify([], null, 2));
            // return console.log(`${dbName + ".json"} file created successfully`);
        } else {
            // return console.log(`${dbName + ".json"} file already exists`);
        }
    } catch (e) {
        return console.log(`Error creating ${dbName + ".json"} file:`, e);
    }
}


function readDb(dbName = "db") {
    const data = fs.readFileSync(dbName + ".json", "utf-8")
    return JSON.parse(data)
}

function writeDb(obj, dbName = "db") {
    if (!obj) {return console.log("Please provide data to save!")}
    try {
        let data = readDb(dbName);
        data = obj;
        fs.writeFileSync(dbName + ".json", JSON.stringify(data, null, 2));
        // return console.log("Save succesful")
    } catch (e) {
        return console.log("Save failed! with the following errror:", e)
    }
}

function getCurrentDateTime() {
    const date = new Date();
    return Math.floor(new Date(date).getTime() / 1000)
}      

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += Math.pow(vecA[i], 2);
        normB += Math.pow(vecB[i], 2);
    }
    // console.log(dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)))
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function clearJsonFile(filename) {
    let emptyData = JSON.stringify([]);
    await fs.writeFileSync(filename, emptyData);
    return console.log("File cleared successfully");
}

function getSimilarTextFromDb(inputEmbedding, dbName = "db") {

    let jsonData = JSON.parse(fs.readFileSync(dbName + ".json", 'utf-8'));
    let result: any = [];
    jsonData.forEach(embedding => {
        let similarity = cosineSimilarity(inputEmbedding, embedding.input.embedding);
        if (similarity > 0.8) {
            result.push({
                interaction: `${embedding.input.text} ${embedding.output.text}`,
                similarity: similarity
            });
        }
    });
    result.sort((a, b) => b.similarity - a.similarity);
    let topThree = result.slice(0, 4);

    // topThree.reverse()
    // console.log(`The top three most similar interactions are:`, topThree.map(r => r.interaction).join(""))
    return topThree.map(r => r.interaction).join("");
  }

export { readDb, writeDb, getSimilarTextFromDb, getCurrentDateTime, encodeToSHA256, cosineSimilarity, createDb, clearJsonFile }