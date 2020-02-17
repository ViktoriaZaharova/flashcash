let svgmin = require('gulp-svgmin'),
    replace = require('gulp-replace'),
    svgPath = {
        "input": "./dev/static/images/svg/*.svg",
        "output": "./build/static/images/svg/"
    };

module.exports = function () {
    $.gulp.task('svg', () => {
        return $.gulp.src(svgPath.input)
            .pipe(svgmin({
                js2svg: {
                    pretty: true
                }
            }))
            .pipe(replace('&gt;', '>'))
            .pipe($.gulp.dest(svgPath.output));
    });
};