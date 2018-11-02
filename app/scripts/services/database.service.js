'use strict';

class DBService {
  constructor(LocationService) {
    this.locationService = LocationService;
    this.initialLoad = true;
    this.idbName = 'mundus-db';
    this.idbVersion = 2;
    this.networkDataReceived = false;
    this.weatherDBStore = 'weather';
    this.dbPromise = idb.open(this.idbName, this.idbVersion, upgradeDB => {
      switch(upgradeDB.oldVersion) {
        case 0:
          const locationStore = upgradeDB.createObjectStore('location', {
            keyPath: 'id'
          });
        case 1:
          const weatherStore = upgradeDB.createObjectStore('weather', {
            keyPath: 'id'
          });
      }
    });
  }

  /**
   * Get the most recently stored location record
   *
   * params: none
   *
   * return: object
   * - Promise that resolves with last location if present
   * or resolve with undefined if there are no locations or
   * if there was an indexedDB error
  **/
  getLastLocation() {
    return this.dbPromise.then(db => {
      const idbRead = db.transaction('location').objectStore('location');
      return idbRead.get(0)
        .then(response => {
          if (response !== undefined) {
            this.locationService.setLocation(null, response.latitude, response.longitude);
            return Promise.resolve(response);
          } else {
            let currentLocation = this.locationService.getLocation();
            currentLocation['id'] = 0;
            const idbWrite = db.transaction('location', 'readwrite').objectStore('location');
            idbWrite.put(currentLocation);
            return Promise.resolve(undefined);
          }
        })
        .catch(error => {
          return Promise.resolve(undefined);
        })
    })
  }

  /**
   * Complete fetch request that is related to indexedDB data
   * Pull from IDB if present and fallback to network
   *
   * params: string, object, string
   * url - url for fetch request
   * [options] - (optional) object contains any arguments for the fetch request
   * dbStore - name of IDB object store to be used
   *
   * return: object
   * - Promise that resolves with response object from IDB or network
  **/
  fetchRequest(url, options = null, dbStore) {
    let networkUpdate;
    if (options != null) {
      networkUpdate = fetch(url, options);
    } else {
      networkUpdate = fetch(url);
    }
    networkUpdate
      .then(networkResponse => {
        console.log('no data in idb, fetch from network');
        return Promise.resolve(networkResponse);
      })
      .catch(error => {
        console.log('fetch error', error);
        return Promise.reject(error);
      })

    return this.dbPromise.then(db => {
      const idbRead = db.transaction(dbStore).objectStore(dbStore);
      const currentLocation = this.locationService.getLocation();
      const _key = `${currentLocation.latitude},${currentLocation.longitude}`;
      return idbRead.get(_key)
        .then(response => {
          console.log('idb response', response);
          if (response) {
            return response;
          } else {
            throw Error('No data');
          }
        })
        .then(dbResponse => {
          if (!this.networkDataReceived) {
            return Promise.resolve(new Response(JSON.stringify(dbResponse)));
          }
        })
        .catch(error => {
          return networkUpdate;
        })
      });
  }
}
