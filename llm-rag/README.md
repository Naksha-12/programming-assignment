
# AI Document Assistant Using LLM and RAG

## Aim
To develop an AI-based application that answers questions from an uploaded text document using Retrieval Augmented Generation (RAG).

## Technologies Used
- Node.js
- Express.js
- OpenAI GPT-4o mini
- HTML, CSS and JavaScript
- Multer

## Features
1. Upload a text document.
2. Split the document into smaller chunks.
3. Retrieve relevant chunks based on the user's question.
4. Send the retrieved context to an LLM.
5. Generate an answer using the document content.

## How to Run

1. Install Node.js.
2. Open the llm-rag folder in a terminal.
3. Install dependencies:

   npm install

4. Create a `.env` file and add your OpenAI API key:

   OPENAI_API_KEY=your_actual_api_key

5. Start the application:

   npm start

6. Open the application in your browser:

   http://localhost:5001

## API Endpoints

- POST /api/upload – Upload a text document.
- POST /api/ask – Ask a question about the uploaded document.

## Conclusion
This project demonstrates the basic working of Retrieval Augmented Generation by combining document retrieval with Large Language Model responses.
