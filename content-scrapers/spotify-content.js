chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'webmemoSpotifyRequest') {
    console.log("Web Memo Spotify Info request received: ");
    let profile = await getSpotifyProfile();
    console.log("Profile:", profile)
    sendResponse({ status: 'success', data: profile, pageUrl: window.location.href });
  }
});

console.log('spotify-content.js loaded - Web Memo extension is active');

const getSpotifyProfile = async () => {
  const profile = {}
  profile.pageTitle = document.title;
  profile.pageUrl = window.location.href;
  await scrapeSongData(profile);
  return profile
}

const scrapeSongData = async (profile) => {
  // section with data-testid="track-page"
  const trackPageElement = document.querySelector('section[data-testid="track-page"]');
  if (trackPageElement) {
    // find image
    const imageElement = trackPageElement.querySelector('img');
    profile.image = imageElement.src;
    profile.songTitle = imageElement.alt;

    // find div with class trackInfo
    const div = imageElement.parentElement.parentElement.parentElement
    // find span with data-testid="entityTitle" in div
    const span = div.querySelector('span[data-testid="entityTitle"]');
    if (span) {
      profile.title = span.textContent.trim();
      const divWithArtist = span.nextElementSibling
      if (divWithArtist) {
        // find span with data-testid="creator-link"
        const aWithArtist = divWithArtist.querySelector('a[data-testid="creator-link"]');
        if (aWithArtist) {
          profile.artist = aWithArtist.textContent.trim();
          profile.artistUrl = aWithArtist.href;
          const grandparentDiv = aWithArtist.parentElement.parentElement
          if (grandparentDiv) {
            // find image of artist
            const artistImage = grandparentDiv.querySelector('img');
            if (artistImage) {
              profile.artistImage = artistImage.src;
            }
            const albumSpan = grandparentDiv.nextElementSibling.nextElementSibling
            if (albumSpan) {
              // find anchor   element inside
              const albumAnchor = albumSpan.querySelector('a');
              if (albumAnchor) {
                profile.album = albumAnchor.textContent.trim();
                profile.albumUrl = albumAnchor.href;
              }
              const yearSpan = albumSpan.nextElementSibling.nextElementSibling
              if (yearSpan) {
                profile.year = yearSpan.textContent.trim();
              }
              const durationSpan = yearSpan.nextElementSibling.nextElementSibling
              if (durationSpan) {
                profile.duration = durationSpan.textContent.trim();
              }

            }
          }
        }

      }
    }
    // find div with id context-menu
    const contextMenuElement = document.querySelector('div#context-menu');
    if (contextMenuElement) {
      // iterate over all spans and find the one with textcontent "View credits" in div
      for (const span of contextMenuElement.querySelectorAll('span')) {
        if (span.textContent.trim() === 'View credits') {
          
          const button = span.parentElement
          button.click();
          // wait 500 ms, then continue
          await delay(500);
          // find dialog with aria-label="Credits"
          const dialog = document.querySelector('dialog[aria-label="Credits"]');
          if (dialog) {

            // find P element with textcontext Written by
            const p = dialog.querySelectorAll('p');
            if (p) {
              for (const pElement of p) {
                if (pElement.textContent.trim() === 'Written by') {
                  // find all siblings (of type anchor and span) under same parent element  
                  const siblings = pElement.parentElement.querySelectorAll('a, span');
                  // iterate over all siblings and add their text content to the writtenBy property
                  const writtenBy=[]
                  for (const sibling of siblings) {
                    if (sibling.tagName === 'A' || sibling.tagName === 'SPAN') {
//                      profile.writtenBy = profile.writtenBy ? `${profile.writtenBy}, ${sibling.textContent.trim()}` : sibling.textContent.trim();
                      writtenBy.push(sibling.textContent.trim())
                    }
                  }
                  profile.writtenBy = writtenBy
                }
                if (pElement.textContent.trim() === 'Performed by') {
                  // find all siblings (of type anchor and span) under same parent element  
                  const siblings = pElement.parentElement.querySelectorAll('a, span');
                  const performedBy=[]
                  // iterate over all siblings and add their text content to the performedBy property
                  for (const sibling of siblings) {
                    if (sibling.tagName === 'A' || sibling.tagName === 'SPAN') {
                      performedBy.push(sibling.textContent.trim())
                      //profile.performedBy = profile.performedBy ? `${profile.performedBy}, ${sibling.textContent.trim()}` : sibling.textContent.trim();
                    }
                  }
                  profile.performedBy = performedBy
                }
                if (pElement.textContent.trim() === 'Produced by') {
                  // find all siblings (of type anchor and span) under same parent element  
                  const siblings = pElement.parentElement.querySelectorAll('a, span');
                  const producedBy=[]

                  // iterate over all siblings and add their text content to the producedBy property
                  for (const sibling of siblings) {
                    if (sibling.tagName === 'A' || sibling.tagName === 'SPAN') {
                      //profile.producedBy = profile.producedBy ? `${profile.producedBy}, ${sibling.textContent.trim()}` : sibling.textContent.trim();
                      producedBy.push(sibling.textContent.trim())
                    }
                  }
                  profile.producedBy = producedBy
                }
              }
            }
            const button = dialog.querySelector('button[aria-label="Close"]');
            if (button) {
              button.click();
            }
          }

          break;
        }
      }
    }

  }

}

