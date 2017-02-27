/** Require project information. */
const pkg = require('./package.json');

/** Require Gulp and plugins. */
const gulp = require('gulp');
const minifyCss = require('gulp-cssnano');
const minifyJs = require('gulp-uglify');
const minifyImg = require('gulp-image');
const inlineCss = require('gulp-inline-css');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const del = require('del');

/** CSS Concat */
gulp.task('concat:css', () => {
  /** Get all distributable css destinations. */
  const styles = Object.keys(pkg.paths.dist.css);

  /** Concatenate css files from package globs for each dist css destination. */
  return styles.forEach((key) => {
    gulp.src(pkg.globs.src.css[key])
      .pipe(concat('styles.css'))
      .pipe(gulp.dest(pkg.paths.dist.css[key]));
  });
});

/** Default task for testing. */
gulp.task('default', () => {
  console.log('Gulp is working!');
});
