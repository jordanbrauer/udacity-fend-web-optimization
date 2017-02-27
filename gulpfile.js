/** Require project information. */
const pkg = require('./package.json');
const pkgStyles = Object.keys(pkg.paths.dist.css);

/** Require Gulp and plugins. */
const gulp = require('gulp');
const minifyCss = require('gulp-cssnano');
const minifyJs = require('gulp-uglify');
const minifyImg = require('gulp-image');
const inlineCss = require('gulp-inline-css');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const merge = require('merge-stream');
const del = require('del');

/**
 * CSS Cleaner
 * Clean generated CSS files.
 */
gulp.task('clean:css', () => {
  return del(pkg.globs.dist.css);
});

/**
 * CSS Concat
 * Concatenate css files from package globs for each dist css destination.
 */
gulp.task('concat:css', () => {
  return pkgStyles.forEach(key => {
    gulp.src(pkg.globs.src.css[key])
      .pipe(concat('styles.css'))
      .pipe(gulp.dest(pkg.paths.dist.css[key]));
  });
});

/**
 * CSS Minify
 * Minify merged css files from package globs for each dist css destination.
 */
gulp.task('minify:css', () => {
  return pkgStyles.forEach(key => {
    gulp.src(pkg.paths.dist.css[key] + 'styles.css')
      .pipe(minifyCss())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(pkg.paths.dist.css[key]));
  });
});

/**
 * CSS Build
 * Call individual CSS tasks from a single build task.
 */
gulp.task('build:css', ['clean:css', 'concat:css', 'minify:css']);

/**
 * CSS Injection
 * Inject styles into HTML from CSS files to improve performance.
 */
gulp.task('inject:css', () => {
  /** Copy over most recent HTML files. */
  const stream_a = gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./dist/'));

  /** Inject generated CSS into copied HTML files. */
  const stream_b = gulp.src('./dist/**/*.html')
    .pipe(inlineCss())
    .pipe(gulp.dest('./dist/'));

  /** Merge and return stream. */
  return merge(stream_a, stream_b);
});

/** Default task for testing. */
gulp.task('default', () => {
  console.log('Gulp is working!');
});
