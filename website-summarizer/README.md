
# AI Website Summarizer

## Aim
To develop an application that accepts a website URL, extracts its content and generates a summary using a Large Language Model.

## Technologies Used
- Node.js
- Express.js
- Cheerio
- OpenAI GPT-4o mini
- HTML, CSS and JavaScript

## Features
1. Accepts a website name or URL.
2. Extracts readable text from the webpage.
3. Uses an LLM to summarize the extracted content.
4. Displays the generated summary.

## How to Run

1. Install Node.js.
2. Open the website-summarizer folder in a terminal.
3. Install dependencies:

   npm install

4. Create a `.env` file and add your OpenAI API key:

   OPENAI_API_KEY=your_actual_api_key

5. Start the application:

   npm start

6. Open your browser:

   http://localhost:5002

## API Endpoint

POST /api/summarize

Accepts a website URL and returns its title and AI-generated summary.

## Conclusion
This application demonstrates how web scraping and Large Language Models can be combined to summarize website content automatically.
