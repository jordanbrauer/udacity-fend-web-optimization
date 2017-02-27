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
const del = require('del');

/** CSS Cleaner */
gulp.task('clean:css', () => {
  return del(pkg.globs.dist.css);
});

/** CSS Concat */
gulp.task('concat:css', () => {
  /** Concatenate css files from package globs for each dist css destination. */
  return pkgStyles.forEach(key => {
    gulp.src(pkg.globs.src.css[key])
      .pipe(concat('styles.css'))
      .pipe(gulp.dest(pkg.paths.dist.css[key]));
  });
});

/** CSS Minify */
gulp.task('minify:css', () => {
  return pkgStyles.forEach(key => {
    // console.log(pkg.paths.dist.css[key] + 'styles.css');
    gulp.src(pkg.paths.dist.css[key] + 'styles.css')
      .pipe(minifyCss())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(pkg.paths.dist.css[key]));
  });
});

/** CSS Build */
gulp.task('build:css', ['clean:css', 'concat:css', 'minify:css']);

/** Default task for testing. */
gulp.task('default', () => {
  console.log('Gulp is working!');
});
