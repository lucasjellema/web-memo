chrome.runtime.onInstalled.addListener(() => {  
  chrome.contextMenus.create({
    id: "webmemoPageInfoForNetwork",
    title: "Make Web Memo for Page",
    contexts: ["page"],
  });
  chrome.contextMenus.create({
    id: "webmemoLinkInfoForNetwork",
    title: "Make Web Memo for Link",
    contexts: ["link"],
  });
  chrome.contextMenus.create({
    id: "webmemoImageInfoForNetwork",
    title: "Make Web Memo for Image",
    contexts: ["image"],
  });
  chrome.contextMenus.create({
    id: "webmemoGoogleMapsInfoForNetwork",
    title: "Make Web Memo for Google Maps Location",
    documentUrlPatterns:["https://www.google.com/maps/*"]
  });
});


chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "webmemoLinkInfoForNetwork") {
    await handleWebmemoInfo(info, tab,'link');
  }
  if (info.menuItemId === "webmemoImageInfoForNetwork") {
    await handleWebmemoInfo(info, tab,'image');
  }
  if (info.menuItemId === "webmemoPageInfoForNetwork") {
    await handleWebmemoInfo(info, tab,'page');
  }
  if (info.menuItemId === "webmemoGoogleMapsInfoForNetwork") {
    await handleWebmemoInfo(info, tab,'location');
  }  
});


async function handleWebmemoInfo(info, tab, scope) {
  (async () => {
    console.log(`${scope} web memo info request ` + JSON.stringify(info))
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'webmemoInfoRequest', scope: scope, linkUrl: info.linkUrl, imageSrc : info.srcUrl });
    console.log(response);
    const profile = response.data;
    profile.type = 'webmemoProfile';
    profile.scope = scope;
    // profile.url = info.linkUrl;
    // profile.linkUrl = info.linkUrl;
    // profile.pageUrl = info.pageUrl;
    profile.notes = info.selectionText;
    chrome.runtime.sendMessage(profile);
  })()
}


// {
//   "menuItemId": "customImageContextMenu",
//   "editable": false,
//   "mediaType": "image",
//   "srcUrl": "https://example.com/image.jpg",
//   "pageUrl": "https://example.com",
//   "frameUrl": "https://example.com/frame",
//   "linkUrl": "https://example.com/link",
//   "selectionText": "",
//   "wasChecked": false,
//   "checked": false
// }
