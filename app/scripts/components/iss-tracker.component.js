'use strict';

/**
 * ISS Tracker Map Component
**/

class ISSTrackerComponent {
  constructor(LocationService, SpaceService) {
    this.locationService = LocationService;
    this.currentLocation = null;
    this.currentBoundaries = null;
    this.spaceService = SpaceService;
    this.issPositionData = null;
    this.issInterval = null;
    this.issCurrentLocationIndex = null;
    this.issMarker = null;
    this.issFullPastPolyline = null;
    this.issFullFuturePolyline = null;
    this.issPartialPastPolyline = null;
    this.issPartialFuturePolyline = null;
    this.issIcon = null;
    this.issMap = null;
    this.issCurrentTrackEndIndex = 0;
    this.indexTrack = null;
    this.startTrack = null;
    this.endTrack = null;
    this.locationMarker = null;
    this.addedPastTracks = [];
    this.isISSMapLoaded = false;
  }

  /**
   *
  **/
  isISSMapLoaded() {
    return this.isISSMapLoaded;
  }

  /**
   * Get ISS orbit data and fill in map
   *
   * params: none
   *
   * return: none
  **/
  buildISSTracker() {
    this.currentLocation = this.locationService.getLocation();
    this.currentBoundaries = this.locationService.getBoundaries();
    const timeframe = this.getISSTimeframe();
    return this.spaceService.fetchISSTrack(timeframe)
      .then(issData => {
        if (this.isValidISSData(issData)) {
          console.log('iss data:', issData.Result.Data[1][0].Coordinates[1][0].Longitude[1]);
          this.issPositionData = issData.Result.Data[1];
          this.populateISSmap(issData.Result.Data[1]);
          return Promise.resolve({status: 'ok'});
        } else {
          return Promise.reject({status: 'invalid json response'});
        }
      })
      .catch(error => console.error(error));
  }

  /**
   *
  **/
  isValidISSData(issData) {
    return issData
           && issData.Result.Data[1][0].Coordinates[1][0].Latitude
           && issData.Result.Data[1][0].Coordinates[1][0].Longitude;
  }

  /**
   *
  **/
  invalidateSize() {
    if (this.issMap !== null) {
      this.issMap.invalidateSize();
    }
  }

  /**
   * Get the space section map and create ISS tracking layer
   *
   * params: colelction
   * issPositions - collection of ISS position data objects
   *
   * return: none
  **/
  populateISSmap(issPositions = this.issPositionData) {
    const westBoundary = this.currentBoundaries.westBoundary;
    const eastBoundary = this.currentBoundaries.eastBoundary;

    // create ISS icon
    this.issIcon = L.icon({
      iconUrl: 'assets/icons/iss.png',
      iconSize: [70, 70]
    });

    if (this.issMap == null) {
      this.issMap = L.map('iss-map');
    }
    this.issMap
      .setView([0, this.currentLocation.longitude], 0)
      .setMaxBounds([
        [-90, westBoundary],
        [90, eastBoundary]
      ]);
    L.esri.basemapLayer('Imagery', {nowrap: true}).addTo(this.issMap);
    L.terminator().addTo(this.issMap);

    this.updateISSMapOverlays(this.generateISSTracks(issPositions));

    this.issInterval = setInterval(() => {
      this.issCurrentLocationIndex++;
      if (this.issCurrentLocationIndex > this.issCurrentTrackEndIndex) {
        this.generateNewISSTracks();
      } else {
        this.updateISSMapOverlays(this.generateISSTracks(this.issPositionData));
      }
    }, (2 * 60 * 1000));

    this.isISSMapLoaded = true;
  }

