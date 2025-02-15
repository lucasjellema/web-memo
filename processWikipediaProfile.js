import { generateGUID } from './utils.js';


export const processWikipediaProfile = async (message) => {
    const profile = message.profile
    console.log("processWikipediaProfile", message)
    const newNode = {}
    newNode.id = generateGUID();
    newNode.name = profile.pageTitle;
    newNode.type = profile.type ? profile.type : 'page'
    newNode.url = profile.pageUrl;
    newNode.pageUrl = profile.pageUrl;
    newNode.pageTitle = profile.pageTitle;
    newNode.oneImage = profile.image;
    if (profile.logoImage) newNode.logoImage = profile.logoImage;
    if (profile['Repository']) {
        // open source software project
        newNode.repositoryUrl = profile['Repository'];
        if (profile['Written in']) newNode.writtenIn = profile['Written in'];
        if (profile['Initial release']) newNode.initialRelease = profile['Initial release'];
        if (profile['Stable release']) newNode.stableRelease = profile['Stable release'];
        if (profile['Type']) newNode.repositoryUrl = profile['Repository'];
        if (profile['Operating system']) newNode.operatingSystem = profile['Operating system'];
        if (profile['License']) newNode.license = profile['License'];
        if (profile['Website']) newNode.websiteUrl = profile['Website'];
        if (profile['Original author(s)']) newNode.originalAuthors = profile['Original author(s)'];
        if (profile['Developer(s)']) newNode.developers = profile['Developer(s)'];
        if (profile['Type']) {
            // split type and create tags on node from strings
            newNode.tags = profile['Type'].split(',').map(tag => tag.trim());
        }
    }
    newNode.headline = profile.headline
    newNode['_wikidataURL'] = profile.wikidataURL
    newNode['_wikidataEntityId'] = profile.entityId
    if (profile.wikidataURL) {
        console.log('fetch', profile.wikidataURL)
        await fetch(profile.wikidataURL)
            .then(response => response.json())
            .then(async data => {
                const instanceOfType = await getInstanceOf(data, profile.entityId)
                console.log(data.entities)
                console.log('instance of', instanceOfType)
                if (instanceOfType == "Q5") {
                    console.log('get person details', instanceOfType)
                    newNode.type = 'person'
                    getPersonDetails(profile.entityId).then(personDetails => {
                        console.log('person details', personDetails)
                        newNode.personDetails = personDetails
                        newNode.education = personDetails.education
                        newNode.birthDate = personDetails.birthDate
                        newNode.birthPlace = personDetails.birthPlace
                        newNode.country = personDetails.countryLabel
                        newNode.image = personDetails.image
                        newNode.countryCitizenship = personDetails.countryCitizenship
                        newNode.birthname = personDetails.birthname
                    })
                }
            }
            )
    }

    // newNode.pageHeader = message.pageHeader;
    // newNode.scope = message.scope;
    // newNode.type = message.scope;
    // if (newNode.type == "link") {
    //     newNode.url = message.linkUrl;
    //     newNode.name = "link: "+message.linkText;
    // }
    // if (newNode.type == "image") {
    //     newNode.imageSrc = message.imageSrc;
    //     if (message.altText) newNode.name = "image: "+message.altText;
    // }
    // newNode.notes = ""
    // newNode.dateCreated = new Date()

    // if (message.scope==="location") enrichNodeWithLocation(newNode, message)
    return newNode

}


const getInstanceOf = async (wikidataEntityData, entityId) => {
    // Extract claims for P31 (instance of)
    const claims = wikidataEntityData.entities[entityId].claims;

    if (claims && claims.P31) {
        // Get the first "instance of" value (some entities have multiple)
        const instanceOfId = claims.P31[0].mainsnak.datavalue.value.id;
        return instanceOfId;
    } else {
        return null;
    }
}

const getPersonDetails = async (entityId) => {
    const endpoint = "https://query.wikidata.org/sparql";

    const sparqlQuery = `
        SELECT ?name ?birthDate ?birthPlaceLabel ?countryLabel ?countryCitizenshipLabel ?image ?educationLabel ?partyLabel ?birthname ?genres ?discography WHERE {
          wd:${entityId} rdfs:label ?name;
                         wdt:P569 ?birthDate.
          
          OPTIONAL { wd:${entityId} wdt:P19 ?birthPlace. }
          OPTIONAL { wd:${entityId} wdt:P17 ?country. }
          OPTIONAL { wd:${entityId} wdt:P27 ?countryCitizenship. }
          OPTIONAL { wd:${entityId} wdt:P18 ?image. }
          OPTIONAL { wd:${entityId} wdt:P69 ?education. }
          OPTIONAL { wd:${entityId} wdt:P102 ?party. }
          OPTIONAL { wd:${entityId} wdt:P1477 ?birthname. }
          OPTIONAL { wd:${entityId} wdt:P136 ?genres. }
          OPTIONAL { wd:${entityId} wdt:P358 ?discography. }

          FILTER (LANG(?name) = "en")

          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
    `;

    const url = endpoint + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";

    try {
        const response = await fetch(url, {
            headers: { "Accept": "application/sparql-results+json" }
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (data.results.bindings.length > 0) {
            const result = data.results.bindings[0];

            return {
                name: result.name.value,
                birthDate: result.birthDate.value,
                birthPlace: result.birthPlaceLabel ? result.birthPlaceLabel.value : "Unknown",
                country: result.countryLabel ? result.countryLabel.value : "Unknown",
                countryCitizenship: result.countryCitizenShipLabel ? result.countryCitizenShipLabel.value : "Unknown",
                image: result.image ? result.image.value : null,
                education: result.educationLabel ? result.educationLabel.value : "Unknown",
                party: result.partyLabel ? result.partyLabel.value : "Unknown",
                birthname: result.birthname ? result.birthname.value : "Unknown",
                genres: result.genres ? result.genres.value : "Unknown",
                discography: result.discography ? result.discography.value : "Unknown"
            };
        } else {
            return { error: "No data found" };
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return { error: error.message };
    }
}

