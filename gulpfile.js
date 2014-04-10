/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, node:true */
"use strict";

// dependencies
var gulp = require('gulp'),
    git = require('gulp-git'),
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
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */

function inc(importance, cake_mustnt_be_a_lie) {
    var process = gulp.src(paths.versionToBump) // get all the files to bump version in
        //.pipe(prompt.confirm('Have you commited all the changes to be included by this version?'));
    if (cake_mustnt_be_a_lie === true) {
        /* never ever do a big release without proper celebration, it's a company policy */
        //process.pipe(prompt.confirm('Has cake been served to celebrate the release?'));
    }
    process.pipe(bump({type: importance})) // bump the version number in those files
        .pipe(gulp.dest(paths.dest))  // save it back to filesystem
        .pipe(git.commit('bumps package version')) // commit the changed version number
        .pipe(filter(paths.versionToCheck)) // read only one file to get the version number
        .pipe(tag_version()); // tag it in the repository
}

gulp.task('patch', function() { return inc('patch'); });
gulp.task('feature', function() { return inc('minor'); });
gulp.task('release', function() { return inc('major', true); });


// by default: build, test, update docs, watch
// run 'once' to not watch :)
gulp.task('default', ['once', 'watch' ]);
gulp.task('once', ['scripts', 'serve', 'test', 'unserve', 'jsdoc' ]);