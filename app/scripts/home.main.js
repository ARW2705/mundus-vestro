'use strict';

document.addEventListener('DOMContentLoaded', event => {
  const defaultLocation = {
    latitude: 34.0522,
    longitude: -118.2437
  };
  const formService = new FormService();
  const locationService = new LocationService(document, defaultLocation.latitude, defaultLocation.longitude);
  const weatherService = new WeatherService();
  const geoService = new GeoService();
  const spaceService = new SpaceService();
  const issTracker = new ISSTrackerComponent(locationService, spaceService);
  const usgsMap = new USGSMapComponent(locationService, geoService);
  const header = new HeaderComponent(document, locationService, formService);

  const homeView = new HomeView(
    document,
    header,
    locationService,
    weatherService,
    spaceService,
    issTracker,
    usgsMap
  );
  homeView.loadContent();
});
