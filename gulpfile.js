/**
 * @Author: Reinier Millo Sánchez <millo>
 * @Date:   2020-04-12T20:17:40-05:00
 * @Email:  reinier.millo88@gmail.com
 * @Project: IKOABO Auth Microservice API
 * @Filename: gulpfile.js
 * @Last modified by:   millo
 * @Last modified time: 2020-04-12T21:24:10-05:00
 * @Copyright: Copyright 2020 IKOA Business Opportunity
 */

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const pump = require('pump');
const javascriptObfuscator = require('gulp-javascript-obfuscator');
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

gulp.task('release', function(cb) {
    pump([
        tsProject.src()
            .pipe(tsProject())
            .js.pipe(gulp.dest("lib")),
        gulp.src('lib/**/*.js'),
        javascriptObfuscator(),
        gulp.dest('lib-obf')
    ], cb);
});