  /**
   * Set map markers and polylines
   *
   * params: object
   * trackData - object containing latitudes and longitudes
   * for marker and polyline positions
   *
   * return: none
  **/
  updateISSMapOverlays(trackData) {
    const positions = this.issPositionData[0].Coordinates[1][0];

    // add location marker if there is none
    if (this.locationMarker == null) {
      this.locationMarker = L.marker([this.currentLocation.latitude, this.currentLocation.longitude]).addTo(this.issMap);
    // if location has changed, remove old marker and set new marker in new location
    } else if (this.locationMarker.getLatLng().lng != this.currentLocation.longitude) {
      this.issMap.removeLayer(this.locationMarker);
      this.locationMarker = L.marker([this.currentLocation.latitude, this.currentLocation.longitude]).addTo(this.issMap);
    }

    // add iss icon marker if there is none
    if (this.issMarker == null) {
      this.issMarker = L.marker(trackData.markerLatLng, {icon: this.issIcon}).addTo(this.issMap);
    // when iss location updates, remove the marker at the old location and set new marker in new location
    } else {
      this.issMap.removeLayer(this.issMarker);
      this.issMarker = L.marker(trackData.nextLatLng, {icon: this.issIcon}).addTo(this.issMap);
    }

    if (this.issFullPastPolyline == null
        || this.issPartialPastPolyline == null
        || this.issPartialFuturePolyline == null
        || this.issFullFuturePolyline == null) {
      const fullFuturePath = this.generatePolylineLatLng(this.startTrack.start, this.startTrack.end, positions);
      const fullPastPath = this.generatePolylineLatLng(this.endTrack.start, this.endTrack.end, positions);
      const pastOfCurrentPath = this.generatePolylineLatLng(this.indexTrack.start, this.issCurrentLocationIndex + 2, positions, 'pre');
      const futureOfCurrentPath = this.generatePolylineLatLng(this.issCurrentLocationIndex, this.indexTrack.end, positions, 'post');

      this.issFullPastPolyline = L.polyline(fullPastPath, {color: '#9e1c1c', opacity: 0.4}).addTo(this.issMap);
      this.issPartialFuturePolyline = L.polyline(futureOfCurrentPath, {color: '#ffffff', weight: 4}).addTo(this.issMap);
      this.issPartialPastPolyline = L.polyline(pastOfCurrentPath, {color: '#d6d328', weight: 4}).addTo(this.issMap);
      this.issFullFuturePolyline = L.polyline(fullFuturePath, {color: '#1c979e', opacity: 0.4}).addTo(this.issMap);
    } else {
      this.addedPastTracks.push(L.polyline([trackData.previousLatLng, trackData.nextLatLng], {color: '#d6d328', opacity: 0.7}).addTo(this.issMap));
    }
  }

  /**
   * Fetch new ISS orbits and update map
   *
   * params: none
   *
   * return: none
  **/
  generateNewISSTracks() {
    const timeframe = this.getISSTimeframe();
    this.spaceService.fetchISSTrack(timeframe)
      .then(issTrack => {
        this.issPositionData = issTrack.Result.Data[1];
        console.log('iss data:', this.issPositionData);
        this.clearISSLayers();
        this.updateISSMapOverlays(this.generateISSTracks(issTrack.Result.Data[1]));
      })
      .catch(error => console.error(error));
  }

  /**
   * Clear ISS marker and orbit paths from map and reset indicies for update
   *
   * params: none
   *
   * return: none
  **/
  clearISSLayers() {
    this.issMap.removeLayer(this.issMarker);
    this.issMap.removeLayer(this.issFullPastPolyline);
    this.issMap.removeLayer(this.issFullFuturePolyline);
    this.issMap.removeLayer(this.issPartialPastPolyline);
    this.issMap.removeLayer(this.issPartialFuturePolyline);
    this.addedPastTracks.forEach(track => {
      this.issMap.removeLayer(track);
    });
    this.issMarker = null;
    this.issFullPastPolyline = null;
    this.issFullFuturePolyline = null;
    this.issPartialPastPolyline = null;
    this.issPartialFuturePolyline = null;
    this.addedPastTracks = [];
    this.issCurrentLocationIndex = null;
    this.issCurrentTrackEndIndex = null;
    this.indexTrack = null;
    this.startTrack = null;
    this.endTrack = null;
  }

