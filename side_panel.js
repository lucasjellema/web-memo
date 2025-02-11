import { processWebmemoMessage } from './processWebmemoMessage.js';
import {processLinkedInProfile} from './processLinkedInProfile.js'
import {processImdbProfile} from './processImdbProfile.js'
import { processGitHubProfile } from './processGitHubProfile.js'; 
import { addTreeNode, createTree } from './tree.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'webmemoProfile') {
    const memoNode = processWebmemoMessage(message);
    addTreeNode(memoNode);
  }
  if (message.type === 'linkedInProfile') {
    const memoNode = processLinkedInProfile(message);
    addTreeNode(memoNode);
  }
  if (message.type === 'imdbProfile') {
    const memoNode = processImdbProfile(message);
    addTreeNode(memoNode);
  }
  if (message.type === 'githubProfile') {
    const memoNode = processGitHubProfile(message);
    addTreeNode(memoNode);
  }

});

document.addEventListener('DOMContentLoaded', function () {
fetch("web-memo.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("web-memo-app").innerHTML = data;

    // The DOMContentLoaded event fires when the initial HTML document has been completely parsed, but it does not wait for external resources like images, stylesheets, or scripts fetched asynchronously (e.g., via fetch()).

// Why is DOMContentLoaded not enough for fetch()?
// DOMContentLoaded fires when the HTML is parsed but before fetch() completes.
// The fetch() request is asynchronous, so the external HTML content is loaded after DOMContentLoaded.
// Instead of relying on DOMContentLoaded, you should ensure the content is fully loaded before using it.
    console.log("Content loaded:");
    // Fire a custom event to notify that content has been loaded
    document.dispatchEvent(new Event("treeContentLoaded"));
    
  });
})
