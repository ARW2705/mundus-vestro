'use strict';

document.addEventListener('DOMContentLoaded', event => {
  const defaultLocation = {
    latitude: 34.0522,
    longitude: -118.2437
  };
  const locationService = new LocationService(defaultLocation.latitude, defaultLocation.longitude);
  const weatherService = new WeatherService();
  const geoService = new GeoService();
  const spaceService = new SpaceService();
  const issTracker = new ISSTrackerComponent(locationService, spaceService);
  const usgsMap = new USGSMapComponent(locationService, geoService);

  const homeView = new HomeView(
    document,
    locationService,
    weatherService,
    // geoService,
    spaceService,
    issTracker,
    usgsMap
  );
  homeView.loadContent();
});
