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
}

const copyToClipboard = (tab, text, html) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: copy,
    args: [text, html]
  });
};

const updateContextMenus = async () => {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: "context-title",
    title: "Title",
    contexts: ["all"]
  });
  chrome.contextMenus.create({
    id: "context-url",
    title: "URL",
    contexts: ["all"]
  });
  chrome.contextMenus.create({
    id: "context-title-url",
    title: "Title URL",
    contexts: ["all"]
  });
  chrome.contextMenus.create({
    id: "context-html",
    title: "HTML",
    contexts: ["all"]
  });
  chrome.contextMenus.create({
    id: "context-markdown",
    title: "Markdown",
    contexts: ["all"]
  });
  chrome.contextMenus.create({
    id: "context-richtext",
    title: "RichText",
    contexts: ["all"]
  });
};

chrome.runtime.onInstalled.addListener(updateContextMenus);
chrome.runtime.onStartup.addListener(updateContextMenus);
chrome.contextMenus.onClicked.addListener((info, tab) => {
  var url = tab.url
  var title = tab.title
  var text = null
  var html = null
  switch (info.menuItemId) {
    case 'context-title':
      text = title
      break;
    case 'context-url':
      text = url
      break;
    case 'context-title-url':
      text = title + '\n' + url
      break;
    case 'context-html':
      text = '<a href="' + url + '">' + title + '</a>'
      break;
    case 'context-markdown':
      text = '[' + title + '](' + url + ')'
      break;
    case 'context-richtext':
      text = title
      html = '<a href="' + url + '">' + title + '</a>'
      break;
  }
  copyToClipboard(tab, text, html);
});