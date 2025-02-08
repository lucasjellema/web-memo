const today = new Date();
const lastDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
const lastQuarter = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());


const doesNodeMatch = (node, searchTerm, advancedSearch) => {
    let match = true
    if (searchTerm != "") match = node.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!match) return false
    if (advancedSearch) {
        if (!advancedSearch.isPage && node.scope == "page") return false;
        if (!advancedSearch.isLink && node.scope == "link") return false;
        if (!advancedSearch.isImage && node.scope == "image") return false;
        if (advancedSearch.dateRange != "any") {
            let nodeDate = new Date(node.dateCreated)
            if (advancedSearch.dateRange == "lastDay") match = nodeDate <= lastDay;
            if (advancedSearch.dateRange == "lastWeek") match = nodeDate <= lastWeek;
            if (advancedSearch.dateRange == "lastMonth") match = nodeDate <= lastMonth;
            if (advancedSearch.dateRange == "lastQuarter") match = nodeDate <= lastQuarter;
            if (advancedSearch.dateRange == "lastYear") match = nodeDate <= lastYear;
        }
    }
    return match
}


const filterNodes = (nodes, searchTerm, advancedSearch) => {
    for (let node of nodes) {
        let hasMatchingChildren = false;
        if (node.children) {
            hasMatchingChildren = filterNodes(node.children, searchTerm, advancedSearch);
        }
        const isMatchingNode = doesNodeMatch(node, searchTerm, advancedSearch)
        node.show = isMatchingNode || hasMatchingChildren
    }
    return nodes.some(node => node.show);
}


function performSearch() {
    let searchTerm = document.getElementById("searchField").value;
    filterNodes(webmemoData, searchTerm);
    document.dispatchEvent(new CustomEvent("treeChanged", { detail: {} }));
}

// Advanced Search function
function performAdvancedSearch() {
    let searchTerm = document.getElementById("searchFieldAdvanced").value;
    let dateRange = document.getElementById("dateRange").value;
    let isPage = document.getElementById("pageCheckbox").checked;
    //  let isProject = document.getElementById("projectCheckbox").checked;
    let isLink = document.getElementById("linkCheckbox").checked;
    let isImage = document.getElementById("imageCheckbox").checked;
    const advancedSearch = {
        dateRange: dateRange,
        isPage: isPage,
        isLink: isLink,
        isImage: isImage
    }
    filterNodes(webmemoData, searchTerm, advancedSearch);

    document.dispatchEvent(new CustomEvent("treeChanged", { detail: {} }));
    // Close the advanced search panel after searching
    // document.getElementById("advancedSearchPanel").style.display = "none";
}

let webmemoData;

export const prepareSearch = (data) => {
    webmemoData = data;
    // Toggle Advanced Search Panel
    document.getElementById("toggleAdvancedSearch").addEventListener("click", function () {
        let panel = document.getElementById("advancedSearchPanel");
        panel.style.display = (panel.style.display === "block") ? "none" : "block";
    });

    // Close Advanced Search Panel
    document.getElementById("closeAdvancedSearch").addEventListener("click", function () {
        document.getElementById("advancedSearchPanel").style.display = "none";
    });

    // Trigger search when magnifying glass is clicked
    document.getElementById("searchBtn").addEventListener("click", performSearch);

    // Allow search when Enter is pressed in the input field
    document.getElementById("searchField").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            performSearch();
        }
    });

    // Trigger advanced search when button is clicked
    document.getElementById("advancedSearchBtn").addEventListener("click", performAdvancedSearch);
}