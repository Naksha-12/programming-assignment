
require("dotenv").config();

const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype === "text/plain" ||
      file.originalname.toLowerCase().endsWith(".txt")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Please upload a .txt file."));
    }
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store document chunks temporarily in memory
let documentChunks = [];

// Split document into smaller chunks
function splitIntoChunks(text, chunkSize = 800) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }

  return chunks;
}

// Retrieve relevant chunks using keyword matching
function retrieveRelevantChunks(question) {
  const keywords = question
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 2);

  const scoredChunks = documentChunks.map(chunk => {
    const content = chunk.toLowerCase();
    let score = 0;

    keywords.forEach(word => {
      if (content.includes(word)) {
        score++;
      }
    });

    return { chunk, score };
  });

  return scoredChunks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.chunk);
}

// Upload and process a text document
app.post("/api/upload", upload.single("document"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Please upload a text document."
    });
  }

  const text = req.file.buffer.toString("utf8").trim();

  if (!text) {
    return res.status(400).json({
      message: "The uploaded document is empty."
    });
  }

  documentChunks = splitIntoChunks(text);

  res.json({
    message: "Document uploaded and processed successfully!",
    totalChunks: documentChunks.length
  });
});

// Ask a question about the uploaded document
app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Please enter a question."
      });
    }

    if (documentChunks.length === 0) {
      return res.status(400).json({
        message: "Please upload a document first."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        message: "OpenAI API key is not configured."
      });
    }

    const relevantChunks = retrieveRelevantChunks(question);

    if (relevantChunks.length === 0) {
      return res.json({
        answer: "No relevant information was found in the document."
      });
    }

    const context = relevantChunks.join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Answer the question using only the supplied document context. If the answer is not present, say so."
        },
        {
          role: "user",
          content: `Document context:\n${context}\n\nQuestion: ${question}`
        }
      ]
    });

    res.json({
      answer: response.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong while generating the answer."
    });
  }
});

app.listen(5001, () => {
  console.log("RAG application running on port 5001");
});
