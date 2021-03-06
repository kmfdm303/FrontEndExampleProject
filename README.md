# FrontEndExampleProject
A front-end build tool example project to help teach how git, bower, node, and grunt work

For this tutorial you will need to install and configure Node.js, NPM and Git. There are some easy examples of installing these items at:

Node.js & npm - https://nodejs.org/download/

Git - https://help.github.com/articles/set-up-git/

Recently I created a framework for creating a front end build system using commonly available tools. I made some decision based on the structure of the file system that seemed to work for the example I was trying to create. 

The basic structure is a follows

* ExampleProject
  * build
  * dest
  * src
    * css
    * js
    * less
    * lib

The html files will be in the src directory and the css files, javascript files and less files will be in their own separate directories. External libraries loaded through bower will be in the lib directory under src. This directory will automatically be created by bower when you add libraries to your project. Just to be clear 'src' is where you put your source code for the project. 'build' is a temporary directory where files are put during the build process, and dest is the final output of the build process.

##Build Goals:
There are two basic build goals, build for debugging and build for release. When we build for debugging we will not minify the code as that makes it difficult for to figure out what is going on in the browser's debugger. When we build for release, we will minify the css and js files and concat them all together into one file for each type.

The project is going to use less. If you would like to use sass or some other language to manage your css you can, It's pretty easy to swap out one css tool for another. We are going to compile our less into css, then take all of the css files and concat them together. We will minify the css when we build for release. There is a css directory for putting straight css files. They will concatenated with the less files into a single style.css file in the dest directory.

