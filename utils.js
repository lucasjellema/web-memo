const STORAGE_KEY = 'web-memo-projects';   // LocalStorage key for the projects data

// Get all saved graphs from local storage
export function getSavedProjects() {
    const projects = localStorage.getItem(STORAGE_KEY);
    return projects ? JSON.parse(projects) : [];
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
