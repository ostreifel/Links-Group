const path = require("path");
const gulp = require('gulp');
const yargs = require("yargs");
const {execSync} = require('child_process');
const dartSass = require('gulp-dart-sass');
const tslint = require('gulp-tslint');
const del = require("del");
const inlinesource = require('gulp-inline-source');

const distFolder = 'dist';

gulp.task('clean', gulp.series(() => {
    return del([distFolder, '*.vsix']);
}));
gulp.task('tslint', gulp.series(() => {
    return gulp.src(["scripts/**/*ts", "scripts/**/*tsx"])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
}));
gulp.task('styles', gulp.series(() => {
    return gulp.src("styles/**/*scss")
        .pipe(dartSass.sync().on('error', dartSass.logError))
        .pipe(gulp.dest(distFolder));
}));
gulp.task('webpack', gulp.series(async () => {
    const option = yargs.argv.release ? '--mode=production' : '--mode=development';
    execSync(`npx webpack ${option}`, {
        stdio: [null, process.stdout, process.stderr]
    });
}));
gulp.task('copy', gulp.series(() => {
    return gulp.src('node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js')
        .pipe(gulp.dest(distFolder));
}));
gulp.task('html', gulp.series(gulp.parallel('copy', 'styles'), () => {
    return gulp.src("*.html")
        .pipe(inlinesource())
        .pipe(gulp.dest(distFolder));
}));
gulp.task('build', gulp.parallel('html', 'webpack', 'tslint'));
gulp.task('package', gulp.series('clean', 'build', async () => {
    const overrides = {}
    if (yargs.argv.release) {
        overrides.public = true;
    } else {
        const manifest = require('./vss-extension.json');
        overrides.name = manifest.name + ": Development Edition";
        overrides.id = manifest.id + "-dev";
    }
    const overridesArg = `--override "${JSON.stringify(overrides).replace(/"/g, '\\"')}"`;
    const manifestsArg = `--manifests vss-extension.json`;

    execSync(`tfx extension create ${overridesArg} ${manifestsArg} --rev-version`,
        (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }

            console.log(stdout);
            console.log(stderr);
            
        });

}));

gulp.task('default', gulp.series('package'));
