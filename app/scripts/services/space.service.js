'use strict';

/**
 * Space Data Service
**/

class SpaceService {
  /**
   * API key
   *
   * params: none
   *
   * return: string
   * - n2yo api key
  **/
  static get SATELLITE_API_KEY() {
    // try {
    //   return N2YO_API_KEY;
    // }
    // catch(error) {
    //   if (error instanceof ReferenceError) {
    //     return require('../_keys').N2YO_API_KEY;
    //   }
    // }
  }

  static get API_BASE_URL() {
    return 'https://andrew-wanex.com/munduste_v1.0.0/satellite';
  }

  /**
   * Satellite tracking api base url
   *
   * params: none
   *
   * return: string
   * - base url for n2yo api
  **/
  static get SATELLITE_BASE_URL() {
    return 'https://www.n2yo.com/rest/v1/satellite/';
  }

  /**
   * Satellite Situation Center api base url
   *
   * params: none
   *
   * return: string
   * - base url for Goddard SFR SSCweb api
  **/
  static get SSCWEB_BASE_URL() {
    return 'https://sscweb.sci.gsfc.nasa.gov/WS/sscr/2';
  }

  /**
   * Satellite tracking complete url
   *
   * params: object
   * query - requested query parameters for http request
   *
   * return: string
   * - complete url with requested paramaters
  **/
  createCompleteSatelliteURL(query) {
    let route = '';
    const coords = `${query.latitude}/${query.longitude}/${query.altitude}`;
    if (query.type == 'positions') {
      route = `${query.type}/${query.satId}/${coords}/${query.duration}`;
    } else if (query.type == 'visualpasses') {
      route = `${query.type}/${query.satId}/${coords}/${query.predictDays}/${query.minVisibility}`;
    } else if (query.type == 'above') {
      route = `${query.type}/${coords}/${query.searchRadius}/${query.searchCategory}`;
    }
    // return SpaceService.SATELLITE_BASE_URL + route + `&apiKey=${SpaceService.SATELLITE_API_KEY}`;
    return SpaceService.API_BASE_URL + '/' + route;
  }

  /**
   * Fetch satellite data
   *
   * params: object
   * query - query parameters to form url
   *
   * return: object
   * - Promise that resolves with satellite data or rejects with error
  **/
  fetchSatelliteData(query) {
    return fetch(this.createCompleteSatelliteURL(query))
      .then(res => {
        return res.json()
          .then(satData => {
            if (satData.info) {
              return Promise.resolve(satData);
            } else {
              return Promise.reject(satData);
            }
          })
          .catch(error => {
            console.log('An error occurred parsing satellite data', error);
            return Promise.reject(error);
          });
      })
      .catch(error => {
        console.log('An error occurred fetching satellite data', error);
        return Promise.reject(error);
      });
  }

  /**
   * Fetch the past and future track of the ISS for a given timeframe
   *
   * params: object
   * timeframe - contains time interval as ISOstring
   *
   * return: object
   * - Promise that resolves with object containing ISS trajectory
   * coordinates and times
  **/
  fetchISSTrack(timeframe) {
    const fetchHeaders = new Headers();
    fetchHeaders.append('accept', 'application/json');
    fetchHeaders.append('content-type', 'application/json');
    const fetchData = {
      'BfieldModel': {
        'ExternalBFieldModel': {
          '@class': 'gov.nasa.gsfc.sscweb.schema.Tsyganenko89CBFieldModel',
          'KeyParameterValues': 'KP_3_3_3'
        },
        'InternalBFieldModel': 'IGRF',
        'TraceStopAltitude': 100
      },
      'Description': 'Complex locator request with nearly all options.',
      'FormatOptions': null,
      'LocationFilterOptions': null,
      'OutputOptions': {
        'AllLocationFilters': true,
        'CoordinateOptions': [
          'java.util.ArrayList',
          [
            {
              'Component': 'LAT',
              'CoordinateSystem': 'GEO',
              'Filter': null
            },
            {
              'Component': 'LON',
              'CoordinateSystem': 'GEO',
              'Filter': null
            }
          ]
        ]
      },
      'Satellites': [
        'java.util.ArrayList',
        [
          {
              'Id': 'iss',
              'ResolutionFactor': 2
          }
        ]
      ],
      'TimeInterval': {
        'End': [
          'javax.xml.datatype.XMLGregorianCalendar',
          timeframe.end
        ],
        'Start': [
          'javax.xml.datatype.XMLGregorianCalendar',
          timeframe.start
        ]
      }
    };

    return fetch(SpaceService.SSCWEB_BASE_URL + '/locations', {
      headers: fetchHeaders,
      body: JSON.stringify(fetchData),
      method: 'POST'
    })
    .then(res => {
      return res.json()
        .then(tracking => {
          if (tracking.Result.StatusCode == 'SUCCESS') {
            return Promise.resolve(tracking);
          } else {
            return Promise.reject(tracking);
          }
        })
        .catch(error => {
          console.log('An error occurred parsing ISS tracking data', error);
          return Promise.reject(error);
        });
    })
    .catch(error => {
      console.log('An error occurred fetching ISS tracking data', error);
      return Promise.reject(error);
    });
  }

}
