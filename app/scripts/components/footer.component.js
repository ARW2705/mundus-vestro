'use strict';

/**
 * Shared footer component
**/

class FooterComponent {
  createFooter() {
    const footer = document.getElementById('main-footer');

    const links = document.createElement('div');
    links.id = 'footer-links';

    const github = document.createElement('a');
    github.href = 'https://github.com';
    github.setAttribute('aria-label', 'github');
    const githubIcon = document.createElement('i');
    githubIcon.className = 'fab fa-github-alt';
    github.append(githubIcon);
    links.append(github);

    footer.append(links);

    const credits = document.createElement('p');
    credits.id = 'footer-credits';
    credits.innerHTML = `Created by <a href="#" target="_blank">Andrew Wanex</a>.`;

    footer.append(credits);

    const license = document.createElement('div');
    license.id = 'footer-license';
    const licenseText = document.createElement('p');
    licenseText.innerHTML = `<a href="" aria-label="MIT license" target="_blank">MIT</a> license.`;
    license.append(licenseText);

    footer.append(license);
    // TODO add mit license link
  }
}
