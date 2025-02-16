import { saveProjects, getSavedProjects, getJSONFile, getQueryParam, generateGUID, harvestTags } from './utils.js';
import { showPropertyPanel, hidePropertyPanel } from './property-panel.js';
import { prepareSearch } from './search.js';
let changed = false;

setInterval(() => {
    if (changed) {
        changed = false
        saveProjects(data);
    }
}, 5000); // check every 5 seconds for a change

let data = [
    {
        id: "0",
        name: "Web Memo Projects",
        type: "root"
    }
];

let selectedNodeElement = null; // Store selected node element
let selectedNodeId = null; // Variable to store selected node ID
let selectedNode
let expandedNodes = new Set(); // Store expanded node IDs

export function createTree(parent, nodes) {
    // only attempt the following when nodes are iterable
    // test nodes 
    if (!Array.isArray(nodes)) return

    for (const node of nodes) {

        const isRoot = (node.type == "root")
        if (node.show == false) continue;
        let div = document.createElement("div");
        div.className = isRoot ? "tree-root" : "tree-node";
        div.draggable = !isRoot; // Enable drag & drop

        let toggle = document.createElement("span");
        toggle.className = "toggle";
        const hasChildren = node.children && node.children.length > 0; // Check if the node has any children
        toggle.textContent = hasChildren ? (isRoot || expandedNodes.has(node.id) ? "▼ " : "▶ ") : "• ";

        div.appendChild(toggle);
        let treeNode = document.createElement("span");
        let iconSource = typeImageMap[node.type]
        if (iconSource) {
            let icon = document.createElement("img");
            icon.src = `images/${iconSource}`;
            icon.classList.add("node-icon");
            icon.alt = node.scope || node.type
            treeNode.appendChild(icon);
        }
        let name = document.createElement("span");
        name.textContent = node.name;
        name.classList.add("node-label");
        name.dataset.id = node.id; // Store node ID in a data attribute
        if (//node is selected
            node.id == selectedNodeId
        ) {
            // Highlight the clicked node
            name.classList.add("selected");
        }

        treeNode.appendChild(name);
        div.appendChild(treeNode)
        parent.appendChild(div);

        // Add selection event
        treeNode.addEventListener("click", () => {
            // Deselect previously selected node
            document.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));

            // Highlight the clicked node
            name.classList.add("selected");

            // Store selected node ID
            selectedNodeId = node.id;
            selectedNode = node
            selectedNodeElement = div;
            if (!isRoot) showPropertyPanel(node, data.harvestedTags);
        });

        treeNode.addEventListener("dblclick", () => {
            if (node.url) {
                window.open(node.url, "_blank");
            }
        });

        treeNode.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showContextMenu(e.pageX, e.pageY, node);
        });

        // Drag & Drop events
        if (!isRoot) {
            div.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("nodeId", node.id);
                console.log(`drag ${node.id}`)
                e.stopPropagation();
            });

            div.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            div.addEventListener("drop", (e) => {
                e.preventDefault();
                e.stopPropagation(); // do not also try to handle drop for ancestor elements
                let draggedNodeId = e.dataTransfer.getData("nodeId");

                if (draggedNodeId !== node.id) {
                    moveNode(draggedNodeId, node.id);
                }
            });
        }
        let childContainer = document.createElement("div");
        childContainer.style.display = isRoot || expandedNodes.has(node.id) ? "block" : "none";
        div.appendChild(childContainer);

        if (node.children) {
            toggle.addEventListener("click", () => {
                const isExpanded = expandedNodes.has(node.id);
                if (isExpanded) {
                    expandedNodes.delete(node.id);
                    childContainer.style.display = "none";
                    toggle.textContent = "▶ ";
                } else {
                    expandedNodes.add(node.id);
                    childContainer.style.display = "block";
                    toggle.textContent = "▼ ";
                }
            });
            createTree(childContainer, node.children);
        }
    };
}

function moveNode(draggedId, targetId) {
    let draggedNode = findNodeById(data, draggedId);
    let targetNode = findNodeById(data, targetId);

    if (!draggedNode || !targetNode) {
        alert("Invalid move");
        return;
    }

    // Remove dragged node from its old parent
    removeNodeById(data, draggedId);

    // Add it to the new parent
    if (!targetNode.children) targetNode.children = [];
    targetNode.children.push(draggedNode);

    refreshTree()
}

