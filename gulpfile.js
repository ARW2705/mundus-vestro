'use strict';

const gulp = require('gulp');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();

const paths = {
  html: {
    src: 'app/*.html',
    dest: 'dist/'
  },
  assets: {
    src: 'app/assets/**/*',
    dest: 'dist/assets/'
  },
  scss: {
    src: 'app/styles/*.scss',
    watch: 'app/styles/**/*.scss',
    dest: 'dist/styles/'
  },
  wicons: {
    src: 'app/styles/vendor/weather-icons/*.css',
    dest: 'dist/styles/'
  },
  scripts: {
    srcShared: [
      'app/scripts/vendor/idb.js',
      'app/scripts/_keys.js',
      'app/scripts/services/location.service.js',
      'app/scripts/services/forms.service.js',
      'app/scripts/components/header.component.js'
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
    dest: 'dist/scripts'
  },
  clean: {
    src: 'dist'
  },
};

const previewTasks = [
  'shared-scripts',
  'home-view',
  'sky-view',
  'earth-view',
  'space-view',
  'loader',
  'html',
  'assets',
  'wicons',
  'sass'
];

gulp.task('clean', () => {
  return gulp.src(paths.clean.src, {read: false})
    .pipe(clean())
});

gulp.task('html', () => {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
});

gulp.task('assets', () => {
  return gulp.src(paths.assets.src)
    .pipe(gulp.dest(paths.assets.dest))
});

gulp.task('sass', () => {
  return gulp.src(paths.scss.src)
    // .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sass()).on('error', sass.logError)
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(browserSync.stream())
});

gulp.task('wicons', () => {
  return gulp.src(paths.wicons.src)
    .pipe(concat('wicons.css'))
    .pipe(gulp.dest(paths.wicons.dest))
});

gulp.task('shared-scripts', () => {
  return gulp.src(paths.scripts.srcShared)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('shared.min.js'))
    .pipe(gulp.dest(paths.scripts.dest))
});

gulp.task('home-view', () => {
  return gulp.src(paths.scripts.srcHomeView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('index.min.js'))
    .pipe(gulp.dest(paths.scripts.dest))
});

gulp.task('sky-view', () => {
  return gulp.src(paths.scripts.srcSkyView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('sky.details.min.js'))
    .pipe(gulp.dest(paths.scripts.dest))
});

gulp.task('earth-view', () => {
  return gulp.src(paths.scripts.srcEarthView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('earth.details.min.js'))
    .pipe(gulp.dest(paths.scripts.dest))
});

gulp.task('space-view', () => {
  return gulp.src(paths.scripts.srcSpaceView)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('space.details.min.js'))
    .pipe(gulp.dest(paths.scripts.dest))
});

gulp.task('loader', () => {
  return gulp.src(paths.scripts.srcLoader)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('loader.min.js'))
    .pipe(gulp.dest(paths.scripts.dest))
});

gulp.task('preview', previewTasks, () => {
  browserSync.init({
    server: 'dist'
  });

  gulp.watch(paths.scss.watch, ['sass']);
});

gulp.task('default', () => {});
