'use strict';

/**
 * Home page view
 * Construct DOM elements utilizing services
**/

class HomeView {
  /**
   * Add dependencies
  **/
  constructor(
    _document,
    LocationService,
    WeatherService,
    GeoService,
    SpaceService
  ) {
    this._document = _document;
    this.locationService = LocationService;
    this.weatherService = WeatherService;
    this.weather = null;
    this.weatherPreviewExtendedTotal = 5;
    this.geoService = GeoService;
    this.geoData = null;
    this.startTime = 14 * 24 * 60 * 60 * 1000;
    this.maxRadius = 100;
    this.geoLimit = 25;
    this.spaceService = SpaceService;
    this.overheadSatData = null;
    this.issPositionData = null;
    this.issTrackData = null;
    this.currentLocation = LocationService.getLocation();
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
    this.isISSMapLoaded = false;
    this.eastBoundary = null;
    this.westBoundary = null;
  }

  /** TODO implement splash screen
   * Show loading splash screen
   *
   * params: boolean
   * show - show splash screen if true, hide if false
   *
   * return: none
  **/
  showLoadingScreen(show) {
    if (show) {
      // Show screen
    } else {
      // Hide screen
    }
  }

  /** TODO implement component loading
   * Show component loading icon
   *
   * params: HTMLElement, boolean
   * element - content section
   * show - show component loading icon if true, hide if false
   *
   * return: none
  **/
  showElementLoading(element, show) {
    if (show) {
      // Show element loading
    } else {
      // Show element, hide loading
    }
  }

  /** TODO implement toggling component views
   * Toggle weather forecast preview expansion
   *
   * params: HTMLElement
   * section - page section to toggle view
   *
   * return: none
  **/
  togglePreview(section) {
    const header = section.children[0];
    const body = section.children[1];

    console.log('toggled', section, header, body);
  }

  /**
   * Load home page data elements
   *
   * params: none
   *
   * return: none
  **/
  loadContent() {
    this.showLoadingScreen(true);

    // load weather forecast section
    this.weatherService.fetchForecastPreview(this.currentLocation)
      .then(weather => {
        this.weather = weather;
        const weatherSection = this._document.getElementById('atmosphere');

        weatherSection.append(this.createWeatherPreviewHeader());
        weatherSection.append(this.createWeatherPreviewBody());

        this.populateWeatherPreviewHeader(weather);
        this.populateWeatherPreviewBody(weather);
      })
      .catch(error => console.error(error));

    // load earthquake quick view section
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
    this.geoService.fetchGeoData(geoQuery)
      .then(geoData => {
        this.geoData = geoData.features;

        const earthSection = this._document.getElementById('earth');

        earthSection.append(this.createGeoPreviewHeader());
        earthSection.append(this.createGeoPreviewBody());

        // this.populateGeoPreviewHeader(geoData.features);
        this.populateGeoPreviewBody(geoData.features);
      })
      .catch(error => console.error(error));

    // load satellite/iss quickview section
    const overheadQuery = {
      type: 'above',
      latitude: this.currentLocation.latitude,
      longitude: this.currentLocation.longitude,
      altitude: 0,
      searchRadius: 15,
      searchCategory: 0
    };
    const timeframe = this.getISSTimeframe();
    const satelliteFetchData = [
      this.spaceService.fetchSatelliteData(overheadQuery),
      this.spaceService.fetchISSTrack(timeframe),
    ];
    Promise.all(satelliteFetchData)
      .then(satData => {
        this.overheadSatData = satData[0];
        this.issPositionData = satData[1].Result.Data[1];

        const spaceSection = this._document.getElementById('space');

        spaceSection.append(this.createSpacePreviewHeader());
        spaceSection.append(this.createSpacePreviewBody());

        this.populateSpacePreviewHeader(this.overheadSatData);
        this.populateSatelliteQuickview(this.overheadSatData);
        this.populateISSmap(this.issPositionData);
      })
      .catch(error => console.error(error));
  }

