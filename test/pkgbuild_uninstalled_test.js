'use strict';

var grunt = require('grunt');
var child_process = require('child_process');
var _ = require('lodash');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

module.exports = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  uninstalled: function(test) {
      var files = _.filter(grunt.config("pkgbuild.my_build.files"), function(f) {
        return !!f.pkgname || !!f.scripts;
      });
      //test package receipts
      var receipts = grunt.config("receipts");
      test.expect(files.length);
      files.forEach(function(f) {
        var file = f.component || f.root;
        var res = new Buffer("");
        var identifier = f.identifier;
        if(!identifier && !!file) {
            identifier =!!f.component ? receipts["component"] : receipts["root"];
        }
        if(!!identifier) {
            try {
                res = child_process.execSync("pkgutil --pkgs / | grep " + identifier);
            } catch(err) {
                //console.log(err.message);
            }
            test.equal(res.toString().trim(), "", "the package " + identifier + " should not be installed");
        }
      });
      
      test.done();
  }
};
