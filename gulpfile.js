/**
 * @file gulpfile.js
 * @author Jordan Brauer <jbrauer.inc@gmail.com>
 */

/** Require gulp & plugins. */
// NOTE: Could use gulp-load-plugins instead of maintaining a growing list of vars.
const gulp = require('gulp');
const minifyCss = require('gulp-cssnano');
const minifyJs = require('gulp-uglify');
const minifyImg = require('gulp-imagemin');
const compressImg = require('gulp-image');
const resize = require('gulp-image-resize');
const inline = require('gulp-inline');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const run = require('run-sequence');
const del = require('del');

//===============================================
// Gulpfile Vars
//===============================================

/** @const {obj} pkg - Require project data */
const pkg = require('./package.json');

/** @const {arr} pkgStyles - for unique style sheets generation */
const pkgStyles = Object.keys(pkg.paths.dist.css);

/** @const {arr} largeFixtures - array of large fixtures to be resized for distribution. */
const largeFixtures = [
  'pizzeria.jpg'
];

//===============================================
// HTML View Tasks
//===============================================

/**
 * HTML Cleaner
 * @function clean:views - Delete generated HTML files.
 */
gulp.task('clean:views', () => del(pkg.globs.dist.views));

/**
 * HTML Compiler
 * @function compile:views - Move HTML view files for DI.
 */
gulp.task('compile:views', () => {
  gulp.src(pkg.globs.src.views)
  .pipe(gulp.dest(pkg.paths.dist.views));
});

/**
 * HTML Builder
 * @function build:views - move src html files to dist for dependency injection.
 */
// gulp.task('build:views', ['clean:views', 'compile:views']);
gulp.task('build:views', () => {
  return run(
    'clean:views',
    'compile:views'
  );
});

//===============================================
// CSS Style Tasks
//===============================================

/**
 * CSS Cleaner
 * @function clean:css - Delete generated CSS files.
 */
gulp.task('clean:css', () => del(pkg.globs.dist.css));

/**
 * CSS Compiler
 * @function compile:css - Concatenate/minify CSS files from package globs for each dist css destination.
 */
gulp.task('compile:css', () => {
  return pkgStyles.forEach(key => {
    gulp.src(pkg.globs.src.css[key])
      .pipe(concat('styles.css'))
      .pipe(minifyCss())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(pkg.paths.dist.css[key]));
  });
});

/**
 * CSS Builder
 * @function build:css - Call individual CSS tasks from a single build task.
 */
// gulp.task('build:css', ['clean:css', 'compile:css']);
gulp.task('build:css', () => {
  return run(
    'clean:css',
    'compile:css'
  );
});

//===============================================
// JS Script Tasks
//===============================================

/**
 * JS Cleaner
 * @function clean:js - Delete generated JS files.
 */
gulp.task('clean:js', () => del(pkg.globs.dist.js));

/**
 * JS Compiler
 * @function compile:js - Minify JS files for external use or DI.
 */
gulp.task('compile:js', () => {
  return gulp.src(pkg.globs.src.js)
    .pipe(minifyJs())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(pkg.paths.dist.js));
});

/**
 * JS Build
 * @function build:js - move src JS files to dist directory for DI.
 */
// gulp.task('build:js', ['clean:js', 'compile:js']);
gulp.task('build:js', () => {
  return run(
    'clean:js',
    'compile:js'
  );
});

//===============================================
// Image Tasks
//===============================================

/**
 * Image Cleaner
 * @function clean:img - Delete generated image files.
 */
gulp.task('clean:img', () => del(pkg.globs.dist.img));

/**
 * Image Compressor
 * @function compress:img - Compress images from src assets.
 */
gulp.task('compress:img', () => {
  return gulp.src(pkg.globs.src.img)
    .pipe(minifyImg([
      minifyImg.jpegtran({ progressive: true, interlaced: true }),
      minifyImg.optipng({ progressive: true, interlaced: true }),
      minifyImg.gifsicle({ progressive: true, interlaced: true }),
      minifyImg.svgo({ progressive: true, interlaced: true })
    ], { verbose: true }))
    .pipe(compressImg({
      /**
      * BUG: After a few jpegs for gulp-image it craps out, even with
      * concurrency set to 1 at time. I also found that disabling the
      * jpeg compression engines that it would work fine since it skipped
      * the jpegs but that isn't what I want. I do indeed have both mozjpeg,
      * and jpegoptim installed on my machine as other image-optimizers work
      * (not as good as this one when this one works...) and I can use them
      * individually from the command line.
      *
      * HACK: After playing around I found that throwing a second image
      * optimizer (gulp-imagemin) into the pipeline before gulp-image runs
      * does the trick. I am guessing it has something to do with a memory
      * usage problem due to pizzeria.png being quite large on its own in
      * addition to the other images being in the pipeline at the same time.
      */
      jpegoptim: true, // NOTE: set these to false if having issues with image compression.
      mozjpeg: true,
      // concurrent: 1 // NOTE: uncomment if having performance/memory issues.
    }))
    .pipe(gulp.dest(pkg.paths.dist.img));
});

/**
 * Image Resizer
 * @function resize:img - Resize any large images from the largeFixtures array.
 */
gulp.task('resize:img', () => {
  return largeFixtures.forEach(key => {
    gulp.src(pkg.paths.src.img + key)
      .pipe(resize({ width: 768 }))
      .pipe(gulp.dest('./dist/img'));
  });
});

/**
 * Image Builder
 * @function build:img - compress image files from source to dist.
 */
// gulp.task('build:img', ['clean:img', 'compress:img', 'resize:img']);
gulp.task('build:img', () => {
  return run(
    'clean:img',
    'compress:img',
    'resize:img'
  );
});

//===============================================
// Compiler Tasks
//===============================================

/**
 * NOTE/BUG: The current way that the Gulp docs say to run a sequence of
 * tasks is sadly a little buggy. Gulp 4 will fix with this with gulp.series(),
 * but they have yet to release it to production.
 * In the mean time run-sequence (https://www.npmjs.com/package/run-sequence)
 * can be used in place of the deprecated gulp.run() for batch running tasks.
 */

/**
 * Static Content Compiler
 * @function compile:static-content - runs all static content build tasks before DI.
 */
// gulp.task('compile:static-content', ['build:views', 'build:css', 'build:js', 'build:img']);
gulp.task('compile:static-content', () => {
  return run(
    ['build:views', 'build:css', 'build:js'],
    'build:img'
  );
});

/**
 * Dependency Injection
 * @function compile:di - Inject styles, scripts and imgs into HTML from CSS/JS files for performance boost.
 */
gulp.task('compile:di', () => {
  return gulp.src(pkg.globs.dist.views)
    .pipe(inline({
      base: pkg.paths.dist,
      disabledTypes: ['svg']
    }))
    .pipe(gulp.dest(pkg.paths.dist.views));
});

//===============================================
// Watch Tasks
//===============================================

// TODO: Add watch tasks for development. Implement browser-reload too.

//===============================================
// Default & Misc Tasks
//===============================================

/**
 * Super Cleaner
 * @function clean:all - Deletes all generated files. Use as a reset.
 */
// gulp.task('clean:all', ['clean:views', 'clean:css', 'clean:js', 'clean:img'], () => del(pkg.paths.dist.views));
gulp.task('clean:all', () => {
  return run(
    'clean:views',
    'clean:css',
    'clean:js',
    'clean:img'
  );
});

/**
 * Default
 * @function default - task for testing Gulp installation.
 */
gulp.task('default', () => {
  console.log('Gulp is working!');
});
