const STORAGE_KEY = 'web-memo-projects';   // LocalStorage key for the projects data

export const WEB_MEMO_VERSION = "0.8";

// Get all saved projects from local storage
export function getSavedProjects() {
    const projects = localStorage.getItem(STORAGE_KEY);
    return projects && "undefined" !== projects ? JSON.parse(projects) : [];
}

// Save projects to  local storage
export function saveProjects(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


export function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}


export const getJSONFile = (url) => {
    return new Promise((resolve, reject) => {
        fetch(url, { method: 'GET' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                resolve(response.json())
            })
            .catch(err =>
                resolve(1)
            );
    })
}

export function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

export const harvestTags = (node, allTags) => {
    // collect all tags in node and child nodes and add to Set tags
    // add node.tags to allTags
    if (node?.tags) {
        allTags.add(...node.tags)
    }

    if (node?.children)
        for (let childNode of node.children) {
            harvestTags(childNode, allTags)
        }
} 

export const exportProject = (node) => {
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