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
    documentUrlPatterns: ["https://www.google.com/maps/*"]
  });
  chrome.contextMenus.create({
    id: "webmemoLinkedInInfoForNetwork",
    title: "Make Web Memo for LinkedIn Contact",
    contexts: ["page"],
    documentUrlPatterns: ["*://www.linkedin.com/*"]
  });
  chrome.contextMenus.create({
    id: "webmemoImdbInfoForNetwork",
    title: "Make Web Memo for IMDb",
    contexts: ["page"],
    documentUrlPatterns: ["*://www.imdb.com/*"]
  });
  chrome.contextMenus.create({
    id: "webmemoGitHubInfoForNetwork",
    title: "Make Web Memo for GitHub Repository",
    documentUrlPatterns: ["*://github.com/*"]
  });
  chrome.contextMenus.create({
    id: "webmemoGoodreadsInfoForNetwork",
    title: "Make Web Memo for Goodreads Book",
    documentUrlPatterns: ["*://www.goodreads.com/*"]
  });
  chrome.contextMenus.create({
    id: "webmemoSpotifyInfoForNetwork",
    title: "Make Web Memo for Spotify Song",
    documentUrlPatterns: ["*://open.spotify.com/*"]
  });
  chrome.contextMenus.create({
    id: "webmemoWikipediaInfoForNetwork",
    title: "Make Web Memo for Wikipedia Page",
    documentUrlPatterns: ["*://en.wikipedia.org/*"]
  });
});


chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "webmemoLinkInfoForNetwork") {
    await handleWebmemoInfo(info, tab, 'link');
  }
  if (info.menuItemId === "webmemoImageInfoForNetwork") {
    await handleWebmemoInfo(info, tab, 'image');
  }
  if (info.menuItemId === "webmemoPageInfoForNetwork") {
    await handleWebmemoInfo(info, tab, 'page');
  }
  if (info.menuItemId === "webmemoGoogleMapsInfoForNetwork") {
    await handleWebmemoInfo(info, tab, 'location');
  }
  if (info.menuItemId === "webmemoLinkedInInfoForNetwork") {
    await handleLinkedInInfo(info, tab);
  }
  if (info.menuItemId === "webmemoImdbInfoForNetwork") {
    await handleImdbInfo(info, tab);
  }
  if (info.menuItemId === "webmemoGitHubInfoForNetwork") {
    await handleGitHubInfo(info, tab);
  } 
  if (info.menuItemId === "webmemoGoodreadsInfoForNetwork") {
    await handleGoodreadsInfo(info, tab);
  }
  if (info.menuItemId === "webmemoSpotifyInfoForNetwork") {
    await handleSpotifyInfo(info, tab);
  }
  if (info.menuItemId === "webmemoWikipediaInfoForNetwork") {
    await handleWikipediaInfo(info, tab);
  }

});


async function handleWebmemoInfo(info, tab, scope) {
  (async () => {
    console.log(`${scope} web memo info request ` + JSON.stringify(info))
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'webmemoInfoRequest', scope: scope, linkUrl: info.linkUrl, imageSrc: info.srcUrl });
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

async function handleLinkedInInfo(info, tab) {
  console.log('linkedIn person info clicked ', info);
  //await chrome.sidePanel.open({ tabId: tab.id });
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'webmemoLinkedInInfoRequest' });
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'linkedInProfile',
      profile: response.data,
      linkedInUrl: response.linkedInUrl
    });
  })()
}


async function handleImdbInfo(info, tab) {
  console.log('imdb info clicked ', info);
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'webmemoImdbInfoRequest' });
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'imdbProfile',
      profile: response.data,
      imdbUrl: response.imdbUrl
    });
  })()
}


async function handleGitHubInfo(info, tab) {
  console.log('github info clicked ', info);
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'webmemoGitHubRequest' });
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'githubProfile',
      profile: response.data,
    });
  })()
}
async function handleGoodreadsInfo(info, tab) {
  console.log('goodreads info clicked ', info);
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'webmemoGoodreadsRequest' });
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'goodreadsProfile',
      profile: response.data,
    });
  })()
}

async function handleSpotifyInfo(info, tab) {
  console.log('spotify info clicked ', info);
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'webmemoSpotifyRequest' });
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'spotifyProfile',
      profile: response.data,
    });
  })()
}

async function handleWikipediaInfo(info, tab) {
  console.log('wikipedia info clicked ', info);
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'webmemoWikipediaRequest' });
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'wikipediaProfile',
      profile: response.data,
    });
  })()
}

