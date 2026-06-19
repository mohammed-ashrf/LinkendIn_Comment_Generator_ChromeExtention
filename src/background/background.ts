chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "INSERT_COMMENT") {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {
          console.warn("Failed to send INSERT_COMMENT to tab");
        });
      }
    });
    sendResponse({ forwarded: true });
    return true;
  }
});