/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, node:true */
"use strict";

// dependencies
var gulp = require('gulp'),
    bump = require('gulp-bump'),
    header = require('gulp-header'),
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
    },
    banner = ['/**',
              ' * <%= pkg.name %> - <%= pkg.description %>',
              ' * @version v<%= pkg.version %>',
              ' * @link <%= pkg.homepage %>',
              ' * @license <%= pkg.license %>',
              ' */',
              ''].join('\n');

// Minify, concatenate and do all the magic with JS files
gulp.task('scripts', function() {
    var pkg = require('./package.json');

    // minified
    gulp.src(paths.scripts)
        .pipe(uglify())
        .pipe(concat(paths.distFile))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest(paths.dest));

    // unminified
    gulp.src(paths.scripts)
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest(paths.dest));
});

// Update JSDoc files
gulp.task('jsdoc', function() {
    gulp.src(paths.scripts.concat(['README.md']))
        .pipe(jsdoc(paths.docs, {
            path    : 'ink-docstrap',
            theme   : 'spacelab',
            linenums: true
        }, {
            // infos
            plugins: ['plugins/markdown']
        }, {
            // options
            "private"  : true,
            cleverLinks: true
        }));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts', 'jsdoc']);
});

// run QUnit tests
gulp.task('run-tests', ['serve'], function() {
    return gulp.src('./test/public/index.html')
        .pipe(qunit());
});

// start the local server (files + mock API) for tests
gulp.task('serve', function() {
    test_server.start();
});

// start local server, run tests, stop local server
gulp.task('test', ['serve', 'run-tests'], function() {
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
    var process = gulp.src(paths.versionToBump); // get all the files to bump version in
    if (cake_mustnt_be_a_lie === true) {
        /* never ever do a big release without proper celebration, it's a company policy */
        process.pipe(prompt.confirm('Has cake been served to celebrate the release?'));
    }
    process.pipe(bump({type: importance})) // bump the version number in those files
        .pipe(gulp.dest(paths.dest));  // save it back to filesystem
}

gulp.task('patch', function() { return inc('patch'); });
gulp.task('feature', function() { return inc('minor'); });
gulp.task('release', function() { return inc('major', true); });

gulp.task('tag', function() {
    return gulp.src(paths.versionToCheck) // read only one file to get the version number
        .pipe(prompt.confirm('Have you commited all the changes to be included by this version?'))
        .pipe(tag_version()); // tag it in the repository
});

// by default: build, test, update docs, watch
// run 'once' to not watch :)
gulp.task('default', ['once', 'watch' ]);
gulp.task('once', ['scripts', 'test', 'jsdoc' ]);