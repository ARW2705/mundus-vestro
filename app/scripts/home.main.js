'use strict';

document.addEventListener('DOMContentLoaded', event => {
  const defaultLocation = {
    latitude: 34.0522,
    longitude: -118.2437
  };
  const formService = new FormService();
  const dbService = new DBService();
  const locationService = new LocationService(dbService, defaultLocation.latitude, defaultLocation.longitude);
  const weatherService = new WeatherService(dbService);
  const geoService = new GeoService();
  const spaceService = new SpaceService();
  const issTracker = new ISSTrackerComponent(locationService, spaceService);
  const usgsMap = new USGSMapComponent(locationService, geoService);
  const header = new HeaderComponent(locationService, formService);
  const footer = new FooterComponent();

  const homeView = new HomeView(
    header,
    footer,
    locationService,
    weatherService,
    spaceService,
    issTracker,
    usgsMap
  );
  homeView.loadContent();
});
