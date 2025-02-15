let tagContainer, propertyEditContent

let editModalTitle, saveButton, cancelButton
document.addEventListener('treeContentLoaded', function () {
    propertyEditContent = document.getElementById('property-edit-content')
    cancelButton = document.getElementById('cancelChanges');
    saveButton = document.getElementById('saveChanges');
    editModalTitle = document.getElementById('editModalTitle');
    tagContainer = document.getElementById("tag-container")
    tagContainer.style.display = "none";
    tagContainer.addEventListener("click", () => {
        focusInput()
    })
})


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

let nodeToEdit
const typeList = ['project', 'page', 'link', 'image', 'location', 'object', 'movie','technology', 'github', 'note','news','person','music','tv', 'book']

export function showEditPanel(node, harvestedTags) {
    nodeToEdit = node
    existingTags = Array.from(harvestedTags.values())

    let editPanel = document.getElementById("edit-panel");
    // replace current selectedTags with contents from node.tags
    selectedTags.clear();
    if (node.tags) node.tags.forEach(tag => selectedTags.add(tag));

    editModalTitle.textContent = `Edit ${node.type} ${node.name}`;
    propertyEditContent.innerHTML = '';
    let form = document.createElement("form");

    for (let key in node) {
        // TODO all internal properties should start with _
        if (key !== "children" && key !== "id" && key !== "tags"&& key !== "show") { 
            const div = document.createElement('div');
            div.innerHTML = `<label>${key}: </label>`;

            if (key === "notes") {
                div.innerHTML += `<textarea data-key="${key}" rows="4" cols="40">${node[key]}</textarea>`
            } else
                if (key === "type") {
                    let options = typeList.map(value => `<option value="${value}" ${value == node[key]?"selected":""}>${value}</option>`).join('');
                    div.innerHTML +=
                        `<select data-key="${key}" ">
                          ${options}
                        </select>`

                    //         `<input list="typesList" value="${node[key]}" data-key="${key}" />
                    //   <datalist id="typesList">
                    //     ${options}
                    //   </datalist>`
                } else {
                    div.innerHTML +=
                        `<input type="text" value="${node[key]}" data-key="${key}"  />`
                }
            form.appendChild(div);
        }
    }

    // // Save Button
    saveButton.onclick = () => saveNodeEdits(node, form, harvestedTags);
    cancelButton.onclick = () => (editPanel.style.display = "none");
    propertyEditContent.appendChild(form);
    tagContainer.style.display = "block";
    renderTags(selectedTags);
    editPanel.style.display = "block"; // Show panel
}


function saveNodeEdits(node, form, harvestedTags) {
    let inputs = form.querySelectorAll("input, textarea, select"); // Include textareas
    inputs.forEach(input => {
        let key = input.dataset.key;
        node[key] = input.value; // Update node
    });
    // save tags
    node.tags = Array.from(selectedTags);

    // add all tags to harvestedTags 
    for (const tag of node.tags) {
        harvestedTags.add(tag);
    }
    

    // Add new property if specified
    const key = newPropertyKey.value.trim();
    const value = newPropertyValue.value.trim();
    if (key) {
        node[key] = value;
    }

    document.getElementById("edit-panel").style.display = "none"; // Hide edit panel
    document.dispatchEvent(new CustomEvent("treeChanged", { detail: {} }));

}

let existingTags = ["JavaScript", "HTML", "CSS", "React", "Vue", "Angular", "Node.js", "Python"];
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
        renderTags(selectedTags);
    }
    input.value = "";
    hideSuggestions();
}

function removeTag(tag) {
    selectedTags.delete(tag);
    renderTags(selectedTags);
}

function renderTags(tags) {
    tagsDiv.innerHTML = "";
    for (const tag of tags) {

        const tagEl = document.createElement("div");
        tagEl.classList.add("tag");
        tagEl.innerHTML = `${tag} <span class="remove" >&times;</span>`;
        tagEl.addEventListener("click", () => {
            removeTag(tag);
        })
        tagsDiv.appendChild(tagEl);

    };
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
