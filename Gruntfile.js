/*
 * grunt-macpackage
 * https://github.com/tmoskun/grunt-macpackage
 *
 * Copyright (c) 2015 tmoskun
 * Licensed under the MIT license.
 */


'use strict';
var _ = require('lodash');

module.exports = function(grunt) {
		
  //var date = grunt.template.today('mmmm-dd-yyyy-h-MM-TT');
  //var identifier_prefix = "com.Calaverastech."+date+".";
  //var identifier_prefix = "com.calaverastech.Test.";
	
  // Project configuration.
  grunt.initConfig({
    date: grunt.template.today('mmmm-dd-yyyy-h-MM-TT'),
    identifier_prefix: "com.calaverastech.Test",
    name_prefix: "GruntPkgbuildTest",
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['packages/*'],
      apps: ["comp/**/*", "root/**/*"]
    },
    receipts: {
        root: "<%= identifier_prefix %>.root.app.pkg",
        component: "<%= identifier_prefix %>.comp.app.pkg",
        preflight: "<%= identifier_prefix %>.preflight.pkg",
        postflight: "<%= identifier_prefix %>.postflight.pkg"
    },
    // Configuration to be run (and then tested).
    pkgbuild: {
        my_build: {
            options: {
                    dest: "packages"
            },
            files: [
                    {root: "root", analyze: true, plist: "Info.plist", plistoptions: {"BundleIsRelocatable": false}},
                    {root: "root", plist: "packages/Info.plist", location: "/tmp", version: "1.0", identifier: "<%= receipts.root %>", pkgname: "<%= name_prefix %>-fromRoot-<%= date %>"},
                    {component: ["comp/<%= name_prefix %>Comp.app"], location: "/tmp", pkgname: "<%= name_prefix %>-fromComp-<%= date %>"},
                    {scripts: "scripts/preflight", pkgname: "<%= name_prefix %>-preflight-<%= date %>", identifier: "<%= receipts.preflight %>"},
                    {scripts: "scripts/postflight", pkgname: "<%= name_prefix %>-postflight-<%= date %>", identifier: "<%= receipts.postflight %>"},
            ]
      }
      //default_options: {
      //  options: {
      //  },
      //  files: {
      //    
      //    'tmp/default_options': ['test/fixtures/testing', 'test/fixtures/123']
      //  }
      //},
      //custom_options: {
        //options: {
          //separator: ': ',
          //punctuation: ' !!!'
        //},
        //files: {
          //'tmp/custom_options': ['test/fixtures/testing', 'test/fixtures/123']
        //}
      //}
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    },
    exec: {
		createMacApp: {
			cmd: function(dir, identifier, script, appname) {
    			return 'mkdir -p ' + dir + ' && /usr/local/bin/platypus -A -y -o "None" -V 1.0 -u "CalaverasTech.com" -I ' + identifier + ' ' + script + ' ' + dir + '/' + appname + '.app';
    		},
	        //return 'mkdir -p app && /usr/local/bin/platypus -A -y -o "None" -i ' + cwd + '/icons/snmpsniffer.icns -V ' + version + ' -u "CalaverasTech.com" -I com.calaverastech.Snmpsniffer -f ' + cwd + '/bin/mac/snmpsniffer-run.sh ' + comm + " " + app;
	        //return 'mkdir -p app && /usr/local/bin/platypus -A -y -o "None" -i ' + cwd + '/icons/snmpsniffer.icns -V ' + version + ' -u "CalaverasTech.com" -I com.calaverastech.Snmpsniffer ' + comm + " " + app;
			stdout: true
		},
        removeScriptResults: {
            cmd: function(name, passw) {
                return "echo " + passw + " | sudo -S rm -f /tmp/"+name;
            },
            stdout: true
        },
        removeFiles: {
            cmd: function(file, loc, passw) {
                return "cd " + loc + " && echo " + passw + " | sudo -S rm -rf " + file;
            },
            stdout: true
        },
		installPkg: {
			cmd: function(cwd, pkg, passw) {
                   console.log("echo " + passw + " | sudo -S installer -pkg " + cwd + "/" + pkg + " -target /");
                   return "echo " + passw + " | sudo -S installer -pkg " + cwd + "/" + pkg + " -target /";
			},
			stdout: true
		},
		uninstallPkg: {
			cmd: function(identifier, passw, location) {
				//return 'echo ' + passw + ' | sudo -S sh -c "$(' + comm + ' pkgutil --forget ' +identifier + ')"';
                return 'echo ' + passw + ' | sudo -S pkgutil --forget ' +identifier;
			},
			stdout: true
		}
		
		
    },
    chmod: {
    	src: "scripts/**/*",
        options: {
            mode: "755"
        }
    }
    
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-chmod');
    
  grunt.registerTask("cleanFiles", function(passw) {
      grunt.task.run(["clean", "exec:removeScriptResults:"+grunt.config("name_prefix")+"Script.txt:"+passw]);
      var files = grunt.config("pkgbuild.my_build.files");
      var filenames = [];
      files.forEach(function(f) {
        if(!!f.location) {
            grunt.task.run("exec:removeFiles:"+grunt.config("name_prefix")+"*:"+f.location+":"+passw);
         }
      });
  });
  
  grunt.registerTask("createFiles", "Create bundles and files for testing", ["chmod", "exec:createMacApp:root:" + grunt.config("identifier_prefix")+ ".app.pkg" + ":scripts/my_script1:" + grunt.config("name_prefix")+"Root", "exec:createMacApp:comp:" + grunt.config("receipts.component") + ":scripts/my_script2:" + grunt.config("name_prefix") + "Comp"]);
    
  grunt.registerTask("installPackages", "Install all created packages", function(passw) {
	  var dest = grunt.config("pkgbuild.my_build.options.dest") || ".";
      grunt.file.expand({cwd: dest}, "*.pkg").forEach(function(f) {
            grunt.task.run("exec:installPkg:"+dest+":"+f+":"+passw);
      });
  });
  
  grunt.registerTask("uninstallPackages", "Uninstall all created packages", function(passw) {
	  var files = grunt.config("pkgbuild.my_build.files");
      var receipts = grunt.config("receipts");
      var cwd = grunt.config("pkgbuild.my_build.options.cwd") || ".";
      files.forEach(function(f) {
        if(!!f.pkgname && (!!f.component || !!f.root)) {
            var identifier = f.identifier || (!!f.component ? receipts["component"] : receipts["root"]);
            grunt.task.run("exec:uninstallPkg:"+identifier+":"+passw+":"+f.location);
        }
      });
  });
    
  grunt.registerTask("pkgbuildTest", function() {
      var tests = Array.prototype.splice.call(arguments, 0).map(function(test) {
        return 'test/pkgbuild_' + test + "_test.js";
      });
      if(tests.length > 0) {
        grunt.config('nodeunit.tests', tests);
      }
      grunt.task.run("nodeunit");
  });
  
  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['cleanFiles:'+grunt.option("passw"), 'createFiles', 'pkgbuild', 'clean:apps', 'installPackages:'+grunt.option("passw"), 'pkgbuildTest:installed', 'uninstallPackages:'+grunt.option("passw"), 'pkgbuildTest:uninstalled']);
	  
  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
