var browserify = require('browserify');
var test = require('tap').test;
var fs = require('fs');

var gasify = require('../');

test('bundle-gasify', function(t) {

  var expected = fs.readFileSync(__dirname + '/fixtures/expected.js', {encoding: 'utf8'});
  browserify(__dirname + '/fixtures/main.js')
    .plugin(gasify, { comment: true })
    .bundle(function(err, buf) {
      t.error(err, 'build failed');
      t.ok(buf);
      t.equal(buf.toString(), expected.toString(), 'plugin and expected output match');
      t.end();
    });
});