// Find a node by ID in a tree structure
function findNodeById(nodes, id) {
    for (let node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            let found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
}

// Remove a node from its parent
function removeNodeById(nodes, id) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
            nodes.splice(i, 1);
            return true;
        }
        if (nodes[i].children) {
            let removed = removeNodeById(nodes[i].children, id);
            if (removed) return true;
        }
    }
    return false;
}

// Show the context menu
function showContextMenu(x, y, node) {
    const contextMenu = document.getElementById("context-menu");
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;
    contextMenu.style.display = "block";

    const deleteNodeOption = document.getElementById("delete-node")
    // Set actions
    if (node?.type != "root") {
        deleteNodeOption.style.display = "block";
        deleteNodeOption.onclick = () => deleteNode(node);
    } else {
        deleteNodeOption.style.display = "none";
    }
    const mergeProjectsOption = document.getElementById("merge");
    if (node?.type === "project" && selectedNode?.type === "project" && selectedNode?.id !== node?.id) {
        mergeProjectsOption.style.display = "block";
        mergeProjectsOption.textContent = `Merge Project ${selectedNode?.name} into Project ${node?.name}`;
        mergeProjectsOption.onclick = () => mergeProjects(selectedNode, node);
    } else {
        mergeProjectsOption.style.display = "none";
    }

    const createChildOption = document.getElementById("create-child");
    if (node?.type === "project" || node?.type === "root") {
        createChildOption.style.display = "block";
        createChildOption.onclick = () => createChildProject(node);
    } else {
        createChildOption.style.display = "none";
    }

    const createObjectOption = document.getElementById("create-object");
    if (node?.type !== "root") {
        createObjectOption.style.display = "block";
        createObjectOption.onclick = () => createObject(node);
    } else {
        createObjectOption.style.display = "none";
    }

    const exportProjectOption = document.getElementById("export-project");
    if (node?.type === "project" || node?.type === "root") {
        exportProjectOption.style.display = "block";
        exportProjectOption.textContent = `Export Project ${node?.type === "root" ? "All Projects" : node?.name}`
        exportProjectOption.onclick = () => exportProject(node);
    } else {
        exportProjectOption.style.display = "none";
    }

    const importProjectOption = document.getElementById("import-project-file")
    if (node?.type === "root") {
        importProjectOption.style.display = "block";
        importProjectOption.onclick = () => importProject(node);
    } else {
        importProjectOption.style.display = "none";
    }

    const importRemoteProjectOption = document.getElementById("import-project-url")
    if (node?.type === "root") {
        importRemoteProjectOption.style.display = "block";
        importRemoteProjectOption.onclick = async () => importRemoteProject(node);
    } else {
        importRemoteProjectOption.style.display = "none";
    }
}

const importProject = (node) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const importedData = JSON.parse(reader.result);
            if (!node.children) node.children = [];
            //TODO reassign new id values
            // check if file contains a root project that itself has multiple projects
            if (importedData.type === 'root') {
                importedData.children.forEach(importedChild => {
                    if (importedChild.type === 'project') {
                        importedChild.id = `proj-${generateGUID()}`; // Unique ID
                        node.children.push(importedChild);
                        harvestTags(importedChild, data.harvestedTags)

                    }
                })
            } else {
                node.children.push(importedData);
                harvestTags(importedData, data.harvestedTags)
            }
            changed = true
            refreshTree();
        };
        reader.readAsText(file);
    };
    input.click();
}


const importRemoteProject = async (node, remoteURL) => {
    try {
        let remoteMemoProjectURL = remoteURL || prompt("Enter URL for remote Web Memo Project:");
        const importedData = await getJSONFile(remoteMemoProjectURL);
        //TODO reassign new id values
        // check if file contains a root project that itself has multiple projects
        if (!node.children) node.children = [];
        if (importedData.type === 'root') {
            importedData.children.forEach(importedChild => {
                if (importedChild.type === 'project') {
                    importedChild.id = `proj-${generateGUID()}`; // Unique ID
                    node.children.push(importedChild);
                }
            })
        } else {
            //TODO reassign new id values
            importedData.id = `proj-${generateGUID()}`; // Unique ID
            node.children.push(importedData);
        }
        changed = true
        harvestTags(importedData, data.harvestedTags)
        refreshTree();
        return node
    } catch (error) {
        console.error(error);
        return node
    }
};


