let plumber = require('gulp-plumber'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	csso = require('gulp-csso'),
	sourcemaps = require('gulp-sourcemaps'),
	rename = require('gulp-rename'),
	stylesPATH = {
		"input": "./dev/static/styles/",
		"ouput": "./build/static/css/"
	};

module.exports = function () {
	$.gulp.task('styles:dev', () => {
		return $.gulp.src(stylesPATH.input + 'styles.sass')
			.pipe(plumber())
			.pipe(sourcemaps.init())
			.pipe(sass())
			.pipe(autoprefixer({
				overrideBrowserslist: ['last 15 version']
			}))
			.pipe(sourcemaps.write())
			.pipe(rename('styles.min.css'))
			.pipe($.gulp.dest(stylesPATH.ouput))
			.on('end', $.browserSync.reload);
	});
	$.gulp.task('styles:build', () => {
		return $.gulp.src(stylesPATH.input + 'styles.sass')
			.pipe(sass())
			.pipe(autoprefixer({
				overrideBrowserslist: ['last 15 version']
			}))
			.pipe($.gulp.dest(stylesPATH.ouput))
	});
	$.gulp.task('styles:build-min', () => {
		return $.gulp.src(stylesPATH.input + 'styles.sass')
			.pipe(sass())
			.pipe(autoprefixer({
				overrideBrowserslist: ['last 15 version']
			}))
			.pipe(csso({
				restructure: false,
				sourceMap: false,
				debug: false
			}))
			.pipe(rename('styles.min.css'))
			.pipe($.gulp.dest(stylesPATH.ouput))
	});
};