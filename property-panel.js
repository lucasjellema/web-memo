import { showEditPanel } from './edit-property-panel.js';

console.log(`property-panel.js loaded - Web Memo extension is active`);

let panel, panelHeader, tagContainer, readonlyTagsDiv, endPropertyContent, endPropertyEditContent, propertyEditContent

let modal, propertyList, closeButton,editButton, modalTitle
document.addEventListener('treeContentLoaded', function () {
    modal = document.getElementById('propertiesPanel');
    propertyList = document.getElementById('propertyList');
    closeButton = document.getElementById('closeButton');
    editButton = document.getElementById('editButton');

    modalTitle = document.getElementById('propertiesPanelTitle');


    readonlyTagsDiv = document.getElementById("readonly-tags");
})

document.addEventListener("click", (event) => {
    if (!modal.contains(event.target) && !event.target.classList.contains("node-label")) {
        hidePropertyPanel();
    }
});

let nodeToShow = null;

export function showPropertyPanel(node,harvestedTags) {
    nodeToShow = node;
    modalTitle.textContent = node.name;
    propertyList.innerHTML = ''; // Clear the property list
    // Populate the modal with the element's current properties

    for (const key in node) {
        // skip property id 
        if (key === 'id' || key === 'children' || key === 'subtype' || key === 'shape'|| key === 'tags'|| key === 'show') continue;


        let value = node[key];
        if (!value) continue;
        // if property is timeOfCreation, show it in a human legible time date format, and make it non editable

        if (key === 'timeOfCreation') {
            const date = new Date(node[key]);
            value = date.toLocaleString();
        }
        const div = document.createElement('div');
        if (key.toLocaleLowerCase().endsWith('url')) {
            const linkOpener = document.createElement('span');
            linkOpener.textContent = `Open ${key} in new Tab`;
            linkOpener.addEventListener('click', () => {
                window.open(value, '_blank');
            });
            div.appendChild(linkOpener);


        }
        // if key ends with image than show image
        else if (key.toLocaleLowerCase().endsWith('image')) {
            const image = document.createElement('img');
            if (value.startsWith('url("')) {
                //remove first 5 and last 2 characters                
                const v = value.substring(5, value.length - 2);
                image.src = v;
            }
            else
                image.src = value;

            image.width = 100;
            image.height = 100;
            div.appendChild(image);
        }
        else {
            div.innerHTML = `<label>${key}: ${value}</label>`;
        }
        propertyList.appendChild(div);
    }
    renderTags(node.tags);
    editButton.onclick = () => showEditPanel(node, harvestedTags);
    closeButton.onclick = () => hidePropertyPanel();

    // Show the modal
    modal.style.display = 'block';

}

// Close Property Panel
export function hidePropertyPanel() {
    nodeToShow = null;
    modal.style.display = 'none';

    //panel.style.display = "none";

}


function renderTags(tags) {
    readonlyTagsDiv.innerHTML = "";
    if (tags)
    for (const tag of tags) {
        // Read-only tags
        const readonlyTagEl = document.createElement("div");
        readonlyTagEl.classList.add("readonly-tag");
        readonlyTagEl.textContent = tag;
        readonlyTagsDiv.appendChild(readonlyTagEl);
    };
}

