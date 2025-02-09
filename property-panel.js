console.log(`property-panel.js loaded - Web Memo extension is active`);

let panel, panelHeader, tagContainer
document.addEventListener('treeContentLoaded', function () {
    panel = document.getElementById("property-panel");
    panelHeader = document.getElementById("property-panel-header")
    console.log(`property-panel.js loaded - Web Memo extension is active`, panelHeader);
    tagContainer = document.getElementById("tag-container")
//    tagContainer.style.display = "none";
    tagContainer.addEventListener("click", () => {
        focusInput()
    })
})

document.addEventListener("click", (event) => {
    // panel = document.getElementById("property-panel");
    // panelHeader = document.getElementById("property-panel-header")
    // console.log(`property-panel.js loaded - Web Memo extension is active`, panel);
    if (!panel.contains(event.target) && !event.target.classList.contains("node-label")) {
        hidePropertyPanel();
    }
});

export function showPropertyPanel(node) {
    const panelContent = document.getElementById("property-content");
    if (node.type == 'project') {
        panelHeader.innerText = node.name
        panelContent.innerHTML = `
  <p><strong>Type:</strong> ${node.type || "Unknown"}</p>
`
    }
    else {
        panelHeader.innerText = node.name
        panelContent.innerHTML = `
    <p><a href="${node.imageSrc || node.url}" target="_new">Open in browser</a></p>
  `;
        if (node.imageSrc) {
            panelContent.innerHTML += `<img src="${node.imageSrc}" />`
        }
    }
    if (node.notes) {
        panelContent.innerHTML += `<p><strong>Notes:</strong>${node.notes}`
    }
    // TODO date created is a string, not a date object
    if (node.dateCreated) panelContent.innerHTML += `<p><strong>Date Created:</strong> ${new Date(node.dateCreated).toLocaleDateString()}</p>`
    //    panelContent.innerHTML += `<p><strong>Date Created:</strong> ${node.dateCreated}</p>`
    // Edit Button
    let editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.onclick = () => showEditPanel(node);
    panelContent.appendChild(editButton);
    panel.style.display = "block";

}

// Close Property Panel
export function hidePropertyPanel() {
    panel.style.display = "none";
}

// from editable property panel in network-navigator
// let options
// const datalistId = `datalist-${key}`;
// if (editable) {
//     const suggestions = getTopValuesForProperty(cy, key);
//     options = suggestions.map(value => `<option value="${value}">${value}</option>`).join('');
// }


// const div = document.createElement('div');
// div.innerHTML = `<label>${key}: </label>`;
// if (options) {
//     div.innerHTML +=
//         `<input list="${datalistId}" value="${data[key]}" data-key="${key}" />
//   <datalist id="${datalistId}">
//     ${options}
//   </datalist>`
// } else {
//     div.innerHTML +=
//         `<input type="text" value="${value}" data-key="${key}" ${!editable ? 'disabled' : ''} />`
// }
// propertyList.appendChild(div);


function showEditPanel(node) {
    let editPanel = document.getElementById("edit-panel");
    editPanel.innerHTML = ""; // Clear previous content

    let title = document.createElement("h3");
    title.textContent = `Edit ${node.name}`;
    editPanel.appendChild(title);

    let form = document.createElement("form");

    for (let key in node) {
        if (key !== "children" && key !== "id" && key !== "type") { // Skip children property
            let label = document.createElement("label");
            label.textContent = key;

            let input;
            if (key === "notes") {
                // Use textarea for notes
                input = document.createElement("textarea");
                input.rows = 4; // Adjust height
                input.cols = 40;
            } else {
                // Use regular input for other fields
                input = document.createElement("input");
                input.type = "text";
            }

            input.value = node[key];
            input.dataset.key = key; // Store key for easy reference

            form.appendChild(label);
            form.appendChild(input);
            form.appendChild(document.createElement("br"));
        }
    }

    // Save Button
    let saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.type = "button";
    saveButton.onclick = () => saveNodeEdits(node, form);
    form.appendChild(saveButton);

    // Cancel Button
    let cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.type = "button";
    cancelButton.onclick = () => (editPanel.style.display = "none");
    form.appendChild(cancelButton);

    editPanel.appendChild(form);
    editPanel.style.display = "block"; // Show panel
}


function saveNodeEdits(node, form) {
    let inputs = form.querySelectorAll("input, textarea"); // Include textareas
    inputs.forEach(input => {
        let key = input.dataset.key;
        node[key] = input.value; // Update node
    });

    document.getElementById("edit-panel").style.display = "none"; // Hide edit panel
    showPropertyPanel(node); // Refresh property panel with new values
    document.dispatchEvent(new CustomEvent("treeChanged", { detail: {} }));

}

const existingTags = ["JavaScript", "HTML", "CSS", "React", "Vue", "Angular", "Node.js", "Python"];
const selectedTags = new Set();

let tagsDiv, input, suggestionsDiv
document.addEventListener('treeContentLoaded', function () {
   tagsDiv = document.getElementById("tags");
   input = document.getElementById("tag-input");
   suggestionsDiv = document.getElementById("suggestions");

   input.addEventListener("input", showSuggestions);



   input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && input.value.trim() !== "") {
        addTag(input.value.trim());
        event.preventDefault();
    }
});

document.addEventListener("click", (event) => {
    if (!document.querySelector(".tag-container").contains(event.target)) {
        hideSuggestions();
    }
});
})    

function addTag(tag) {
    if (!selectedTags.has(tag)) {
        selectedTags.add(tag);
        renderTags();
    }
    input.value = "";
    hideSuggestions();
}

function removeTag(tag) {
    selectedTags.delete(tag);
    renderTags();
}

function renderTags() {
    tagsDiv.innerHTML = "";
    selectedTags.forEach(tag => {
        const tagEl = document.createElement("div");
        tagEl.classList.add("tag");
        tagEl.innerHTML = `${tag} <span class="remove" >&times;</span>`;
        tagEl.addEventListener("click", () => {
            removeTag(tag);
        })
        tagsDiv.appendChild(tagEl);
    });
}

function showSuggestions() {
    const value = input.value.toLowerCase();
    suggestionsDiv.innerHTML = "";
    if (value.length > 0) {
        const filteredTags = existingTags.filter(tag => tag.toLowerCase().includes(value));
        filteredTags.forEach(tag => {
            const div = document.createElement("div");
            div.textContent = tag;
            div.onclick = () => addTag(tag);
            suggestionsDiv.appendChild(div);
        });
        suggestionsDiv.style.display = filteredTags.length > 0 ? "block" : "none";
    } else {
        hideSuggestions();
    }
}

function hideSuggestions() {
    suggestionsDiv.style.display = "none";
}


function focusInput() {
    input.focus();
}
