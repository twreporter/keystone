var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');

/**
 * Prepare public assets
 */
gulp.task('copy-fontawesome', function () {
	// copy fontawesome's webfont file into the public folder
	gulp.src('node_modules/font-awesome/fonts/fontawesome-*')
		.pipe(gulp.dest('admin/public/fonts'));
});

/**
 * Prepare public assets
 */
gulp.task('copy-css', function () {
	// copy @twreporter/react-article-components css into the public folder
	gulp.src('node_modules/@twreporter/react-article-components/dist/styles/main.css')
		.pipe(gulp.dest('admin/public/styles/@twreporter/react-article-components'));

	gulp.src('node_modules/font-awesome/less/*.less')
		.pipe(gulp.dest('admin/public/styles/font-awesome'));
});


/**
 * Build Tasks
 */

gulp.task('build-packages', function () {
	gulp.start('copy-fontawesome');
	gulp.start('copy-css');

	var packages = require('./admin/client/packages');
	var b = browserify();
	packages.forEach(function (i) { b.require(i); });
	b = b.bundle().pipe(source('packages.js'));
	if (process.env.NODE_ENV === 'production') {
		b.pipe(streamify(uglify()));
	}
	return b.pipe(gulp.dest('./admin/public/js'));
});
