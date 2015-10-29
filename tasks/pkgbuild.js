/*
 * grunt-pkgbuild
 * https://github.com/calaverastech/grunt-pkgbuild
 *
 * Copyright (c) 2015 tmoskun
 * Licensed under the MIT license.
 */

'use strict';


function PkgbuildObj(obj) {
    this.root = obj.root;
    this.component = obj.component;
    this.analyze = obj.analyze || false;
    this.scripts = obj.scripts || "";
    this.plist = obj.plist || "";
    this.location = obj.location || "";
    this.identifier = obj.identifier || "";
    this.version = obj.version || "";
    this.plistoptions = obj.plistoptions || {};
    this.pkgname = obj.pkgname || "";
}



module.exports = function(grunt) {
  //var tmp = require("tmp");
  var _ = require('lodash'),
    path = require("path"),
    fs = require("fs"),
    done;
    
  //var pkgcount = 0,
  //    pkgnumber,
  //    callback;
    
  //  function processResult(error, stdout, stderr) {
  //      if(!!error) {
  //          grunt.log.error("ERROR: " + error);
  //      }
  //  }
    
  

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
  
  grunt.config.merge({
	  	exec: {
            mkdir: {
                     cmd: function(dir) {
                        return "mkdir -p " + dir;
                     }
            },
            createScriptPkg: {
                     cmd: function(scripts, pkgname, identifier) {
                        return "pkgbuild --identifier " + ((!!identifier && identifier.length > 0) ? identifier : ("com." + pkgname + ".pkg")) + " --nopayload --scripts " + scripts + " " + pkgname + ".pkg";
                     },
                     stdout: true,
            },
            analyzeMacPkg: {
                     cmd: function (root, plist, scripts) {
                        return "pkgbuild --analyze --root " + root + ((!!scripts && scripts.length > 0) ? (" --scripts " + scripts) : "") + " " + plist;
                     },
                     stdout: true
            },
            createMacPkgFromComponent: {
                     cmd: function(component, pkgname, loc, identifier, scripts) {
                        var comps = component.split(",");
                        var locs = !!loc ? loc.split(",") : [];
                        if(comps.length > 1 && !identifier) {
                            identifier=pkgname+".pkg";
                        }
                        var currentLoc = (locs.length > 0) ? locs[0]:null;
                        var comp_str = _.reduce(comps, function(comm, comp, n) {
                            if(n < (locs.length - 1)) {
                                currentLoc = locs[n];
                            }
                            return comm + " --component " + comp + ((!!currentLoc && currentLoc.length > 0) ? (" --install-location " + currentLoc):"");
                        }, "");
                        return "pkgbuild " + comp_str + ((!!identifier && identifier.length > 0) ? (" --identifier " + identifier) : "") + ((!!scripts && scripts.length > 0) ? (" --scripts " + scripts):"") +  " " + pkgname + ".pkg";
                     },
                     stdout: true
            },
            createMacPkgFromRoot: {
                     cmd: function(root, pkgname, version, loc, identifier, scripts, plist) {
                        return "pkgbuild --root " + root +
                        " --identifier " + ((!!identifier && identifier.length > 0) ? identifier : ("com." + pkgname+".pkg")) +
                        ((!!plist && plist.length > 0) ? (" --component-plist " + plist) : "") +
                        ((!!version && version.length > 0) ? (" --version " + version) : "") +
                        ((!!loc && loc.length > 0) ? (" --install-location " + loc) : "") +
                        ((!!scripts && scripts.length > 0) ? (" --scripts " + scripts) : "") +
                        " " + pkgname + ".pkg";
                     },
                     stdout: true,
            }
        },
        plistbuddy: {
            BundleIsRelocatable: {
                     method: "Set",
                     entry: ":0:BundleIsRelocatable",
                     type: 'bool'
            },
            BundleOverwriteAction: {
                     method: "Set",
                     entry: ":0:BundleOverwriteAction",
                     type: 'string'
            },
            BundlePreInstallScriptPath: {
                     method: "Add",
                     entry: ":0:BundlePreInstallScriptPath",
                     type: 'string'
            },
            BundlePostInstallScriptPath: {
                     method: "Add",
                     entry: ":0:BundlePostInstallScriptPath",
                     type: 'string'
            }
        }
  });
    
    
    var libs = ['grunt-plistbuddy'];
    
    var apppath = process.cwd(),
    dirfiles = [],
    libfiles = [];
    
    process.chdir(__dirname);
    var currpath = process.cwd();
    
    while(currpath !== "/" && libs.length > 0) {
        if(fs.existsSync("node_modules")) {
            dirfiles = grunt.file.expand({cwd: path.join(currpath,"node_modules"), filter:"isDirectory"}, "*" );
            libfiles = _.intersection(dirfiles, libs);
            for(var i = 0; i<libfiles.length; i++) {
                grunt.loadNpmTasks(libfiles[i]);
            }
            libs = _.difference(libs, libfiles);
        }
        currpath = path.join(process.cwd(), "../");
        process.chdir(currpath);
    }
    
    process.chdir(apppath);
    
  grunt.registerMultiTask('pkgbuild', 'Create Mac packages', function() {
	//Check platform
	if(process.platform !== 'darwin') {
		grunt.log.error("This should be run on a Mac computer");
		return false;
	}
	
    // Merge task-specific and/or target-specific options with these defaults.
    //var options = this.options({
    //  analyze: false,
    //  component: false
    //	plist: "Info.plist"
    //});
                          
    //get absolute path
    function abs_path(file, cwd) {
                          
        function get_path(p) {
            var dir = grunt.file.isPathAbsolute(p) ? "" : (cwd || ".");
            return path.join(dir, p);
        }
                          
        if(_.isArray(file)) {
            return _.map(file, function(p) {
                return get_path(p);
            });
        } else {
            return get_path(file);
        }
    }
                          
    function file_exists(file) {
        if (!grunt.file.exists(file)) {
            grunt.log.warn('Source file "' + file + '" not found.');
            return false;
        }
        return true;
    }
                          
    var data = this.data,
        options = this.options({cwd: process.cwd(), dest: process.cwd()}),
        files = this.data.files,
        target = this.target;
                          
    if(!!data.cwd) {
        options.cwd = data.cwd;
    }
    if(data.dest) {
        options.dest = data.dest;
    }
                          
    if(!grunt.file.isPathAbsolute(options.cwd)) {
        options.cwd = path.join(process.cwd(), options.cwd);
    }
                          
    if(!grunt.file.isPathAbsolute(options.dest)) {
        options.dest = path.join(process.cwd(), options.dest);
    }
    
    if(!!options.dest) {
        grunt.task.run("exec:mkdir:"+options.dest);
    }
    
    var keys=_.keys(grunt.config("plistbuddy"));
                          
    //create a callback after all packages are created
    var func = data.callback;
    if(!func || typeof func !== "function") {
        func = function() {
            grunt.log.ok("CREATING PACKAGES FOR " + target + " IS FINISHED");
        };
    }
                          
    done = _.after(files.length, func);
                          
                          
    // Iterate over all specified file groups.
	_.chain(files)
        .filter(function(f, index) {
		  var file = f.root || f.component || f.scripts;
		  if(!file || file.length === 0) {
			  grunt.log.warn("Neither root nor component, nor scripts are specified for the file " + index);
			  return false;
		  }
          file = abs_path(file, options.cwd);
          if(_.isArray(file)) {
                return _.every(file, function(f) {
                    return file_exists(f);
                });
          } else {
             return file_exists(file);
          }
          return true;
      })
      .map(function(f) {
         return new PkgbuildObj(f);
      }).each(function(f) {
		var plist = abs_path((f.plist || (path.basename(f.root) + ".plist")), options.dest),
            opts = _.pick(f.plistoptions, keys);
        var callback;
        
        var set_plist = function(plist, callback) {
            _.each(opts, function(val, o) {
                grunt.config("plistbuddy."+o+".src", plist);
                grunt.config("plistbuddy."+o+".value", val);
                grunt.task.run("plistbuddy:"+o);
            });
            if(!!callback) {
              callback.call();
            }
        };
              
		if(!!f.analyze) {
          grunt.config("exec.analyzeMacPkg.callback", function() {
             set_plist(plist, done);
          });
          grunt.config("exec.analyzeMacPkg.cwd", options.cwd);
              
          grunt.task.run("exec:analyzeMacPkg:"+f.root+":"+plist+":"+f.scripts);
              
		} else {
		  var file = f.root || f.component || f.scripts;
		  if(!f.pkgname) {
			  grunt.log.warn("Missing package name for "+file);
			  return false;
		  } 
		  var pkgname = abs_path(f.pkgname, options.dest);
		  if(!!f.component && f.component.length > 0){
              grunt.config("exec.createMacPkgFromComponent.cwd", options.cwd);
              grunt.config("exec.createMacPkgFromComponent.callback", done);
              grunt.task.run("exec:createMacPkgFromComponent:"+f.component+":"+pkgname+":"+f.location+":"+f.identifier);
		  } else if(!!f.root && f.root.length > 0) {
              callback = function() {
                if(!fs.existsSync(plist)) {
                    grunt.config("exec.analyzeMacPkg.callback", function() {
                        set_plist(plist, done);
                    });
                    grunt.config("exec.analyzeMacPkg.cwd", options.cwd);
                    grunt.task.run("exec:analyzeMacPkg:"+f.root+":"+plist+":"+f.scripts);
                } else {
                    set_plist(plist);
                    done.call();
                }
			  };
            grunt.config("exec.createMacPkgFromRoot.callback", callback);
            grunt.config("exec.createMacPkgFromRoot.cwd", options.cwd);
            grunt.task.run("exec:createMacPkgFromRoot:"+f.root+":"+pkgname+":"+f.version+":"+f.location+":"+f.identifier+":"+f.scripts+":"+plist);
		  } else if(!!f.scripts && f.scripts.length > 0) {
              grunt.config("exec.createScriptPkg.callback", done);
              grunt.config("exec.createScriptPkg.cwd", options.cwd);
              grunt.task.run("exec:createScriptPkg:"+f.scripts+":"+pkgname+":"+f.identifier);
		  } else {
			  grunt.log.warn("Missing paramateres. Can't create package from " + file);
		  }
		}
	}).value();
    
  });

};
