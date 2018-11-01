'use strict';

/**
 * Home page view
 * Construct DOM elements utilizing components and services
**/

class HomeView {
  constructor(
    HeaderComponent,
    FooterComponent,
    LocationService,
    WeatherService,
    SpaceService,
    ISSTrackerComponent,
    USGSMapComponent
  ) {
    document.addEventListener('location-update', event => {
      this.currentLocation = event.detail;
      this.toggleLoadingSpinner(document.getElementById('forecast-preview-header').children[2]);
      this.toggleLoadingSpinner(document.getElementById('earthquake-preview-header').children[1]);
      this.toggleLoadingSpinner(document.getElementById('space-preview-header').children[1]);
      this.fetchWeatherData();
      this.fetchUSGSData();
      this.fetchSpaceData();
    });
    this.currentLocation = LocationService.getLocation();
    this.currentBoundaries = LocationService.getBoundaries();
    this.weatherService = WeatherService;
    this.issTracker = ISSTrackerComponent;
    this.usgsMap = USGSMapComponent;
    this.weather = null;
    this.weatherPreviewExtendedTotal = 5;
    this.spaceService = SpaceService;
    this.overheadSatData = null;
    this.satelliteListStart = 0;
    HeaderComponent.createHeader();
    FooterComponent.createFooter();
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

  /**
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
    body.classList.toggle('collapsed');
    if (body.classList.contains('collapsed')) {
      header.style.backgroundColor = '#53b4df';
    } else {
      if (section.id == 'space') {
        this.issTracker.invalidateSize();
      }
      if (section.id == 'earth') {
        this.usgsMap.invalidateSize();
      }
      header.style.backgroundColor = '#0f435b';
    }
    if (section.id == 'weather') {
      const updatedAt = document.getElementById('preview-updated-at');
      updatedAt.style.display = (updatedAt.style.display == 'none') ? 'inline': 'none';
    } else if (section.id == 'space') {
      const satCount = document.getElementById('space-preview-overhead-simple');
      satCount.style.display = (satCount.style.display == 'none') ? 'inline': 'none';
    }
  }

  /**
   * Toggle loading spinner in selected preview header
   *
   * params: HTMLElement
   * icon - the particular spinner icon to toggle
   *
   * return: none
  **/
  toggleLoadingSpinner(icon) {
    if (icon.style.display == 'none') {
      icon.style.display = 'inline-block';
    } else {
      icon.style.display = 'none';
    }
  }

  /**
   * Creates home page section HTML
   * Calls API fetch requests
   * Populates HTML values from API responses
   *
   * params: none
   *
   * return: none
  **/
  loadContent() {
    this.showLoadingScreen(true);

    const weatherSection = document.getElementById('weather');
    weatherSection.append(this.createWeatherPreviewHeader());
    weatherSection.append(this.createWeatherPreviewBody());

    const earthSection = document.getElementById('earth');
    earthSection.append(this.createGeoPreviewHeader());
    earthSection.append(this.createGeoPreviewBody());

    const spaceSection = document.getElementById('space');
    spaceSection.append(this.createSpacePreviewHeader());
    spaceSection.append(this.createSpacePreviewBody());

    this.fetchWeatherData();
    this.fetchUSGSData();
    this.fetchSpaceData();
  }

  fetchWeatherData() {
    // load weather forecast section
    this.weatherService.fetchForecastPreview(this.currentLocation)
      .then(weather => {
        this.showLoadingScreen(false);
        this.weather = weather;
        this.toggleLoadingSpinner(document.getElementById('forecast-preview-header').children[2]);
        this.populateWeatherPreviewHeader(weather);
        this.populateWeatherPreviewBody(weather);
      })
      .catch(error => console.error(error));
  }

  fetchUSGSData() {
    // load earthquake quick view section
    this.usgsMap.buildUSGSMap(this.currentLocation)
      .then(response => {
        this.showLoadingScreen(false);
        this.toggleLoadingSpinner(document.getElementById('earthquake-preview-header').children[1]);
        this.populateGeoPreviewHeader(response.geoData.features);
      })
      .catch(error => console.error(error));
  }

  fetchSpaceData() {
    // load satellite/iss quickview section
    const overheadQuery = {
      type: 'above',
      latitude: this.currentLocation.latitude,
      longitude: this.currentLocation.longitude,
      altitude: 0,
      searchRadius: 15,
      searchCategory: 0
    };
    const spaceFetches = [
      this.spaceService.fetchSatelliteData(overheadQuery),
      this.issTracker.buildISSTracker()
    ];
    Promise.all(spaceFetches)
      .then(response => {
        this.showLoadingScreen(false);
        const satData = response[0];
        this.overheadSatData = satData;
        this.toggleLoadingSpinner(document.getElementById('space-preview-header').children[1]);
        this.populateSatelliteCounter(satData.info.satcount);
        this.populateSatelliteQuickview(this.overheadSatData);
      })
      .catch(error => console.error(error));
  }

  /**
   * ========== WEATHER SECTION ==========
  **/

  /**
   * Create the header section for the weather summary
   *
   * params: none
   *
   * return: HTMLElement
   * HTML header
  **/
  createWeatherPreviewHeader() {
    const weatherHeader = document.createElement('header');
    weatherHeader.id = 'forecast-preview-header';
    weatherHeader.innerHTML = 'Weather';
    weatherHeader.addEventListener('click', event => {
      event.preventDefault();
      if (this.weather !== null) {
        this.togglePreview(document.getElementById('weather'));
        document.getElementById('forecast-preview-body')
          .scrollIntoView(false, {
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
      }
    });

    const updatedAt = document.createElement('span');
    updatedAt.id = 'preview-updated-at';
    updatedAt.style.display = 'none';
    weatherHeader.append(updatedAt);

    const alertIcon = document.createElement('i');
    alertIcon.className = 'fas fa-exclamation-triangle alert-icon';
    alertIcon.style.display = 'none';
    weatherHeader.append(alertIcon);

    const loadingIcon = document.createElement('i');
    loadingIcon.className = 'fas fa-spinner loading-spinner';
    weatherHeader.append(loadingIcon);

    return weatherHeader;
  }

  /**
   * Create the body section for the weather summary
   *
   * params: none
   *
   * return: HTMLElement
   * HTML body div
  **/
  createWeatherPreviewBody() {
    const weatherBody = document.createElement('div');
    weatherBody.id = 'forecast-preview-body';
    weatherBody.className = 'collapsed';

    // const detailsButton = document.createElement('button');
    // detailsButton.className = 'section-details-button';
    // detailsButton.innerHTML = 'More information';
    // const buttonIcon = document.createElement('i');
    // buttonIcon.className = 'fas fa-info-circle';
    // detailsButton.append(buttonIcon);
    // detailsButton.addEventListener('click', event => {
    //   event.preventDefault();
    //   console.log('go to weather details page');
    // });
    // weatherBody.append(detailsButton);

    weatherBody.append(this.createWeatherSummaryContainer());

    weatherBody.append(this.createWeatherHourlyContainer());

    weatherBody.append(this.createWeatherDailyContainer());

    const attribution = document.createElement('a');
    attribution.id = 'weather-attribution';
    attribution.href = 'https://darksky.net/poweredby/';
    attribution.target = '_blank';
    const attributionImage = document.createElement('img');
    attributionImage.src = '../assets/images/poweredby-oneline.png';
    attribution.append(attributionImage);
    weatherBody.append(attribution);

    return weatherBody;
  }

  /**
   * Create the weather summary HTML
   *
   * params: none
   *
   * return: HTMLElement
   * HTML summary div
  **/
  createWeatherSummaryContainer() {
    const currentlyContainer = document.createElement('div');
    currentlyContainer.id = 'forecast-currently';

    const weatherIcon = document.createElement('i');
    weatherIcon.id = 'preview-icon';
    currentlyContainer.append(weatherIcon);

    const summaryContainer = document.createElement('div');
    summaryContainer.id = 'preview-summary';

    const temperature = document.createElement('i');
    temperature.id = 'current-thermometer';
    summaryContainer.append(temperature);

    const text = document.createElement('p');
    text.id = 'preview-text';
    summaryContainer.append(text);

    const highlow = document.createElement('p');
    highlow.id = 'current-high-low';
    summaryContainer.append(highlow);

    const humidity = document.createElement('p');
    humidity.id = 'current-humidity';
    summaryContainer.append(humidity);

    const wind = document.createElement('div');
    wind.id = 'current-wind';
    const windSpeed = document.createElement('p');
    wind.append(windSpeed);
    const windDirection = document.createElement('i');
    wind.append(windDirection);
    summaryContainer.append(wind);

    currentlyContainer.append(summaryContainer);

    return currentlyContainer;
  }

  /**
   * Create the weather hourly forecast HTML
   *
   * params: none
   *
   * return: HTMLElement
   * HTML hourly forecast div
  **/
  createWeatherHourlyContainer() {
    const hourlyContainer = document.createElement('ul');
    hourlyContainer.id = 'forecast-hourly';
    for (let i=0; i < this.weatherPreviewExtendedTotal; i++) {
      const li = document.createElement('li');
      li.className = 'forecast-hour';

      const time = document.createElement('time');
      li.append(time);

      const icon = document.createElement('i');
      li.append(icon);

      const temperature = document.createElement('p');
      li.append(temperature);

      hourlyContainer.append(li);
    }

    return hourlyContainer;
  }

  /**
   * Create the daily forecast HTML
   *
   * params: none
   *
   * return: HTMLElement
   * HTML daily forecast div
  **/
  createWeatherDailyContainer() {
    const dailyContainer = document.createElement('ul');
    dailyContainer.id = 'forecast-daily';
    for (let i=0; i < this.weatherPreviewExtendedTotal; i++) {
      const li = document.createElement('li');
      li.className = 'forecast-day';

      const weekday = document.createElement('p');
      li.append(weekday);

      const icon = document.createElement('i');
      li.append(icon);

      const temperatures = document.createElement('div');
      temperatures.className = 'forecast-day-temperatures';
      const high = document.createElement('p');
      high.className = 'highs';
      temperatures.append(high);
      const low = document.createElement('p');
      low.className = 'lows';
      temperatures.append(low);
      li.append(temperatures);

      const precip = document.createElement('div');
      precip.className = 'forecast-day-precip';
      const precipIcon = document.createElement('i');
      precipIcon.className = 'wi wi-raindrop';
      precip.append(precipIcon);
      const precipChance = document.createElement('p');
      precip.append(precipChance);
      li.append(precip);

      dailyContainer.append(li);
    }

    return dailyContainer;
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
    const header = document.getElementById('forecast-preview-header');

    const updatedAt = header.children[0];
    const forecastTime = new Date(forecast.currently.time);
    const _hour = forecastTime.getHours();
    const _minutes = forecastTime.getMinutes();
    const hour = ((0 < _hour) && (_hour < 13)) ? _hour: Math.abs(_hour - 12);
    const minute = (_minutes < 10) ? `0${_minutes}`: _minutes;
    const ampm = (_hour < 13) ? 'am': 'pm';
    updatedAt.innerHTML = `Updated at<br>${hour}:${minute} ${ampm}`;

    const alertIcon = header.children[1];
    alertIcon.style.display = (forecast.alerts !== undefined) ? 'inline-block': 'none';
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
    const weatherIcon = document.getElementById('preview-icon');
    weatherIcon.className = this.getWeatherIcon(forecast.currently.icon);

    const summary = document.getElementById('preview-text');
    summary.innerHTML = forecast.currently.summary;

    const temperature = document.getElementById('current-thermometer');
    temperature.className = this.getThermometerIcon(forecast.currently.temperature);
    temperature.innerHTML = ` ${forecast.currently.temperature}°`;

    const highlow = document.getElementById('current-high-low');
    highlow.innerHTML = `<span class="highs">H</span> ${forecast.currently.high}° / <span class="lows">L</span> ${forecast.currently.low}°`;

    const humidity = document.getElementById('current-humidity');
    humidity.innerHTML = `<span class="weather-keyword">Humidity</span> ${forecast.currently.humidity}%`;

    const wind = document.getElementById('current-wind');
    const windSpeed = wind.children[0];
    windSpeed.innerHTML = `<span class="weather-keyword">Wind</span> ${forecast.currently.windSpeed}mph`;
    const windDirection = wind.children[1];
    windDirection.className = `wi wi-wind towards-${forecast.currently.windDirection}-deg`;

    const hourlyContainer = document.getElementById('forecast-hourly');
    for (let i=0; i < this.weatherPreviewExtendedTotal; i++) {
      const weatherHour = hourlyContainer.children[i];

      const currentTime = new Date(forecast.hourly[i].time);
      const _hour = currentTime.getHours();
      const hour = ((0 < _hour) && (_hour < 13)) ? _hour: Math.abs(_hour - 12);
      const ampm = (_hour < 13) ? 'am': 'pm';
      weatherHour.children[0].innerHTML = `${hour}${ampm}`;

      weatherHour.children[1].className = `${this.getWeatherIcon(forecast.hourly[i].icon)} hourly-icon`;

      weatherHour.children[2].innerHTML = `${forecast.hourly[i].temperature}°`;
    }

    const dailyContainer = document.getElementById('forecast-daily');
    for (let i=0; i < this.weatherPreviewExtendedTotal; i++) {
      const weatherDay = dailyContainer.children[i].children;

      weatherDay[0].innerHTML = this.getAbbreviatedWeekday(forecast.daily[i].time);
      weatherDay[1].className = `${this.getWeatherIcon(forecast.daily[i].icon)} daily-icon`;

      weatherDay[2].children[0].innerHTML = `${forecast.daily[i].high}°`;
      weatherDay[2].children[1].innerHTML = `${forecast.daily[i].low}°`;

      weatherDay[3].children[1].innerHTML = `${forecast.daily[i].precip}%`;
    }
  }

  /**
   * Get the font awesome class name that corresponds to input temperature
   *
   * params: number
   * temperature - in fahrenheit
   *
   * return: string
   * - desired class for font awesome thermometer
  **/
  getThermometerIcon(temperature) {
    const levels = {
      'quarter': 42,
      'half': 60,
      'three-quarters': 78,
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
   * Get the Weather Icons class name that corresponds to weather
   * API icon name property
   *
   * params: string
   * iconName - API icon value
   *
   * return: string
   * - desired class for weather icons
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
   * Get the abbreviated weekday name
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
   * ========== END WEATHER SECTION ==========
  **/

  /**
   * ========== EARTHQUAKE SECTION ==========
  **/

  /**
   * Create the header section for the earth summary
   *
   * params: none
   *
   * return: HTMLElement
   * HTML header
  **/
  createGeoPreviewHeader() {
    const geoHeader = document.createElement('header');
    geoHeader.id = 'earthquake-preview-header';
    geoHeader.innerHTML = 'Earthquakes';
    geoHeader.addEventListener('click', event => {
      event.preventDefault();
      if (this.geoData !== null) {
        this.togglePreview(document.getElementById('earth'));
        document.getElementById('earthquake-preview-body')
          .scrollIntoView(false, {
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
      }
    });

    const alertIcon = document.createElement('i');
    alertIcon.className = 'fas fa-exclamation-triangle alert-icon';
    alertIcon.style.display = 'none';
    geoHeader.append(alertIcon);

    const loadingIcon = document.createElement('i');
    loadingIcon.className = 'fas fa-spinner loading-spinner';
    geoHeader.append(loadingIcon);

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
    const geoBody = document.createElement('div');
    geoBody.id = 'earthquake-preview-body';
    geoBody.className = 'collapsed';

    // const detailsButton = document.createElement('button');
    // detailsButton.className = 'section-details-button';
    // detailsButton.innerHTML = 'More information';
    // const buttonIcon = document.createElement('i');
    // buttonIcon.className = 'fas fa-info-circle';
    // detailsButton.append(buttonIcon);
    // detailsButton.addEventListener('click', event => {
    //   event.preventDefault();
    //   console.log('go to geo details page');
    // });
    // geoBody.append(detailsButton);

    const geoMap = document.createElement('div');
    geoMap.id = 'earthquake-preview-map';
    geoMap.style.maxWidth = '500px';
    geoMap.style.height = '300px';
    geoBody.append(geoMap);

    return geoBody;
  }

  /**
   * Get the earthquake section header and set
   * alert icon display if an alert is available
   *
   * params: object
   * geoData - earquake preview data from API
   *
   * return: none
  **/
  populateGeoPreviewHeader(geoData) {
    const header = document.getElementById('earthquake-preview-header');

    const alert = geoData.find(feature => {
      if (feature.properties.alert != null) {
        return feature;
      }
    });
    const alertIcon = header.children[0];
    alertIcon.style.display = (alert !== undefined) ? 'inline-block': 'none';
  }

  /**
   * ========== END EARTHQUAKE SECTION ==========
  **/

  /**
   * ========== SATELLITE SECTION ==========
  **/

  /**
   * Create the space quickview header
   *
   * params: none
   *
   * return: HTMLElement
   * - HTML header
  **/
  createSpacePreviewHeader() {
    const spacePreviewHeader = document.createElement('header');
    spacePreviewHeader.id = 'space-preview-header';
    spacePreviewHeader.innerHTML = 'Space';
    spacePreviewHeader.addEventListener('click', event => {
      event.preventDefault();
      if (this.overheadSatData !== null && this.issTracker.isISSMapLoaded) {
        this.togglePreview(document.getElementById('space'));
        document.getElementById('space-preview-body')
          .scrollIntoView(false, {
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
      }
    });

    const overheadCounter = document.createElement('span');
    overheadCounter.id = 'space-preview-overhead-simple';
    overheadCounter.style.display = 'none';
    spacePreviewHeader.append(overheadCounter);

    const loadingIcon = document.createElement('i');
    loadingIcon.className = 'fas fa-spinner loading-spinner';
    spacePreviewHeader.append(loadingIcon);

    return spacePreviewHeader;
  }

  /**
   * Create the space preview body
   *
   * params: none
   *
   * return: HTMLElement
   * - HTML body for space quickview
  **/
  createSpacePreviewBody() {
    const spacePreviewBody = document.createElement('div');
    spacePreviewBody.id = 'space-preview-body';
    spacePreviewBody.className = 'collapsed';

    // const detailsButton = document.createElement('button');
    // detailsButton.className = 'section-details-button';
    // detailsButton.innerHTML = 'More information';
    // const buttonIcon = document.createElement('i');
    // buttonIcon.className = 'fas fa-info-circle';
    // detailsButton.append(buttonIcon);
    // detailsButton.addEventListener('click', event => {
    //   event.preventDefault();
    //   console.log('go to space details page');
    // });
    // spacePreviewBody.append(detailsButton);

    const issMap = document.createElement('div');
    issMap.id = 'iss-map';
    issMap.style.height = '300px';
    issMap.style.maxWidth = '500px';
    spacePreviewBody.append(issMap);

    spacePreviewBody.append(this.createSatelliteQuickview());

    return spacePreviewBody;
  }

  /**
   * Create the satellite quick view list HTML
   *
   * params: none
   *
   * return: HTMLElement
   * - HTML satellite list
  **/
  createSatelliteQuickview() {
    const satelliteQuickview = document.createElement('div');
    satelliteQuickview.id = 'satellite-quickview-container';

    const satelliteQuickviewHeader = document.createElement('p');
    satelliteQuickview.append(satelliteQuickviewHeader);

    const satelliteQuickviewList = document.createElement('ul');
    for (let i=0; i < 3; i++) {
      const li = document.createElement('li');
      li.className = 'satellite-quickview-list-item';
      const name = document.createElement('p');
      li.append(name);
      const span = document.createElement('span');
      li.append(span);
      satelliteQuickviewList.append(li);
    }
    satelliteQuickview.append(satelliteQuickviewList);

    const listButtonContainer = document.createElement('div');
    listButtonContainer.id = 'satellite-list-button-container';

    const listUpButton = document.createElement('button');
    listUpButton.className = 'satellite-list-buttons';
    listUpButton.addEventListener('click', event => {
      event.preventDefault();
      this.traverseSatelliteList('up');
    });
    const buttonUpIcon = document.createElement('i');
    buttonUpIcon.className = 'far fa-arrow-alt-circle-up';
    listUpButton.append(buttonUpIcon);
    listButtonContainer.append(listUpButton);

    const listDownButton = document.createElement('button');
    listDownButton.className = 'satellite-list-buttons';
    listDownButton.addEventListener('click', event => {
      event.preventDefault();
      this.traverseSatelliteList('down');
    });
    const buttonDownIcon = document.createElement('i');
    buttonDownIcon.className = 'far fa-arrow-alt-circle-down';
    listDownButton.append(buttonDownIcon);
    listButtonContainer.append(listDownButton);

    satelliteQuickview.append(listButtonContainer);

    return satelliteQuickview;
  }

  /**
   * Add number of satellites overhead now from api response
   *
   * params: number
   * satCount - number of satellites overhead
   *
   * return: none
  **/
  populateSatelliteCounter(satCount) {
    const headerCounter = document.getElementById('space-preview-overhead-simple');
    headerCounter.innerHTML = `Overhead: ${satCount}`;
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
    const satelliteQuickview = document.getElementById('satellite-quickview-container');
    const header = satelliteQuickview.children[0];
    header.innerHTML = `Currently there are <span id="sat-count">${satellites.info.satcount}</span> satellites overhead`;

    const list = satelliteQuickview.children[1];
    const selected = satellites.above;
    this.populateSatelliteList(list.children, selected, 0);

    const buttons = document.getElementById('satellite-list-button-container').children;
    buttons[0].disabled = true;
    buttons[1].disabled = selected.length < 4;
  }

  /**
   * Fill in satellite information in each list item
   *
   * params: HTMLElement, collection, number
   * list - satellite HTML list
   * satellites - array of satellites's data
   * startIndex - the starting index of satellites to be used,
   *              will always be 3 less than length of satellites
   *              as long as satellites has at least 3 items
   *
   * return: none
  **/
  populateSatelliteList(HTMLlist, satellites, startIndex) {
    for (let i=0; i < 3; i++) {
      const li = HTMLlist[i];
      const name = li.children[0];
      const date = li.children[1];
      if ((startIndex + i) < satellites.length) {
        name.innerHTML = `${satellites[startIndex + i].satname}`;
        date.innerHTML = `Launched ${satellites[startIndex + i].launchDate}`;
      } else {
        name.innerHTML = 'N/A';
        date.innerHTML = 'N/A';
      }
    }
  }

  /**
   * Determine starting index to be used in satellite list on button click
   * then call populateSatelliteList with the proper indicies
   *
   * params: string
   * direction - 'up' or 'down'
   *
   * return: none
  **/
  traverseSatelliteList(direction) {
    const satelliteList = document.getElementById('satellite-quickview-container').children[1];
    const satCount = this.overheadSatData.above.length;
    const buttons = document.getElementById('satellite-list-button-container').children;

    let newIndex;
    if (direction == 'up') {
      newIndex = this.satelliteListStart - 3;
      newIndex = (newIndex < 0) ? 0: newIndex;
      buttons[1].disabled = false;
      if (newIndex == 0) {
        buttons[0].disabled = true;
      }
    } else {
      newIndex = this.satelliteListStart + 3;
      newIndex = (newIndex + 3 > satCount) ? satCount - 3: newIndex;
      buttons[0].disabled = false;
      if (newIndex == (satCount - 3)) {
        buttons[1].disabled = true;
      }
    }
    this.satelliteListStart = newIndex;
    this.populateSatelliteList(satelliteList.children, this.overheadSatData.above, newIndex);
  }

  /**
   * ========== END SATELLITE SECTION ==========
  **/
}