const loadDataFromRemote = async (remoteURL, data) => {
    await importRemoteProject(data[0], remoteURL);
}


document.addEventListener("click", (event) => {
    document.getElementById("context-menu").style.display = "none";
});

// Delete node function
function deleteNode(node) {
    function recursiveDelete(arr, nodeId) {
        return arr.filter(item => {
            if (item.id === nodeId) return false;
            if (item.children) item.children = recursiveDelete(item.children, nodeId);
            return true;
        });
    }
    data.splice(0, data.length, ...recursiveDelete(data, node.id));
    changed = true
    refreshTree();
}

document.addEventListener("treeChanged", (event) => {
    changed = true
    refreshTree();
});

function createChildProject(node) {
    const newProjectName = prompt("Enter new project name:");
    if (!newProjectName) return;

    const newProject = {
        id: `proj-${Date.now()}`, // Unique ID
        name: newProjectName,
        type: "project",
        notes: "",
        children: []
    };
    if (!node.children) node.children = [];
    node.children.push(newProject)
    changed = true
    expandedNodes.add(node.id);
    refreshTree();
}

function createObject(node) {
    const newObjectName = prompt("Enter name for new object :");
    if (!newObjectName) return;

    const newObject = {
        id: generateGUID(), // Unique ID
        name: newObjectName,
        type: "object",
        notes: "",
        children: []
    };
    if (!node.children) node.children = [];
    node.children.push(newObject)
    changed = true
    expandedNodes.add(node.id);
    refreshTree();
}

const mergeProjects = (sourceNode, targetNode) => {
    // all children of selectedNode are added to node
    if (!targetNode.children) targetNode.children = [];
    targetNode.children.push(...sourceNode.children)
    // remove sourceNode
    removeNodeById(data, sourceNode.id)
    changed = true
    refreshTree();

}

// Refresh tree UI
function refreshTree() {
    document.getElementById("tree-container").innerHTML = "";
    createTree(document.getElementById("tree-container"), data);
}


document.addEventListener("treeContentLoaded", async () => {
    let closePropertyPanelButton = document.getElementById("closePropertyPanelButton")
    if (closePropertyPanelButton) {
        closePropertyPanelButton.addEventListener("click", () => hidePropertyPanel())
    }

    let container = document.getElementById("tree-container");
    const projects = getSavedProjects()
    if (projects?.length > 0) {
        data = projects
    }
    expandedNodes.add(0);

    const remoteURL = getQueryParam("remoteURL");
    if (remoteURL) {
        await loadDataFromRemote(remoteURL, data);
    } else createTree(container, data);
    prepareSearch(data)


    const harvestedTags = new Set()
    harvestTags(data[0], harvestedTags);
    data.harvestedTags = harvestedTags
    console.log("harvested tags", data.harvestedTags)

});

const exportProject = (node) => {
    const json = JSON.stringify(node, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    if (node.type === "project") {
        a.download = `web-memo-project-${node.name}-${dateStr}.json`;
    } else if (node.type === "root") {
        a.download = `web-memo-all-projects-${dateStr}.json`;
    }
    a.click();
    URL.revokeObjectURL(url);
}

export const addTreeNode = (memoNode) => {
    let parentNode = selectedNode
    if (!parentNode) {
        alert('Please select the target node in the Web Memo Tree Navigator and try again')
        return;
    }

    if (!parentNode.children) parentNode.children = [];
    parentNode.children.push(memoNode)
    changed = true
    expandedNodes.add(parentNode.id);
    refreshTree();
}

const typeImageMap = {
    "project": "folder.png",
    "object": "object.png",
    "page": "page.png",
    "link": "link.png",
    "image": "image.png",
    "location": "location.png",
    "github": "github.png",
    "podcast": "podcast.png",
    "technology": "technology.png",
    "book": "book.png",
    "person": "person.png",
    "note": "note.png",
    "music": "music.png",




}