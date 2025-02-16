import { generateGUID } from './utils.js';

export const processImdbProfile = ( message) => {
    console.log('imdb profile',message)


    const profile = message.profile
    console.log("processIMBdProfile", message)
    const newNode = {}
    newNode.id = generateGUID();
    newNode.name = profile.name;
    newNode.url = message.imdbUrl;
    newNode.pageUrl = profile.pageUrl;
    newNode.pageTitle = profile.pageTitle;
    newNode.type = profile.type === 'name' ? 'person' : 'movie'
    newNode.subtype = profile.type
    if (profile.type === 'name') {
        newNode.biography = profile.bio;
        newNode.birthDate = profile.birthDate;
        newNode.deathDate = profile.deathDate;
        newNode.image = profile.image;
        newNode.portfolio = profile.portfolio;
        newNode.knownFor = profile.knownFor;
        if (profile.knownFor ) { newNode.knownForString = profile.knownFor.map(item => item.character + ' in ' + item.title + "("+item.period+")").join(', ') }
    }
    if (profile.subtype === 'TV Series' || profile.subtype === 'TV Mini Series' || profile.subtype === 'Movie') {
        if (profile.subtype === 'TV Series' || profile.subtype === 'TV Mini Series') newNode.type='tv'
        if (profile.subtype === 'Movie' ) newNode.type='movie'
        
        newNode.image = profile.image;
        newNode.plot = profile.plot;
        newNode.rating = profile.rating.split('/')[0];
        newNode.chips = profile.chips;
        if (profile.chips) {
            // if chips is an array, then add all entries to newNode.tags
            if (profile.chips && Array.isArray(profile.chips)) {
                newNode.tags = profile.chips?.map(tag => tag.trim());
            } else {
                newNode.tags = profile.chips?.split(',').map(tag => tag.trim());                
            }
        }
        newNode.cast = profile.cast.map(cast => cast.name);
        newNode.creator = profile.Creator?.map(creator => creator.name);
        newNode.stars = profile.Stars?.map(star => star.name);

        if (profile.moreLikeThis) {
            newNode.moreLikeThis = profile.moreLikeThis.map(item => item.title);
            newNode.moreLikeThisArray = profile.moreLikeThis
        }
    }

    return newNode
}


/* Creator
: 
[{…}]
Stars
: 
(3) [{…}, {…}, {…}]
cast
: 
(18) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
chips
: 
(9) ['Conspiracy Thriller', 'Dystopian Sci-Fi', 'Psychological Drama', 'Psychological Thriller', 'Workplace Drama', 'Drama', 'Mystery', 'Sci-Fi', 'Thriller']
image
: 
"https://m.media-amazon.com/images/M/MV5BZDI5YzJhODQtMzQyNy00YWNmLWIxMjUtNDBjNjA5YWRjMzExXkEyXkFqcGc@._V1_QL75_UX190_CR0,2,190,281_.jpg"
name
: 
"Severance"
period
: 
"TV Series"
plot
: 
"Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs."
rating
: 
"8.7/10261K"
subtype
: 
"TV Series"
type
: 
"title"
*/