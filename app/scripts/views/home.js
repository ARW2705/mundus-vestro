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
    // SpaceService
  ) {
    this._document = _document;
    this.locationService = LocationService;
    this.weatherService = WeatherService;
    this.geoService = GeoService;
    // this.spaceService = SpaceService;
    this.currentLocation = LocationService.getLocation();
    this.weather = null;
    this.weatherPreviewExtendedTotal = 5;
    this.geoData = null;
    this.startTime = 1000 * 60 * 60 * 24 * 14;
    this.maxRadius = 100;
    this.geoLimit = 25;
  }

  /**
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
    /*
    format
    starttime - def now - 30days
    endtime - def now
    latitude
    longitude
    maxradiuskm
    eventid
    limit
    orderby - time, time-asc, magnitude, magnitude-asc
    */
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    const geoQuery = {
      format: 'geojson',
      starttime: startDate.toISOString(),
      latitude: this.currentLocation.latitude,
      longitude: this.currentLocation.longitude,
      maxradiuskm: this.maxRadius,
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
    L.esri.basemapLayer("Topographic").addTo(map);
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
}
