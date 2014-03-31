/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, node:true */
"use strict";

// dependencies
var gulp = require('gulp'),
    test_server = require('./test/server.js'),
// coffee = require('gulp-coffee'), // onomatopeic
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    jsdoc = require('gulp-jsdoc'),
    qunit = require('gulp-qunit');

// config
var paths = {
    scripts: ['src/*.js'],
    dest   : 'build/lib',
    docs   : 'build/docs',
    dist   : 'sndapi.min.js'
};

gulp.task('scripts', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    gulp.src(paths.scripts)
        //.pipe(coffee())
        .pipe(uglify())
        .pipe(concat(paths.dist))
        .pipe(gulp.dest(paths.dest));
    gulp.src(paths.scripts)
        .pipe(jsdoc(paths.docs, {
            path : 'ink-docstrap',
            theme: 'cerulean'
        }));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('serve', function() {
    test_server.start();
});

gulp.task('unserve', /*['serve', 'test'],*/ function() {
    test_server.stop();
});

gulp.task('test', /*['serve'],*/ function() {
    return gulp.src('./test/public/index.html')
        .pipe(qunit());
});


gulp.task('test2', function() {
    gulp.src('http://localhost:8081/index.html')
        .pipe(qunit());
});

gulp.task('default', ['once', 'watch' ]);
gulp.task('once', ['scripts', /*'serve',*/ 'test'/*, 'unserve'*/ ]);