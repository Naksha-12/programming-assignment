
require("dotenv").config();

const express = require("express");
const cheerio = require("cheerio");
const OpenAI = require("openai");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Convert website name into a valid URL
function normalizeUrl(input) {
  let url = input.trim();

  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  const parsed = new URL(url);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS websites are supported.");
  }

  if (
    ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)
  ) {
    throw new Error("Local addresses are not allowed.");
  }

  return parsed.toString();
}

// Extract readable text from a website
async function extractWebsiteText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 WebsiteSummarizer/1.0"
    },
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    throw new Error("Unable to access this website.");
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    throw new Error("The provided URL is not an HTML webpage.");
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, header, noscript").remove();

  const title = $("title").text().trim();
  const text = $("body").text().replace(/\s+/g, " ").trim();

  if (!text) {
    throw new Error("No readable content found on this website.");
  }

  return {
    title,
    text: text.slice(0, 12000)
  };
}

// Website summarization API
app.post("/api/summarize", async (req, res) => {
  try {
    const { website } = req.body;

    if (!website) {
      return res.status(400).json({
        message: "Please enter a website name or URL."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        message: "OpenAI API key is not configured."
      });
    }

    const url = normalizeUrl(website);
    const page = await extractWebsiteText(url);

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Summarize the supplied webpage content clearly. Include its main purpose and important points. Do not invent information."
        },
        {
          role: "user",
          content: `Website title: ${page.title}\n\nWebsite content:\n${page.text}`
        }
      ]
    });

    res.json({
      website: url,
      title: page.title,
      summary: result.choices[0].message.content
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message || "Unable to summarize the website."
    });
  }
});

app.listen(5002, () => {
  console.log("Website Summarizer running on port 5002");
});
