import { generateGUID } from './utils.js';

export const processLinkedInProfile = (message) => {
    console.log('linkedin profile', message)

    const profile = message.profile
    const newNode = {}
    newNode.id = generateGUID();
    newNode.name = profile.name;
    newNode.url = message.linkedInUrl;
    newNode.pageUrl = profile.pageUrl;
    newNode.pageTitle = profile.pageTitle;
    newNode.type = profile.type
    if (profile.type === 'person') {
        newNode.about = profile.about;
        newNode.image = profile.image;
        newNode.location = profile.location;
        newNode.currentCompany = profile.currentCompany;
        newNode.currentCompanyImage = profile.currentCompanyLogo;
        newNode.currentRole = profile.currentRole;
        newNode.experience = profile.experience;
        if (profile.experience) {
            newNode.experienceString = profile.experience.map(item => item.role + ' at ' + item.company+' ('+item.period+')').join(', ')
        }
        }
    if (profile.type === 'company') {
        newNode.about = profile.about;
        newNode.image = profile.image;
        newNode.location = profile.location;
        newNode.tagline = profile.tagline;
        newNode.industry = profile.industry;
        newNode.followers = profile.followers;
        newNode.numberOfEmployees = profile.numberOfEmployees;
        newNode.locations = profile.locations;
        newNode.websiteUrl = profile.websiteUrl;
        if (profile.locations) {
            newNode.locationsString = profile.locations.map(item => item).join(', ')
        }
    }

    /* company
    : 
    "AMIS"
    companyImageUrl
    : 
    "https://media.licdn.com/dms/image/v2/D4E0BAQHXOAz0NNvODQ/company-logo_100_100/company-logo_100_100/0/1692023929092/amis_services_logo?e=1747872000&v=beta&t=Km-vPBmuYg3vOhQz11n553N3uxWZ3RTFq16x7vGsAcc"
    companyUrl
    : 
    "https://www.linkedin.com/company/209268/"
    duration
    : 
    "11 yrs 10 mos"
    period
    : 
    "May 2013 - Present"
    role
    : 
    "Oracle consultant"
    */

    newNode.dateCreated = new Date()

    return newNode


}
