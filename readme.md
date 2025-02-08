# Chrome Extension - Web Memo Extension

This Chrome Extension adds a menu item to the context menu for any web page and an additional one when the context menu is opened for a <A> or a <IMG> element. When the menu item is activated, the properties of the page or the specific element are captured from the DOM in the current document and communicated to the Side Panel. The Side Panel contains a tree navigator with Project nodes that contain entries for web pages, links and images, annotated and timestamped (and possibly child projects). When details for a page, link or image are communicated to the side panel, a new node is created under the currently selected node (typically but not necessarily a project node)

Double click on a tree node of type page, image or link will open a browser tab that loads the associated content.
A single click on a tree node will bring up the property palette with the captured properties for the node.
Nodes can be dragged an dropped in tree, allowing the user to assign entries to a different project. 
Nodes can be removed using the delete option in the tree node's context menu.
The data for this extension is saved to and reloaded from local storage upon opening the side panel.
Projects can be saved to file. Projects can be imported from uploaded file and from a remote URL.

## Implementation details

The following mechanisms are at play:
* define permissions for contextMenus, sidePanel, activeTab and scripting in manifest.json 
* define the context menu item in `background.js`
  * define the action to take when the item is cLicked: send message (to web-memo-content.js), ask for page or element details, send response as message (to side_panel.js); the asynchronous single message-response is used with the active tab (where web-memo-content.js listens for the message)
* in `web-memo-content.js`: when a message of type *webmemoInfoRequest* is received, details are established and a response message is sent (to `background.js`)
* the message is received in `background.js`. From it, a new message of type *webmemoInfo* is created and sent (to `web-memo-side_panel.js`)
* in `web-memo-side_panel.js` - the message is received and its contents is added to the tree data collection
* every 5 seconds if there are have been changes to the tree data, it is saved to the browser local storage

## Installation

* Clone the Git repository
* Open your Chromium browser - Google Chrome, Microsoft Edge, Brave Browser
* Open the *Manage Extensions* page
* Make sure the *Developer Mode* is activated
* Click on the button *Load Unpacked*
* Select the directory on your local file system that contains the file `manifest.json`, part of the cloned repository
* The extension should be loaded into your browser and it should be added to the list of extensions
* You can now open the extension's side panel page from the context menu on the 'Manage Extensions' icon  