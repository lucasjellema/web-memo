import { generateGUID } from './utils.js';


export const processWebmemoMessage = (message) => {

    console.log(processWebmemoMessage, message)
    const newNode = {}
    newNode.id = generateGUID();
    newNode.name = message.pageTitle;
    newNode.url = message.pageUrl;
    newNode.pageUrl = message.pageUrl;
    newNode.pageTitle = message.pageTitle;
    newNode.pageHeader = message.pageHeader;
    newNode.scope = message.scope;
    newNode.type = message.scope;
    if (newNode.type == "link") {
        newNode.url = message.linkUrl;
        newNode.name = "link: "+message.linkText;
    }
    if (newNode.type == "image") {
        newNode.imageSrc = message.imageSrc;
        if (message.altText) newNode.name = "image: "+message.altText;
    }
    newNode.notes = ""
    newNode.dateCreated = new Date()

    if (message.scope==="location") enrichNodeWithLocation(newNode, message)
    return newNode

}


const enrichNodeWithLocation = (node, message) => {
    console.log(`enriching location`)
    node.latitude = message.locationDetails.latitude
    node.longitude = message.locationDetails.longitude
    if (message.locationDetails.name) node.name = message.locationDetails.name
}