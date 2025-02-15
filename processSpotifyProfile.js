import { generateGUID } from './utils.js';


export const processSpotifyProfile = (message) => {
    const profile = message.profile
    console.log("processSpotifyProfile", message)
    const newNode = {}
    newNode.id = generateGUID();
    newNode.name = profile.pageTitle;
    newNode.url = profile.pageUrl;
    newNode.pageUrl = profile.pageUrl;
    newNode.pageTitle = profile.pageTitle;
    newNode.type = 'music'
    newNode.title = profile.title
    newNode.albumImage = profile.image
newNode.artistImage = profile.artistImage
    newNode.year = profile.year


    newNode.dateCreated = new Date()

    return newNode

}


