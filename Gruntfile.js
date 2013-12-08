'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      files: ['test/**/*_test.js']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      // lib: {
      //   src: ['lib/**/*.js']
      // },
      test: {
        src: ['test/**/*.js']
      }
    },
    coffee: {
      compile: {
        options: {
          bare: false
        },
        files: {
          'ish/js/browserio.js': 'src/browserio.coffee'
        }
      },
      compilebare: {
        options: {
          bare: true
        },
        files: {
          'config.js': 'src/config.coffee',
          'lib/ishosc.js': 'src/ishosc.coffee'
        }
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      coffee: {
        files: ['src/**/*.coffee'],
        tasks: ['coffee:compile']
      },
//      lib: {
//        files: '<%= jshint.lib.src %>',
//        tasks: ['jshint:lib', 'nodeunit']
//      },
      // test: {
      //   files: '<%= jshint.test.src %>',
      //   tasks: ['jshint:test', 'nodeunit']
      // }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  // grunt.registerTask('default', ['jshint', 'nodeunit']);
  grunt.registerTask('default', ['jshint']);

};
