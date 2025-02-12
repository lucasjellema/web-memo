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


