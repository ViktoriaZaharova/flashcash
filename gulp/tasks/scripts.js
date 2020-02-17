let uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	babel = require('gulp-babel'),
	scriptsPATH = {
		"input": "./dev/static/js/",
		"ouput": "./build/static/js/"
	};

module.exports = function () {
	$.gulp.task('js:dev', () => {
		return $.gulp.src(scriptsPATH.input + '*.js')
			.pipe(babel({
				presets: ['@babel/env']
			}))
			.pipe(concat('main.min.js'))
			.pipe($.gulp.dest(scriptsPATH.ouput))
			.pipe($.browserSync.reload({
				stream: true
			})),
			$.gulp.src(scriptsPATH.input + '/libs/*/*')
			.pipe($.gulp.dest(scriptsPATH.ouput + 'libs/'));
	});

	$.gulp.task('js:build', () => {
		return $.gulp.src(scriptsPATH.input + '*.js')
			.pipe(babel({
				presets: ['@babel/env']
			}))
			.pipe(concat('main.min.js'))
			.pipe($.gulp.dest(scriptsPATH.ouput));
	});

	$.gulp.task('js:build-min', () => {
		return $.gulp.src(scriptsPATH.input + '*.js')
			.pipe(babel({
				presets: ['@babel/env']
			}))
			.pipe(concat('main.min.js'))
			.pipe(uglify())
			.pipe($.gulp.dest(scriptsPATH.ouput)),
			$.gulp.src(scriptsPATH.input + '/libs/*/*')
			.pipe($.gulp.dest(scriptsPATH.ouput + 'libs/'));;
	});
};