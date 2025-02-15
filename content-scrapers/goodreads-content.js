chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'webmemoGoodreadsRequest') {
    console.log("Web Memo Goodreads Info request received: ");
    let profile = getGoodreadsProfile(message.linkUrl);
    console.log("Profile:", profile)
    sendResponse({ status: 'success', data: profile, pageUrl: window.location.href });
  }
});

console.log('goodreads-content.js loaded - Web Memo extension is active');

const getGoodreadsProfile = () => {


  const profile = {}

  profile.pageTitle = document.title;
  profile.pageUrl = window.location.href;
  const isBookPage = window.location.href.includes('/book/')
  const isAuthorPage = window.location.href.includes('/author/')
  profile.subtype = isBookPage ? 'book' : isAuthorPage ? 'person' : 'book'

  if (isBookPage) {
    scrapeBookData(profile);
  } else if (isAuthorPage) {
    scrapeAuthorData(profile);
  }


  return profile
}

const scrapeBookData = (profile) => {
  const bookCardElement = document.querySelector('div.BookCard');
  if (bookCardElement) {
    // find image
    const imageElement = bookCardElement.querySelector('img');
    profile.image = imageElement.src;
  }
  // find div with BookPageTitleSection
  const bookPageTitleSectionElement = document.querySelector('div.BookPageTitleSection');
  if (bookPageTitleSectionElement) {
    // find title
    const titleElement = bookPageTitleSectionElement.querySelector('h1');
    profile.title = titleElement.textContent.trim();

    const subtitleElement = bookPageTitleSectionElement.querySelector('h3');
    profile.subtitle = subtitleElement?.textContent.trim();
  }

  // div with BookPageMetadataSection
  const bookPageMetadataSectionElement = document.querySelector('div.BookPageMetadataSection');
  if (bookPageMetadataSectionElement) {
    // find author
    const authorElement = bookPageMetadataSectionElement.querySelector('a');
    profile.author = authorElement?.textContent.trim();

    // div class RatingStatistics__rating
    const ratingElement = bookPageMetadataSectionElement.querySelector('div.RatingStatistics__rating');
    profile.rating = ratingElement?.textContent.trim();

    // p with attribute data-testid="publicationInfo"
    const publicationInfoElement = bookPageMetadataSectionElement.querySelector('p[data-testid="publicationInfo"]');
    profile.publicationInfo = publicationInfoElement?.textContent.trim();

    // p with attribute data-testid="pagesFormat"
    const pagesFormatElement = bookPageMetadataSectionElement.querySelector('p[data-testid="pagesFormat"]');
    profile.pagesFormat = pagesFormatElement?.textContent.trim();
    // div class TruncatedContent__text  
    const truncatedContentElement = bookPageMetadataSectionElement.querySelector('div.TruncatedContent__text');
    profile.truncatedContent = truncatedContentElement?.textContent.trim();

  }
  // div with data-testid="genresList"
  const genresListElement = document.querySelector('div[data-testid="genresList"]');
  if (genresListElement) {
    // all span children with class BookPageMetadataSection__genreButton
    const genreButtons = genresListElement.querySelectorAll('span.BookPageMetadataSection__genreButton');
    if (genreButtons) {
      profile.genres = [...genreButtons].map(genreButton => genreButton.textContent.trim());
    }

  }
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