  /**
   * Create the space quickview header
   *
   * params: none
   *
   * return: HTMLElement
   * - HTML header
  **/
  createSpacePreviewHeader() {
    const spacePreviewHeader = this._document.createElement('header');
    spacePreviewHeader.id = 'space-preview-header';
    spacePreviewHeader.innerHTML = 'Space';
    spacePreviewHeader.addEventListener('click', event => {
      console.log('space clicked');
      this.togglePreview(this._document.getElementById('space'));
    });

    const overheadCounter = this._document.createElement('span');
    overheadCounter.id = 'space-preview-overhead-simple';
    spacePreviewHeader.append(overheadCounter);

    return spacePreviewHeader;
  }

  /**
   * Create the space quickview body
   *
   * params: none
   *
   * return: HTMLElement
   * - HTML body for space quickview
  **/
  createSpacePreviewBody() {
    const spacePreviewBody = this._document.createElement('div');
    spacePreviewBody.id = 'space-preview-body';

    const issMap = this._document.createElement('div');
    issMap.id = 'iss-map';
    issMap.style.height = '300px';
    issMap.style.width = '500px';
    spacePreviewBody.append(issMap);

    const satelliteQuickview = this._document.createElement('div');
    satelliteQuickview.id = 'satellite-quickview-container';

    const satelliteQuickviewHeader = this._document.createElement('p');
    satelliteQuickview.append(satelliteQuickviewHeader);

    const satelliteQuickviewList = this._document.createElement('ul');
    for (let i=0; i < 3; i++) {
      const li = this._document.createElement('li');
      li.className = 'satellite-quickview-list-item';
      const name = this._document.createElement('p');
      li.append(name);
      const span = this._document.createElement('span');
      li.append(span);
      satelliteQuickviewList.append(li);
    }
    satelliteQuickview.append(satelliteQuickviewList);

    const satelliteQuickviewListMoreButton = this._document.createElement('button');
    satelliteQuickviewListMoreButton.id = 'show-more-satellites';
    satelliteQuickviewListMoreButton.addEventListener('click', event => {
      console.log('show more satellites');
    });

    spacePreviewBody.append(satelliteQuickview);

    return spacePreviewBody;
  }

  /**
   * Get the space section header and update
   * overhead satellite data
   *
   * params: collection
   * satellites - collection of overhead satellite data objects
   *
   * return: none
  **/
  populateSpacePreviewHeader(satellites = this.overheadSatData) {
    const spacePreviewHeaderCounter = this._document.getElementById('space-preview-overhead-simple');
    spacePreviewHeaderCounter.innerHTML = `Overhead: ${satellites.info.satcount}`;
  }

