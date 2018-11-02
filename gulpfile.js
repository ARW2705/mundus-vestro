'use strict';

const gulp = require('gulp');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
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
      'app/scripts/views/sky.js',
      'app/scripts/sky.main.js'
    ],
    srcEarthView: [
      'app/scripts/services/geological.service.js',
      'app/scripts/components/usgs-map.component.js',
      'app/scripts/views/earth.js',
      'app/scripts/earth.main.js'
    ],
    srcSpaceView: [
      'app/scripts/services/space.service.js',
      'app/scripts/components/iss-tracker.component.js',
      'app/scripts/views/space.js',
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

const previewTasks = [
  'shared-scripts',
  'home-view',
  'sky-view',
  'earth-view',
  'space-view',
  'loader',
  'sw',
  'html',
  'fonts',
  'icons',
  'images',
  'wicons',
  'sass'
];

gulp.task('clean', () => {
  return gulp.src(paths.clean.previewSrc, {read: false})
    .pipe(clean())
});

gulp.task('html', () => {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.previewDest))
});

gulp.task('fonts', () => {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.previewDest))
});

gulp.task('icons', () => {
  return gulp.src(paths.icons.src)
    .pipe(gulp.dest(paths.icons.previewDest))
});

gulp.task('images', () => {
  return gulp.src(paths.images.src)
    .pipe(imageResize({
      percentage: 8,
      imageMagick: true
    }))
    .pipe(imagemin({progressive: true}))
    .pipe(gulp.dest(paths.images.previewDest))
});

gulp.task('sass', () => {
  return gulp.src(paths.scss.src)
    .pipe(sass()).on('error', sass.logError)
    .pipe(gulp.dest(paths.scss.previewDest))
    .pipe(browserSync.stream())
});

gulp.task('wicons', () => {
  return gulp.src(paths.wicons.src)
    .pipe(concat('wicons.css'))
    .pipe(gulp.dest(paths.wicons.previewDest))
});

gulp.task('shared-scripts', () => {
  return gulp.src(paths.scripts.srcShared)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('shared.min.js'))
    .pipe(gulp.dest(paths.scripts.previewDest))
});

gulp.task('home-view', () => {
  return gulp.src(paths.scripts.srcHomeView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('index.min.js'))
    .pipe(gulp.dest(paths.scripts.previewDest))
});

gulp.task('sky-view', () => {
  return gulp.src(paths.scripts.srcSkyView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('sky.details.min.js'))
    .pipe(gulp.dest(paths.scripts.previewDest))
});

gulp.task('earth-view', () => {
  return gulp.src(paths.scripts.srcEarthView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('earth.details.min.js'))
    .pipe(gulp.dest(paths.scripts.previewDest))
});

gulp.task('space-view', () => {
  return gulp.src(paths.scripts.srcSpaceView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('space.details.min.js'))
    .pipe(gulp.dest(paths.scripts.previewDest))
});

gulp.task('loader', () => {
  return gulp.src(paths.scripts.srcLoader)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('loader.min.js'))
    .pipe(gulp.dest(paths.scripts.previewDest))
});

gulp.task('sw', () => {
  return gulp.src(paths.scripts.sw.src)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest(paths.scripts.sw.previewDest))
});

gulp.task('preview', previewTasks, () => {
  browserSync.init({
    server: 'dist'
  });

  gulp.watch(paths.scss.watch, ['sass']);
});

/* === END PREVIEW TASKS === */

/*-----------------------------------------------------------*/

/* === BUILD TASKS === */

const buildTasks = [
  'build-shared-scripts',
  'build-home-view',
  'build-sky-view',
  'build-earth-view',
  'build-space-view',
  'build-loader',
  'build-sw',
  'build-html',
  'build-fonts',
  'build-icons',
  'build-images',
  'build-wicons',
  'build-sass',
  'build-manifest'
];

gulp.task('build-clean', () => {
  return gulp.src(paths.clean.buildSrc, {read: false})
    .pipe(clean())
});

gulp.task('build-html', () => {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.buildDest))
});

gulp.task('build-fonts', () => {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.buildDest))
});

gulp.task('build-icons', () => {
  return gulp.src(paths.icons.src)
    .pipe(imagemin({progressive: true}))
    .pipe(gulp.dest(paths.icons.buildDest))
});

gulp.task('build-images', () => {
  return gulp.src(paths.images.src)
    .pipe(imageResize({
      percentage: 8,
      imageMagick: true
    }))
    .pipe(imagemin({progressive: true}))
    .pipe(gulp.dest(paths.images.buildDest))
});

gulp.task('build-sass', () => {
  return gulp.src(paths.scss.src)
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.scss.buildDest))
});

gulp.task('build-wicons', () => {
  return gulp.src(paths.wicons.src)
    .pipe(concat('wicons.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.wicons.buildDest))
});

gulp.task('build-shared-scripts', () => {
  return gulp.src(paths.scripts.srcShared)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('shared.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.buildDest))
});

gulp.task('build-home-view', () => {
  return gulp.src(paths.scripts.srcHomeView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('index.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.buildDest))
});

gulp.task('build-sky-view', () => {
  return gulp.src(paths.scripts.srcSkyView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('sky.details.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.buildDest))
});

gulp.task('build-earth-view', () => {
  return gulp.src(paths.scripts.srcEarthView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('earth.details.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.buildDest))
});

gulp.task('build-space-view', () => {
  return gulp.src(paths.scripts.srcSpaceView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('space.details.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.buildDest))
});

gulp.task('build-loader', () => {
  return gulp.src(paths.scripts.srcLoader)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('loader.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.buildDest))
});

gulp.task('build-sw', () => {
  return gulp.src(paths.scripts.sw.src)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.sw.buildDest))
});

gulp.task('build-manifest', () => {
  return gulp.src(paths.scripts.sw.manifest)
    .pipe(gulp.dest(paths.scripts.sw.buildDest))
});

gulp.task('build', buildTasks, () => {});

gulp.task('default', () => {});
