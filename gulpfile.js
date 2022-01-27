'use strict';

const gulp = require('gulp');
const clean = require('gulp-clean');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const imageResize = require('gulp-image-resize');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

const paths = {
  html: {
    src: 'app/*.html',
    buildDest: 'dist',
    previewDest: 'tmp'
  },
  fonts: {
    src: 'app/assets/fonts/**/*',
    buildDest: 'dist/assets/fonts',
    previewDest: 'tmp/assets/fonts'
  },
  icons: {
    src: 'app/assets/icons/**/*',
    buildDest: 'dist/assets/icons',
    previewDest: 'tmp/assets/icons'
  },
  images: {
    src: 'app/assets/images/**/*',
    buildDest: 'dist/assets/images',
    previewDest: 'tmp/assets/images'
  },
  scss: {
    src: 'app/styles/*.scss',
    watch: 'app/styles/**/*.scss',
    buildDest: 'dist/styles',
    previewDest: 'tmp/styles'
  },
  wicons: {
    src: 'app/styles/vendor/weather-icons/*.css',
    buildDest: 'dist/styles',
    previewDest: 'tmp/styles'
  },
  scripts: {
    srcShared: [
      'app/scripts/vendor/idb.js',
      'app/scripts/services/database.service.js',
      'app/scripts/_keys.js',
      'app/scripts/services/location.service.js',
      'app/scripts/services/forms.service.js',
      'app/scripts/components/header.component.js',
      'app/scripts/components/footer.component.js'
    ],
    srcHomeView: [
      'app/scripts/services/weather.service.js',
      'app/scripts/services/geological.service.js',
      'app/scripts/services/space.service.js',
      'app/scripts/components/iss-tracker.component.js',
      'app/scripts/components/usgs-map.component.js',
      'app/scripts/views/home.js',
      'app/scripts/home.main.js'
    ],
    srcSkyView: [
      'app/scripts/services/weather.service.js',
      'app/scripts/sky.main.js'
    ],
    srcEarthView: [
      'app/scripts/services/geological.service.js',
      'app/scripts/components/usgs-map.component.js',
      'app/scripts/earth.main.js'
    ],
    srcSpaceView: [
      'app/scripts/services/space.service.js',
      'app/scripts/components/iss-tracker.component.js',
      'app/scripts/space.main.js'
    ],
    srcLoader: 'app/scripts/shared/loader.js',
    sw: {
      src: 'app/sw.js',
      manifest: 'app/manifest.json',
      buildDest: 'dist',
      previewDest: 'tmp'
    },
    buildDest: 'dist/scripts',
    previewDest: 'tmp/scripts'
  },
  clean: {
    buildSrc: 'dist',
    previewSrc: 'tmp'
  },
};


function previewClean() {
  return gulp.src(paths.clean.previewSrc, {read: false})
    .pipe(clean())
}
exports.previewClean = previewClean;

function html() {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.previewDest));
}
exports.html = html;

function fonts() {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.previewDest));
}
exports.fonts = fonts;

function icons() {
  return gulp.src(paths.icons.src)
    .pipe(gulp.dest(paths.icons.previewDest));
}
exports.icons = icons;

function images() {
  return gulp.src(paths.images.src)
    .pipe(imageResize({
      percentage: 8,
      imageMagick: true
    }))
    .pipe(imagemin({progressive: true}))
    .pipe(gulp.dest(paths.images.previewDest));
}
exports.images = images;

function styles() {
  return gulp.src(paths.scss.src)
    .pipe(sass()).on('error', sass.logError)
    .pipe(gulp.dest(paths.scss.previewDest))
    .pipe(browserSync.stream());
}
exports.styles = styles;

function wicons() {
  return gulp.src(paths.wicons.src)
    .pipe(concat('wicons.css'))
    .pipe(gulp.dest(paths.wicons.previewDest));
}
exports.wicons = wicons;

function sharedScripts() {
  return gulp.src(paths.scripts.srcShared)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('shared.min.js'))
    .pipe(gulp.dest(paths.scripts.previewDest));
}
exports.sharedScripts = sharedScripts;

function homeView() {
  return gulp.src(paths.scripts.srcHomeView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('index.min.js'))
    .pipe(gulp.dest(paths.scripts.previewDest));
}
exports.homeView = homeView;

function skyView() {
  return gulp.src(paths.scripts.srcSkyView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('sky.details.min.js'))
    .pipe(gulp.dest(paths.scripts.previewDest));
}
exports.skyView = skyView;

function earthView() {
  return gulp.src(paths.scripts.srcEarthView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('earth.details.min.js'))
    .pipe(gulp.dest(paths.scripts.previewDest));
}
exports.earthView = earthView;

