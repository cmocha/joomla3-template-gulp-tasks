/*

npm install gulp --save-dev
npm install gulp-load-plugins --save-dev
npm install gulp-less --save-dev
npm install gulp-minify-css --save-dev
npm install gulp-autoprefixer --save-dev
npm install gulp-rename --save-dev
npm install gulp-sourcemaps --save-dev
npm install es6-promise --save-dev
npm install gulp-concat --save-dev
npm install browser-sync --save-dev
npm install gulp-useref --save-dev
npm install gulp-uglify --save-dev
npm install gulp-if --save-dev
npm install gulp-imagemin --save-dev
npm install gulp-cache --save-dev
npm install del --save-dev
npm install run-sequence --save-dev
npm install gulp-replace --save-dev

*/


'use strict';
var Promise = require('es6-promise').Promise;
var browserSync = require('browser-sync');

var gulp = require('gulp'),
  gulpIf = require('gulp-if'),
  replace = require('gulp-replace'),
  del = require('del'),
  runSequence = require('run-sequence'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  P = gulpLoadPlugins();

// LESS TASK
// gulp less
// we source the build.less file that imports the template.less
// or the Joomla core bootstrap.less file.
// we pipe it to the gulp-autoprefixer and gulp-sourcemaps plugins.
// we then pipe the output to the ./css folder and browserSync plugin.
// using the build.less file is for customization of the protostar template.
// using the bootstrap.less file will allow for building the core Joomla Bootstrap less files.
// see the ./less/build.less file more detail.
gulp.task('less', function () {
  return gulp.src(['./less/build.less'])
    .pipe(P.sourcemaps.init())
    .pipe(P.less())
    .pipe(P.autoprefixer({ map: true }))
    .pipe(P.concat('template.css'))
    .pipe(P.sourcemaps.write('.'))
    .pipe(gulp.dest('./css'))
    // to browserSync
    .pipe(browserSync.reload({
      stream: true
    }));
});

// MIN TASK
// gulp min
// the less task will run first followed by min.
// this task will source css files from the ./css folder.
// then minify and rename them to template.min.css.
gulp.task('min', ['less'], function () {
    return gulp.src(['./css/template.css'])
  .pipe(P.minifyCss())
  .pipe(P.rename('template.min.css'))
  //.pipe(gulp.dest('dist/css'));
  // change output dir due to icon fonts not loading from root media dir
  .pipe(gulp.dest('./css'));
});

// UGLIFY TASK
// gulp uglify
// this task will source js files from the ./js folder.
// then minify and rename them to scripts.min.css.
// then piped to the ./dist folder.
gulp.task('uglify', function () {
 // return gulp.src(['./js/template.js', './js/one.js', './js/two.js'])
  return gulp.src(['./js/template.js'])
  
  .pipe(P.uglify())
  //.pipe(P.rename('scripts.min.js'))
  //.pipe(gulp.dest('dist/js'));
  .pipe(P.concat('scripts.min.js'))
  .pipe(gulp.dest('./js'))
  // to browserSync
  .pipe(browserSync.reload({
    stream: true
  }));
});

// IMAGE TASK
// gulp image
// we source our images from the root image folder
// we use gulp-imagemin and the gulp-cache plugin to not repeat optimizing unless needed.
// progressive for jpeg, interlaced for gif. 
// readmore at https://www.npmjs.com/package/gulp-imagemin
gulp.task('image', function() {
  return gulp.src('../../images/**/*.+(png|jpg|gif|svg)')
  .pipe(P.cache(P.imagemin({
    //jpeg
      progressive:true,
    //gif
      interlaced:true
  })))
  .pipe(gulp.dest('dist/root/images'));
});

// IMAGE:TMP TASK
// gulp image:tmp
// we source our images from the template image folder
// we use gulp-imagemin and the gulp-cache plugin to not repeat optimizing unless needed.
// progressive for jpeg, interlaced for gif. 
// readmore at https://www.npmjs.com/package/gulp-imagemin
gulp.task('image:tmp', function() {
  return gulp.src('./images/**/*.+(png|jpg|gif|svg)')
  .pipe(P.cache(P.imagemin({
    //jpeg
      progressive:true,
    //gif
      interlaced:true
  })))
  .pipe(gulp.dest('dist/images'));
});

// FONTS TASK
// gulp fonts
// no optimizing is needed
// we only need to move fonts to ./dist/fonts folder
gulp.task('fonts', function() {
  return gulp.src('./fonts/**/*')
  .pipe(gulp.dest('dist/fonts'));
});

// CLEAN ALL TASK
// gulp clean:all
// remove all files in dist
gulp.task('clean:all', function(callback){
  del('dist');
  return P.cache.clearAll(callback);
});

// CLEAN TASK
// gulp clean
// this task prevents removing our images when running gulp clean
// the second glob will clean everything in dist but the images or root/images directory
// and the third glob will leave the files inside the images directory
// essentially cleaning the entire dist directory but the images.
gulp.task('clean', function(callback){
  del(['dist/**/*', '!dist/images', '!dist/root', '!dist/images/**/*', '!dist/root/**/*'], callback);
});


// BROWSER SYNC TASK
// gulp browserSync
// Either proxy setting worked for the Joomla-Tools Vagrant Box
// Note I added these lines below in the Vagrantfile to expose the ports for Browsersync
// config.vm.network "forwarded_port", guest: 3000, host: 3000
// config.vm.network "forwarded_port", guest: 3001, host: 3001
//  
// Enable public network 
// config.vm.network "public_network"
// 
// run ifconfig inside vagrant box to see the appropriate address available to connect via the network from external device. 
gulp.task('browserSync', function() {
  browserSync({

          //proxy: "joomla.box/mysite/"
          proxy: "33.33.33.58:80"
          // View browser sync at - http://33.33.33.58:3000/mysite/
          // View browsersync control at http://localhost:3001/
  });
});

// WATCH TASK
// gulp watch
// This will load browserfy and run the less task.
// wait for the less task to complete then reload.
// then run the min task.
gulp.task('watch', ['browserSync'], function(){
  var watchLess = gulp.watch(['./less/*.less', '../../media/jui/less/*.less'], ['min']);
  watchLess.on('change', function (event) {
    console.log('Event type: ' + event.type); // added, changed, or deleted
    console.log('Event path: ' + event.path); // The path of the modified file
  });
  var watchHtml = gulp.watch(['*.php', './html/**/*.php'], browserSync.reload);
  watchHtml.on('change', function (event) {
   console.log('Event type: ' + event.type); // added, changed, or deleted
   console.log('Event path: ' + event.path); // The path of the modified file
  });
  var watchJS = gulp.watch(['./js/template.js'], ['uglify']);
  watchJS.on('change', function (event) {
   console.log('Event type: ' + event.type); // added, changed, or deleted
   console.log('Event path: ' + event.path); // The path of the modified file
  });

});



// BUILD TASK
// gulp build
gulp.task('build', function (callback) {
    runSequence(['clean', 'min', 'uglify', 'image', 'image:tmp', 'fonts'],
    callback);
});

// DEFAULT TASK
// gulp
// for development. 
gulp.task('default', function (callback) {
      runSequence(['less', 'watch'],
    callback);
});



