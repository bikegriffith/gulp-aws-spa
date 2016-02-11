'use strict';

// sample gulp file showing how one might use this utility along side your
// own clean/build/test gulp tasks.

var gulp = require('gulp');
var clean = require('gulp-clean');
var awsSpa = require(/*'gulp-aws-spa'*/ './index.js');

// example clean/build steps
gulp.task("clean", () => {
  return gulp.src('./dist', {read: false}).pipe(clean());
});
gulp.task("build", () => {
  return gulp.src('index.js').pipe(gulp.dest('./dist/index.js'));
});

// wire up the rest
awsSpa.register(gulp, {
  awsCredentials: require('./example-aws-credentials.js'),
  deployConfig: require('./example-deploy-config.js'),
  gulpTasks: {
    pushToS3: true,
    invalidateCloudfront: true,
    deploy: {
      src: './dist/index.js',
      preDeploy: ['clean', 'build']
    }
  }
});

