
const currentURLs = document.querySelectorAll('._currentURL');
let parts = window.location.href.split('/');
let pageURL = `${parts[0]}//${parts[2]}/api`

currentURLs.forEach((url) => {
    url.innerHTML = pageURL;
})
