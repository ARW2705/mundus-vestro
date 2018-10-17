'use strict';

/**
 * Earthquake Data Service
**/

class GeoService {
  /**
   * Geological API base URL
   *
   * params: none
   *
   * return: string
   * - earthquake usgs domain
  **/
  static get GEO_API_BASE_URL() {
    return 'https://earthquake.usgs.gov/fdsnws/event/1/query?';
  }

  /**
   * Create the complete URL with given query parameters
   *
   * params: object
   * query - each key corresponds to the required api parameter
   * with that particular key's value as the requested value
   *
   * return: string
   * - complete URL for requested data
  **/
  createCompleteURL(query) {
    let querystring = '';
    for (const key in query) {
      querystring += `${key}=${query[key]}&`;
    }
    return GeoService.GEO_API_BASE_URL + querystring;
  }

  /**
   * Fetch USGS data based on input query
   *
   * params: object
   * query - requested query parameters
   *
   * return: object
   * - Promise resolving with data or reject with error
  **/
  fetchGeoData(query) {
    return fetch(this.createCompleteURL(query))
      .then(res => {
        return res.json()
          .then(geoData => {
            if (geoData.metadata.status == 200) {
              return Promise.resolve(geoData);
            } else {
              return Promise.reject(geoData);
            }
          })
          .catch(error => {
            console.log('An error occurred parsing USGS data');
            return Promise.reject(error);
          })
      })
      .catch(error => {
        console.log('An error occurred fetching USGS data');
        return Promise.reject(error);
      });
  }

}
