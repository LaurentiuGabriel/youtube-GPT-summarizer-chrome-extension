// Create a context menu item
chrome.contextMenus.create({
  id: "terms",
  title: "Terms and Conditions Checker",
  contexts: ["all"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.sendMessage(tab.id, { type: "CHECK", url: tab.url });
});