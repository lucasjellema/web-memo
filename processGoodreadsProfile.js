import { generateGUID } from './utils.js';


export const processGoodreadsProfile = (message) => {
    const profile = message.profile
    console.log("processGoodreadsProfile", message)
    const newNode = {}
    newNode.id = generateGUID();
    newNode.name = profile.pageTitle;
    newNode.url = profile.pageUrl;
    newNode.pageUrl = profile.pageUrl;
    newNode.pageTitle = profile.pageTitle;
    newNode.type = profile.subtype
    newNode.title = profile.title
    newNode.bookcoverImage = profile.image


    if (profile.subtype === 'book') {
        if (profile.subtitle) newNode.subtitle = profile.subtitle;
        if (profile.author) newNode.author = profile.author;
        if (profile.rating) newNode.rating = profile.rating;
        if (profile.publicationInfo) newNode.publicationInfo = profile.publicationInfo;
        if (profile.pagesFormat) newNode.pagesFormat = profile.pagesFormat;
        if (profile.truncatedContent) newNode.truncatedContent = profile.truncatedContent;
        //if (profile.genres) newNode.genres = profile.genres;
        // turn genres into tags
        if (profile.genres) {
            // if genres is an array, then add all entries to newNode.tags
            if (profile.genres && Array.isArray(profile.genres)) {
                newNode.tags = profile.genres?.map(tag => tag.trim());
            } else {

                newNode.tags = profile.genres?.split(',').map(tag => tag.trim());
                
            }

        }
    }
    if (profile.subtype === 'person') { // author
        if (profile.description) newNode.description = profile.description;
        if (profile.birthdate) newNode.birthdate = profile.birthdate;
        if (profile.birthplace) newNode.birthplace = profile.birthplace;
        if (profile.died) newNode.died = profile.died;
        if (profile.website) newNode.websiteUrl = profile.website;
        newNode.tags = profile.genres?.split(',').map(tag => tag.trim());
        newNode.portfolio = profile.portfolio
        newNode.tags.push('author')
        if (profile.books) newNode.books = profile.books
    }

    newNode.dateCreated = new Date()

    return newNode

}


