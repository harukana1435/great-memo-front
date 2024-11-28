const tabsContainer = document.getElementById("tabs");
const contentArea = document.getElementById("content-area");
const addTabButton = document.getElementById("add-tab-button");
const addUrlButton = document.getElementById("add-url");
const linksList = document.getElementById("links-list");
const writeToNotionButton = document.getElementById("write-to-notion");

// 保存されたタブデータを取得
let tabsData = JSON.parse(localStorage.getItem("tabsData")) || {};

// 現在のアクティブタブ
let currentTab = null;

// ランダムIDを生成する関数
function generateUniqueId() {
  const timestamp = Date.now(); // 現在のタイムスタンプ
  const randomNum = Math.floor(Math.random() * 1000); // 乱数
  return `${timestamp}-${randomNum}`;
}

// タブを初期化
function initializeTabs() {
  if (Object.keys(tabsData).length === 0) {
    addNewTab();
  } else {
    for (const tabName in tabsData) {
      addTabButtonUI(tabName, tabsData[tabName].id);
    }

    // 最後のアクティブタブを取得
    const savedActiveTab = localStorage.getItem("activeTab");
    if (savedActiveTab && tabsData[savedActiveTab]) {
      setActiveTab(savedActiveTab);
    } else {
      setActiveTab(Object.keys(tabsData)[0]);
    }
  }
}

// 新しいタブを作成
function addNewTab() {
  const newTabId = generateUniqueId(); // 一意のIDを生成
  const newTabName = `tab${Object.keys(tabsData).length + 1}`;
  tabsData[newTabName] = { id: newTabId, content: "" };
  localStorage.setItem("tabsData", JSON.stringify(tabsData));
  addTabButtonUI(newTabName, newTabId);
  setActiveTab(newTabName);
}

function addTabButtonUI(tabName, tabId) {
  const tabButton = document.createElement("div");
  tabButton.id = tabId; // IDを設定
  tabButton.className = "tab-button";
  tabButton.innerHTML = `
    <span>${tabName.replace("tab", "")}</span>
    <button class="delete-tab-button">x</button>
  `;
  // tabButton全体にクリックイベントを追加
  tabButton.addEventListener("click", () => setActiveTab(tabName));
  tabButton
    .querySelector(".delete-tab-button")
    .addEventListener("click", (event) => {
      event.stopPropagation(); // イベント伝播を停止
      deleteTab(tabName, tabId); // タブ削除処理
    });

  tabsContainer.appendChild(tabButton);
}

function setActiveTab(tabName) {
  if (currentTab) {
    tabsData[currentTab].content = contentArea.value;
    localStorage.setItem("tabsData", JSON.stringify(tabsData));
  }

  // アクティブタブを保存
  localStorage.setItem("activeTab", tabName);

  currentTab = tabName;
  contentArea.value = tabsData[tabName].content || "";

  Array.from(tabsContainer.children).forEach((button) =>
    button.classList.remove("active")
  );
  document.getElementById(tabsData[tabName].id).classList.add("active");

  updateLinks();
}

// テキスト内のリンクを検出して表示
function updateLinks() {
  linksList.innerHTML = ""; // リストを初期化
  const text = contentArea.value;
  const urlRegex = /(https?:\/\/[^\s]+)/g; // URLを検出する正規表現
  const urls = text.match(urlRegex) || []; // 検出したURLのリスト

  urls.forEach((url) => {
    const linkContainer = document.createElement("span"); // 横並びにするためのコンテナ
    linkContainer.className = "link-container"; // クラス名を設定

    // リンクマークを追加
    const linkIcon = document.createElement("img");
    linkIcon.src = "images/link-icon.png"; // リンクマークのアイコン画像（リンクアイコンを用意）
    linkIcon.alt = "Link Icon"; // アイコンの代替テキスト
    linkIcon.className = "link-icon"; // アイコン用のクラス
    linkContainer.appendChild(linkIcon);

    // サイト名を表示（URLのホスト部分）
    const link = document.createElement("a");
    link.href = url;
    const hostname = new URL(url).hostname; // URLからホスト名を取得
    const shortUrl =
      hostname.length > 5 ? hostname.slice(0, 5) + "..." : hostname; // ホスト名を短縮
    link.textContent = shortUrl; // 短縮したサイト名を設定
    link.target = "_blank"; // 新しいタブで開くように設定
    linkContainer.appendChild(link);

    // リンクを横並びにするためのスタイルを設定
    linkContainer.style.marginRight = "10px"; // 各リンクの間隔を調整
    linkContainer.style.textAlign = "center"; // 中央揃え

    linksList.appendChild(linkContainer);
  });
}

