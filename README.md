# gulp-aws-spa
gulp utilities for deploying a single page application to Amazon Web Services

## Usage

```
npm install --save-dev gulp-aws-spa
```

Then require and register this script, which adds a few useful gulp tasks, namely:

* `slack-deploy-starting`
* `push-to-s3`
* `invalidate-cloudfront`
* `slack-deploy-complete`
* `deploy` (which runs the others in sequence)

```
var gulp = require('gulp');
var clean = require('gulp-clean');
var awsSpa = require('gulp-aws-spa');

// example clean/build steps (do your worst here)
gulp.task("clean", () => {
  return gulp.src('./dist', {read: false}).pipe(clean());
});
gulp.task("build", () => {
  return gulp.src('index.js').pipe(gulp.dest('./dist/index.js'));
});

// wire up this utility
awsSpa.register(gulp, {
  awsCredentials: require('./aws-credentials.js'),
  deployConfig: require('./deploy-config.js'),
  slackConfig: require('./slack-config.js'),
  gulpTasks: {
    slackDeployStarting: true,
    slackDeployComplete: true,
    pushToS3: true,
    invalidateCloudfront: true,
    deploy: {
      preDeploy: ['clean', 'build']
      postDeploy: []
    }
  }
});
```

See the source for example config files.

## Credits
Mad props to gulp, gulp-awspublish, gulp-invalidate-cloudfront, and gulp-slack.

## License
MIT
