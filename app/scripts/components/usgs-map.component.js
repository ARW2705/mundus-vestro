'use strict';

/**
 * USGS Earthquake Map
**/

class USGSMapComponent {
  constructor(LocationService, GeoService) {
    this.locationService = LocationService;
    this.geoService = GeoService;
    this.currentLocation = null;
    this.geoMap = null;
    this.geoData = null;
    this.geoMapLocation = null;
    this.geoMapLoadEvent = true;
    this.startTime = 14 * 24 * 60 * 60 * 1000;
    this.maxRadius = 100;
    this.geoLimit = 25;
    this.quakeLayer = null;
  }

  /**
   * Fetch earthquake data from USGS
   *
   * params: none
   *
   * return: object
   * - Promise that resolves with response data if valid and rejects with error
   * message otherwise
  **/
  buildUSGSMap() {
    this.currentLocation = this.locationService.getLocation();
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    const geoQuery = {
      format: 'geojson',
      starttime: startDate.toISOString(),
      latitude: this.currentLocation.latitude,
      longitude: this.currentLocation.longitude,
      maxradiuskm: this.maxRadius,
      eventtype: 'earthquake',
      limit: this.geoLimit,
      jsonerror: true
    };
    return this.geoService.fetchGeoData(geoQuery)
      .then(geoData => {
        if (this.isValidGeoData(geoData)) {
          this.geoData = geoData.features;
          this.geoMapLocation = this.currentLocation;
          this.populateGeoPreviewBody(geoData.features);
          return Promise.resolve({status: 'ok', geoData: geoData});
        } else {
          return Promise.reject({status: 'invalid json response'});
        }
      })
      .catch(error => console.error(error));
  }

  /**
   * Call leaflet.js invalidateSize() method to re-render map
   *
   * params: none
   *
   * return: none
  **/
  invalidateSize() {
    if (this.geoMap !== null) {
      this.geoMap.invalidateSize();
    }
  }

  /**
   * Get the earthquake section body and create
   * earthquake map with markers
   *
   * params: object
   * geoData - earthquake preview data from API
   *
   * return: none
  **/
  populateGeoPreviewBody(geoData = this.geoData) {
    if (this.geoMap == null) {
      this.geoMap = L.map('earthquake-preview-map');
    }
    this.geoMap.setView([this.currentLocation.latitude, this.currentLocation.longitude], 9);
    L.esri.basemapLayer('Topographic').addTo(this.geoMap);
    this.quakeLayer = this.getQuakeLayer(geoData).addTo(this.geoMap);
    this.geoMap.on('moveend', event => {
      // moveend is fired when the map is loaded for the first time,
      // ignore the first event trigger
      if (this.geoMapLoadEvent) {
        this.geoMapLoadEvent = false;
        return;
      }

      // get new map center coordinates and create object with correct format
      const _coords = event.target.getCenter();
      const newCenter = {
        latitude: _coords.lat,
        longitude: _coords.lng
      };

      // if distance moved was small (like centering on a nearby point),
      // do not update
      if (this.getDistance(this.geoMapLocation, newCenter) < (this.maxRadius / 3)) {
        return;
      } else {
        this.geoMapLocation = newCenter;
      }

      let startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);

      const geoQuery = {
        format: 'geojson',
        starttime: startDate.toISOString(),
        latitude: newCenter.latitude,
        longitude: newCenter.longitude,
        maxradiuskm: this.maxRadius,
        eventtype: 'earthquake',
        limit: this.geoLimit,
        jsonerror: true
      };

      this.geoService.fetchGeoData(geoQuery)
        .then(geoData => {
          this.geoData = geoData.features;
          this.geoMap.removeLayer(this.quakeLayer);
          this.quakeLayer = this.getQuakeLayer(geoData).addTo(this.geoMap);
        })
        .catch(error => console.error(error));
    });
  }

  /**
   * Create the earthquake layer for leaflet map
   *
   * params: object
   * geoData - earthquake data from USGS
   *
   * return: object
   * - leaflet layer with earthquake data points
  **/
  getQuakeLayer(geoData = this.geoData) {
    const started = this.startTime;
    const quakeLayer = L.geoJSON(geoData, {
      pointToLayer: function (feature, latlng) {
        let r = 255;
        let g = 0;
        let b = 0;
        let opacity = 0;
        let color = 'fff';
        let radius = 2;
        const magnitude = feature.properties.mag;
        const depth = feature.geometry.coordinates[2];
        const age = feature.properties.time;
        // if magnitude data available, set radius in relation to magnitude
        if (magnitude) {
          radius = 2 * magnitude;
        }
        // if depth data available, set color in relation to depth
        if (depth) {
          if (depth < 70) {
            g = Math.round(255 * (depth / 70));
          } else if (depth < 300) {
            g = 255;
            r = Math.round(255 * ((300 - depth) / 230));
          } else if (depth < 700) {
            r = 0;
            g = 255;
            b = Math.round(255 * ((depth - 300) / 400));
          } else {
            r = 0;
          }
          r = (r > 15 ? '': '0') + r.toString(16);
          g = (g > 15 ? '': '0') + g.toString(16);
          b = (b > 15 ? '': '0') + b.toString(16);
        }
        // set opacity in relation to age from present
        opacity = parseFloat(((started - (Date.now() - age)) / started).toFixed(2));
        color = '#' + r + g + b;
        return L.circleMarker(latlng, {
          color: '#000000',
          weight: 1,
          radius: radius,
          fillColor: color,
          fillOpacity: opacity,
        });
      },
      onEachFeature: function (feature, layer) {
        const properties = feature.properties;

        layer.bindPopup(`<a href=${properties.url}>${properties.title}</a>`)
      }
    });
    quakeLayer.addData(geoData);
    return quakeLayer;
  }

  /**
   * Use Haversine formula to get distance between two latlng points
   *
   * params: object, object
   * point1 and point2 - objects with latitude and longitude keys
   *
   * return: number
   * - great-circle distance between two points
  **/
  getDistance(point1, point2) {
    const R = 6371;
    const dLat = this.getRadians(point2.latitude - point1.latitude);
    const dLong = this.getRadians(point2.longitude - point1.longitude);
    const a = (
      Math.sin(dLat / 2)
      * Math.sin(dLat / 2)
      + Math.cos(this.getRadians(point1.latitude))
      * Math.cos(this.getRadians(point2.latitude))
      * Math.sin(dLong / 2)
      * Math.sin(dLong / 2)
    );
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   *
   * params: number
   * degree - number in degrees to be converted
   *
   * return: number
   * - number converted to radians
  **/
  getRadians(degree) {
    return degree * (Math.PI / 180);
  }

  /**
   * Verify USGS api response
   *
   * params: object
   * geoData - parsed json response from USGS
   *
   * return: boolean
   * - true if data is present and metadata status property is 200
  **/
  isValidGeoData(geoData) {
    return geoData && geoData.metadata.status == 200;
  }
}
