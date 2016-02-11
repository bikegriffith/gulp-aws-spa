// this is an example deployment config that supports some extra requirements
//   1. allow `--env=[dev|prod]` flag from command line to support variable deployment target
//   2. dev has no caching and is served straight from S3
//   3. prod is served via CloudFront with long-lived cache control headers
//
// you could dumb it down by just exporting the config dict with `src` and `bucket` keys

var yargs = require('yargs');

var config = {
  src: './dist/**/*'
};

switch (yargs.argv.env || 'dev') {
case 'dev':
  config.bucket = 'dev-www.example.com';
  config.subdirectory = '';
  config.headers = {
    'Cache-Control': 'no-store'
  };
  break;
case 'prod':
  config.bucket = 'www.example.com';
  config.subdirectory = '';
  config.cloudfrontDist = 'ABCD1234';
  config.cloudfrontItems = [
    '/index.html'
  ];
  config.headers = {
    'Cache-Control': 'max-age=86400, no-transform, public'
  };
  break;
default:
  throw 'Invalid environment selection: ' + argv.env;
}

module.exports = config;

