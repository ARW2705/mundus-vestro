'use strict';

/**
 * Client Location Service
**/
class LocationService {
  // Set default location
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.eastBoundary = longitude + 180;
    this.westBoundary = longitude - 180;
    this.address = undefined;
  }

  /**
   * GIS API base URL
   *
   * params: none
   *
   * return: string
   * - arcgis base url
  **/
  static get GIS_API_BASE_URL() {
    return 'https://geocode.arcgis.com/arcgis/rest/services/World';
  }

  /**
   * Create the complete URL with given query parameters for GIS API
   *
   * params: object
   * query - contains gis route and search params
   *
   * return: object
   * - new URL with search parameters
  **/
  createGISCompleteURL(query) {
    const url = new URL(LocationService.GIS_API_BASE_URL + query.route);
    for (const key in query.params) {
      url.searchParams.append(key, query.params[key]);
    }
    return url;
  }

  /**
   * Get client's georaphic location
   *
   * params: none
   *
   * return: object: {number, number}
   * object containing the latitude and longitude of client's location
  **/
  getLocation() {
    return {
      latitude: this.latitude,
      longitude: this.longitude
    };
  }

  /**
   * Get client's georaphic location
   *
   * params: none
   *
   * return: object: {number, number}
   * object containing the latitude and longitude of client's location
  **/
  getBoundaries() {
    return {
      eastBoundary: this.eastBoundary,
      westBoundary: this.westBoundary
    };
  }

  /**
   * Get the current location as City and State/Region
   *
   * params: none
   *
   * return: object
   * - Promise that resolves with an object that contains the nearest city
   * and/or state and/or region
  **/
  getLocationName() {
    if (typeof this.address === 'undefined') {
      if (this.latitude && this.longitude) {
        return this.getReverseGeocode(this.getLocation())
          .then(locale => {
            this.address = locale;
            return Promise.resolve(locale);
          })
          .catch(error => Promise.reject(error));
      }
    } else {
      return Promise.resolve(this.address);
    }
  }

  /**
   * Store client's geographic location
   *
   * params: [boolean], [number], [number]
   * local - defaults to false, if true, use client geolocation
   * latitude - user input latitude
   * longitude - user input longitude
   *
   * return: none
  **/
  setLocation(local = false, latitude = null, longitude = null) {
    if (local && window && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.eastBoundary = position.coords.longitude + 180;
          this.westBoundary = position.coords.longitude - 180;
          this.getReverseGeocode(this.getLocation())
            .then(locale => {
              console.log('got locale', locale);
              this.address = locale;
              this.postLocationUpdate();
            })
            .catch(error => console.log('Error getting reverse geocode', error));
        },
        error => {
          console.log(`Error utilizing geolocation ${error.status}: ${error.message}`);
        }
      );
    } else if (latitude && longitude) {
      this.latitude = latitude;
      this.longitude = longitude;
      this.eastBoundary = longitude + 180;
      this.westBoundary = longitude - 180;
      this.getReverseGeocode(this.getLocation())
        .then(locale => {
          this.address = locale;
          this.postLocationUpdate();
        })
        .catch(error => console.log('Error getting reverse geocode', error));
    } else {
      console.log('Geolocation not available');
    }
  }

  /**
   * Post message that location has been updated
   *
   * params: none
   *
   * return: none
  **/
  postLocationUpdate() {
    const _location = {
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.address
    };
    const newEvent = new CustomEvent('location-update', {
      detail: _location
    });
    document.dispatchEvent(newEvent);
    if (window.navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(swRegistration => {
        if (swRegistration) {
          navigator.serviceWorker.controller.postMessage({
            title: 'set-location',
            body: _location
          });
        }
      })
    }
  }

  /**
   * Get latitude and longitude by city or zipcode
   *
   * params: string
   * locationData - location information (city and/or zipcode)
   *
   * return: object
   * - Promise that resolves with new latitude and longitude coordinates
  **/
  getGeocode(locationData) {
    const query = {
      route: '/GeocodeServer/findAddressCandidates',
      params: {
        f: 'pjson',
        singleLine: locationData
      }
    };
    return fetch(this.createGISCompleteURL(query))
      .then(res => {
        return res.json()
          .then(address => {
            if (address.candidates.length) {
              const lat = parseFloat(address.candidates[0].location.y.toFixed(4));
              const long = parseFloat(address.candidates[0].location.x.toFixed(4));
              this.setLocation(false, lat, long);
              return Promise.resolve({
                latitude: lat,
                longitude: long
              });
            } else {
              return Promise.reject('Missing address match');
            }
          })
          .catch(error => {
            return Promise.reject(error);
          })
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }

  /**
   * Use reverse geocoding to get the nearest city name and zip code
   *
   * params: object
   * latlng - latitude and longitude to be searched
   *
   * return: object
   * - Promise that resolve with city name and zip code
  **/
  getReverseGeocode(latlng) {
    const query = {
      route: '/GeocodeServer/reverseGeocode',
      params: {
        f: 'pjson',
        featureTypes: 'postal',
        location: `${latlng.longitude},${latlng.latitude}`
      }
    };
    return fetch(this.createGISCompleteURL(query))
      .then(res => {
        return res.json()
          .then(geocode => {
            return Promise.resolve({
              city: geocode.address.City,
              region: geocode.address.Region,
              zipcode: geocode.address.Postal
            });
          })
          .catch(error => {
            return Promise.reject(error);
          })
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }

}