function delay(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}


const scrapeAuthorData = (profile) => {
  // div with class authorLeftContainer
  const authorLeftContainerElement = document.querySelector('div.authorLeftContainer');
  if (authorLeftContainerElement) {
    // find image
    const imageElement = authorLeftContainerElement.querySelector('img');
    profile.image = imageElement.src;
  }
  // find div with BookPageTitleSection
  const authorNameElement = document.querySelector('h1.authorName');
  if (authorNameElement) {
    profile.name = authorNameElement.textContent.trim();

    const div = authorNameElement.parentElement.parentElement
    if (div) {
      // iterate over all child nodes
      for (const child of div.children) {
        if (child.tagName === 'DIV' && "Born" === child.textContent?.trim()) {
          console.log("Born", child.textContent.trim());
          console.log("Born next - where", child.nextSibling.textContent.trim());
          profile.birthplace = child.nextSibling.textContent.trim();
          console.log("Born next next - when", child.nextSibling.nextSibling.textContent.trim());
          profile.birthdate = child.nextSibling.nextSibling.textContent.trim();

        }
        if (child.tagName === 'DIV' && "Died" === child.textContent?.trim()) {
          console.log("Died", child.textContent.trim());
          console.log("Died next - ", child.nextSibling.textContent?.trim());
          console.log("Died next next - when", child.nextSibling.nextSibling.textContent?.trim());
          profile.died = child.nextSibling.nextSibling.textContent?.trim();
        }
        if (child.tagName === 'DIV' && "Website" === child.textContent?.trim()) {
          console.log("Website", child.textContent.trim());
          console.log("Website next - ", child.nextElementSibling.textContent?.trim());
          profile.website = child.nextElementSibling.textContent?.trim();
        }
        if (child.tagName === 'DIV' && "Genre" === child.textContent?.trim()) {
          console.log("Genre", child.textContent.trim());
          console.log("Genere next - ", child.nextElementSibling.textContent?.trim());
          profile.genres = child.nextElementSibling.textContent?.trim();
        }
      }

    }
  }


  // div with class aboutAuthorInfo
  const aboutAuthorInfoElement = document.querySelector('div.aboutAuthorInfo');
  if (aboutAuthorInfoElement) {
    // find description
    const descriptionElement = aboutAuthorInfoElement.querySelector('span');
    profile.description = descriptionElement?.textContent.trim();
  }

  // div with itemtype="https://schema.org/Collection"
  const collectionElement = document.querySelector('div[itemtype="https://schema.org/Collection"]');
  if (collectionElement) {
    // find table
    const tableElement = collectionElement.querySelector('table');
    if (tableElement) {
      // find all tr in table
      const trElements = tableElement.querySelectorAll('tr');
      if (trElements) {
        const books = []
        // iterate over all tr elements
        for (const trElement of trElements) {
          // find all td elements in tr
          const tdElements = trElement.querySelectorAll('td');
          if (tdElements) {
            const book = {}
            book.image = tdElements[0].querySelector('img').src
            book.title = tdElements[0].querySelector('a').title
            book.goodreadsUrl = tdElements[0].querySelector('a').href
            const bookText = tdElements[1].querySelector('div')?.textContent
            if (bookText) {
              // find string published and then extract the next 5 characters
              const publishedIndex = bookText.indexOf("published")
              book.published = bookText.substring(publishedIndex + 12, publishedIndex + 16)
              // find string "avg rating" and extract the 5 characters  before that string
              const avgRatingIndex = bookText.indexOf("avg rating")
              book.avgRating = bookText.substring(avgRatingIndex - 5, avgRatingIndex)

            }

            books.push(book)
          }
        }
        profile.books = books
      }
    }
  }
}

