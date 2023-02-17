function extractVideoId(url) {
  const regex = /watch\?v=(\w{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Extracts the captions JSON from the HTML of the video page
function _extractCaptionsJson(html, videoId) {
  const splittedHtml = html.split('"captions":');

  // Check for too many requests
  if (splittedHtml.length <= 1) {
    if (html.includes('class="g-recaptcha"')) {
      throw new Error(`TooManyRequests: ${videoId}`);
    }
    // Check for video availability
    if (!html.includes('"playabilityStatus":')) {
      throw new Error(`VideoUnavailable: ${videoId}`);
    }
    // Check for transcripts availability
    throw new Error(`TranscriptsDisabled: ${videoId}`);
  }

  // Extract the captions JSON
  const captionsJson = JSON.parse(
    splittedHtml[1]
      .split(',"videoDetails')[0]
      .replace(/\n/g, '')
  ).playerCaptionsTracklistRenderer;

  // Check for transcripts availability
  if (!captionsJson) {
    throw new Error(`TranscriptsDisabled: ${videoId}`);
  }

  // Check for the presence of caption tracks
  if (!captionsJson.captionTracks) {
    throw new Error(`NoTranscriptAvailable: ${videoId}`);
  }

  return captionsJson;
}

// Fetches the captions of the video as XML
async function getCaptionAsXml(youtubeLink) {
  const youtubeId = extractVideoId(youtubeLink)
  //const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const targetUrl = 'https://www.youtube.com/watch?v=' + youtubeId;
  return fetch(targetUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.text();
    })
    .then(data => {
      const link = _extractCaptionsJson(data.toString(), youtubeId)
      return fetch(link.captionTracks[0].baseUrl)
        .then(response => response.text())
        .then(data => {
          return data
        })
        .catch(error => {
          alert(error)
          console.log(error);
        });
    })
    .catch(error => {
      console.error(error);
    });
}

function getTextFromXML(xml) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(xml, "application/xml");
  var textNodes = doc.getElementsByTagName("text");
  var text = "";
  for (var i = 0; i < textNodes.length; i++) {
    text += textNodes[i].textContent;
  }
  return text;
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SUMMARIZE") {
    let text;

    // If there's an active text input
    if (message.url.includes("https://www.youtube.com/")) {
      text = message.url;
      getCaptionAsXml(text).then(data => {
        fetch("http://localhost:3000/youtube-summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: getTextFromXML(data) }),
        })
          .then((response) => response.json())
          .then(async (data) => {
            alert(`Summary: ${data.reply}`);
            restoreCursor();
          })
          .catch((error) => {
            restoreCursor();
            alert(
              "Error. Make sure you're running the server by following the instructions on https://github.com/LaurentiuGabriel/youtube-summarizer-extension. Also make sure you don't have an adblocker preventing requests to localhost:3000."
            );
            throw new Error(error);
          });
      })
    } else {
      alert(
        "This is not a YouTube video! Please go to the page of a youtube video."
      );
    }
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
