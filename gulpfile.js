var gulp = require('gulp'),
// coffee = require('gulp-coffee'), // onomatopeic
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    qunit = require('gulp-qunit');

var paths = {
    scripts: ['src/*.js'],
    dest   : 'build',
    dist   : 'sndapi.min.js'
};

gulp.task('scripts', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    return gulp.src(paths.scripts)
        //.pipe(coffee())
        .pipe(uglify())
        .pipe(concat(paths.dist))
        .pipe(gulp.dest(paths.dest));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('test', function() {
    return gulp.src('./test/public/index.html')
        .pipe(qunit());
});

gulp.task('test2', function() {
    return gulp.src('http://localhost:8081/index.html')
        .pipe(qunit());
});

gulp.task('default', ['scripts', 'watch' ]);