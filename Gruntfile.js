/* globals grunt */

module.exports = function(grunt) {
  'use strict';

  var pkg = require('./package.json');

  grunt.util.linefeed = '\n';
  grunt.initConfig({
    aws: grunt.file.readJSON('aws.json'),
    browserify: {
      all: {
        files: {
          'dist/npmap.js': ['main.js'],
          'dist/npmap-standalone.js': ['npmap.js']
        }
      }
    },
    clean: {
      dist: {
        src: [
          'dist/**/*'
        ]
      }
    },
    concat: {
      css: {
        dest: 'dist/npmap.css',
        src: [
          'node_modules/leaflet/dist/leaflet.css',
          'theme/nps.css'
        ]
      }
    },
    copy: {
      css: {
        dest: 'dist/npmap-standalone.css',
        src: 'theme/nps.css'
      },
      images: {
        cwd: 'theme/images/',
        dest: 'dist/images',
        expand: true,
        src: [
          '**'
        ]
      },
      javascript: {
        dest: 'dist/npmap-bootstrap.js',
        src: 'src/bootstrap.js'
      }
    },
    csslint: {
      src: [
        'dist/npmap.css'
      ]
    },
    cssmin: {
      dist: {
        cwd: 'dist/',
        dest: 'dist/',
        expand: true,
        ext: '.min.css',
        src: ['*.css', '!*.min.css']
      }
    },
    invalidate: {
      options: {
        distribution: '<%= aws.distribution %>',
        key: '<%= aws.key %>',
        secret: '<%= aws.secret %>'
      },
      production: {
        files: [{
          dest: '',
          expand: true,
          filter: 'isFile',
          src: [
            'dist/*',
            'dist/images/*',
            'dist/images/icons/*'
          ]
        }]
      }
    },
    pkg: pkg,
    uglify: {
      npmap: {
        dest: 'dist/npmap.min.js',
        src: 'dist/npmap.js'
      },
      'npmap-bootstrap': {
        dest: 'dist/npmap-bootstrap.min.js',
        src: 'dist/npmap-bootstrap.js'
      },
      'npmap-standalone': {
        dest: 'dist/npmap-standalone.min.js',
        src: 'dist/npmap-standalone.js'
      }
    },
    upload: {
      options: {
        access: 'public-read',
        bucket: '<%= aws.bucket %>',
        headers: {
          "Cache-Control": "max-age=630720000, public",
          "Expires": new Date(Date.now() + 63072000000).toUTCString()
        },
        key: '<%= aws.key %>',
        secret: '<%= aws.secret %>'
      },
      production: {
        /*
        del: [{
          src: 'npmap.js/<%= pkg.version %>/*'
        }],
        */
        upload: [{
          dest: 'npmap.js/<%= pkg.version %>/images/',
          src: 'dist/images/*'
        },{
          dest: 'npmap.js/<%= pkg.version %>/images/icons/',
          src: 'dist/images/icons/*'
        },{
          dest: 'npmap.js/<%= pkg.version %>/npmap-bootstrap.js',
          options: {
            gzip: true
          },
          src: 'dist/npmap-bootstrap.js'
        },{
          dest: 'npmap.js/<%= pkg.version %>/npmap-bootstrap.min.js',
          options: {
            gzip: true
          },
          src: 'dist/npmap-bootstrap.min.js'
        },{
          dest: 'npmap.js/<%= pkg.version %>/npmap-standalone.css',
          options: {
            gzip: true
          },
          src: 'dist/npmap-standalone.css'
        },{
          dest: 'npmap.js/<%= pkg.version %>/npmap-standalone.js',
          options: {
            gzip: true
          },
          src: 'dist/npmap-standalone.js'
        },{
          dest: 'npmap.js/<%= pkg.version %>/npmap-standalone.min.js',
          options: {
            gzip: true
          },
          src: 'dist/npmap-standalone.min.js'
        },{
          dest: 'npmap.js/<%= pkg.version %>/npmap.css',
          options: {
            gzip: true
          },
          src: 'dist/npmap.css'
        },{
          dest: 'npmap.js/<%= pkg.version %>/npmap.js',
          options: {
            gzip: true
          },
          src: 'dist/npmap.js'
        },{
          dest: 'npmap.js/<%= pkg.version %>/npmap.min.js',
          options: {
            gzip: true
          },
          src: 'dist/npmap.min.js'
        }]
      }
    },
    usebanner: {
      dist: {
        options: {
          banner: '/**\n * NPMap.js <%= pkg.version %>\n * Built on <%= grunt.template.today("mm/dd/yyyy") %> at <%= grunt.template.today("HH:MM:ssTT Z") %>\n * Copyright <%= grunt.template.today("yyyy") %> National Park Service\n * Licensed under ' + pkg.licenses[0].type + ' (' + pkg.licenses[0].url + ')\n */',
          position: 'top'
        },
        files: {
          src: [
            'dist/*.css',
            'dist/*.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-invalidate-cloudfront');
  grunt.loadNpmTasks('grunt-s3');
  grunt.registerTask('build', ['clean', 'copy', 'concat', 'browserify', 'uglify', 'cssmin', 'usebanner']); //TODO: csscomb, validation
  grunt.registerTask('deploy', ['upload', 'invalidate']);
  grunt.registerTask('lint', ['csslint']); //TODO: jshint
};
