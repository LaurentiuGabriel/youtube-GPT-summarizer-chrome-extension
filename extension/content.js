// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CHECK") {
    let text;

    // If there's an active text input
      text = window.getSelection().toString();
        fetch("http://localhost:3000/eula-summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: data }),
        })
          .then((response) => response.json())
          .then(async (data) => {
            alert(`Checker: ${data.reply}`);
            restoreCursor();
          })
          .catch((error) => {
            restoreCursor();
            alert(
              "Error. Make sure you're running the server by following the instructions on https://github.com/LaurentiuGabriel/youtube-summarizer-extension. Also make sure you don't have an adblocker preventing requests to localhost:3000."
            );
            throw new Error(error);
          });
    // } else {
    //   alert(
    //     "Something went wrong! Make sure the terms and conditions are not too large to be handled for ChatGPT. Try to send less text!"
    //   );
    // }
  }
});

const showLoadingCursor = () => {
  const style = document.createElement("style");
  style.id = "cursor_wait";
  style.innerHTML = `* {cursor: wait;}`;
  document.head.insertBefore(style, null);
};

const restoreCursor = () => {
  document.getElementById("cursor_wait").remove();
};
