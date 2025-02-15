import { generateGUID } from './utils.js';


export const processGitHubProfile = (message) => {
const profile = message.profile
    console.log("processGitHubProfile", message)
    const newNode = {}
    newNode.id = generateGUID();
    newNode.name = profile.pageTitle;
    newNode.url = profile.pageUrl;
    newNode.pageUrl = profile.pageUrl;
    newNode.pageTitle = profile.pageTitle;
    newNode.repositoryName = profile.repositoryName
    newNode.type = 'github'

    if (profile.stars) newNode.stars = profile.stars;
    if (profile.watchers) newNode.watchers = profile.watchers;
    if (profile.forks) newNode.forks = profile.forks;
    newNode.dateCreated = new Date()

    return newNode

}


