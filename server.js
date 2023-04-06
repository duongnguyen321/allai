const express = require("express");
const { Configuration: OpenAIConfig, OpenAIApi: OpenAIApi } = require("openai");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const app = express();
const openai = new OpenAIApi(
  new OpenAIConfig({ apiKey: process.env.OPENAI_API_KEY })
);

// Server hander to get and post data to API server or not
const server = async (method, body) => {
  const all = `${process.env.API_URL}/all`; // get all data
  const url = `${process.env.API_URL}/chat-history`; // push some thing to server
  if (method === "get") {
    try {
      const response = await axios.get(all);
      const chatHistory = response.data;
      const message = await chatHistory.flatMap((chatItem) => [
        { role: "user", content: chatItem.user },
        { role: "assistant", content: chatItem.bot },
      ]);
      return message;
    } catch (error) {
      console.error("Unable to save chat history: ", error);
      return [];
    }
  } else if (method === "post") {
    try {
      await axios.post(url, body);
      return true;
    } catch (error) {
      console.error("Unable to upload chat history: ", error);
      return false;
    }
  }
};
// Middleware
app.use(cors());
app.use(express.json());
app.use("/", express.static(__dirname + "/client"));

// Routes
app.get("/api/get-chat-history", async (req, res) => {
  const message = await server("get");
  return res.send(message);
});
app.post("/api/get-prompt-result", async (req, res) => {
  const { prompt: promptText, model: modelName = "gpt" } = req.body;
  if (!promptText) {
    return res.status(400).send({ error: "Prompt is missing in the request" });
  }
  try {
    if ("image" === modelName) {
      const imageData = await openai.createImage({
        prompt: promptText,
        response_format: "url",
        size: "1024x1024",
      });
      const img = `<img src="${imageData.data.data[0].url}" class="ai-image" alt="${promptText}">`;
      await server("post", { user: promptText, bot: img });
      return res.send(img);
    }
    if ("chatgpt" === modelName) {
      const message = await server("get");
      const chatData = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [...message, { role: "user", content: promptText }],
      });
      const result = chatData.data.choices[0]?.message?.content;
      await server("post", {
        user: promptText,
        bot: result,
      });
      return res.send(result);
    }
    const completionData = await openai.createCompletion({
      prompt: promptText,
      model: modelName,
    });
    const result = completionData.data.choices[0].text;
    await server("post", { user: promptText, bot: result });
    return res.send(result);
  } catch (err) {
    const errorMessage = err.response ? err.response.data.error : `${err}`;
    server("post", { user: promptText, bot: errorMessage });
    console.error(errorMessage);
    return res.status(500).send({ error: errorMessage });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
