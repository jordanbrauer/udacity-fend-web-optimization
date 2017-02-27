/** Require Gulp and plugins. */
const gulp = require('gulp');
const minifyCss = require('gulp-cssnano');
const minifyJs = require('gulp-uglify');
const minifyImg = require('gulp-image');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const del = require('del');

/** Default task for testing. */
gulp.task('default', () => {
  console.log('Gulp is working!');
});
