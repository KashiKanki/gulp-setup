// see video explanation: https://youtu.be/ubHwScDfRQA

const { src, dest, watch, series} = require('gulp');
const sass = require('gulp-sass')(require('sass')); // This is different from the video since gulp-sass no longer includes a default compiler. Install sass as a dev dependency `npm i -D sass` and change this line from the video.
const prefix = require('gulp-autoprefixer');
const minify = require('gulp-clean-css');
const terser = require('gulp-terser');
const imagemin = require('gulp-imagemin');
const imagewebp = require('gulp-webp');
const browserSync = require('browser-sync').create();
const handlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const extname = require('gulp-extname');
const hb = require('gulp-hb');
const through = require('through2');



const testJsonFile = require('./src/data/test.json');

// Static server
function server() {
  browserSync.init({
    server: './dist',
    port: 4000,
    ui: {
      port: 4001
    }
  });
};


// function hbs() {
//   return src('src/views/*.hbs')
//   .pipe(handlebars({testJsonFile}, { //.pipe(handlebars({testJsonFile}, {
//     ignorePartials: false,
//     batch: ['src/views/']
//   })).pipe(rename({
//     extname: '.html'
//   })).pipe(dest('dist'));
// }

function basic() {
  return src('./src/views/*.hbs')
      .pipe(hb()
          .partials('./src/views/**/*.hbs')
          .helpers('./src/views/*.js')
          .data('./src/data/**/*.{js,json}')
      ).pipe(rename({
          extname: '.html'
       })).pipe(dest('dist'));
     // .pipe(dest('dist'));
}

// function hbs() {
//   return src('src/views/*.hbs')
//   .pipe(handlebars({testJsonFile}, { //.pipe(handlebars({testJsonFile}, {
//     ignorePartials: false,
//     batch: ['src/views/']
//   })).pipe(rename({
//     extname: '.html'
//   })).pipe(dest('dist'));
// }



//compile, prefix, and min scss
function compilescss() {
  return src('src/scss/*.scss') // change to your source directory
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(dest('dist/css')) // change to your final/public directory
    // .pipe(sass())
    // .pipe(prefix('last 2 versions'))
    // .pipe(minify())
    .pipe(dest('dist/css')) // change to your final/public directory
};

//Copy all Data to dist
function copyfonts() {
  return src(`./src/fonts/**/*`)
    .pipe(dest(`dist/fonts`));
}

function copyData() {
  return src(`./src/data/**/*.json`)
    .pipe(dest(`dist/data`));
}
// copyFiles('data');
// copyFiles('fonts');


// function copyfonts() {
//   return src('src/fonts/**/*')
//       .pipe(dest('dist/fonts'));
// };

//optimize and move images
function optimizeimg() {
  return src('src/images/*.{jpg,png}') // change to your source directory
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 80, progressive: true }), // imagemin.mozjpeg
      imagemin.optipng({ optimizationLevel: 2 }),
    ]))
    .pipe(dest('dist/images')) // change to your final/public directory
};

//optimize and move images
function webpImage() {
  return src('dist/images/*.{jpg,png}') // change to your source directory
    .pipe(imagewebp())
    .pipe(dest('dist/images')) // change to your final/public directory
};


// minify js
function jsmin(){
  return src('src/js/*.js') // change to your source directory
    .pipe(terser())
    .pipe(dest('dist/js')); // change to your final/public directory
}

//watchtask
function watchTask(){
  server();
  // copyFiles('data');
  //copyFiles('fonts');

  watch('src/scss/**/*.scss', compilescss).on('change', browserSync.reload); // change to your source directory
  watch('src/js/*.js', jsmin).on('change', browserSync.reload); // change to your source directory
  watch('src/images/*', optimizeimg).on('change', browserSync.reload); // change to your source directory
  watch('dist/images/*.{jpg,png}', webpImage).on('change', browserSync.reload); // change to your source directory
  //watch('src/views/**/*.hbs', hbs).on('change', browserSync.reload);
  watch('src/data/**/*.json', copyData).on('change', browserSync.reload); 
  watch('src/views/**/*.hbs', basic).on('change', browserSync.reload);

}


// Default Gulp task 
exports.default = series(
  basic,
  copyData,
  copyfonts,
  //copyFiles,
  //hbs,
  compilescss,
  jsmin,
  optimizeimg,
  webpImage,
  watchTask
);
