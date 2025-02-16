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

    newNode.album = profile.album
    newNode.albumUrl = profile.albumUrl
    newNode.artist = profile.artist
    newNode.artistUrl = profile.artistUrl
    newNode.duration = profile.duration
    newNode.image = profile.image
    if (profile.performedBy) {
        newNode.performedBy = profile.performedBy
        newNode.performedByString = profile.performedBy.map(w => w.name).join(', ')
    }
    if (profile.producedBy) {
        newNode.producedBy = profile.producedBy
        newNode.producedByByString = profile.producedBy.map(w => w.name).join(', ')
    }
    newNode.songTitle = profile.songTitle
    newNode.title = profile.title
    if (profile.writtenBy) {
        newNode.writtenBy = profile.writtenBy
        newNode.writtenByString = profile.writtenBy.map(w => w.name).join(', ')
    }
    newNode.dateCreated = new Date()

    return newNode

}

