# Udacity FEND Web Optimization

__Table of Contents:__

* [Usage Instructions](#usage-instructions)
* [List of Optimizations](#list-of-optimizations)

## Usage Instructions

* 1) [Downloading](#downloading)
* 2) [Installing](#installing)
* 3) [API Usage](#api-usage)

## Downloading

Clone the repository like so,

```shell
$ git clone https://github.com/jordanbrauer/udacity-fend-web-optimization.git
```

## Installing

Next install the project with a simple

```shell
$ npm install
```

In addition to downloading the project dependencies like normal, this command also invokes the `postinstall` npm script after dependencies have been downloaded. The `postinstall` script runs the `compile:static-content` and `compile:di` gulp commands, more on these in the API section.

## API Usage

The API is written in JS and uses Gulp. See the docs [here](https://jordanbrauer.github.io/udacity-fend-web-optimization/docs/).

### Building the Project

As mentioned in the previous section [Installing](#installing), the `postinstall` npm script runs both the `compile:static-content` and `compile:di` tasks respectively. They have the following effects,

__compile:static-content__

This task is run first and simply copies the static assets (HTML, styles, scripts, images, fonts, icons, etc..) from the `./src/` directory while doing any work on them needed for production/performance (minification, concatenation, pre-processing, transpiling etc..) in the pipeline before placing them into their `./dist/` directory counterpart.

__compile:di__

Run this task to inject all external static files (the dependencies) into the markup (HTML).

> _Note: Rather than running both of these commands manually, you can alternatively use the npm script `compile` which calls both compile tasks like so,_
>```shell
$ npm run compile
```

## List of Optimizations

Here are the optimizations that were made to the site.

### HTML

* Removed GoogleAnalytics as it is not needed for this case.
* Removed GoogleFonts entirely due to large performance impact on top of the font not being unique enough to warrant such a performance hit - even hosting the files ourself.

### CSS

* Moved all styles to dedicated `css/` directory. Each unique stylesheet has it's own sub-directory.
* Concatenated each unique themes' individual style sheets together.
* Minified the merged style sheets to conserve space.
* Inlined styles into HTML to reduce number of requests.

### JS

* Moved all scripts to dedicated `js/` directory.
* Minified each script file to conserve space.
* Inlined scripts into HTML to reduce number of requests.
* Reduced number of generated pizzas from 200 to 32.
* Updated `changePizzaSizes()` to do less work while looping through the `.randomPizzaContainer` selectors. This is achieved by moving the assignment of `dx` and `newwidth` outside/above the `for...` loop in addition to only selecting the first (`.randomPizzaContainer[0]`) of many `.randomPizzaContainer`s since they all are the same size all the time. This limits the calculations to being done only the first time `changePizzaSizes()` is called rather than for every single iteration it makes in the loop freeing up computing resources.

__Improved `changePizzaSizes()` function__

```javascript
// Iterates through pizza elements on the page and changes their widths
function changePizzaSizes(size) {
  var pizzaSelector = document.querySelectorAll('.randomPizzaContainer');
  var dx = determineDx(pizzaSelector[0], size);
  var newwidth = (pizzaSelector[0].offsetWidth + dx) + 'px';

  for (var i = 0; i < document.querySelectorAll(".randomPizzaContainer").length; i++) {
    document.querySelectorAll(".randomPizzaContainer")[i].style.width = newwidth;
  }
}
```

* Improved the `updatePositions()` function performance by isolating the calculation for vertical scroll distance outside of the loop since it only needs to be calculated once per function call and not for every `.mover` selector.

__Improved `updatePositions()` function__

```javascript
// Moves the sliding background pizzas based on scroll position
function updatePositions() {
  // ...

  var items = document.querySelectorAll('.mover');
  var verticalScroll = (document.body.scrollTop / 1250);

  for (var i = 0; i < items.length; i++) {
    var phase = Math.sin((verticalScroll) + (i % 5));
    items[i].style.left = items[i].basicLeft + 100 * phase + 'px';
  }

  // ...
}
```

### Images

* Moved all images to dedicated `img/` directory.
* Compressed any jpeg images with `jpegoptim`, `mozjpeg`, `jpegtran`, and `jpegRecompress`
* Compressed any png images with `pngquant`, `optipng`, `zopflipng`
* Resized the overly-large `pizzeria.png` image.
* Inlined images into HTML for performance boost.