  /**
   * Set the orbit paths and return updated ISS position data
   *
   * params: object
   * issPositions - object containing ISS latitude and longitude coordinates
   *
   * return: object
   * - contains coordinates to be used to update the ISS marker and current orbit path
  **/
  generateISSTracks(issPositions = this.issPositionData) {
    // find and set iss current location by its time index
    if (this.issCurrentLocationIndex == null) {
      this.issCurrentLocationIndex = 120;
    }

    // determine positions for ISS marker offset by client location
    const positions = issPositions[0].Coordinates[1][0];

    // indicies don't change during an orbit, they only need to be updated at the beginning of a new orbit
    if (this.indexTrack == null || this.startTrack == null || this.endTrack == null) {
      this.indexTrack = this.getTrack(this.issCurrentLocationIndex, null, null, this.currentBoundaries.westBoundary, this.currentBoundaries.eastBoundary, positions.Longitude[1]);
      this.startTrack = this.getTrack(null, this.indexTrack.end + 1, null, this.currentBoundaries.westBoundary, this.currentBoundaries.eastBoundary, positions.Longitude[1]);
      this.endTrack = this.getTrack(null, null, this.indexTrack.start - 1, this.currentBoundaries.westBoundary, this.currentBoundaries.eastBoundary, positions.Longitude[1]);
    }

    const markerLong = this.getConvertedLongitude(positions.Longitude[1][this.issCurrentLocationIndex]);
    const markerLat = positions.Latitude[1][this.issCurrentLocationIndex];
    const previousLat = positions.Latitude[1][this.issCurrentLocationIndex - 1];
    const previousLong = this.getConvertedLongitude(positions.Longitude[1][this.issCurrentLocationIndex - 1]);
    const nextLat = positions.Latitude[1][this.issCurrentLocationIndex];
    const nextLong = this.getConvertedLongitude(positions.Longitude[1][this.issCurrentLocationIndex]);

    return {
      markerLatLng: [markerLat, markerLong],
      previousLatLng: [previousLat, previousLong],
      nextLatLng: [nextLat, nextLong]
    };
  }

  /**
   * Get the beginning and end position indicies when supplied with a middle
   * index, start index, or end index within the given boundaries
   *
   * params: number, number, number, number, number, collection
   * Requires one of the params 'index', 'start', and 'end' to be supplied
   * [index] - an index located somewhere in the middle of a path
   * [start] - an index at the start of the full future path
   * [end] - an index at the end of the full past path
   * westBoundary - longitude coordinate for the western edge of the map
   * eastBoundary - longitude coordinate for the eastern edge of the map
   * positions - array of longitude coordinates
   *
   * return: object
   * - contains the starting and ending indices for a particular path
   *
  **/
  getTrack(index = null, start = null, end = null, westBoundary, eastBoundary, positions) {
    let _start = (start == null) ? 0: start;
    let _end = (end == null) ? positions.length - 1: end;
    let foundStart = false;
    let foundEnd = false;
    let foundMid = false;
    let startedFromWest, nearEast, lastDescendingLongitude, lastAscendingLongitude;
    if (index != null) {
      startedFromWest = positions[index] > eastBoundary;
      nearEast = !startedFromWest;
      lastDescendingLongitude = positions[index];
      lastAscendingLongitude = positions[index];
    }
    for (let i=0; i < 60; i++) {
      if (start != null) {
        // have start, go forward until the position has passed
        // the prime meridian and positions[i] > eastBoundary
        if (!foundMid && positions[start + i] < eastBoundary) {
          foundMid = true;
        }
        if (foundMid && positions[start + i] > eastBoundary) {
          _end = start + i - 1;
          break;
        }
      } else if (end != null) {
        // have end, go backward until the position has passed
        // the international date line and positions[i] < eastBoundary
        if (!foundMid && positions[end - i] > eastBoundary) {
          foundMid = true;
        }
        if (foundMid && positions[end - i] < eastBoundary) {
          _start = end - i + 1;
          break;
        }
      } else {
        // have somewhere in middle, go both directions to find start and end
        if (!foundStart) {
          // have passed the international date line
          if (lastDescendingLongitude < positions[index - i]) {
            nearEast = false;
          }
          if ((startedFromWest && positions[index - i] < eastBoundary) || (!startedFromWest && !nearEast && positions[index - i] < eastBoundary)) {
            _start = index - i + 1;
            foundStart = true;
          }
          lastDescendingLongitude = positions[index - i];
        }
        if (!foundEnd) {
          // have passed the prime meridian
          if (lastAscendingLongitude > positions[index + i]) {
            nearEast = true;
          }
          if ((startedFromWest && nearEast && positions[index + i] > eastBoundary) || (!startedFromWest && positions[index + i] > eastBoundary)) {
            _end = index + i - 1;
            // store the end of the current track to check when the full paths need to be redone
            this.issCurrentTrackEndIndex = _end;
            foundEnd = true;
          }
          lastAscendingLongitude = positions[index + i];
        }
      }
    }
    return {start: _start, end: _end};
  }

