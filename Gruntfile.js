/* globals grunt */
/* jshint camelcase: false */

module.exports = function(grunt) {
  'use strict';

  var pkg = require('./package.json');

  grunt.util.linefeed = '\n';
  grunt.initConfig({
    aws: grunt.file.readJSON('aws.json'),
    aws_s3: {
      options: {
        accessKeyId: '<%= aws.key %>',
        bucket: 'npmap',
        //differential: true,
        region: 'us-east-1',
        secretAccessKey: '<%= aws.secret %>',
        sslEnabled: true,
        uploadConcurrency: 5
      },
      clean_production: {
        files: [{
          action: 'delete',
          cwd: 'dist/',
          dest: 'npmap.js/<%= pkg.version %>/'
        }]
      },
      production: {
        options: {
          params: {
            CacheControl: 'max-age=630720000, public',
            ContentEncoding: 'gzip',
            Expires: new Date(Date.now() + 63072000000).toISOString()
          }
        },
        files: [{
          cwd: 'dist/',
          dest: 'npmap.js/<%= pkg.version %>/',
          expand: true,
          src: [
            '**'
          ]
        }]
      }
    },
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
          '**/*'
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
    invalidate_cloudfront: {
      options: {
        distribution: '<%= aws.distribution %>',
        key: '<%= aws.key %>',
        secret: '<%= aws.secret %>'
      },
      production: {
        files: [{
          cwd: './dist/',
          dest: 'npmap.js/<%= pkg.version %>/',
          expand: true,
          filter: 'isFile',
          src: [
            '**/*'
          ]
        }]
      }
    },
    mocha_phantomjs: {
      all: [
        'test/index.html'
      ]
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

  grunt.loadNpmTasks('grunt-aws-s3');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-invalidate-cloudfront');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.registerTask('build', ['clean', 'copy', 'concat', 'browserify', 'uglify', 'cssmin', 'usebanner']); //TODO: csscomb, validation
  grunt.registerTask('deploy', ['aws_s3', 'invalidate_cloudfront']);
  grunt.registerTask('lint', ['csslint']); //TODO: jshint
  grunt.registerTask('test', ['mocha_phantomjs']);
};
