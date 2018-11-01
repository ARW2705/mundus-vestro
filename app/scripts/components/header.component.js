'use strict';

/**
 * Shared header component
**/

class HeaderComponent {
  constructor(LocationService, FormService) {
    this.locationService = LocationService;
    this.formService = FormService;
  }

  /**
   * Create header HTML
  **/
  createHeader() {
    const header = document.getElementById('main-header');

    const banner = document.createElement('h1');
    banner.innerHTML = 'Mundus Te';
    header.append(banner);

    const tagline = document.createElement('p');
    tagline.innerHTML = 'Your world at a glance';
    header.append(tagline);

    header.append(this.createNavigation());

    const locationInputContainer = document.createElement('div');
    locationInputContainer.id = 'location-input-container';
    locationInputContainer.append(this.createLocationInput());
    locationInputContainer.append(this.createClientLocationButton());

    header.append(locationInputContainer);
  }

  /**
   * Create navigation HTML
  **/
  createNavigation() {
    const nav = document.createElement('nav');

    const skyLink = document.createElement('a');
    skyLink.href = '#weather';
    skyLink.innerHTML = 'Sky';
    nav.append(skyLink);

    const earthLink = document.createElement('a');
    earthLink.href = '#earth';
    earthLink.innerHTML = 'Earth';
    nav.append(earthLink);

    const spaceLink = document.createElement('a');
    spaceLink.href = '#space';
    spaceLink.innerHTML = 'Space';
    nav.append(spaceLink);

    return nav;
  }

  /**
   * Create client location input HTML
  **/
  createLocationInput() {
    const form = document.createElement('form');
    form.setAttribute('novalidate', 'novalidate');
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

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter city or zipcode';
    form.append(input);

    return form;
  }

  /**
   *
  **/
  createClientLocationButton() {
    const button = document.createElement('button');
    button.id = 'current-location-button';
    button.addEventListener('click', event => {
      this.locationService.setLocation(window);
    });

    const icon = document.createElement('i');
    icon.className = 'far fa-compass';
    button.append(icon);

    return button;
  }
}