  /**
   * Convert input longitude to offset by current location longitude
   * as well as convert from 0 - 360 scale to -180 - 180 scale
   *
   * params: number
   * longitude - float with longitude between 0 and 360 degrees
   *
   * return: number
   * - the longitude converted to -180 - 180 scale and offset by
   *   the distance of the current location longitude from prime meridian
  **/
  getConvertedLongitude(longitude) {
    const offsetLong = (longitude < 180) ? longitude: longitude - 360;
    return (offsetLong < (180 + this.currentLocation.longitude)) ? offsetLong: offsetLong - 360;
  }

  /**
   * Form the converted coordinates to be used for polyline
   *
   * params: number, number, object, string
   * start - starting coordinate index for start of polyline
   * end - ending coordinate index for end of polyline
   * positions - object containing array of latitudes and array of longitudes
   * [partial] - determines which ends of polyline to extend to cover map
   *           - default: null - extends beginning and end of polyline for full
   *                           - future and past orbit paths
   *           - 'pre' - only extends the beginning for partial past path
   *           - 'post' - only extends the end for partial future path
   *
   * return: collection
   * - array of 2 element arrays [[latitude, longitude], ...]
  **/
  generatePolylineLatLng(start, end, positions = this.issPositionData[0].Coordinates[1][0], partial = null) {
    const track = [];
    if (partial == 'pre' || partial == null) {
      for (let preExtension=start - 3; preExtension < start; preExtension++) {
        track.push([positions.Latitude[1][preExtension], positions.Longitude[1][preExtension] - 360]);
      }
    }
    for (let i=start; i < end; i++) {
      const _long = positions.Longitude[1][i];
      const _lat = positions.Latitude[1][i];
      const convertedLong = this.getConvertedLongitude(_long);
      if ((i - start < 2 && convertedLong > 0) || (end - i < 2 && convertedLong < 0)) {
        continue;
      }
      track.push([_lat, convertedLong]);
    }
    if (partial == 'post' || partial == null) {
      for (let postExtension=end - 1; postExtension < end + 2; postExtension++) {
        track.push([positions.Latitude[1][postExtension], positions.Longitude[1][postExtension]]);
      }
    }
    return track;
  }

  /**
   * Set the start and end ISO strings to fetch ISS positions
   *
   * params: none
   *
   * return: object
   * - object with start and end ISO string timestamps
  **/
  getISSTimeframe() {
    const start = new Date();
    start.setHours(start.getHours() - 4);
    const end = new Date();
    end.setHours(end.getHours() + 4);
    return {start: start.toISOString(), end: end.toISOString()};
  }

}
