var gulp = require('gulp');
//var coffee = require('gulp-coffee'); // onomatopeic
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var paths = {
	scripts: ['src/*.js'],
	dest: 'build',
	dist: 'sndapi.min.js'
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


gulp.task('default', ['scripts', 'watch' ]);