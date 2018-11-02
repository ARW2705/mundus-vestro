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
   *
   * params: none
   *
   * return: none
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
    const locationDisplay = document.createElement('p');
    locationDisplay.id = 'location-display';
    locationInputContainer.append(locationDisplay);
    header.append(locationInputContainer);

    this.populateHeaderLocation();
  }

  /**
   * Create navigation HTML
   *
   * params: none
   *
   * return: HTMLElement
   * - header navigation element
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
   *
   * params: none
   *
   * return: HTMLElement
   * - HTML form for location input
  **/
  createLocationInput() {
    const form = document.createElement('form');
    form.setAttribute('novalidate', 'novalidate');
    form.setAttribute('aria-label', 'Search for a location');
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
    input.setAttribute('aria-label', 'search location');
    input.placeholder = 'Enter city or zipcode';
    form.append(input);

    return form;
  }

  /**
   * Button to get client location
   *
   * params: none
   *
   * return: HTMLElement
   * - button element
  **/
  createClientLocationButton() {
    const button = document.createElement('button');
    button.id = 'current-location-button';
    button.setAttribute('aria-label', 'search for your location');
    button.addEventListener('click', event => {
      this.locationService.setLocation(true);
    });

    const icon = document.createElement('i');
    icon.className = 'far fa-compass';
    button.append(icon);

    return button;
  }

  /**
   * Insert header dynamically generated data
   *
   * params; none
   *
   * return: none
  **/
  populateHeaderLocation() {
    const locationName = this.locationService.getReverseGeocode(this.locationService.getLocation());
    locationName.then(res => {
      console.log('location header', res);
      let address = '';
      if (res.city) {
        address += res.city;
      }
      if (res.region) {
        address += `, ${res.region}`;
      }
      if (res.zipcode) {
        address += ` ${res.zipcode}`;
      }
      const display = document.getElementById('location-display');
      display.innerHTML = address;
    });
  }
}
