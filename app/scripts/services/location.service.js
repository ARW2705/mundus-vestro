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
   * Store client's geographic location
   *
   * params: [object], [number], [number]
   * window - window object to use for geolocation
   * latitude - user input latitude
   * longitude - user input longitude
   *
   * return: none
  **/
  setLocation(window = null, latitude = null, longitude = null) {
    if (window && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.eastBoundary = position.coords.longitude + 180;
          this.westBoundary = position.coords.longitude - 180;
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
    } else {
      console.log('Geolocation not available');
    }
  }

}
