chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'webmemoGitHubRequest') {
    console.log("Web Memo GiHub Info request received: ");
      let profile = getGitHubProfile( message.linkUrl);
      console.log("Profile:", profile)
      sendResponse({ status: 'success', data: profile, pageUrl: window.location.href });
  }
});

console.log('web-memo-content.js loaded - Web Memo extension is active');

const getGitHubProfile = () => {


  const profile = {}

  profile.pageTitle = document.title;
  profile.pageUrl = window.location.href;
  // // find first h1 element
  // const h1Element = document.querySelector('h1');
  // if (h1Element) {
  //   profile.pageHeader = h1Element.innerText || h1Element.textContent;
  // }

  // if (scope == "link") {
  //   profile.linkUrl = window.location.href;
  //   profile.selectionText = window.getSelection().toString();
  //   const linkInfo = getLinkInfo(linkUrl);
  //   if (linkInfo) {
  //     profile.linkText = linkInfo.linkText;
  //     profile.href = linkInfo.href;
  //   }
  // }
  // if (scope == "image") {
  //   profile.imageSrc = imageSrc
  //   // find alt text for image
  //   const imageElement = document.querySelector(`img[src="${imageSrc}"]`);
  //   if (imageElement) {
  //     profile.altText = imageElement.alt;
  //   }
  // }

  return profile
}

