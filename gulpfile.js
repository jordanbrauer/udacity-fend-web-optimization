/**
 * @file gulpfile.js
 * @author Jordan Brauer <jbrauer.inc@gmail.com>
 */

// Require gulp & plugins.
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
const chalk = require('chalk');
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
 * @function clean:views
 * @desc Delete generated HTML files.
 * @example gulp clean:views
 */
gulp.task('clean:views', () => del(pkg.globs.dist.views));

/**
 * HTML Compiler
 * @function compile:views
 * @desc Move HTML view files for DI.
 * @example gulp compile:views
 */
gulp.task('compile:views', () => {
  return gulp.src(pkg.globs.src.views)
  .pipe(gulp.dest(pkg.paths.dist.views));
});

/**
 * HTML Builder
 * @function build:views
 * @desc move src html files to dist for dependency injection.
 * @example gulp build:views
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
 * @function clean:css
 * @desc Delete generated CSS files.
 * @example gulp clean:css
 */
gulp.task('clean:css', () => del(pkg.globs.dist.css));

/**
 * CSS Compiler
 * @function compile:css
 * @desc Concatenate/minify CSS files from package globs for each dist css destination.
 * @example gulp compile:css
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
 * @function build:css
 * @desc Call individual CSS tasks from a single build task.
 * @example gulp build:css
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
 * @function clean:js
 * @desc Delete generated JS files.
 * @example gulp clean:js
 */
gulp.task('clean:js', () => del(pkg.globs.dist.js));

/**
 * JS Compiler
 * @function compile:js
 * @desc Minify JS files for external use or DI.
 * @example gulp compile:js
 */
gulp.task('compile:js', () => {
  return gulp.src(pkg.globs.src.js)
    .pipe(minifyJs())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(pkg.paths.dist.js));
});

/**
 * JS Build
 * @function build:js
 * @desc move src JS files to dist directory for DI.
 * @example gulp build:js
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
 * @function clean:img
 * @desc Delete generated image files.
 * @example gulp clean:img
 */
gulp.task('clean:img', () => del(pkg.globs.dist.img));

/**
 * Image Compressor
 * @function compress:img
 * @desc Compress images from src assets.
 * @example gulp compress:img
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
       // BUG: After a few jpegs for gulp-image it craps out, even with
       // concurrency set to 1 at time. I also found that disabling the
       // jpeg compression engines that it would work fine since it skipped
       // the jpegs but that isn't what I want. I do indeed have both mozjpeg,
       // and jpegoptim installed on my machine as other image-optimizers work
       // (not as good as this one when this one works...) and I can use them
       // individually from the command line.
       //
       // HACK: After playing around I found that throwing a second image
       // optimizer (gulp-imagemin) into the pipeline before gulp-image runs
       // does the trick. I am guessing it has something to do with a memory
       // usage problem due to pizzeria.png being quite large on its own in
       // addition to the other images being in the pipeline at the same time.
      jpegoptim: true, // NOTE: set these to false if having issues with image compression.
      mozjpeg: true,
      // concurrent: 1 // NOTE: uncomment if having performance/memory issues.
    }))
    .pipe(gulp.dest(pkg.paths.dist.img));
});

/**
 * Image Resizer
 * @function resize:img
 * @desc Resize any large images from the largeFixtures array.
 * @example gulp resize:img
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
 * @function build:img
 * @desc compress image files from source to dist.
 * @example gulp build:img
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
 * @function compile:static-content
 * @desc runs all static content build tasks before DI.
 * @example gulp compile:static-content
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
 * @function compile:di
 * @desc Inject styles, scripts and imgs into HTML from CSS/JS files for performance boost.
 * @example gulp compile:di
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
// Default & Misc Tasks
//===============================================

/**
 * File Change Watcher
 * @function watch
 * @desc Watch the entire project filesystem for changes and run the respective task for updates.
 * @example gulp watch
 */
gulp.task('watch', () => {
  // Quick and dirty string template for watchers to log events into
  let offender = (e) => `[${chalk.gray(e.type.toUpperCase())}] ${chalk.magenta(e.path)}`;

  // HTML Watcher
  gulp.watch(pkg.globs.src.views, (event) => {
    // Log event, the offending file and run respective task(s).
    console.log(offender(event));
    run('build:views', 'compile:di');
  });

  // CSS watcher
  gulp.watch(pkg.globs.src.css.base, (event) => {
    // Log event, the offending file and run respective task(s).
    console.log(offender(event));
    run('build:css', 'compile:di');
  });

  // JS Watcher
  gulp.watch(pkg.globs.src.js, (event) => {
    // Log event, the offending file and run respective task(s).
    console.log(offender(event));
    run('build:js', 'compile:di');
  });

  // Image Watcher
  gulp.watch(pkg.globs.src.img, (event) => {
    // Log event, the offending file and run respective task(s).
    console.log(offender(event));
    run('build:img', 'compile:di');
  });
});

/**
 * Super Cleaner
 * @function clean:all
 * @desc Deletes all generated files. Use as a reset.
 * @example gulp clean:all
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
 * @function default
 * @desc task for testing Gulp installation.
 * @example gulp
 * @example gulp default
 */
gulp.task('default', () => {
  console.log('Gulp is working!');
});
