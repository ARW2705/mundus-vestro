'use strict';

class DBService {
  constructor() {
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
            keyPath: 'currently.time'
          });
      }
    });
  }

  idbGet(url, options, dbStore) {
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
      return idbRead.getAll()
        .then(response => {
          if (response.length) {
            console.log('weatherDB', response);
            return response[response.length - 1];
          } else {
            throw Error('No data');
          }
        })
        .then(dbResponse => {
          if (!this.networkDataReceived) {
            console.log('idb found first');
            return Promise.resolve(new Response(JSON.stringify(dbResponse)));
          }
        })
        .catch(error => {
          return networkUpdate;
        })
      });
  }
}
