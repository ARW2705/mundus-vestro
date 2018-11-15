'use strict';

/**
 * Weather Data Service
**/

class WeatherService {
  constructor(DBService) {
    this.dbservice = DBService;
  }
  /**
   * API key
   *
   * params: none
   *
   * return: string
   * - API key for darksky.net
  **/
  static get API_KEY() {
    try {
      return WEATHER_API_KEY;
    }
    catch(error) {
      if (error instanceof ReferenceError) {
        return require('../_keys').WEATHER_API_KEY;
      }
    }
  }

  /**
   * Weather API base URL
   *
   * params: none
   *
   * return: string
   * - darksky.net domain
  **/
  static get WEATHER_API_BASE_URL() {
    return 'https://api.darksky.net';
  }

  /**
   * Create the complete URL with given query parameters
   *
   * params: object
   * query - contains necessary querystring values
   *
   * return: string
   * - complete URL for requested data
  **/
  createCompleteURL(query) {
    return `${WeatherService.WEATHER_API_BASE_URL}/${query.requestType}/${WeatherService.API_KEY}/${query.latitude},${query.longitude}`;
  }

  /**
   * Fetch complete forecast data
   *
   * params: object
   * query - object with user defined parameters for forecast query
   *
   * returns: object
   * - Promise with weather data or error message
   **/
  fetchForecast(query) {
    const proxy = HTTPS_PROXY;
    const url = proxy + this.createCompleteURL(query);

    return this.dbservice.fetchRequest(url, null, 'weather')
      .then(response => {
        return response.json()
          .then(data => {
            console.log(data);
            return Promise.resolve(data);
          })
          .catch(error => {
            console.log('response parse error', error);
            return Promise.reject(error);
          })
      })
      .catch(error => {
        console.log('Error', error);
        Promise.reject(error);
      });
  }

  /**
   * Fetch forecast for preview
   *
   * params: object
   * location - location service instance
   *
   * returns: object
   * - Promise with weather data or error message
  **/
  fetchForecastPreview(currentLocation) {
    const query = {
      requestType: 'forecast',
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    };
    return this.fetchForecast(query)
      .then(weather => {
        const hourly = [];
        // get next 5 hours
        for (let i=1; i < 6; i++) {
          const hour = weather.hourly.data[i];
          hourly.push({
            time: hour.time * 1000,
            icon: hour.icon,
            temperature: Math.round(hour.temperature)
          });
        }

        const daily = [];
        // get next 5 days
        for (let i=1; i < 6; i++) {
          const day = weather.daily.data[i];
          daily.push({
            time: day.time * 1000,
            icon: day.icon,
            high: Math.round(day.temperatureHigh),
            low: Math.round(day.temperatureLow),
            precip: Math.round(day.precipProbability * 100)
          });
        }

        const current = weather.currently;
        const preview = {
          currently: {
            time: current.time * 1000,
            icon: current.icon,
            summary: current.summary,
            temperature: Math.round(current.temperature),
            high: Math.round(weather.daily.data[0].temperatureHigh),
            low: Math.round(weather.daily.data[0].temperatureLow),
            humidity: Math.round(current.humidity * 100),
            precip: Math.round(current.precipProbability * 100),
            windSpeed: Math.round(current.windSpeed),
            windDirection: current.windBearing,
          },
          hourly: hourly,
          daily: daily,
          alerts: weather.alerts
        };

        return Promise.resolve(preview);
      })
      .catch(error => {
        console.log('Failed to fetch weather');
        return Promise.reject(error);
      });
  }
}
