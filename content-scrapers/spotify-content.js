chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // I will let ChatGPT explain:
  // chrome.tabs.sendMessage() only supports synchronous message passing by default. If the content script's listener is asynchronous, it doesn't return a response immediately, and sendMessage() doesn't actually wait for the async operation to complete. Instead, it resolves as soon as the listener returns, which may happen before your async operation is done.

  // Solution:
  // You need to return a Promise inside the message listener.
  // Explanation:
  // The message listener is asynchronous, but since the callback itself isn't async, we manually wrap it in an IIFE (Immediately Invoked Function Expression).
  // The sendResponse function is used inside the async operation.
  // The critical part: returning true from the listener keeps the messaging channel open, allowing the async operation to complete before sending the response.

  (async () => {
    try {
      console.log("Received message:", message);
      if (message.type === 'webmemoSpotifyRequest') {
        console.log("Web Memo Spotify Info request received: ");
        let profile = await getSpotifyProfile();
        console.log("Profile:", profile)
        sendResponse({ status: 'success', data: profile, pageUrl: window.location.href });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  })();
  return true; // Keeps the message channel open for async sendResponse

});

console.log('spotify-content.js loaded - Web Memo extension is active');

const getSpotifyProfile = async () => {
  const profile = {}
  profile.pageTitle = document.title;
  profile.pageUrl = window.location.href;
  await scrapeSongData(profile);
  return profile
}

const scrapeSongData = async (profile) => {
  // section with data-testid="track-page"
  const trackPageElement = document.querySelector('section[data-testid="track-page"]');
  if (trackPageElement) {
    // find image
    const imageElement = trackPageElement.querySelector('img');
    profile.image = imageElement.src;
    profile.songTitle = imageElement.alt;

    // find div with class trackInfo
    const div = imageElement.parentElement.parentElement.parentElement
    // find span with data-testid="entityTitle" in div
    const span = div.querySelector('span[data-testid="entityTitle"]');
    if (span) {
      profile.title = span.textContent.trim();
      const divWithArtist = span.nextElementSibling
      if (divWithArtist) {
        // find span with data-testid="creator-link"
        const aWithArtist = divWithArtist.querySelector('a[data-testid="creator-link"]');
        if (aWithArtist) {
          profile.artist = aWithArtist.textContent.trim();
          profile.artistUrl = aWithArtist.href;
          const grandparentDiv = aWithArtist.parentElement.parentElement
          if (grandparentDiv) {
            // find image of artist
            const artistImage = grandparentDiv.querySelector('img');
            if (artistImage) {
              profile.artistImage = artistImage.src;
            }
            const albumSpan = grandparentDiv.nextElementSibling.nextElementSibling
            if (albumSpan) {
              // find anchor   element inside
              const albumAnchor = albumSpan.querySelector('a');
              if (albumAnchor) {
                profile.album = albumAnchor.textContent.trim();
                profile.albumUrl = albumAnchor.href;
              }
              const yearSpan = albumSpan.nextElementSibling.nextElementSibling
              if (yearSpan) {
                profile.year = yearSpan.textContent.trim();
              }
              const durationSpan = yearSpan.nextElementSibling.nextElementSibling
              if (durationSpan) {
                profile.duration = durationSpan.textContent.trim();
              }

            }
          }
        }

      }
    }
    // find div with id context-menu
    const contextMenuElement = document.querySelector('div#context-menu');
    if (contextMenuElement) {
      // iterate over all spans and find the one with textcontent "View credits" in div
      for (const span of contextMenuElement.querySelectorAll('span')) {
        if (span.textContent.trim() === 'View credits') {

          const button = span.parentElement
          button.click();
          // wait 500 ms, then continue
          await delay(500);
          // find dialog with aria-label="Credits"
          const dialog = document.querySelector('dialog[aria-label="Credits"]');
          if (dialog) {

            // find P element with textcontext Written by
            const p = dialog.querySelectorAll('p');
            if (p) {
              for (const pElement of p) {
                if (pElement.textContent.trim() === 'Written by') {
                  // find all siblings (of type anchor and span) under same parent element  
                  const siblings = pElement.parentElement.querySelectorAll('a, span');
                  // iterate over all siblings and add their text content to the writtenBy property
                  const writtenBy = []
                  for (const sibling of siblings) {
                    if (sibling.tagName === 'A' || sibling.tagName === 'SPAN') {
                      // TODO add href for Anchor elements
                      writtenBy.push(sibling.textContent.trim())
                    }
                  }
                  profile.writtenBy = writtenBy
                }
                if (pElement.textContent.trim() === 'Performed by') {
                  // find all siblings (of type anchor and span) under same parent element  
                  const siblings = pElement.parentElement.querySelectorAll('a, span');
                  const performedBy = []
                  // iterate over all siblings and add their text content to the performedBy property
                  for (const sibling of siblings) {
                    if (sibling.tagName === 'A' || sibling.tagName === 'SPAN') {
                      // TODO add href for Anchor elements
                      performedBy.push(sibling.textContent.trim())
                    }
                  }
                  profile.performedBy = performedBy
                }
                if (pElement.textContent.trim() === 'Produced by') {
                  // find all siblings (of type anchor and span) under same parent element  
                  const siblings = pElement.parentElement.querySelectorAll('a, span');
                  const producedBy = []

                  // iterate over all siblings and add their text content to the producedBy property
                  for (const sibling of siblings) {
                    if (sibling.tagName === 'A' || sibling.tagName === 'SPAN') {
                      // TODO add href for Anchor elements
                      producedBy.push(sibling.textContent.trim())
                    }
                  }
                  profile.producedBy = producedBy
                }
              }
            }
            const button = dialog.querySelector('button[aria-label="Close"]');
            if (button) {
              button.click();
            }
          }

          break;
        }
      }
    }

  }

}

function delay(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