  /**
   * Get the space section body and add quick
   * overhead satellite stats
   *
   * params: collection
   * satellites - collection of overhead satellite data objects
   *
   * return: none
  **/
  populateSatelliteQuickview(satellites = this.overheadSatData) {
    const satelliteQuickview = this._document.getElementById('satellite-quickview-container');
    const header = satelliteQuickview.children[0];
    header.innerHTML = `Overhead now: ${satellites.info.satcount}`;

    const list = satelliteQuickview.children[1];
    const selected = satellites.above;
    for (let i=0; i < list.children.length && i < selected.length; i++) {
      const li = list.children[i];
      const name = li.children[0];
      const date = li.children[1];
      name.innerHTML = `${selected[i].satname}`;
      date.innerHTML = `Launched ${selected[i].launchDate}`;
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
    this.westBoundary = this.currentLocation.longitude - 180;
    this.eastBoundary = this.currentLocation.longitude + 180;

    // create ISS icon
    this.issIcon = L.icon({
      iconUrl: 'assets/icons/iss.png',
      iconSize: [70, 70]
    });

    // generate map
    this.issMap = L.map('iss-map')
      .setView([0, this.currentLocation.longitude], 0)
      .setMaxBounds([
        [-90, this.westBoundary],
        [90, this.eastBoundary]
      ]);
    L.esri.basemapLayer('Imagery', {nowrap: true}).addTo(this.issMap);

    this.updateISSMapOverlays(this.generateISSTracks(issPositions));

    this.issInterval = setInterval(() => {
      console.log('Updating ISS');
      this.issCurrentLocationIndex++;
      if (this.issCurrentLocationIndex > this.issCurrentTrackEndIndex) {
        console.log(this.issCurrentLocationIndex, this.issCurrentTrackEndIndex);
        this.generateNewISSTracks();
      }
      this.updateISSMapOverlays(this.generateISSTracks(this.issPositionData));
    }, (2 * 60 * 1000));
  }

  updateISSMapOverlays(trackData) {
    const positions = this.issPositionData[0].Coordinates[1][0];

    if (this.issMarker == null) {
      this.issMarker = L.marker(trackData.markerLatLng, {icon: this.issIcon}).addTo(this.issMap);
      L.marker([this.currentLocation.latitude, this.currentLocation.longitude]).addTo(this.issMap);
    } else {
      const newMarker = L.marker(trackData.nextLatLng, {icon: this.issIcon});
      this.issMap.removeLayer(this.issMarker);
      this.issMarker = newMarker;
      newMarker.addTo(this.issMap);
    }

    if (this.issFullPastPolyline == null
        || this.issPartialPastPolyline == null
        || this.issPartialFuturePolyline == null
        || this.issFullFuturePolyline == null) {
      const fullFuturePath = this.generatePolylineLatLng(trackData.startTrack.start, trackData.startTrack.end, positions);
      const fullPastPath = this.generatePolylineLatLng(trackData.endTrack.start, trackData.endTrack.end, positions);
      const pastOfCurrentPath = this.generatePolylineLatLng(trackData.indexTrack.start, this.issCurrentLocationIndex + 1, positions);
      const futureOfCurrentPath = this.generatePolylineLatLng(this.issCurrentLocationIndex, trackData.indexTrack.end, positions);

      this.issFullPastPolyline = L.polyline(fullPastPath, {color: 'red'}).addTo(this.issMap);
      this.issPartialPastPolyline = L.polyline(pastOfCurrentPath, {color: 'yellow'}).addTo(this.issMap);
      this.issPartialFuturePolyline = L.polyline(futureOfCurrentPath, {color: 'white'}).addTo(this.issMap);
      this.issFullFuturePolyline = L.polyline(fullFuturePath, {color: 'blue'}).addTo(this.issMap);
    } else {
      L.polyline([trackData.previousLatLng, trackData.nextLatLng], {color: 'yellow'}).addTo(this.issMap);
    }
  }

  generateNewISSTracks() {
    console.log('near track data end, fetching new data');
    const timeframe = this.getISSTimeframe();
    this.spaceService.fetchISSTrack(timeframe)
      .then(issTrack => {
        this.issPositionData = issTrack.Result.Data[1];
        this.clearISSLayers();
        this.updateISSMapOverlays(this.generateISSTracks(issTrack.Result.Data[1]));
      })
      .catch(error => console.error(error));
  }

  clearISSLayers() {
    this.issMap.removeLayer(this.issMarker);
    this.issMap.removeLayer(this.issFullPastPolyline);
    this.issMap.removeLayer(this.issFullFuturePolyline);
    this.issMap.removeLayer(this.issPartialPastPolyline);
    this.issMap.removeLayer(this.issPartialFuturePolyline);
    this.issMarker = null;
    this.issFullPastPolyline = null;
    this.issFullFuturePolyline = null;
    this.issPartialPastPolyline = null;
    this.issPartialFuturePolyline = null;
  }

  generateISSTracks(issPositions = this.issPositionData) {
    // find and set iss current location by its time index
    if (this.issCurrentLocationIndex == null) {
      const _now = new Date();
      const positionTimes = issPositions[0].Time[1];
      for (let i=115; i < 126; i++) {
        const positionTime = new Date(positionTimes[i][1]);
        if (Math.abs(_now - positionTime) <= (60 * 1000)) {
          this.issCurrentLocationIndex = i;
        }
      }
    }

    // determine positions for ISS marker offset by client location
    const positions = issPositions[0].Coordinates[1][0];

    const indexTrack = this.getTrack(this.issCurrentLocationIndex, null, null, this.westBoundary, this.eastBoundary, positions.Longitude[1]);
    const startTrack = this.getTrack(null, indexTrack.end + 1, null, this.westBoundary, this.eastBoundary, positions.Longitude[1]);
    const endTrack = this.getTrack(null, null, indexTrack.start - 1, this.westBoundary, this.eastBoundary, positions.Longitude[1]);

    const markerLong = this.getConvertedLongitude(positions.Longitude[1][this.issCurrentLocationIndex]);
    const markerLat = positions.Latitude[1][this.issCurrentLocationIndex];
    const previousLat = positions.Latitude[1][this.issCurrentLocationIndex - 1];
    const previousLong = this.getConvertedLongitude(positions.Longitude[1][this.issCurrentLocationIndex - 1]);
    const nextLat = positions.Latitude[1][this.issCurrentLocationIndex];
    const nextLong = this.getConvertedLongitude(positions.Longitude[1][this.issCurrentLocationIndex]);

    return {
      indexTrack: indexTrack,
      startTrack: startTrack,
      endTrack: endTrack,
      markerLatLng: [markerLat, markerLong],
      previousLatLng: [previousLat, previousLong],
      nextLatLng: [nextLat, nextLong]
    };
  }

  getTrack(index, start = null, end = null, westBoundary, eastBoundary, positions) {
    const errorMargin = 10;
    let _start = (start == null) ? 0: start;
    let _end = (end == null) ? positions.length - 1: end;
    let foundStart = false;
    let foundEnd = false;
    let foundMid = false;
    const startedFromWest = positions[index] > eastBoundary;
    let nearEast = false;
    for (let i=0; i < 60; i++) {
      if (start != null) {
        // have start, go forward until positions[i] > eastBoundary
        if (positions[start + i] < eastBoundary) {
          foundMid = true;
        }
        if (foundMid && positions[start + i] > eastBoundary && positions[start + i] < eastBoundary + errorMargin) {
          _end = start + i - 1;
          this.issCurrentTrackEndIndex = _end;
          break;
        }
      } else if (end != null) {
        // have end, go back until positions[j]
        if (positions[end - i] > eastBoundary) {
          foundMid = true;
        }
        if (foundMid && positions[end - i] < eastBoundary && positions[end - i] < eastBoundary + errorMargin) {
          _start = end - i;
          break;
        }
      } else {
        // have somewhere in middle, go both directions to find start and end
        if (!foundStart) {
          if (positions[index - i] > eastBoundary && positions[index - i] < eastBoundary + errorMargin) {
            _start = index - i;
            foundStart = true;
          }
        }
        if (!foundEnd) {
          if (positions[index + i] > eastBoundary && positions[index + i] < eastBoundary + errorMargin) {
            console.log('found end', i, positions[index + i]);
            _end = index + i - 1;
            foundEnd = true;
          }
        }
      }
    }
    console.log(`With ${index}, ${start}, ${end} - generated ${_start} - ${_end}`);
    return {start: _start, end: _end};
  }

  getConvertedLongitude(longitude) {
    const offsetLong = (longitude < 180) ? longitude: longitude - 360;
    return (offsetLong < (180 + this.currentLocation.longitude)) ? offsetLong: offsetLong - 360;
  }

  generatePolylineLatLng(start, end, positions = this.issPositionData[0].Coordinates[1][0]) {
    let isBeforeBreak = true;
    let lastLong = 0;
    const preBreakTrack = [];
    const postBreakTrack = [];
    for (let i=start; i < end; i++) {
      const _long = positions.Longitude[1][i];
      const _lat = positions.Latitude[1][i];
      const convertedLong = this.getConvertedLongitude(_long);
      if (lastLong > 0 && convertedLong < 0) {
        isBeforeBreak = false;
      }
      lastLong = convertedLong;
      if (isBeforeBreak) {
        preBreakTrack.push([_lat, convertedLong]);
      } else {
        postBreakTrack.push([_lat, convertedLong]);
      }
    }
    for (let postExtension=end - 1; postExtension < end + 2; postExtension++) {
      postBreakTrack.push([positions.Latitude[1][postExtension], positions.Longitude[1][postExtension]]);
    }
    const track = [preBreakTrack, postBreakTrack];
    return track;
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
    const started = this.startTime;
    const map = L.map('earthquake-preview-map').setView([this.currentLocation.latitude, this.currentLocation.longitude], 9);
    L.esri.basemapLayer('Topographic').addTo(map);
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
    }).addTo(map);
    quakeLayer.addData(geoData);
  }

  /**
   * Create the header section for the earth summary
   *
   * params: none
   *
   * return: HTMLElement
   * HTML header
  **/
  createGeoPreviewHeader() {
    const geoHeader = this._document.createElement('header');
    geoHeader.id = 'earthquake-preview-header';
    geoHeader.innerHTML = 'Earthquakes';
    geoHeader.addEventListener('click', event => {
      console.log('geo clicked');
      this.togglePreview(this._document.getElementById('earth'));
    });

    const alertIcon = this._document.createElement('i');
    alertIcon.id = 'earthquake-alert';
    alertIcon.className = 'fas fa-exclamation-triangle';
    alertIcon.style.display = 'none';
    geoHeader.append(alertIcon);

    return geoHeader;
  }

  /**
   * Create the body section for the earth summary
   *
   * params: none
   *
   * return: HTMLElement
   * HTML header
  **/
  createGeoPreviewBody() {
    const geoBody = this._document.createElement('div');
    geoBody.id = 'earthquake-preview-body';

    const geoMap = this._document.createElement('div');
    geoMap.id = 'earthquake-preview-map';
    geoMap.style.height = '300px';
    geoBody.append(geoMap);

    return geoBody;
  }

  /**
   * Get the weather section header and fill in weather data
   * values to weather preview section
   *
   * params: object
   * forecast - weather preview data from API
   *
   * return: none
  **/
  populateWeatherPreviewHeader(forecast = this.weather) {
    const updatedAt = this._document.getElementById('preview-updated-at');
    const forecastTime = new Date(forecast.currently.time);
    const _hour = forecastTime.getHours();
    const _minutes = forecastTime.getMinutes();
    const hour = ((0 < _hour) && (_hour < 13)) ? _hour: Math.abs(_hour - 12);
    const minute = (_minutes < 10) ? `0${_minutes}`: _minutes;
    const ampm = (_hour < 13) ? 'am': 'pm';
    updatedAt.innerHTML = `Updated at ${hour}:${minute} ${ampm}`;

    const alertIcon = this._document.getElementById('preview-alert');
    alertIcon.style.display = (forecast.alerts !== undefined) ? 'block': 'none';
  }

  /**
   * Get the weather section body and fill in weather data
   * values to weather preview section
   *
   * params: object
   * forecast - weather preview data from API
   *
   * return: none
  **/
  populateWeatherPreviewBody(forecast = this.weather) {
    const weatherIcon = this._document.getElementById('preview-icon');
    weatherIcon.className = this.getWeatherIcon(forecast.currently.icon);

    const summary = this._document.getElementById('preview-summary');
    summary.innerHTML = forecast.currently.summary;

    const temperature = this._document.getElementById('current-thermometer');
    temperature.className = this.getThermometerIcon(forecast.currently.temperature);
    temperature.innerHTML = ` ${forecast.currently.temperature}°`;

    const highlow = this._document.getElementById('current-high-low');
    highlow.innerHTML = `H ${forecast.currently.high}° / L ${forecast.currently.low}°`;

    const humidity = this._document.getElementById('current-humidity');
    humidity.innerHTML = `Humidity ${forecast.currently.humidity}%`;

    const wind = this._document.getElementById('current-wind');
    const windSpeed = wind.children[0];
    windSpeed.innerHTML = `${forecast.currently.windSpeed}mph`;
    const windDirection = wind.children[1];
    windDirection.className = `wi wi-wind towards-${forecast.currently.windDirection}-deg`;

    const hourlyContainer = this._document.getElementById('forecast-hourly');
    for (let i=0; i < this.weatherPreviewExtendedTotal; i++) {
      const weatherHour = hourlyContainer.children[i];

      const currentTime = new Date(forecast.hourly[i].time);
      const _hour = currentTime.getHours();
      const hour = ((0 < _hour) && (_hour < 13)) ? _hour: Math.abs(_hour - 12);
      const ampm = (_hour < 13) ? 'am': 'pm';
      weatherHour.children[0].innerHTML = `${hour}${ampm}`;

      weatherHour.children[1].className = this.getWeatherIcon(forecast.hourly[i].icon);

      weatherHour.children[2].innerHTML = `${forecast.hourly[i].temperature}°`;
    }

    const dailyContainer = this._document.getElementById('forecast-daily');
    for (let i=0; i < this.weatherPreviewExtendedTotal; i++) {
      const weatherDay = dailyContainer.children[i].children;

      weatherDay[0].innerHTML = this.getAbbreviatedWeekday(forecast.daily[i].time);
      weatherDay[1].className = this.getWeatherIcon(forecast.daily[i].icon);

      weatherDay[2].children[0].innerHTML = forecast.daily[i].high;
      weatherDay[2].children[1].innerHTML = forecast.daily[i].low;

      weatherDay[3].children[1].innerHTML = `${forecast.daily[i].precip}%`;
    }
  }

  /**
   * Create the header section for the weather summary
   *
   * params: none
   *
   * return: HTMLElement
   * HTML header
  **/
  createWeatherPreviewHeader() {
    const weatherHeader = this._document.createElement('header');
    weatherHeader.id = 'forecast-preview-header';
    weatherHeader.innerHTML = 'Weather';
    weatherHeader.addEventListener('click', event => {
      console.log('weather clicked');
      this.togglePreview(this._document.getElementById('atmosphere'));
    });

    const updatedAt = this._document.createElement('span');
    updatedAt.id = 'preview-updated-at';
    updatedAt.style.display = 'none';
    weatherHeader.append(updatedAt);

    const alertIcon = this._document.createElement('i');
    alertIcon.id = 'preview-alert';
    alertIcon.className = 'fas fa-exclamation-triangle';
    alertIcon.style.display = 'none';
    weatherHeader.append(alertIcon);

    return weatherHeader;
  }

  /**
   * Create the body section for the weather summary
   *
   * params: object
   * forecast - summarized forecast data from API
   *
   * return: HTMLElement
   * HTML body div
  **/
  createWeatherPreviewBody(forecast = this.weather) {
    const weatherBody = this._document.createElement('div');
    weatherBody.id = 'forecast-preview-body';

    const currentlyContainer = this._document.createElement('div');
    currentlyContainer.id = 'forecast-currently';

    const weatherIcon = this._document.createElement('i');
    weatherIcon.id = 'preview-icon';
    currentlyContainer.append(weatherIcon);

    const summary = this._document.createElement('p');
    summary.id = 'preview-summary';
    currentlyContainer.append(summary);

    const temperature = this._document.createElement('i');
    temperature.id = 'current-thermometer';
    currentlyContainer.append(temperature);

    const highlow = this._document.createElement('p');
    highlow.id = 'current-high-low';
    currentlyContainer.append(highlow);

    const humidity = this._document.createElement('p');
    humidity.id = 'current-humidity';
    currentlyContainer.append(humidity);

    const wind = this._document.createElement('div');
    wind.id = 'current-wind';
    const windSpeed = this._document.createElement('p');
    wind.append(windSpeed);
    const windDirection = this._document.createElement('i');
    wind.append(windDirection);
    currentlyContainer.append(wind);

    weatherBody.append(currentlyContainer);

    const hourlyContainer = this._document.createElement('ul');
    hourlyContainer.id = 'forecast-hourly';
    for (let i=0; i < this.weatherPreviewExtendedTotal; i++) {
      const li = this._document.createElement('li');
      li.className = 'forecast-hour';

      const time = this._document.createElement('time');
      li.append(time);

      const icon = this._document.createElement('i');
      li.append(icon);

      const temperature = this._document.createElement('p');
      li.append(temperature);

      hourlyContainer.append(li);
    }

    weatherBody.append(hourlyContainer);

    const dailyContainer = this._document.createElement('ul');
    dailyContainer.id = 'forecast-daily';
    for (let i=0; i < this.weatherPreviewExtendedTotal; i++) {
      const li = this._document.createElement('li');
      li.className = 'forecast-day';

      const weekday = this._document.createElement('p');
      li.append(weekday);

      const icon = this._document.createElement('i');
      li.append(icon);

      const temperatures = this._document.createElement('div');
      temperatures.className = 'forecast-day-temperatures';
      const high = this._document.createElement('p');
      high.className = 'highs';
      temperatures.append(high);
      const low = this._document.createElement('p');
      low.className = 'lows';
      temperatures.append(low);
      li.append(temperatures);

      const precip = this._document.createElement('div');
      precip.className = 'forecast-day-precip';
      const precipIcon = this._document.createElement('i');
      precipIcon.className = 'wi wi-raindrop';
      precip.append(precipIcon);
      const precipChance = this._document.createElement('p');
      precip.append(precipChance);
      li.append(precip);

      dailyContainer.append(li);
    }

    weatherBody.append(dailyContainer);

    return weatherBody;
  }

  /**
   * Create the body section for the weather summary
   *
   * params: number
   * temperature - in fahrenheit
   *
   * return: string
   * desired class for font awesome thermometer
  **/
  getThermometerIcon(temperature) {
    const levels = {
      'quarter': 48,
      'half': 64,
      'three-quarters': 80,
      'full': 96
    };
    let icon = 'empty';
    for (const level in levels) {
      if (temperature > levels[level]) {
        icon = level;
      }
    }
    return `fas fa-thermometer-${icon}`;
  }

  /**
   * Create the body section for the weather summary
   *
   * params: string
   * iconName - API icon value
   *
   * return: string
   * desired class for weather icons
  **/
  getWeatherIcon(iconName) {
    const wicons = {
      'clear-day': 'wi wi-day-sunny',
      'clear-night': 'wi wi-night-clear',
      'rain': 'wi wi-rain',
      'snow': 'wi wi-snow',
      'sleet': 'wi wi-sleet',
      'wind': 'wi wi-strong-wind',
      'fog': 'wi wi-fog',
      'cloudy': 'wi wi-cloudy',
      'partly-cloudy-day': 'wi wi-day-cloudy',
      'partly-cloudy-night': 'wi wi-night-alt-cloudy'
    };
    const defaultIcon = 'wi wi-na';
    return (wicons.hasOwnProperty(iconName)) ? wicons[iconName]: defaultIcon;
  }

  /**
   * Create the body section for the weather summary
   *
   * params: object
   * day - datetime
   *
   * return: string
   * abbreviated weekday name
  **/
  getAbbreviatedWeekday(day) {
    const datetime = new Date(day);
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return weekdays[datetime.getDay()];
  }

  /**
   * Set the start and end ISO strings to fetch ISS position tracks
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
