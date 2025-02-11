chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'webmemoInfoRequest') {
    console.log("Web Memo Info request received: ");
    if (message.type === 'page' || message.type === 'link' || message.type === 'image') {
      let profile = getProfile(message.scope, message.linkUrl, message.imageSrc);
      console.log("Profile:", profile)
      sendResponse({ status: 'success', data: profile, pageUrl: window.location.href });
    }
  }
});

console.log('web-memo-content.js loaded - Web Memo extension is active');

const getProfile = (scope, linkUrl, imageSrc) => {


  const profile = {}

  profile.pageTitle = document.title;
  profile.pageUrl = window.location.href;
  // find first h1 element
  const h1Element = document.querySelector('h1');
  if (h1Element) {
    profile.pageHeader = h1Element.innerText || h1Element.textContent;
  }

  if (scope == "link") {
    profile.linkUrl = window.location.href;
    profile.selectionText = window.getSelection().toString();
    const linkInfo = getLinkInfo(linkUrl);
    if (linkInfo) {
      profile.linkText = linkInfo.linkText;
      profile.href = linkInfo.href;
    }
  }
  if (scope == "image") {
    profile.imageSrc = imageSrc
    // find alt text for image
    const imageElement = document.querySelector(`img[src="${imageSrc}"]`);
    if (imageElement) {
      profile.altText = imageElement.alt;
    }
  }

  return profile
}


function getLinkInfo(linkUrl) {
  console.log(`inside console.js `, linkUrl)

  let theLink
  const links = document.querySelectorAll(`a`);
  // print href for every link
  for (let i = 0; i < links.length; i++) {
    //    console.log(links[i].href);
    if (links[i].href == linkUrl) {
      console.log("Link found as global link: ", linkUrl);
      theLink = links[i];
      break;
    }
  }
  if (!theLink) {
    const linkUrlWithoutSource = linkUrl.replace(window.location.href, '');
    for (let i = 0; i < links.length; i++) {
      //    console.log(links[i].href);
      if (links[i].href == linkUrlWithoutSource) {
        console.log("Link found as local link: ", linkUrlWithoutSource);
        theLink = links[i];
        break;
      }
    }
  }

  if (theLink) {
    const linkElement = theLink;
    const linkText = linkElement.innerText || linkElement.textContent;
    const id = linkElement.id;
    return {
      linkText: linkText,
      href: linkUrl,
      id: id
    };
  }


  return null;
}

