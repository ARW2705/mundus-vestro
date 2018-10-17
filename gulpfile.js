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
  sass: {
    src: 'app/styles/*.scss',
    watch: 'app/styles/**/*.scss',
    dest: 'dist/styles/'
  },
  wicons: {
    src: 'app/styles/vendor/weather-icons/*.css',
    dest: 'dist/styles/'
  },
  scripts: {
    src: [
      'app/scripts/vendor/*.js',
      'app/scripts/_keys.js',
      'app/scripts/services/*.service.js',
      'app/scripts/views/home.js',
      'app/scripts/index.js'
    ],
    dest: 'dist/scripts'
  },
  clean: {
    src: 'dist'
  },
};

const previewTasks = [
  'scripts',
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
  return gulp.src(paths.sass.src)
    // .pipe(sass({outputStyle: 'compressed'})).on('error', sass.logError)
    .pipe(sass()).on('error', sass.logError)
    .pipe(gulp.dest(paths.sass.dest))
    .pipe(browserSync.stream())
});

gulp.task('wicons', () => {
  return gulp.src(paths.wicons.src)
    .pipe(concat('wicons.css'))
    .pipe(gulp.dest(paths.wicons.dest))
});

gulp.task('scripts', () => {
  return gulp.src(paths.scripts.src)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('index.min.js'))
    .pipe(gulp.dest(paths.scripts.dest))
});

gulp.task('test-scripts', () => {
  return gulp.src(paths.scripts.src)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('test.js'))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('tmp/'))
});

gulp.task('preview', previewTasks, () => {
  browserSync.init({
    server: 'dist'
  });
  gulp.watch(paths.sass.watch, ['sass']);
});

gulp.task('default', () => {});
