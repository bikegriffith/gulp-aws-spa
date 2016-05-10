# gulp-aws-spa
gulp utilities for deploying a single page application to Amazon Web Services

## Why?
Because I got sick of having the same boilerplate for deployment in every static web app that I deployed to S3/CloudFront.  If you deploy your static web assets to S3/CloudFront, you might be interested in this too.  Send an issue if something doesn't make sense or if you think another related feature might be useful.

## Usage

```
npm install --save-dev gulp-aws-spa
```

Then make sure you have the proper config files (examples provided):

* `aws-credentials.js` ([example](example-aws-credentials.js))
* `deploy-config.js` ([example](example-deploy-config.js))
* `slack-config.js` ([example](example-slack-config.js))

Then require and register this script, which adds a few useful gulp tasks:

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
      preDeploy: ['clean', 'build'],
      postDeploy: []
    }
  }
});
```

Finally, deploy your code!

```
gulp deploy --env=dev
```

## Credits
Mad props to gulp, gulp-awspublish, gulp-invalidate-cloudfront, and gulp-slack.

## License
MIT
