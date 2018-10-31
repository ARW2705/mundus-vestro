'use strict';

/**
 * Shared header component
**/

class HeaderComponent {
  constructor(_document, LocationService, FormService) {
    this._document = _document;
    this.locationService = LocationService;
    this.formService = FormService;
  }

  /**
   * Create header HTML
  **/
  createHeader() {
    const header = this._document.getElementById('main-header');

    const banner = this._document.createElement('h1');
    banner.innerHTML = 'Mundus Te';
    header.append(banner);

    const tagline = this._document.createElement('p');
    tagline.innerHTML = 'Your world at a glance';
    header.append(tagline);

    header.append(this.createNavigation());

    const locationInputContainer = this._document.createElement('div');
    locationInputContainer.id = 'location-input-container';
    locationInputContainer.append(this.createLocationInput());
    locationInputContainer.append(this.createClientLocationButton());

    header.append(locationInputContainer);
  }

  /**
   * Create navigation HTML
  **/
  createNavigation() {
    const nav = this._document.createElement('nav');

    const skyLink = this._document.createElement('a');
    skyLink.href = '#weather';
    skyLink.innerHTML = 'Sky';
    nav.append(skyLink);

    const earthLink = this._document.createElement('a');
    earthLink.href = '#earth';
    earthLink.innerHTML = 'Earth';
    nav.append(earthLink);

    const spaceLink = this._document.createElement('a');
    spaceLink.href = '#space';
    spaceLink.innerHTML = 'Space';
    nav.append(spaceLink);

    return nav;
  }

  /**
   * Create client location input HTML
  **/
  createLocationInput() {
    const form = this._document.createElement('form');
    form.setAttribute('novalidation', true);
    form.id = 'location-input';
    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = event.target.firstChild.value;
      const status = this.formService.validate({input: input});
      if (status.error === '') {
        this.locationService.getGeocode(input)
          .catch(error => console.error(error));
      } else {
        alert(`Error: ${status.error}`);
      }
    });

    const input = this._document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter city or zipcode';
    form.append(input);

    return form;
  }

  /**
   *
  **/
  createClientLocationButton() {
    const button = this._document.createElement('button');
    button.id = 'current-location-button';
    button.addEventListener('click', event => {
      this.locationService.setLocation(window);
    });

    const icon = this._document.createElement('i');
    icon.className = 'far fa-compass';
    button.append(icon);

    return button;
  }
}
