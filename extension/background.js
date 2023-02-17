// Create a context menu item
chrome.contextMenus.create({
  id: "youtube-summary",
  title: "Summarize Youtube Video",
  contexts: ["all"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "youtube-summary") {
    chrome.tabs.sendMessage(tab.id, { type: "SUMMARIZE", url: tab.url });
  }
});