var path        = require('path');
var child       = require('child_process');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');

var gulp        = require('gulp');
var sass        = require('gulp-sass');
var gutil       = require('gulp-util');
var concat      = require('gulp-concat');
var rename      = require('gulp-rename');
var uglify      = require('gulp-uglify');
var htmlmin     = require('gulp-htmlmin');
var cleanCSS    = require('gulp-clean-css');
var browserify  = require('gulp-browserify');
var prefix      = require('gulp-autoprefixer');

//
// Source and distribute folders paths
//
var srcDir      = 'src/';
var srcStyle    = srcDir + '_scss/';
var srcScripts  = srcDir + '_js/';

var distDir     = 'dist/';
var distStyle   = distDir + 'css/';
var distScripts = distDir + 'js/';

//
// Main source files
//
var styleMain   = 'main.scss';
var scriptMain  = 'main.js';


gulp.task('jekyll', (done) => {
    let productionEnv = process.env;
    productionEnv.JEKYLL_ENV = 'production';

    const jekyll = child.spawn('jekyll' , ['build'], { env: productionEnv });

    const jekyllLogger = (buffer) => {
        buffer.toString()
            .split(/\n/)
            .forEach((message) => gutil.log('Jekyll: ' + message));
    };

    jekyll.stdout.on('data', jekyllLogger);
    jekyll.stderr.on('data', jekyllLogger);
    jekyll.on('close', done);

    return jekyll;
});

gulp.task('jekyll-rebuild', ['build'], () => {
    browserSync.reload();
});

gulp.task('styles', () => {
    return gulp.src(srcStyle + styleMain)
        .pipe(sass({
            style: 'compressed',
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(cleanCSS())
        .pipe(browserSync.reload({stream: true}))
        .pipe(gulp.dest(distStyle))
        .on('error', gutil.log);
});

gulp.task('scripts', () => {
    function createErrorHandler(name) {
        return function (err) {
          console.error('Error from ' + name + ' in compress task', err.toString());
        };
    }

    return gulp.src(path.join(srcScripts, scriptMain))
        .pipe(browserify({
            insertGlobals : true,
        }))
        .on('error', createErrorHandler('gulp.src'))
        .pipe(concat('main.js'))
        .on('error', createErrorHandler('gulp.src'))
        .pipe(gulp.dest(distScripts))
        .on('error', createErrorHandler('gulp.src'))
        .pipe(rename('main.min.js'))
        .on('error', createErrorHandler('gulp.src'))
        .pipe(uglify())
        .on('error', createErrorHandler('gulp.src'))
        .pipe(browserSync.reload({stream: true}))
        .pipe(gulp.dest(distScripts))
        .on('error', gutil.log);
});

gulp.task('html', () => {
    return gulp.src([
            path.join(distDir, '*.html'),
            path.join(distDir, '*/*.html')
        ])
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(distDir))
        .pipe(browserSync.reload({stream:true, once: true}))
        .on('error', gutil.log);
});

gulp.task('browser-sync', () => {
    browserSync({
        open: false,
        logFileChanges: true,
        server: {
            baseDir: './' + distDir
        }
    });
});

gulp.task('watch', () => {
    gulp.watch([
        path.join(srcStyle, '*.scss'),
        path.join(srcStyle, '*/*.scss'),
    ], ['styles']);
    gulp.watch([
        path.join(srcScripts, '*.js'),
    ], ['scripts']);
    gulp.watch([
        path.join(srcDir, '*.html'),
        path.join(srcDir, '_layouts/*.html'),
        path.join(srcDir, '_includes/*'),
    ], ['jekyll-rebuild']);
    gulp.watch([
        path.join(distDir, '*.html'),
        path.join(distDir, '*/*.html'),
    ], ['html']);
});

gulp.task('build', () => {
    runSequence('jekyll', ['styles', 'scripts', 'html']);
});

gulp.task('default', ['build', 'browser-sync', 'watch']);
