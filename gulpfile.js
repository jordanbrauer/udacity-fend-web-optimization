/** Require project information along with gulp & plugins. */
const pkg = require('./package.json');
const pkgStyles = Object.keys(pkg.paths.dist.css);
const gulp = require('gulp');
const minifyCss = require('gulp-cssnano');
const minifyJs = require('gulp-uglify');
const compressImg = require('gulp-image');
const inline = require('gulp-inline');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const del = require('del');

//===============================================
// Default Task
//===============================================

/** Default - task for testing Gulp installation. */
gulp.task('default', () => {
  console.log('Gulp is working!');
});

//===============================================
// Directory Cleaning Tasks
//===============================================

/** HTML Cleaner - Delete generated HTML files. */
gulp.task('clean:views', () => del(pkg.globs.dist.views));

/** CSS Cleaner - Delete generated CSS files. */
gulp.task('clean:css', () => del(pkg.globs.dist.css));

/** JS Cleaner - Delete generated JS files. */
gulp.task('clean:js', () => del(pkg.globs.dist.js));

/** Image Cleaner - Delete generated image files. */
gulp.task('clean:img', () => del(pkg.globs.dist.img));

/** Super Cleaner - Deletes all generated files. */
gulp.task('clean:all', ['clean:views', 'clean:css', 'clean:js', 'clean:img'], () => del(pkg.paths.dist.views));

//===============================================
// HTML View Tasks
//===============================================

/** Copy Views - Move HTML view files from src to dist - ready for DI. */
gulp.task('copy:views', () => {
  gulp.src(pkg.globs.src.views)
  .pipe(gulp.dest(pkg.paths.dist.views));
});

//===============================================
// CSS Style Tasks
//===============================================

/** CSS Concat - Concatenate css files from package globs for each dist css destination. */
gulp.task('concat:css', () => {
  return pkgStyles.forEach(key => {
    gulp.src(pkg.globs.src.css[key])
      .pipe(concat('styles.css'))
      .pipe(gulp.dest(pkg.paths.dist.css[key]));
  });
});

/** CSS Minify - Minify merged css files from package globs for each dist css destination. */
gulp.task('minify:css', () => {
  return pkgStyles.forEach(key => {
    gulp.src(pkg.paths.dist.css[key] + 'styles.css')
      .pipe(minifyCss())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(pkg.paths.dist.css[key]));
  });
});

//===============================================
// JS Script Tasks
//===============================================

/** JS Copy - Move JS files for minification and DI. */
gulp.task('copy:js', () => {
  return gulp.src(pkg.globs.src.js)
    .pipe(gulp.dest(pkg.paths.dist.js));
});

/** JS Minify - Minify JS files for external use. */
gulp.task('minify:js', () => {
  return gulp.src(pkg.globs.dist.js)
    .pipe(minifyJs())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(pkg.paths.dist.js));
});

//===============================================
// Image Tasks
//===============================================

/** Image Compressions - Compress images from src assets. */
gulp.task('compress:img', () => {
  return gulp.src(pkg.globs.src.img)
    .pipe(compressImg())
    .pipe(gulp.dest(pkg.paths.dist.img));
});

//===============================================
// Build Tasks
//===============================================

/** HTML Build - move src html files to dist for dependency injection. */
gulp.task('build:views', ['clean:views', 'copy:views']);

/**
 * CSS Build - Call individual CSS tasks from a single build task.
 * BUG: minify:css has to be run manually after compile:static-content is run.
 */
gulp.task('build:css', ['clean:css', 'concat:css', 'minify:css']);

/**
 * JS Build - move src JS files to dist directory.
 * BUG: minify:js has to be run manually after compile:static-content is run.
 */
gulp.task('build:js', ['clean:js', 'copy:js', 'minify:js']);

/** Image Build - compress image files from source to dist. */
gulp.task('build:img', ['clean:img', 'compress:img']);

//===============================================
// Compile Tasks
//===============================================

/** Static Content - runs all static content buld tasks before DI. */
gulp.task('compile:static-content', ['build:views', 'build:css', 'build:js', 'build:img']);

/** Dependency Injection - Inject styles, scripts, and images into HTML from CSS files to improve performance. */
gulp.task('compile:di', () => {
  return gulp.src(pkg.globs.dist.views)
    .pipe(inline({
      base: pkg.paths.dist,
      disabledTypes: ['svg']
    }))
    .pipe(gulp.dest(pkg.paths.dist.views));
});
