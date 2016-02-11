'use strict';

// Prerequisites:
//
//    Create your `aws-credentials.js' file (see example)
//    Create a `deploy-config.js' file (see example)
//
// Usage:
//
//    var awsSpa = require('gulp-aws-spa');
//
//    awsSpa.register({
//      awsCredentials: require('./aws-credentials.js'),
//      deployConfig: require('./deploy-config.js'),
//      slackConfig: require('./slack-config.js'),
//      gulpTasks: {
//        slackDeployStarting: true,
//        slackDeployComplete: true,
//        pushToS3: true,
//        invalidateCloudfront: true,
//        deploy: {
//          preDeploy: ['test', 'clean-build', 'build'],
//          postDeploy: []
//        }
//      }
//
//    });

var cloudfront = require('gulp-invalidate-cloudfront');
var clean = require('gulp-clean');
var awspublish = require('gulp-awspublish');
var path = require('path');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');

module.exports = {
  register: (gulp, options) => {
    if (!options) { throw 'options is a required argument'; }
    if (!options.awsCredentials) { throw 'options.awsCredentials is required'; }
    if (!options.deployConfig) { throw 'options.deployConfig is required'; }
    if (!options.gulpTasks) { throw 'options.gulpTasks is required'; }

    const { awsCredentials, deployConfig, slackConfig, gulpTasks } = options;
    runSequence = runSequence.use(gulp);

    // tee up slack config
    var slack;
    if (gulpTasks.slackDeployStarting || gulpTasks.slackDeployComplete) {
      slack = require('gulp-slack')(slackConfig);
    }

    // register gulp tasks...
    var preDeploy = [].concat(gulpTasks.deploy.preDeploy || []);
    var postDeploy = [].concat(gulpTasks.deploy.postDeploy || []);

    if (gulpTasks.slackDeployStarting) {
      gulp.task('slack-deploy-starting', () => {
        return gulp.src('*').pipe(slack(
          `Starting deploy to <${deployConfig.bucket}>...`
        )); //TODO: get current branch/checksum/user
      });
      preDeploy = preDeploy.concat('slack-deploy-starting');
    }

    if (gulpTasks.slackDeployComplete) {
      gulp.task('slack-deploy-complete', () => {
        return gulp.src('*').pipe(slack(
          `Finished deploy to <${deployConfig.bucket}>...`
        )); //TODO: get current branch/checksum/user
      });
      postDeploy = postDeploy.concat('slack-deploy-complete');
    }

    if (gulpTasks.pushToS3) {
      gulp.task('push-to-s3', () => {
        var publisher = awspublish.create({
          region: awsCredentials.region,
          params: { Bucket: deployConfig.bucket }
        });
        return gulp.src(deployConfig.src)
                  .pipe(rename(function (path) {
                    if (deployConfig.subdirectory) {
                      path.dirname = deployConfig.subdirectory + "/" + path.dirname;
                    }
                  }))
                  .pipe(publisher.publish(deployConfig.headers))
                  //.pipe(publisher.cache())
                  .pipe(publisher.sync(deployConfig.subdirectory))
                  .pipe(awspublish.reporter());
      });
      preDeploy = preDeploy.concat('push-to-s3');
    }

    if (gulpTasks.invalidateCloudfront) {
      gulp.task('invalidate-cloudfront', (done) => {
        if (deployConfig.cloudfrontDist) {
          var batch = {
            CallerReference: new Date().toString(),
            Paths: {
              Quantity: 1,
              Items: deployConfig.cloudfrontItems
            }
          };
          var awsSettings = {
            credentials: {
              accessKeyId: awsCredentials.accessKeyId,
              secretAccessKey: awsCredentials.secretAccessKey
            },
            region: awsCredentials.region,
            distributionId: deployConfig.cloudfrontDist
          };
          return gulp.src('*').pipe(cloudfront(batch, awsSettings));
        } else {
          console.log(`CloudFront distribution not configured for ${deployConfig.bucket}`);
          done();
        }
      });
      preDeploy = preDeploy.concat('invalidate-cloudfront');
    }

    // Finally wire up the grand finale
    gulp.task('deploy', (done) => {
      let sequence = preDeploy.concat(postDeploy).concat([done]);
      return runSequence(...sequence);
    });
  }
};