We will pluck out the appropriate .js files in the lib directory and concat them into the include.js file in the dest/lib directory (minifying the code when built for release. We will do the same for the files in the js directory, placing them in dest/js/script.js. 

Once everything is built we are going to launch a web server and put a watch on the source files. When these source files change, we will automatically recompile the appropriate files and use livereload to refresh the browser so the mere act of saving a file will cause the browser to update with the changes.

Lets get started.

We will need to install node.js on your machine. A complete guild to installing node is at https://nodejs.org/.

We will also need to install npm, the node package manager. This will install a package and all of its dependencies into a node_modules directory. There are a few command line options that go along with npm. NPM will create a file called package.json which has a list of the dependencies in a project. To initialize a project just type 'npm init' it will ask you a series of questions to help build this file. 
```
name: ExampleProject   <-- make sure this a valid name. spaces are a no no, so just make your project name in camelCase.
version: 0.0.0
description:     <-- this is optional, you can leave it blank. You can always change it later by editing the package.json file.
entry point: index.html   <-- since this is a simple web site builder just use index.html
test command:       <-- leave these blank
git repository:
keywords:
author:   <-- Your name here!
licence: MIT   <-- this is example code to share with the world so the MIT license seems appropriate. 
```
Hit ok and you are set. now if you open the package.json file you will see the following:
######package.json
```json
{
  "name": "ExampleProject",
  "version": "0.0.0",
  "description": "",
  "main": "index.html",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "MIT"
}
```
Now we just need to add grunt. Grunt is a task runner. It will do some tasks to automate the build process. You can read more about grunt at gruntjs.com. There are a lot of plugins for performing specific tasks and we will learn about some of them shortly. We are going to use a special command line argument with npm to make sure grunt gets added to package.json.
```
npm install -g grunt-cli
npm install grunt --save-dev
```
The frist line will install the grunt-cli globaly on your system. The second line will install grunt locally on in your project directory and the --save-dev will add grunt as a dependency to our project. The whole reason we want it as a dependency is that now, all we need to do is have the package.json file and if we type npm install, npm will automatically download all of the dependencies.  If you look at package.json now you will see a new section that lists out our project's dependencies.
######package.json
```json
  "devDependencies": {
    "grunt": "^0.4.5"
  }
```
What that carrot(^) in the version number means is install grunt with a version of 0.4.5 or higher. As an experiment you can copy the package.json file to another directory and type npm install. npm will go out and install grunt into the node_modlules directory and get this project looking a lot like the ExampleProject directory.

Now, we are going to create a very simple grunt task to lint our code. Linting makes sure your code is valid syntactically and forces you to adhere to generally accepted coding guidelines. We are simply going to set up a task called debug that will run the linter (called jshint) then exit. First off we need to install the jshint module. 
```
npm install grunt-contrib-jshint --save-dev
```
This will install jshint and add it to the dependencies in the package.json file. You can see a lit of available plugins at gruntjs.com/plugins. I will be using the contrib plugins as they are all officially maintained by the grunt team. Now all we need to do is create a file called gruntfile.js in the root directory of our projects and place the following code in it.
######gruntfile.js
```javascript
/* jshint node: true */
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		jshint: ['gruntfile.js']
	})
	
	// load the jshint module
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// register tasks
	grunt.registerTask('debug', ['jshint']);
};
```
We now have our fist grunt task. The grunt.initConfig section takes a json object with the configuration parameters for that task. Since we are using an external module we need to add the grunt.loadNpmTasks() function. and finally to register our task we us grunt.registerTask. To run our grunt tasks type the following at the command line from the root directory of our project.
```
grunt debug
```
What you are doing here is telling grunt to run the 'debug' task that we defined with the registerTask function. registerTask takes an array of individual tasks and chains them together. If any of those tasks fail, the entire registered task will fail. Our example is failing the linter because there is a semicolon missing after the grunt.initConfig method. Add the semicolon and save the gruntfile.js again and then re-run grunt debug and we will have our first lint free, successful grunt task. You can run an individual task by passing the individual task name to grunt such as...
```
grunt jshint
```
this will run the jshint task only. This can be helpful when debugging your tasks to see exactly what is happening with each task. Next we are going to take care of a little bit of plumbing required to get our build process in order. We need to install clean, less and copy into our project using NPM.
```
npm install grunt-contrib-clean --save-dev
npm install grunt-contrib-less --save-dev
npm install grunt-contrib-copy --save-dev
```
Your package.json file's dependencies section should look like this. Your version numbers may be a little different but don't worry, these number will constantly increment as they are active projects.
######package.json
```json
  "devDependencies": {
    "grunt": "^0.4.5",
    "grunt-contrib-clean": "^0.6.0",
    "grunt-contrib-copy": "^0.8.0",
    "grunt-contrib-jshint": "^0.11.1",
    "grunt-contrib-less": "^1.0.0"
  }
```
Clean will remove all of the files from a directory. Make sure you get this right because we don't want to clean the source code directory, just the directories with compiled code. As a quick recap we will lint our code, run clean on build and dest then run less on the .less files to compile them to css then copy them to the dest directory. Grunt allows for a few options when naming tasks. We are going to use some of those options while creating our example site . We will be adding a few lines to the initConfig's json object along the way. Paste the following code into the gruntfile.js
######gruntfile.js
```javascript
/* jshint node: true */
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		jshint: ['Gruntfile.js'],
		clean:{
			build: {
				src: ['build/*']
			},
			dest: {
				src: ['dest/*']
			}
		},
		less:{
			debug: {
				options: {
					compress: false
				},
				files: [{
					expand: true,
					cwd: 'src/less/',
					src: ['**/*.less'],
					dest: 'build/css/',
					ext: '.css'
				}]
			}
		},
		copy: {
			css: {
				files: [{
					expand: true,
					cwd: 'build/css/',
					src: ['**/*.css'],
					dest: 'dest/css/',
					ext: '.css'
				}]
			}
		}		
	});
	
	// load all modules
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');

	// register tasks
	grunt.registerTask('debug', ['jshint', 'clean:build', 'clean:dest', 'less:debug', 'copy:css']);
};
```

Notice the different configurations for the clean command in the initConfig's json object. Cleaning the build directory can be accomplished by running the clean:build task. You can clean the build directory now at the command line by running 'grunt clean:build'. This added level allows a single plugin to run multiple different tasks. There is another interesting change here as well in the files array under the less:debug and copy:css section. Grunt has 2 ways to map files, static mappings and dynamic mappings. A static mapping will take an array of source files and destination files where a dynamic mapping will search a directory for source files that match a pattern and put them in a destination directory with a specific file name. This snippet of code is taken from the gruntjs.com website

######Static mapping example
```javascript
static_mappings: {
	// Because these src-dest file mappings are manually specified, every
	// time a new file is added or removed, the Gruntfile has to be updated.
	files: [
		{src: 'lib/a.js', dest: 'build/a.min.js'},
		{src: 'lib/b.js', dest: 'build/b.min.js'},
		{src: 'lib/subdir/c.js', dest: 'build/subdir/c.min.js'},
		{src: 'lib/subdir/d.js', dest: 'build/subdir/d.min.js'},
	],
}
```
######Dynamic mappings example
```javascript
dynamic_mappings: {
	// Grunt will search for "**/*.js" under "lib/" when the "uglify" task
	// runs and build the appropriate src-dest file mappings then, so you
	// don't need to update the Gruntfile when files are added or removed.
	files: [{
		expand: true,     // Enable dynamic expansion.
		cwd: 'lib/',      // Src matches are relative to this path.
		src: ['**/*.js'], // Actual pattern(s) to match.
		dest: 'build/',   // Destination path prefix.
		ext: '.min.js',   // Dest filepaths will have this extension.
		extDot: 'first'   // Extensions in filenames begin after the first dot
	}],
}
```
The less:debug files section says take the files in the src/less directory that match the pattern '\*\*/*.less'. The '*\*\*/' means any recursively search all subdirectories for '*.less' any file with and extension of .less. It will use those files as an input and compile those files into .css files in the build/css directory. The copy:css files section says copy any file in the build/css directory or its subdirectories with an extension of .css to the dest/css directory. So, the tl;dr of that is the less:debug task will compile the less files into the build/css directory and then the copy:css task will copy those css files to the dest/css directory. I know we could have just compiled the .less files to the dest/css directory but I am planning a head a little bit here for the concat and minify tasks. The only thing we are missing is a less file. create a file in the src/less directory called border.less and paste the following code in it

######src/less/border.less
```less
.border-radius(@value) {
	-webkit-border-radius: @value;
	-moz-border-radius:  @value;
	border-radius: @value;
	background-clip: padding-box;
}

.slightly-rounded {
	.border-radius(2px);
}

.very-rounded {
	.border-radius(6px);
}
```
This less code will define a function called border-radius which will output the border-radius code for each appropriate browser prefix. When this compiles it will create 2 css classes that will have the code to create 2px radius and 6px radius rounded corners. Create another file in the same directory called designElements.less and paste the following code in it.

######src/less/designElements.less
```less
@green: #96dd3c;
@softGray: #888;
@softBlack: #333;
@lightGray: #eee;
@titleFontSize: 1.4em;

body {
	margin-left: 10px;
	margin-right: 10px;
}

.titleBar {
	font-size: @titleFontSize;
	font-weight: bold;
	padding-left: 10px;
	padding-right: 10px;
	border: 2px solid @softGray; 
	background-color: @green;
	color: @softBlack;
}

.wrapper {
	margin-top: 5px;
	margin-bottom: 5px;
	margin-left: 10px;
	margin-right: 10px;
}

.subTitleBar {
	font-size: @titleFontSize;
	font-weight: bold;
	padding-left: 10px;
	padding-right: 10px;
	border: 2px solid @softGray; 
	background-color: @lightGray;
	color: @softBlack;	
}
```
This bit of code will define a few colors that we will use throughout our stylesheet. This can greatly simplify things making it less likely that you will forget to add a color somewhere or get the values wrong. Now that we have a few .less files, lets run grunt and see what the output looks like.
```
grunt debug
```
This should produce 2 files in the dest/css directory with the following content:
######dest/css/border.css
```css
.slightly-rounded {
	-webkit-border-radius: 2px;
	-moz-border-radius: 2px;
	border-radius: 2px;
	background-clip: padding-box;
}
.very-rounded {
	-webkit-border-radius: 6px;
	-moz-border-radius: 6px;
	border-radius: 6px;
	background-clip: padding-box;
}
```

######dest/css designElements.css
```css
body {
	margin-left: 10px;
	margin-right: 10px;
}
.titleBar {
	font-size: 1.4em;
	font-weight: bold;
	padding-left: 10px;
	padding-right: 10px;
	border: 2px solid #888888;
	background-color: #96dd3c;
	color: #333333;
}
.wrapper {
	margin-top: 5px;
	margin-bottom: 5px;
	margin-left: 10px;
	margin-right: 10px;
}
.subTitleBar {
	font-size: 1.4em;
	font-weight: bold;
	padding-left: 10px;
	padding-right: 10px;
	border: 2px solid #888888;
	background-color: #eeeeee;
	color: #333333;
}
```
Now we need a html file to show off our css classes. Create a file in the src directory called index.html with the following content.

######scr/index.html
```html
<!DOCTYPE html>
<html>
<head>
	<title>Example Application</title>
	<link rel="stylesheet" type="text/css" href="css/border.css">
	<link rel="stylesheet" type="text/css" href="css/designElements.css">
</head>
<body>

<div class="very-rounded titleBar">
	check it
</div>
<div class="wrapper">
	<div style="width: 50%;">
		<div class="slightly-rounded subTitleBar">
			a new heading
		</div>
	</div>
</div>

</body>
</html>
```
We are going to need to copy index.html to the dest directory so we need to make a few changes to the copy configuration in the gruntfile.js. Remember to close the files in the dest/css directory if you have them open in a file viewer otherwise the clean command can not delete the files in that directory because they have an open file handle.

######gruntfile.js
```javascript
/* jshint node: true */
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		jshint: ['Gruntfile.js'],
		clean:{
			build: {
				src: ['build/*']
			},
			dest: {
				src: ['dest/*']
			}
		},
		less:{
			debug: {
				options: {
					compress: false
				},
				files: [{
					expand: true,
					cwd: 'src/less/',
					src: ['**/*.less'],
					dest: 'build/css/',
					ext: '.css'
				}]
			}
		},
		copy: {
			css: {
				files: [{
					expand: true,
					cwd: 'build/css/',
					src: ['**/*.css'],
					dest: 'dest/css/',
					ext: '.css'
				}]
			},
			html: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.html'],
					dest: 'dest/',
					ext: '.html'
				}]
			}
		}		
	});
	
	// load all modules
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');

	// register tasks
	grunt.registerTask('debug', ['jshint', 'clean:build', 'clean:dest', 'less:debug', 'copy:css', 'copy:html']);
};
```

Save your changes to the gruntfile.js and then run the following command to see the fruits of your labor.
```
grunt debug
```
Open up a web browser and navigate to the dest/index.html file and you should have your first html page. It would be really nice if we could just launch a web server to browse our web page rather than navigating through the file system. We are going to also use a technique called livereload. You can read about how livereload works at livereload.com. Basically, the idea is that there is a process that watches the file system for changes. When those files change an event is triggered that informs the web browser to reload the page. For example, we will set up a watch on all of the .html files in the root directory that will send the reload command to the web browser when they change. So, lets install connect, a livereload enabled web server. Then install watch, the file system watcher.
```
npm install grunt-contrib-connect --save-dev
npm install grunt-contrib-watch --save-dev
```
We will set connect to run on port 8088 but you can choose any port you want. Http traffic's default port is 80 so if we have the web server listening on another port, we will have to explicitly specify the port in the url. The we will just run the server on the localhost loopback so you will need use http://localhost:8088/index.html to view your index.html page in the dest directory. You will need to add the configuration for connect and watch so your gruntfile.js show look as follows.

######gruntfile.js
```javascript
/* jshint node: true */
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		jshint: ['Gruntfile.js'],
		clean:{
			build: {
				src: ['build/*']
			},
			dest: {
				src: ['dest/*']
			}
		},
		less:{
			debug: {
				options: {
					compress: false
				},
				files: [{
					expand: true,
					cwd: 'src/less/',
					src: ['**/*.less'],
					dest: 'build/css/',
					ext: '.css'
				}]
			}
		},
		copy: {
			css: {
				files: [{
					expand: true,
					cwd: 'build/css/',
					src: ['**/*.css'],
					dest: 'dest/css/',
					ext: '.css'
				}]
			},
			html: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.html'],
					dest: 'dest/',
					ext: '.html'
				}]
			}
		},
		connect: {
			server: {
				options: {
					port:8088,
					base: {
						path: 'dest',
						options: {
							index: 'index.html'
						}
					}
				}
			}
		},
		watch: {
			html: {
				options: {
					livereload: true
				},
				files: [
					'src/*.html'
				],
				tasks: ['copy:html']
			}
		}
	});
	
	// load all modules
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// register tasks
	grunt.registerTask('debug', ['jshint', 'clean:build', 'clean:dest', 'less:debug', 'copy:css', 'copy:html', 'connect:server', 'watch']);
};
```

If you run grunt, the web server should start and the watch process will be running, just waiting for any .html file in the src directory to change. When it changes, the server will send a command through livereload to your web browser and the browser will automatically refresh. Run grunt from the command line using...
```
grunt debug
```
Open up an editor with the index.html file and open a web browser side by side with text editor, pointed at http://localhost:8088/index.html. Make a change in the text editor to the index.html file. Try changing the text in the div with the class title bar on line 11 of the html file to something else like "Check it out, livereload is working." When you save the file in your text editor you will notice the browser immediately refreshes with your changes.

The watch plugin can do more that just copy html changes. Lets set it up to compile and publish changes to less files. The tasks section of the watch configuration allows you to chain together grunt tasks when a files changes on the file system. make the following changes to the gruntfile.js to watch the src/less directory for changes to less files.

######gruntfile.js
```javascript
/* jshint node: true */
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		jshint: ['Gruntfile.js'],
		clean:{
			build: {
				src: ['build/*']
			},
			dest: {
				src: ['dest/*']
			}
		},
		less:{
			debug: {
				options: {
					compress: false
				},
				files: [{
					expand: true,
					cwd: 'src/less/',
					src: ['**/*.less'],
					dest: 'build/css/',
					ext: '.css'
				}]
			}
		},
		copy: {
			css: {
				files: [{
					expand: true,
					cwd: 'build/css/',
					src: ['**/*.css'],
					dest: 'dest/css/',
					ext: '.css'
				}]
			},
			html: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.html'],
					dest: 'dest/',
					ext: '.html'
				}]
			}
		},
		connect: {
			server: {
				options: {
					port:8088,
					base: {
						path: 'dest',
						options: {
							index: 'index.html'
						}
					}
				}
			}
		},
		watch: {
			html: {
				options: {
					livereload: true
				},
				files: [
					'src/*.html'
				],
				tasks: ['copy:html']
			},
			less: {
				options: {
					lifereload: true	
				},
				files: [
					'src/less/**/*.less'
				],
				tasks: ['less:debug', 'copy:css', 'copy:lib', 'concat:debug_css']
			}
		}
	});
	
	// load all modules
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// register tasks
	grunt.registerTask('debug', ['jshint', 'clean:build', 'clean:dest', 'less:debug', 'copy:css', 'copy:html', 'connect:server', 'watch']);
};
```

A couple of things to notice here, in the watch:less configuration, notice how the files pattern is 'src/less/**/*.less' the double asterisk between the forward slashes is telling watch to look at all subdirectories. The whole pattern is saying look in the src/less directory and all of it's subdirectories for any file name with an extension of .less. Also notice in the gurnt.registerTask section at the bottom, we added just the 'watch' task. What that means is if the watch task has sub tasks, run all of the sub tasks, or as in the case of jshint. if there are no sub tasks registered, just run the single task. Looking at the array of tasks in the grunt.registerTask line, we can just call 'clean' instead of 'clean:build' and 'clean:dist'. The same thing goes for 'copy'

Alright, lets add normalize.css to the project. We can look up normalize.css and copy the file to the src/css directory or we can use bower to accomplish the same task. Bower is a lot like npm except it is focused on front-end development libraries. More information on bower can be found at http://bower.io. Installation is available through npm using the following command.
```
npm install -g bower
npm install bower --save-dev
```
Bower requires an initialization similar to npm init so at the command line type
```
bower init
```
Accept all of the defaults and you will notice that a bower.json file is created. Take a look at the file real quick to make sure everything looks good and now we are a ready to install our first bower package. Bower will normally install packages into the bower_components directory but that name looks silly to me, so we are going to have to bower files go into the src/lib directory. To change the default bower directory we need to create a file called .bowerrc in the root directory of the project. Some operating systems make this a little difficult to perform this task so at root directory of the project you can just type the following command:
```
echo {"directory" : "src/lib"} >> .bowerrc
```
This will write the json object to a file called .bowerrc. Now that bower is configured, we can install our first bower package. On the bower website, you can search for packages. Type in 'normalize.css'. You should see the search results for a package named normalize.css. If you click on the search result, it should take you to the github project. There are installation instructions below for bower. Type the following line in at the command line to install normalize and update the bower.json file.
```
bower install normalize.css --save-dev
```
If you look at your bower.json file you will notice that bower has added normalize to the devDependencies section. The whole reason we continue to use the --save-dev option on the bower install command it to ensure the bower.json file is kept current. If we use just the  'bower install' command, bower will download and install all of the items in the bower.json files devDependencies section. The npm install command will do the same thing for mode modules. If we keep the these files up to date, all we need is our source code and the config files, and if we just run npm install and bower install, all of the dependencies will be downloaded for us.

Normalize.css is a bit of css that will reset each of the web browsers to a know state. Some web browsers have different margins and padding on elements which can cause discrepancies across browsers.

Our directory structure should look like the following:

* ExampleProject
  * build
    * css
      * border.css
      * designElements.css
  * node_modules
  * dest
    * css
      * border.css
      * designElements.css
  * src
    * css
    * js
    * less
      * border.less
      * designElements.less
    * lib
      * normalize.css
    * index.html
  * bower.json
  * package.json
  * gruntfile.js
  * .bowerrc

Now all we need to do is to get the normalize.css file into our build process. We are going to change the gruntfile.js to copy the normalize.css file to our dest/css directory.
######gruntfile.js
```javascript
/* jshint node: true */
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		jshint: ['Gruntfile.js'],
		clean:{
			build: {
				src: ['build/*']
			},
			dest: {
				src: ['dest/*']
			}
		},
		less:{
			debug: {
				options: {
					compress: false
				},
				files: [{
					expand: true,
					cwd: 'src/less/',
					src: ['**/*.less'],
					dest: 'build/css/',
					ext: '.css'
				}]
			}
		},
		copy: {
			css: {
				files: [{
					expand: true,
					cwd: 'build/css/',
					src: ['**/*.css'],
					dest: 'dest/css/',
					ext: '.css'
				}]
			},
			lib: {
				src: 'src/lib/normalize.css/normalize.css',
				dest: 'dest/css/normalize.css'
			}
			html: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.html'],
					dest: 'dest/',
					ext: '.html'
				}]
			}
		},
		connect: {
			server: {
				options: {
					port:8088,
					base: {
						path: 'dest',
						options: {
							index: 'index.html'
						}
					}
				}
			}
		},
		watch: {
			html: {
				options: {
					livereload: true
				},
				files: [
					'src/*.html'
				],
				tasks: ['copy:html']
			},
			less: {
				options: {
					lifereload: true	
				},
				files: [
					'src/less/**/*.less'
				],
				tasks: ['less:debug', 'copy:css', 'copy:lib', 'concat:debug_css']
			}
		}
	});
	
	// load all modules
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// register tasks
	grunt.registerTask('debug', ['jshint', 'clean:build', 'clean:dest', 'less:debug', 'copy:css', 'copy:html', 'copy:lib', 'connect:server', 'watch']);
};
```
If we run the build process using...
```
grunt debug
```
..we will see that the normalize css file is in the dest directory but it doesn't appear to have changed anything in our web browser. That's because we didn't include normalize.css in our html file. So change the index.html file to include the normalze.css file.

######src/index.html
```html
<!DOCTYPE html>
<html>
<head>
	<title>Example Application</title>
	<link rel="stylesheet" type="text/css" href="css/border.css">
	<link rel="stylesheet" type="text/css" href="css/designElements.css">
	<link rel="stylesheet" type="text/css" href="css/normalize.css">
</head>
<body>

<div class="very-rounded titleBar">
	Check it out, livereload is working.
</div>
<div class="wrapper">
	<div style="width: 50%;">
		<div class="slightly-rounded subTitleBar">
			a new heading
		</div>
	</div>
</div>

</body>
</html>
```

When you save your changes, livereload will automatically cause your browser to refresh with the changes. Your font should be arial at this point based on normalize.css. We are starting to see a problem here. Every time we add a new css file we have to change the index.html file. If we have dozens of html files, we have to change each one. What we are going to do is concatenate each of the css files in to a single file called style.css. This is an optimization that will help our page load faster because the browser doesn't have to open a connection and download several different files, it will only do it once. It will help us in the future too when we minify our code for the release task, but more on that later. 

We are going to install concat via npm.

```
npm install grunt-contrib-concat --save-dev
```
and then modify to gruntfile.js to concat all of the files in the build/css directory. We will switch the normalize.css to copy over to the build directory. We are also going to create a custom process which will add a header before each of the css files so that while we are debugging our code, we can easily see which file we need to change. We are also going to add a new directory for some future planing. We are going to add a src/css directory so that if we end up with any css files, they will be included in the concat process.

######gruntfile.js
```javascript
/* jshint node: true */
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		jshint: ['Gruntfile.js'],
		clean:{
			build: {
				src: ['build/*']
			},
			dest: {
				src: ['dest/*']
			}
		},
		less:{
			debug: {
				options: {
					compress: false
				},
				files: [{
					expand: true,
					cwd: 'src/less/',
					src: ['**/*.less'],
					dest: 'build/css/',
					ext: '.css'
				}]
			}
		},
		copy: {
			css: {
				files: [{
					expand: true,
					cwd: 'src/css/',
					src: ['**/*.css'],
					dest: 'build/css/',
					ext: '.css'
				}]
			},
			lib: {
				src: 'src/lib/normalize.css/normalize.css',
				dest: 'build/css/normalize.css'
			},
			html: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.html'],
					dest: 'dest/',
					ext: '.html'
				}]
			}
		},
		concat: {
			debug_css: {
				options: {
					process: function(src, filepath) {
						return '/* *** Source: ' + filepath + ' *** */\n' + src + '\n\n';
					}
				},
				files:{
					'dest/css/style.css': 'build/css/**/*.css'
				}
			}
		},
		connect: {
			server: {
				options: {
					port:8088,
					base: {
						path: 'dest',
						options: {
							index: 'index.html'
						}
					}
				}
			}
		},
		watch: {
			html: {
				options: {
					livereload: true
				},
				files: [
					'src/*.html'
				],
				tasks: ['copy:html']
			},
			less: {
				options: {
					lifereload: true	
				},
				files: [
					'src/less/**/*.less'
				],
				tasks: ['less:debug', 'copy:css', 'copy:lib', 'concat:debug_css']
			}
		}
	});
	
	// load all modules
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// register tasks
	grunt.registerTask('debug', ['jshint', 'clean:build', 'clean:dest', 'less:debug', 'copy:css', 'copy:html', 'copy:lib', 'concat:debug_css', 'connect:server', 'watch']);
};
```
Now if we change the index.html file to just include the style.css file, we will be able to add less and css files at any point without making changes to the html files or the gruntfile.js
######src/index.html
```html
<!DOCTYPE html>
<html>
<head>
	<title>Example Application</title>
	<link rel="stylesheet" type="text/css" href="css/style.css">
</head>
<body>

<div class="very-rounded titleBar">
	Check it out, livereload is working.
</div>
<div class="wrapper">
	<div style="width: 50%;">
		<div class="slightly-rounded subTitleBar">
			a new heading
		</div>
	</div>
</div>

</body>
</html>
```
Lets add build tasks similar to the css tasks, except these will be for javascript. We are going to add a new directory for our javascript files /src/js. Our directory structure should look as follows:

* build
  * css
* dest
  * css
* node_modules
* src
  * js
  * less
  * lib
  
We are going to add a file called prettyNumber.js to the js directory which will just have a little function that I wrote a few years ago that will take a number in bytes and give it a proper label based on which counting system you use. Paste the following code into a new file in the src/js directory called prettyNumber.js

######src/js/prettyNumber.js
```javascript
// pBytes: the size in bytes to be converted.
// pUnits: 'si'|'iec' si units means the order of magnitude is 10^3, iec uses 2^10

function prettyNumber(pBytes, pUnits) {
    // Handle some special cases
    if(pBytes === 0) return '0 Bytes';
    if(pBytes === 1) return '1 Byte';
    if(pBytes === -1) return '-1 Byte';

    var bytes = Math.abs(pBytes);
    var orderOfMagnitude, abbreviations;
    if(pUnits && pUnits.toLowerCase() && pUnits.toLowerCase() == 'si') {
        // SI units use the Metric representation based on 10^3 as a order of magnitude
        orderOfMagnitude = Math.pow(10, 3);
        abbreviations = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    } else {
        // IEC units use 2^10 as an order of magnitude
        orderOfMagnitude = Math.pow(2, 10);
        abbreviations = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    }
    var i = Math.floor(Math.log(bytes) / Math.log(orderOfMagnitude));
    var result = (bytes / Math.pow(orderOfMagnitude, i));

    // This will get the sign right
    if(pBytes < 0) {
        result *= -1;
    }

    // This bit here is purely for show. it drops the precision on numbers greater than 100 before the units.
    // it also always shows the full number of bytes if bytes is the unit.
    if(result >= 99.995 || i===0) {
        return result.toFixed(0) + ' ' + abbreviations[i];
    } else {
        return result.toFixed(2) + ' ' + abbreviations[i];
    }
}
```

Include the file to the index.html file.

######src/index.html
```html
<!DOCTYPE html>
<html>
<head>
	<title>Example Application</title>
	<link rel="stylesheet" type="text/css" href="css/style.css">
	<script type="text/javascript" src="js/script.js"></script>
</head>
<body>

<div class="very-rounded titleBar">
	Check it out, livereload is working.
</div>
<div class="wrapper">
	<div style="width: 50%;">
		<div class="slightly-rounded subTitleBar">
			a new heading
		</div>
	</div>
</div>

</body>
</html>
```
..and we just need to add a few bits to our gruntfile.js. We will need to lint the js files, concat them together and add a watch task to re-concat them if anything changes.

######gruntfile.js
```javascript
/* jshint node: true */
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		jshint: [
			'Gruntfile.js',
			'src/js/**/*.js'
		],
		clean:{
			build: {
				src: ['build/*']
			},
			dest: {
				src: ['dest/*']
			}
		},
		less:{
			debug: {
				options: {
					compress: false
				},
				files: [{
					expand: true,
					cwd: 'src/less/',
					src: ['**/*.less'],
					dest: 'build/css/',
					ext: '.css'
				}]
			}
		},
		copy: {
			css: {
				files: [{
					expand: true,
					cwd: 'src/css/',
					src: ['**/*.css'],
					dest: 'build/css/',
					ext: '.css'
				}]
			},
			lib: {
				src: 'src/lib/normalize.css/normalize.css',
				dest: 'build/css/normalize.css'
			},
			html: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.html'],
					dest: 'dest/',
					ext: '.html'
				}]
			}
		},
		concat: {
			debug_js: {
				options: {
					process: function(src, filepath) {
						return '/* *** Source: ' + filepath + ' *** */\n' + src + '\n\n';
					}
				},
				files:{
					'dest/js/script.js': 'src/js/**/*.js'
				}
			},
			debug_css: {
				options: {
					process: function(src, filepath) {
						return '/* *** Source: ' + filepath + ' *** */\n' + src + '\n\n';
					}
				},
				files:{
					'dest/css/style.css': 'build/css/**/*.css'
				}
			}
		},
		connect: {
			server: {
				options: {
					port:8088,
					base: {
						path: 'dest',
						options: {
							index: 'index.html'
						}
					}
				}
			}
		},
		watch: {
			html: {
				options: {
					livereload: true
				},
				files: [
					'src/*.html'
				],
				tasks: ['copy:html']
			},
			less: {
				options: {
					lifereload: true	
				},
				files: [
					'src/less/**/*.less'
				],
				tasks: ['less:debug', 'copy:css', 'copy:lib', 'concat:debug_css']
			},
			debug_js: {
				options: {
					livereload: true
				},
				files: [
					'src/js/**/*.js'
				],
				tasks: ['concat:debug_js' ]
			}
		}
	});
	
	// load all modules
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// register tasks
	grunt.registerTask('debug', ['jshint', 'clean:build', 'clean:dest', 'less:debug', 'copy:css', 'copy:html', 'copy:lib', 'concat:debug_css', 'concat:debug_js', 'connect:server', 'watch']);
};
```

Lets add jQuery to our projects. jQuery is a popular javascript framework to simplify writing javascript. It hides all kinds of browser incompatibilities and is actively maintained. Lets use bower to install jquery.
```
bower install jquery --save-dev
```
Then add the file to our build process. We will add a new section to the concat configuration called debug_lib. We will have to pull the exact path to the file to individually include it. We will have to do this with each javascript library that we use but they are all concated together so we won't have to change the html every time, but we will need to change it now to include the lib/include.js. We are going to add the debug_lib to the watch list too so if we run bower upgrade and it updates our library files, the browser will reload via livereload.

######gruntfile.js
```javascript
/* jshint node: true */
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		jshint: [
			'Gruntfile.js',
			'src/js/**/*.js'
		],
		clean:{
			build: {
				src: ['build/*']
			},
			dest: {
				src: ['dest/*']
			}
		},
		less:{
			debug: {
				options: {
					compress: false
				},
				files: [{
					expand: true,
					cwd: 'src/less/',
					src: ['**/*.less'],
					dest: 'build/css/',
					ext: '.css'
				}]
			}
		},
		copy: {
			css: {
				files: [{
					expand: true,
					cwd: 'src/css/',
					src: ['**/*.css'],
					dest: 'build/css/',
					ext: '.css'
				}]
			},
			lib: {
				src: 'src/lib/normalize.css/normalize.css',
				dest: 'build/css/normalize.css'
			},
			html: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.html'],
					dest: 'dest/',
					ext: '.html'
				}]
			}
		},
		concat: {
			debug_js: {
				options: {
					process: function(src, filepath) {
						return '/* *** Source: ' + filepath + ' *** */\n' + src + '\n\n';
					}
				},
				files:{
					'dest/js/script.js': 'src/js/**/*.js'
				}
			},
			debug_css: {
				options: {
					process: function(src, filepath) {
						return '/* *** Source: ' + filepath + ' *** */\n' + src + '\n\n';
					}
				},
				files:{
					'dest/css/style.css': 'build/css/**/*.css'
				}
			},
			debug_lib: {
				options: {
					process: function(src, filepath) {
						return '/* *** Source: ' + filepath + ' *** */\n' + src + '\n\n';
					}
				},
				files:{
					'dest/lib/include.js': ['src/lib/jquery/dist/jquery.js']
				}
			}
		},
		connect: {
			server: {
				options: {
					port:8088,
					base: {
						path: 'dest',
						options: {
							index: 'index.html'
						}
					}
				}
			}
		},
		watch: {
			html: {
				options: {
					livereload: true
				},
				files: [
					'src/*.html'
				],
				tasks: ['copy:html']
			},
			less: {
				options: {
					lifereload: true	
				},
				files: [
					'src/less/**/*.less'
				],
				tasks: ['less:debug', 'copy:css', 'copy:lib', 'concat:debug_css']
			},
			debug_js: {
				options: {
					livereload: true
				},
				files: [
					'src/js/**/*.js'
				],
				tasks: ['concat:debug_lib', 'concat:debug_js']
			}
		}
	});
	
	// load all modules
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// register tasks
	grunt.registerTask('debug', ['jshint', 'clean:build', 'clean:dest', 'less:debug', 'copy:css', 'copy:html', 'copy:lib', 'concat:debug_css', 'concat:debug_js', 'concat:debug_lib', 'connect:server', 'watch']);
};
```
######src/index.html
```html
<!DOCTYPE html>
<html>
<head>
	<title>Example Application</title>
	<link rel="stylesheet" type="text/css" href="css/style.css">
	<script type="text/javascript" src="lib/include.js"></script>
	<script type="text/javascript" src="js/script.js"></script>
</head>
<body>

<div class="very-rounded titleBar">
	Check it out, livereload is working.
</div>
<div class="wrapper">
	<div style="width: 50%;">
		<div class="slightly-rounded subTitleBar">
			a new heading
		</div>
	</div>
</div>

</body>
</html>
```

We can test out jquery by running a simple command in the browser's javascript console. Each of the different browsers has a tool to allow you to enter commands in the javascript console. Firebug is a good tool for firefox, Chrome has a built in tool, Explorer has a javascript command line tool and you can Enable development mode in Safari to get a console as well. If you can't get a javascript console in your browser, just google it, it's there. Run the following command the javascript console.
```
$(".titleBar").css("background-color", "#ff9933");
```
This isn't a tutorial in how to use jQuery but I will quickly explain what this does. Use jQuery to select all html elements that have the titleBar class and change it's computed css property 'background-color' to the value '#ff9933'. You should see the title bar's color change from green to orange. This is a temporary change that will only last for the life of the page. If you make a change to any of the watched files, livereload will reload the page and you will lose your change. If you want to permanently change the color you would need to change the titleBar's background color in the src/less/designElements.less file.

You can also run prettyNumber at the browser's javascript console. 
```
prettyNumber(82728347, "si");  // returns 82.73 MB
```
This function takes a number of bytes and returns a formatted number based on which counting system you use. The "si" counting system uses 1000 bytes in a kilobyte, and the "iec" system uses 1024 bytes in a kibibyte. More on this at (http://en.wikipedia.org/wiki/Kilobyte)
```
prettyNumber(82728347, "iec");  // returns 78.90 MiB
```
Things are looking pretty good at this point, one thing we are going to need to do is set up another task called 'release'. This task will minify our javascript code down to one file so that it will be most efficiently transferred. A lot of hosting services will charge you based on traffic. It would be silly to just throw away money so we minify our css too. We are going to keep the file headers after each file is minified so that we will at least be able to see what file has a javascript error in production if a problem comes up. We will also have a visual cue at to which files are included. Some may argue that this step isn't necessary but it's only going to add a small amount to the size of our final file. So the first step is to download uglify (the javascript minifier) and cssmin (the css minifier).
```
npm install grunt-contrib-uglify --save-dev
npm install grunt-contrib-cssmin --save-dev
```
Now we will register a new grunt task called release and make some modifications to the gruntfile.js. We are going to have the less:release section compress (minify) the code on the way to the build directory and have cssmin minify the normalize.css file into the build directory. After the css files are minified we will concat them together into dest/css/style.css. We will have uglify minify all of the /src/js files into the build/js directory and flatten the file structure on the way. Flattening the file structure will require you to keep all files in the src/js directory or its subdirectories unique. We will then concat the build/js files into dest/js/script.js. The people over at jQuery were nice enough to supply a minified version of jquery so we will just use that as the source for the concatenation into dest/lib/include.js. We are also going to copy over src/lib/jquery/dest/jquery.min.map not really sure what this file does but the browser complains of a 404 if it is not there.

######gruntfile.js
```javascript
/* jshint node: true */
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		jshint: [
			'Gruntfile.js',
			'src/js/**/*.js'
		],
		clean:{
			build: {
				src: ['build/*']
			},
			dest: {
				src: ['dest/*']
			}
		},
		less:{
			debug: {
				options: {
					compress: false
				},
				files: [{
					expand: true,
					cwd: 'src/less/',
					src: ['**/*.less'],
					dest: 'build/css/',
					ext: '.css'
				}]
			},
			release: {
				options: {
					compress: true
				},
				files: [{
					expand: true,
					cwd: 'src/less/',
					src: ['**/*.less'],
					dest: 'build/css/',
					ext: '.css'
				}]
			}
		},
		copy: {
			css: {
				files: [{
					expand: true,
					cwd: 'src/css/',
					src: ['**/*.css'],
					dest: 'build/css/',
					ext: '.css'
				}]
			},
			lib: {
				src: 'src/lib/normalize.css/normalize.css',
				dest: 'build/css/normalize.css'
			},
			html: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.html'],
					dest: 'dest/',
					ext: '.html'
				}]
			},
			release: {
				src: 'src/lib/jquery/dist/jquery.min.map',
				dest: 'dest/lib/jquery.min.map'
			}
		},
		concat: {
			debug_js: {
				options: {
					process: function(src, filepath) {
						return '/* *** Source: ' + filepath + ' *** */\n' + src + '\n\n';
					}
				},
				files:{
					'dest/js/script.js': 'src/js/**/*.js'
				}
			},
			debug_css: {
				options: {
					process: function(src, filepath) {
						return '/* *** Source: ' + filepath + ' *** */\n' + src + '\n\n';
					}
				},
				files:{
					'dest/css/style.css': 'build/css/**/*.css'
				}
			},
			debug_lib: {
				options: {
					process: function(src, filepath) {
						return '/* *** Source: ' + filepath + ' *** */\n' + src + '\n\n';
					}
				},
				files:{
					'dest/lib/include.js': ['src/lib/jquery/dist/jquery.js']
				}
			},
			release: {
				options: {
					process: function(src, filepath) {
						return '/* *** Source: ' + filepath + ' *** */\n' + src + '\n\n';
					}
				},
				files:{
					'dest/js/script.js': 'build/js/**/*.js',
					'dest/css/style.css': 'build/css/**/*.css',
					'dest/lib/include.js': ['src/lib/jquery/dist/jquery.min.js']
				}
			}
		},
		uglify:{
			release:{
				files: [{
					expand: true,
					cwd: 'src/js/',
					src: ['**/*.js'],
					dest: 'build/js/',
					flatten: true,
					filter: 'isFile'
				}]
			}
		},
		cssmin: {
			release: {
				files: {
					'build/css/normalize.css':'src/lib/normalize.css/normalize.css'
				}
			}
		},
		connect: {
			server: {
				options: {
					port:8088,
					base: {
						path: 'dest',
						options: {
							index: 'index.html'
						}
					}
				}
			}
		},
		watch: {
			html: {
				options: {
					livereload: true
				},
				files: [
					'src/*.html'
				],
				tasks: ['copy:html']
			},
			less: {
				options: {
					lifereload: true	
				},
				files: [
					'src/less/**/*.less'
				],
				tasks: ['less:debug', 'copy:css', 'copy:lib', 'concat:debug_css']
			},
			debug_js: {
				options: {
					livereload: true
				},
				files: [
					'src/js/**/*.js'
				],
				tasks: ['concat:debug_js' ]
			}
		}
	});
	
	// load all modules
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// register tasks
	grunt.registerTask('debug', ['jshint', 'clean:build', 'clean:dest', 'less:debug', 'copy:css', 'copy:html', 'copy:lib', 'concat:debug_css', 'concat:debug_js', 'concat:debug_lib', 'connect:server', 'watch']);
	grunt.registerTask('release', ['clean:build', 'clean:dest', 'less:release', 'copy:html', 'cssmin:release', 'copy:css', 'uglify:release', 'concat:release', 'copy:release', 'connect:server', 'watch']);
};
```
Running grunt release will now minify our js and css files. We can even minify our html rather easily if we want to using grunt-contrib-htmlmin. There is one optimization that we can make left here in our gruntfile.js We use the same anonymous function to apply a header on each of the concat tasks. Lets pull that out into a variable at the top of the file.

######gruntfile.js
```javascript
/* jshint node: true */
'use strict';

var addHeader = function(src, filepath) {
	return '/* *** Source: ' + filepath + ' *** */\n' + src + '\n\n';
};

module.exports = function(grunt) {
	grunt.initConfig({
		jshint: [
			'Gruntfile.js',
			'src/js/**/*.js'
		],
		clean:{
			build: {
				src: ['build/*']
			},
			dest: {
				src: ['dest/*']
			}
		},
		less:{
			debug: {
				options: {
					compress: false
				},
				files: [{
					expand: true,
					cwd: 'src/less/',
					src: ['**/*.less'],
					dest: 'build/css/',
					ext: '.css'
				}]
			},
			release: {
				options: {
					compress: true
				},
				files: [{
					expand: true,
					cwd: 'src/less/',
					src: ['**/*.less'],
					dest: 'build/css/',
					ext: '.css'
				}]
			}
		},
		copy: {
			css: {
				files: [{
					expand: true,
					cwd: 'src/css/',
					src: ['**/*.css'],
					dest: 'build/css/',
					ext: '.css'
				}]
			},
			lib: {
				src: 'src/lib/normalize.css/normalize.css',
				dest: 'build/css/normalize.css'
			},
			html: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.html'],
					dest: 'dest/',
					ext: '.html'
				}]
			},
			release: {
				src: 'src/lib/jquery/dist/jquery.min.map',
				dest: 'dest/lib/jquery.min.map'
			}
		},
		concat: {
			debug_js: {
				options: {
					process: addHeader
				},
				files:{
					'dest/js/script.js': 'src/js/**/*.js'
				}
			},
			debug_css: {
				options: {
					process: addHeader
				},
				files:{
					'dest/css/style.css': 'build/css/**/*.css'
				}
			},
			debug_lib: {
				options: {
					process: addHeader
				},
				files:{
					'dest/lib/include.js': ['src/lib/jquery/dist/jquery.js']
				}
			},
			release: {
				options: {
					process: addHeader
				},
				files:{
					'dest/js/script.js': 'build/js/**/*.js',
					'dest/css/style.css': 'build/css/**/*.css',
					'dest/lib/include.js': ['src/lib/jquery/dist/jquery.min.js']
				}
			}
		},
		uglify:{
			release:{
				files: [{
					expand: true,
					cwd: 'src/js/',
					src: ['**/*.js'],
					dest: 'build/js/',
					flatten: true,
					filter: 'isFile'
				}]
			}
		},
		cssmin: {
			release: {
				files: {
					'build/css/normalize.css':'src/lib/normalize.css/normalize.css'
				}
			}
		},
		connect: {
			server: {
				options: {
					port:8088,
					base: {
						path: 'dest',
						options: {
							index: 'index.html'
						}
					}
				}
			}
		},
		watch: {
			html: {
				options: {
					livereload: true
				},
				files: [
					'src/*.html'
				],
				tasks: ['copy:html']
			},
			less: {
				options: {
					lifereload: true	
				},
				files: [
					'src/less/**/*.less'
				],
				tasks: ['less:debug', 'copy:css', 'copy:lib', 'concat:debug_css']
			},
			debug_js: {
				options: {
					livereload: true
				},
				files: [
					'src/js/**/*.js'
				],
				tasks: ['concat:debug_js' ]
			}
		}
	});
	
	// load all modules
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// register tasks
	grunt.registerTask('debug', ['jshint', 'clean:build', 'clean:dest', 'less:debug', 'copy:css', 'copy:html', 'copy:lib', 'concat:debug_css', 'concat:debug_js', 'concat:debug_lib', 'connect:server', 'watch']);
	grunt.registerTask('release', ['clean:build', 'clean:dest', 'less:release', 'copy:html', 'cssmin:release', 'copy:css', 'uglify:release', 'concat:release', 'copy:release', 'connect:server', 'watch']);
};
```
There we go! We have a pretty decent starting point for a new project. Lets add this project to GitHub. You will need to create an account on GitHub. You can read how to set up git at https://help.github.com/articles/set-up-git/ . After setting up git you will need to create a repository (or repo). There are instructions to create a new repo at https://help.github.com/articles/create-a-repo/ . Choose an easy name for the repo. In my example I will use FrontEndExampleProject which is arguably not very easy but I'm trying to be explicit. Create the project on the GitHub website and then open up a command prompt and navigate to your root project directory on your local machine. Run the following command to initialize your git project
```
git init
```
This will create a directory called .git/ in your current directory which has the information that git needs to track the files in your local repository. Next you will need to set up the remote repo, which is the repo you just set up on GitHub. The pattern for adding the remote git repo is as follows, but you will need to make a slight change. 
```
git remote add origin https://github.com/[user]/[repo].git
```
You will need to replace **user** with your GitHub username and **repo** with the name of your repository name that you created during the create-a-repo step earlier. My username is kmfdm303 and the repo I created is called FrontEndExampleProject so I would run the following command.
```
git remote add origin https://github.com/kmfdm303/FrontEndExampleProject.git
```
You can check to see if the command worked by running 
```
git remote -v
```
which will show the alias name (origin) and the remote location for fetching and pushing. Next lets create a .gitignore file. This file will tell git that we do not want to add the files matching certain patterns into source control. You can create the git ignore file by typing..
```
touch .gitignore
```
..or another command appropriate to the operating system you are running. We want to exclude all of our staging files and external packages so add the following lines to the .gitignore file
```
build/
dest/
node_modules/
src/lib/
```
now if you do a git status you will just see the files that we have worked on so do a git add on each of those files
```
git add .bowerrc
git add .gitignore
git add bower.json
git add gruntfile.js
git add instructions.txt
git add package.json
git add src/
```
If you do a git status again you will see that you have all of those files and directories staged for commit. Now lets commit them to the local repo using:
```
git commit
```
This should open up the vi editor where you can add a comment to your commit. I used something along the lines of "initial commit" for this push. Save your changes and quit out of vi. You need to pull the current state of the project down from GitHub to get the head of your local branch in sync with GitHub. We need to fetch GitHub's copy of the project and merge it into our local repo. Run the following command
```
git pull origin master
```
Now lets set our upstream target and push our changes
```
git push --set-upstream origin master
```
Now a git status will show that we have a clean working directory and if we open a web browser and go to the url we added earlier in the git remote command (https://github.com/kmfdm303/FrontEndExampleProject in my case) without the .git at the end, you will see a web based directory structure of our project. Congratulations, you are now a contributor to GitHub. You can fork this project in the future to get yourself a starting point for building your next project. 
