chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'webmemoGoodreadsRequest') {
    console.log("Web Memo Goodreads Info request received: ");
    let profile = getGoodreadsProfile(message.linkUrl);
    console.log("Profile:", profile)
    sendResponse({ status: 'success', data: profile, pageUrl: window.location.href });
  }
});

console.log('goodreads-content.js loaded - Web Memo extension is active');

const getGoodreadsProfile = () => {


  const profile = {}

  profile.pageTitle = document.title;
  profile.pageUrl = window.location.href;

  return profile
}

