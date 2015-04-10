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