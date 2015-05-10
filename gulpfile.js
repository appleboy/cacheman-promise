'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var mocha = require('gulp-mocha');


gulp.task('coverage', ['clean'], function(){
  return gulp.src('lib/index.js')
    .pipe($.istanbul())
    .pipe($.istanbul.hookRequire());
});

gulp.task('jshint', function () {
  return gulp.src(['lib/index.js'])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-reporter-jscs'))
    .pipe($.jshint.reporter('fail'));
});

function mochaStream(){
  return gulp.src('test/index.js')
    .pipe($.mocha({
      reporter: 'spec'
    }));
}

gulp.task('mocha', ['coverage'], function () {
  return mochaStream()
    .pipe($.istanbul.writeReports());
});

gulp.task('mocha:nocov', function(){
  return mochaStream();
});

gulp.task('clean', del.bind(null, ['coverage/**/*']));

gulp.task('default', ['mocha', 'jshint']);
