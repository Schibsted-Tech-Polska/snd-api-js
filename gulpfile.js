/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, node:true */
"use strict";

// dependencies
var gulp = require('gulp'),
    util = require('gulp-util'),
    bump = require('gulp-bump'),
    filter = require('gulp-filter'),
    test_server = require('./test/server.js'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    jsdoc = require('gulp-jsdoc'),
    prompt = require('gulp-prompt'),
    tag_version = require('gulp-tag-version'),
    qunit = require('gulp-qunit');

// config
var paths = {
    scripts       : ['src/*.js'],
    versionToBump : ['./package.json', './bower.json'],
    versionToCheck: './package.json',
    dest          : './',
    docs          : './docs',
    distFile      : 'sndapi.min.js'
};

// Minify, concatenate and do all the magic with JS files
gulp.task('scripts', function() {
    gulp.src(paths.scripts)
        .pipe(uglify())
        .pipe(concat(paths.distFile))
        .pipe(gulp.dest(paths.dest));
});

// Update JSDoc files
gulp.task('jsdoc', function() {
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

// run QUnit tests
gulp.task('test', ['serve'], function() {
    return gulp.src('./test/public/index.html')
        .pipe(qunit());
});

// start the local server (files + mock API) for tests
gulp.task('serve', function() {
    test_server.start();
});

// stop the local server (files + mock API) for tests
gulp.task('unserve', ['serve', 'test'], function() {
    test_server.stop();
});

/**
 * Bumping version number.
 * Please read http://semver.org/
 *
 * You can use the commands
 *
 *     gulp patch     # makes 0.1.0 → 0.1.1
 *     gulp feature   # makes 0.1.1 → 0.2.0
 *     gulp release   # makes 0.2.1 → 1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */

function inc(importance, cake_mustnt_be_a_lie) {
    var process = gulp.src(paths.versionToBump);
    if (cake_mustnt_be_a_lie === true) {
        /* never ever do a big release without proper celebration, it's a company Hoshin thing */
        process.pipe(prompt.confirm('Has cake been served to celebrate the release?'));
    }
    process.pipe(bump({type: importance}))
        .pipe(gulp.dest('./'))
        .pipe(filter('package.json'))
        .pipe(tag_version());
}

gulp.task('patch', function() { return inc('patch'); });
gulp.task('feature', function() { return inc('minor'); });
gulp.task('release', function() { return inc('major', true); });

gulp.task('tmp', function(test) {
    console.log('v<% package.version %>');
    util.log('stuff happened', 'Really it did', util.colors.cyan('123'));
    console.log(test);
});

// by default: build, test, update docs, watch
// run 'once' to not watch :)
gulp.task('default', ['once', 'watch' ]);
gulp.task('once', ['scripts', 'serve', 'test', 'unserve', 'jsdoc' ]);