function spaceView() {
  return gulp.src(paths.scripts.srcSpaceView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('space.details.min.js'))
    .pipe(gulp.dest(paths.scripts.previewDest));
}
exports.spaceView = spaceView;

function loader() {
  return gulp.src(paths.scripts.srcLoader)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('loader.min.js'))
    .pipe(gulp.dest(paths.scripts.previewDest));
}
exports.loader = loader;

function sw() {
  return gulp.src(paths.scripts.sw.src)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest(paths.scripts.sw.previewDest));
}
exports.sw = sw;

function manifest() {
  return gulp.src(paths.scripts.sw.manifest)
    .pipe(gulp.dest(paths.scripts.sw.previewDest));
}
exports.manifest = manifest;

const previewTasks = [
  sharedScripts,
  homeView,
  skyView,
  earthView,
  spaceView,
  loader,
  sw,
  manifest,
  html,
  fonts,
  icons,
  images,
  wicons,
  styles
];

function preview(done) {
  gulp.series(...previewTasks);

  browserSync.init({
    server: 'tmp'
  });

  gulp.watch(paths.scss.watch, styles);
  done();
}
exports.preview = preview;

/* === END PREVIEW TASKS === */

/*-----------------------------------------------------------*/

/* === BUILD TASKS === */

function buildClean() {
  console.log('running build clean');
  return gulp.src(paths.clean.buildSrc, {read: false})
    .pipe(clean());
}
exports.buildClean = buildClean;

function buildHTML() {
  console.log('running build html');
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.buildDest));
}
exports.buildHTML = buildHTML;

function buildFonts() {
  console.log('running build fonts');
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.buildDest));
}
exports.buildFonts = buildFonts;

function buildIcons() {
  console.log('running build icons');
  return gulp.src(paths.icons.src)
    .pipe(imagemin({progressive: true}))
    .pipe(gulp.dest(paths.icons.buildDest));
}
exports.buildIcons = buildIcons;

function buildImages() {
  console.log('running build images');
  return gulp.src(paths.images.src)
    .pipe(imageResize({
      percentage: 8,
      imageMagick: true
    }))
    .pipe(imagemin({progressive: true}))
    .pipe(gulp.dest(paths.images.buildDest));
}
exports.buildImages = buildImages;

function buildSass() {
  console.log('running build sass');
  return gulp.src(paths.scss.src)
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.scss.buildDest));
}
exports.buildSass = buildSass;

function buildWicons() {
  console.log('running build wicons');
  return gulp.src(paths.wicons.src)
    .pipe(concat('wicons.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.wicons.buildDest));
}
exports.buildWicons = buildWicons;

function buildSharedScripts() {
  console.log('running build shared scripts');
  return gulp.src(paths.scripts.srcShared)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('shared.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.buildDest));
}
exports.buildSharedScripts = buildSharedScripts;

function buildHomeView() {
  console.log('running build home view');
  return gulp.src(paths.scripts.srcHomeView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('index.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.buildDest));
}
exports.buildHomeView = buildHomeView;

function buildSkyView() {
  console.log('running build sky view');
  return gulp.src(paths.scripts.srcSkyView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('sky.details.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.buildDest));
}
exports.buildSkyView = buildSkyView;

function buildEarthView() {
  console.log('running build earth view');
  return gulp.src(paths.scripts.srcEarthView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('earth.details.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.buildDest));
}
exports.buildEarthView = buildEarthView;

function buildSpaceView() {
  console.log('running build space view');
  return gulp.src(paths.scripts.srcSpaceView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('space.details.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.buildDest));
}
exports.buildSpaceView = buildSpaceView;

function buildLoader() {
  console.log('running build loader');
  return gulp.src(paths.scripts.srcLoader)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('loader.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.buildDest));
}
exports.buildLoader = buildLoader;

function buildSW() {
  console.log('running build sw');
  return gulp.src(paths.scripts.sw.src)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.sw.buildDest));
}
exports.buildSW = buildSW;

function buildManifest() {
  console.log('running build manifest');
  return gulp.src(paths.scripts.sw.manifest)
    .pipe(gulp.dest(paths.scripts.sw.buildDest));
}
exports.buildManifest = buildManifest;

const buildTasks = [
  buildSharedScripts,
  buildHomeView,
  buildSkyView,
  buildEarthView,
  buildSpaceView,
  buildLoader,
  buildSW,
  buildManifest,
  buildHTML,
  buildFonts,
  buildIcons,
  buildImages,
  buildWicons,
  buildSass,
  buildManifest
];
exports.build = gulp.series(...buildTasks);

exports.default = () => {};
