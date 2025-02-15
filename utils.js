const STORAGE_KEY = 'web-memo-projects';   // LocalStorage key for the projects data

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
    if (node.tags) {
        allTags.add(...node.tags)
    }

    if (node.children)
        for (let childNode of node.children) {
            harvestTags(childNode, allTags)
        }
} 