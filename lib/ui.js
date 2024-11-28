// ui.js

const addUrlButton = document.getElementById("add-url");
const linksList = document.getElementById("links-list");
const contentArea = document.getElementById("content-area");

export function updateLinks() {
  linksList.innerHTML = "";
  const text = contentArea.value;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  urls.forEach((url) => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.href = url;
    link.textContent = url;
    link.target = "_blank";
    listItem.appendChild(link);
    linksList.appendChild(listItem);
  });
}

export function addCurrentUrl() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    contentArea.value += (contentArea.value ? "\n" : "") + url;
    updateLinks();
  });
}

addUrlButton.addEventListener("click", addCurrentUrl);

contentArea.addEventListener("input", () => {
  updateLinks();
});
