# grunt-pkgbuild

> Create Mac packages

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-pkgbuild --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-pkgbuild');
```

## The "pkgbuild" task

### Overview
In your project's Gruntfile, add a section named `pkgbuild` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  pkgbuild: {
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### General Options

#### options.cwd
Type: `String`

All src matches are relative to (but don't include) this path.

#### options.dest
Type: `String`

Created packages are placed into this directory

### File Options

#### root
Type: `String`

The destination root

#### analyze
Type: `Boolean`

Whether to analyze the destination root instead of creating a package

#### component
Type: `String` or `Array`

The bundle at the path(s) is added to the package. Valid only if you don't use --root

#### plist
Type: `String`

Plist name

#### plistoptions
Type: `Hash`

Options to be edited in plist. Accepted options: BundleIsRelocatable, BundleOverwriteAction, BundlePreInstallScriptPath, BundlePostInstallScriptPath

#### pkgname
Type: `String`

Package name (without the extension ".pkg")

#### identifier
Type: `String`

Package identifier

#### location
Type: `String` or `Array`

Location(s) where the package(components) will be installed

#### version
Type: `String`

Package version

#### scripts
Type: `String`

Directory name with package scripts

### Usage Examples
pkgbuild: {
	my_target: {
		options: {
			dest: "my_packages"
		},
		files: [
			// Analyze the destination root "my_files" and write a component property list into "Info.plist"
			{root: "my_files", analyze: true, plist: "Info.plist"},
			
			// Analyze the destination root "my_files" and write a component property list into "Info-edited.plist" according to new bundle-specific behaviours from "plistoptions"
			{root: "my_files", analyze: true, plist: "Info-edited.plist", plistoptions: {BundleIsRelocatable: false}},
			
			// Build the package sample.pkg, version 1.0, using the entire contents of the destination root "my_files", to be installed into the "/tmp" location,
			// with top level scripts from the "scripts" directory
			{root: "my_files", pkgname: "sample", version: "1.0", location: "/tmp", identifier: "com.sample.pkg"},
			
			// Build the package sample.pkg, version 1.0, using the destination root "my_files", using the bundle specific bundle-specific behaviors indicated in "Info-edited.plist",
			// to be installed into the /tmp location
			{root: "my_files", pkgname: "sample", version: "1.0", location: "/tmp", identifier: "com.sample.pkg", plist: "Info-edited.plist"},
			
			// Build the package sample.pkg, version 1.0, using the destination root "my_files", using the bundle specific bundle-specific behaviors indicated in "plistoptions",
			// to be installed into the /tmp location
			{root: "my_files", pkgname: "sample", version: "1.0", location: "/tmp", identifier: "com.sample.pkg", plistoptions: {BundleIsRelocatable: false, BundlePreInstallScriptPath: "scripts"}},
			
			// Build the package sample.pkg using components "my_comps1" and "my_comps2", to be installed into the /tmp location
			{component: ["my_comps1", "my_comps2"], pkgname: "sample", location: "/tmp"},
			
			// Build a nopayload package samplescript.pkg
			{scripts: "scripts", pkgname: "samplescript", identifier: "com.samplescript.pkg"}
			
		]
	}
}

##Testing

To run the grunt test suite type:

> grunt --passw=&lt; your root password &gt;

Password is required to install and uninstall test packages

##Troubleshooting

By default, if a file or directory is not found it is ignored with a grunt log warning.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
2015-09-21 Initial release
