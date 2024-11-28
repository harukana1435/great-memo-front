// tabs.js

let tabsData = JSON.parse(localStorage.getItem("tabsData")) || {};
let currentTab = null;
const tabsContainer = document.getElementById("tabs");
const contentArea = document.getElementById("content-area");

export function initializeTabs() {
  if (Object.keys(tabsData).length === 0) {
    addNewTab();
  } else {
    for (const tabName in tabsData) {
      addTabButtonUI(tabName);
    }

    const savedActiveTab = localStorage.getItem("activeTab");
    if (savedActiveTab && tabsData[savedActiveTab]) {
      setActiveTab(savedActiveTab);
    } else {
      setActiveTab(Object.keys(tabsData)[0]);
    }
  }
}

export function addNewTab() {
  const newTabName = `tab${Object.keys(tabsData).length + 1}`;
  tabsData[newTabName] = "";
  localStorage.setItem("tabsData", JSON.stringify(tabsData));
  addTabButtonUI(newTabName);
  setActiveTab(newTabName);
}

export function addTabButtonUI(tabName) {
  const tabButton = document.createElement("div");
  tabButton.id = tabName;
  tabButton.className = "tab-button";
  tabButton.innerHTML = `
        <span>${tabName}</span>
        <button class="delete-tab-button">x</button>
    `;
  tabButton
    .querySelector("span")
    .addEventListener("click", () => setActiveTab(tabName));
  tabButton
    .querySelector(".delete-tab-button")
    .addEventListener("click", () => deleteTab(tabName));

  tabsContainer.appendChild(tabButton);
}

export function setActiveTab(tabName) {
  if (currentTab) {
    tabsData[currentTab] = contentArea.value;
    localStorage.setItem("tabsData", JSON.stringify(tabsData));
  }

  localStorage.setItem("activeTab", tabName);

  currentTab = tabName;
  contentArea.value = tabsData[tabName] || "";

  Array.from(tabsContainer.children).forEach((button) =>
    button.classList.remove("active")
  );
  document.getElementById(tabName).classList.add("active");
}

export function deleteTab(tabName) {
  if (Object.keys(tabsData).length === 1) {
    alert("最後のタブは削除できません");
    return;
  }

  if (confirm(`本当に${tabName}を削除しますか？`)) {
    delete tabsData[tabName];
    localStorage.setItem("tabsData", JSON.stringify(tabsData));
    document.getElementById(tabName).remove();

    if (tabName === currentTab) {
      const nextTab = Object.keys(tabsData)[0];
      setActiveTab(nextTab);
    }
  }
}
