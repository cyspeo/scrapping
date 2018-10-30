
const gulp = require('gulp');


var
 // LESS
less = require('gulp-less'),                // Compile LESS to CSS
csslint = require('gulp-csslint'),          // Linting LESS
minifyCSS = require('gulp-minify-css'),     // Minify CSS
// Divers
concat = require('gulp-concat'),            // Merging
del = require('del'),                       // Deleting
templateCache = require('gulp-angular-templatecache'), // concat AngularJs templates in the $templateCcache
connect = require('gulp-connect'), // server web
replace = require('gulp-replace'); // A string replace plugin for gulp

var lessPath = 'styles';
var packagePath = 'server/public';
/**
* less => css
*/
gulp.task('less', function () {
    return gulp.src(['client/**/*.less'])
      .pipe(less())
        .on('error', function (err) {
            console.log(err);
        })
      .pipe(concat('monturf.css'))
      .pipe(gulp.dest(packagePath));

});

gulp.task('del:template', function (cb) {
    del([packagePath + '/app-templates.js'], cb);
})
/**
 * Créé un fichier app-template.js contenant tous les partials html (templates et vues)
 * Dépose le fichier dans /dist
 */
gulp.task('templateCache',['del:template'],  function (callback) {
    return gulp.src(['client/js/**/*.html'])
        .pipe(templateCache('app-templates.js', { module: 'myApp' }))
        .pipe(gulp.dest(packagePath ));
});

/**
* concet JS files into one js
*/
gulp.task('concat-js',["templateCache"], function () {
  gulp.src(['client/js/**/*.js'])
    .pipe(concat('monturf.js'))  // Merge to 1 file
    .pipe(gulp.dest(packagePath));
});




/**
* Copye les fichiers sur dist.
**/
gulp.task('copy-client', function () {

    gulp.src(['client/index.html'])
    .pipe(gulp.dest(packagePath + '/'));
    gulp.src(['client/bootstrap-material-design/*.*'])
    .pipe(gulp.dest(packagePath + '/bootstrap-material-design/'));
    gulp.src(['client/vendor/**.*'])
    .pipe(gulp.dest(packagePath + '/vendor/'));
        
});

/**
 * Nettoie le répertoire /dist
 */
gulp.task('clean', function (callback) {
  /*
  del([packagePath+'fonts/*.*']).then(function (paths) {
    console.log('Deleted files/folders:\n', paths.join('\n'));
  });*/
  del(packagePath, callback);
});


gulp.task('connect', function () {
    connect.server({
        root: 'dist',
        livereload: true,
        port: '8081'
    });

});

/**
* Build global du client
* Lancement des taches en parallele
*/
gulp.task('build',['clean'],function() {
  gulp.start(['copy-client', 'concat-js', 'less']);
})





gulp.task('watch', function () {
    gulp.watch(['client/js/**/*.js'], ['concat-js']);
    gulp.watch(['client/js/**/*.html'], ['templateCache']);
    gulp.watch(['client/**/*.less'], ['less']);
    gulp.watch(['client/index.html'], ['build']);
});



gulp.task('default', ['watch']);