// 現在のURLをテキストエリアに追加
addUrlButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;

    // Webページのタイトルを取得
    const title = tabs[0].title;

    // contentAreaにURLとタイトルを追加
    contentArea.value += (contentArea.value ? "\n" : "") + title + "\n" + url;

    updateLinks(); // リストを更新

    if (currentTab) {
      tabsData[currentTab].content = contentArea.value;
      localStorage.setItem("tabsData", JSON.stringify(tabsData));
    }
  });
});

// タブ追加イベント
addTabButton.addEventListener("click", () => {
  addNewTab();
});

// テキストエリアの変更をリアルタイム保存
contentArea.addEventListener("input", () => {
  if (currentTab) {
    tabsData[currentTab].content = contentArea.value;
    localStorage.setItem("tabsData", JSON.stringify(tabsData));
    updateLinks();
  }
});

function deleteTab(tabName, tabId) {
  if (Object.keys(tabsData).length === 1) {
    alert("最後のタブは削除できません");
    return;
  }

  if (confirm(`本当に${tabName}を削除しますか？`)) {
    // タブを削除
    delete tabsData[tabName];
    localStorage.setItem("tabsData", JSON.stringify(tabsData));

    // タブ名の繰り下げ
    const remainingTabs = Object.keys(tabsData).sort(); // タブ名をソート
    const deletedTabIndex = parseInt(tabName.replace("tab", ""), 10); // 数字部分を取得

    for (let i = deletedTabIndex; i <= remainingTabs.length; i++) {
      const oldTabName = `tab${i + 1}`; // 古いタブ名
      const newTabName = `tab${i}`; // 新しいタブ名を設定

      if (tabsData[oldTabName]) {
        tabsData[newTabName] = tabsData[oldTabName]; // データを移動
        delete tabsData[oldTabName]; // 古いタブ名を削除
      }
    }

    // ローカルストレージを更新
    localStorage.setItem("tabsData", JSON.stringify(tabsData));

    // UIを更新
    updateTabsUI();

    if (tabName == currentTab && tabName == "tab1") {
      currentTab = null;
      setActiveTab(Object.keys(tabsData)[0]);
    } else if (tabName == currentTab) {
      currentTab = null;
      setActiveTab(Object.keys(tabsData)[deletedTabIndex - 2]);
    } else if (parseInt(currentTab.replace("tab", ""), 10) > deletedTabIndex) {
      const activetab = `tab${parseInt(currentTab.replace("tab", ""), 10) - 1}`;
      currentTab = null;
      setActiveTab(activetab);
    } else {
      const activetab = currentTab;
      currentTab = null;
      setActiveTab(activetab);
    }
  }
}

// タブUIを更新する関数
function updateTabsUI() {
  tabsContainer.innerHTML = ""; // 既存のタブボタンを削除

  // 新しいタブをUIに追加
  for (const tabName in tabsData) {
    addTabButtonUI(tabName, tabsData[tabName].id);
  }
}

// マウスホイールで横スクロールを追加（オプション）
document
  .getElementById("tabs-container")
  .addEventListener("wheel", function (e) {
    if (e.deltaY !== 0) {
      // マウスホイールの上下動作を検出
      this.scrollLeft += e.deltaY; // 横スクロール
      e.preventDefault(); // デフォルトの縦スクロールを防止
    }
  });

// Notionに書き込みボタンがクリックされたときの処理
writeToNotionButton.addEventListener("click", () => {
  const tabContent = tabsData[currentTab].content; // メモ内容
  const tabId = tabsData[currentTab].id; // タブID

  // Notion APIにデータを送信する
  fetch("https://great-memo.vercel.app/api/notion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tabId: tabId, // タブID
      tabContent: tabContent, // メモ内容
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Notionに書き込み成功:", data);
      alert("Notionに書き込みました");
    })
    .catch((error) => {
      console.error("Notionへの書き込みエラー:", error);
      alert("Notionへの書き込みに失敗しました");
    });
});

// textarea内でTabキーによるフォーカス移動を無効化
document
  .getElementById("content-area")
  .addEventListener("keydown", function (event) {
    if (event.key === "Tab") {
      event.preventDefault(); // Tabキーによるデフォルトの動作を無効にする
      const textarea = event.target;
      const cursorPosition = textarea.selectionStart; // カーソルの位置
      const textBefore = textarea.value.substring(0, cursorPosition); // カーソル前のテキスト
      const textAfter = textarea.value.substring(cursorPosition); // カーソル後のテキスト

      // Tabキーを押した時にスペースを挿入する（インデント）
      textarea.value = textBefore + "\t" + textAfter;
      textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1; // カーソル位置をインデント後に合わせる
    }
  });

// 初期化
initializeTabs();
