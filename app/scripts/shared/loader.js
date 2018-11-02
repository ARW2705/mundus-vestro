'use strict';

/**
 * Determine which script should be loaded on the page based
 * on the url search parameters and append the corresponding
 * script tag
**/

const querystring = new URLSearchParams(window.location.search);
const page = querystring.get('pageId');
const mainScript = document.createElement('script');
mainScript.setAttribute('src', `scripts/${page}.details.min.js`);
mainScript.setAttribute('type', 'application/javascript');
document.body.appendChild(mainScript);
