const express = require("express");
const jsonServer = require("json-server");
const path = require("path");
const fs = require("fs");
const { Configuration: OpenAIConfig, OpenAIApi: OpenAIApi } = require("openai");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = jsonServer.create();
const router = jsonServer.router(
  JSON.parse(fs.readFileSync(path.join(__dirname, "db.json")))
);
const middlewares = jsonServer.defaults();

const openai = new OpenAIApi(
  new OpenAIConfig({ apiKey: process.env.OPENAI_API_KEY })
);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/", express.static(__dirname + "/client"));
server.use(middlewares);
server.use(router);
app.use(router);

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

app.get("/chat-history", async (req, res) => {
  const chatHistory = await router.db.get("chatHistory").value();
  res.send(chatHistory);
});

app.post("/get-prompt-result", async (req, res) => {
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
      await router.db
        .get("chatHistory")
        .push({ user: promptText, bot: img })
        .write();
      return res.send(img);
    }

    if ("chatgpt" === modelName) {
      const message = await router.db
        .get("chatHistory")
        .value()
        .map((chatItem) => [
          { role: "user", content: chatItem.user },
          { role: "assistant", content: chatItem.bot },
        ])
        .flat();

      const chatData = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [...message, { role: "user", content: promptText }],
      });

      await router.db
        .get("chatHistory")
        .push({
          user: promptText,
          bot: chatData.data.choices[0]?.message?.content,
        })
        .write();

      return res.send(chatData.data.choices[0]?.message?.content);
    }

    const completionData = await openai.createCompletion({
      prompt: promptText,
      model: modelName,
    });

    const result = completionData.data.choices[0].text;
    return res.send(result);
  } catch (err) {
    const errorMessage = err.response ? err.response.data.error : `${err}`;

    await router.db
      .get("chatHistory")
      .push({ user: promptText, bot: "ERROR: " + errorMessage })
      .write();

    console.error(errorMessage);
    return res.status(500).send({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
