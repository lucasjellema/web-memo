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
    newNode.type = 'book'

    // if (profile.stars) newNode.stars = profile.stars;
    // if (profile.watchers) newNode.watchers = profile.watchers;
    // if (profile.forks) newNode.forks = profile.forks;
    newNode.dateCreated = new Date()

    return newNode

}


