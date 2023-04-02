const converter = new showdown.Converter();
let promptId,
  responeId,
  isLoading = false,
  intervalId;
const submitButton = document.getElementById("submit-button"),
  regenerateButton = document.getElementById("regenerate-response-button"),
  promptInput = document.getElementById("prompt-input"),
  modelSelect = document.getElementById("model-select"),
  responseList = document.getElementById("response-list");
const createResponseContainer = (isQuestion, content) => {
  const id = `id-${Date.now()}-${Math.random().toString(16)}`;
  const type = isQuestion ? "my-question" : "chatgpt-response";
  const html = `
    <div class="response-container ${type}">
      <img class="avatar-image" src="assets/img/${
        isQuestion ? "me" : "chatgpt"
      }.png" alt="avatar"/>
      <div class="prompt-content" id="${id}">${content}</div>
    </div>
  `;
  responseList.insertAdjacentHTML("beforeend", html);
  responseList.scrollTop = responseList.scrollHeight;
  return id;
};
const showError = (element, message) => {
  element.innerHTML = message;
  element.style.color = "rgb(200, 0, 0)";
};
const setPromptAndResponseIds = (prompt, response) => {
  promptId = prompt;
  responeId = response;
  regenerateButton.style.display = "flex";
};
async function handleSubmit(userPrompt, generatedResponse) {
  const prompt = userPrompt || promptInput.textContent;
  if (isLoading || !prompt) return;
  submitButton.classList.add("loading");
  promptInput.textContent = "";
  generatedResponse || createResponseContainer(true, `<div>${prompt}</div>`);
  const response = generatedResponse || createResponseContainer(false, "");
  const responseElement = document.getElementById(response);
  isLoading = true;
  let dotsCount = 0,
    incrementing = true;
  const intervalId = setInterval(() => {
    if (incrementing) {
      responseElement.textContent += ".";
      dotsCount++;
      if (dotsCount === 4) {
        incrementing = false;
      }
    } else {
      responseElement.textContent = responseElement.textContent.slice(0, -1);
      dotsCount--;
      if (dotsCount === 0) {
        incrementing = true;
      }
    }
  }, 300);
  try {
    const model = modelSelect.value;
    const response = await fetch("/api/get-prompt-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt, model: model }),
    });
    if (response.type === "invalid_request_error") {
      showError(responseElement, `HTTP Error: ${await response.text()}`);
      return;
    }
    clearInterval(intervalId);
    responseElement.innerHTML = converter.makeHtml(await response.text());
    responseList.scrollTop = responseList.scrollHeight;
    hljs.highlightAll();
  } catch (e) {
    showError(responseElement, `Error: ${e.message}`);
  } finally {
    isLoading = false;
    submitButton.classList.remove("loading");
  }
}
promptInput.addEventListener("keydown", function (e) {
  "Enter" === e.key &&
    (e.preventDefault(),
    e.ctrlKey || e.shiftKey
      ? document.execCommand("insertHTML", !1, "<br/><br/>")
      : handleSubmit());
}),
  submitButton.addEventListener("click", () => {
    handleSubmit();
  }),
  regenerateButton.addEventListener("click", () => {
    !(async function () {
      try {
        await handleSubmit(promptId, responeId),
          regenerateButton.classList.add("loading");
      } finally {
        regenerateButton.classList.remove("loading");
      }
    })();
  });
window.onload = function () {
  (!localStorage.isVisited || localStorage.visitedTime >= 5) &&
    (confirm("Please Give me a shining star ✴️") ||
      alert("Please give me a star to use 🤗"),
    open("https://github.com/duongnguyen321/allai", "_blank"),
    (localStorage.isVisited = !0),
    (localStorage.visitedTime = 0)),
    console.groupCollapsed("%cHello From Client side!", "color: #20e3b2"),
    console.log(
      "%cI am Duong from %chttps://duong.vercel.app%c!",
      "color: #20e3b2",
      "color: #58a6ff",
      "color: #10a37f"
    ),
    console.groupEnd(),
    console.groupCollapsed("%cPlease be a responsible user!", "color: #f55"),
    console.log("%cThank you!", "color: #20e3b2"),
    console.groupEnd(),
    promptInput.focus(),
    (localStorage.visitedTime = JSON.parse(localStorage.visitedTime) + 1);
};
