'use strict';

document.addEventListener('DOMContentLoaded', event => {
  const defaultLocation = {
    latitude: 34.0522,
    longitude: -118.2437
  };
  const formService = new FormService();
  const locationService = new LocationService(defaultLocation.latitude, defaultLocation.longitude);
  const dbService = new DBService(locationService);
  const weatherService = new WeatherService(dbService);
  const geoService = new GeoService();
  const spaceService = new SpaceService();
  const issTracker = new ISSTrackerComponent(locationService, spaceService);
  const usgsMap = new USGSMapComponent(locationService, geoService);
  const header = new HeaderComponent(locationService, formService);
  const footer = new FooterComponent();

  dbService.getLastLocation()
    .then(res => {
      if (res === undefined) {
        console.log('Past location not found, using default');
      } else {
        console.log('Using last stored location');
      }
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
    })

});
