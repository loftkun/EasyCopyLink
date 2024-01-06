const copy = (text, html) => {
  const listener = (event) => {
    event.clipboardData.setData("text/plain", text);
    if (html) {
      event.clipboardData.setData("text/html", html);
    }
    event.preventDefault();
  };
  document.addEventListener("copy", listener);
  document.execCommand("copy");
  document.removeEventListener("copy", listener);
};

const copyToClipboard = (tab, text, html) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: copy,
    args: [text, html]
  }).catch((err) => {
    onExecuteScriptError(err);
  });
};

// executeScript() cannot work on special pages such as followings:
// chrome://
// https://chromewebstore.google.com
function onExecuteScriptError(err) {
  chrome.notifications.create(
    "Notification",
    {
      type: "basic",
      iconUrl: "icon/128.png",
      title: chrome.i18n.getMessage("appName"),
      message: err.message + "\n" + chrome.i18n.getMessage("notification"),
    }
  );
  chrome.notifications.clear("Notification");
}

const menuDefinition = [
  { key: 'chkTitle', title: 'Title' },
  { key: 'chkURL', title: 'URL' },
  { key: 'chkTitleURL', title: 'Title URL' },
  { key: 'chkHTML', title: 'HTML' },
  { key: 'chkMarkdown', title: 'Markdown' },
  { key: 'chkRichText', title: 'RichText' }
];

const onInstalled = async () => {
  // enable all formats
  for (let def of menuDefinition) {
    await chrome.storage.sync.set({ [def.key]: true });
  }
  updateContextMenus();
};

const updateContextMenus = async () => {
  await chrome.contextMenus.removeAll();
  for (let def of menuDefinition) {
    const enable = (await chrome.storage.sync.get(def.key))[def.key];
    if (enable) {
      chrome.contextMenus.create({
        id: def.key,
        title: def.title,
        contexts: ["all"]
      });
    }
  }
};

chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onStartup.addListener(updateContextMenus);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  updateContextMenus();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  var url = tab.url
  var title = tab.title
  var text = null
  var html = null
  switch (info.menuItemId) {
    case 'chkTitle':
      text = title
      break;
    case 'chkURL':
      text = url
      break;
    case 'chkTitleURL':
      text = title + '\n' + url
      break;
    case 'chkHTML':
      text = '<a href="' + url + '">' + title + '</a>'
      break;
    case 'chkMarkdown':
      text = '[' + title + '](' + url + ')'
      break;
    case 'chkRichText':
      text = title
      html = '<a href="' + url + '">' + title + '</a>'
      break;
  }
  copyToClipboard(tab, text, html);
});