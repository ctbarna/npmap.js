/* globals grunt */
/* jshint camelcase: false */

module.exports = function(grunt) {
  'use strict';

  var cssNpmaki = '',
    npmaki = require('./node_modules/npmaki/_includes/maki.json'),
    pkg = require('./package.json'),
    sizes = {
      large: 24,
      medium: 18,
      small: 12
    };

  for (var i = 0; i < npmaki.length; i++) {
    var icon = npmaki[i];

    for (var prop in sizes) {
      cssNpmaki += '.' + icon.icon + '-' + prop + ' {background-image: url(images/icon/npmaki/' + icon.icon + '-' + sizes[prop] + '.png);}\n';
      cssNpmaki += '.' + icon.icon + '-' + prop + '-2x {background-image: url(images/icon/npmaki/' + icon.icon + '-' + sizes[prop] + '@2x.png);}\n';
    }
  }

  grunt.util.linefeed = '\n';
  grunt.initConfig({
    aws: grunt.file.readJSON('aws.json'),
    aws_s3: {
      options: {
        accessKeyId: '<%= aws.key %>',
        bucket: 'npmap',
        //differential: true,
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
            Expires: new Date(Date.now() + 63072000000).toISOString()
          }
        },
        files: [{
          cwd: 'dist/images/',
          dest: 'npmap.js/<%= pkg.version %>/images/',
          expand: true,
          src: [
            '**'
          ]
        },{
          cwd: 'dist/gzip/',
          dest: 'npmap.js/<%= pkg.version %>/',
          expand: true,
          params: {
            ContentEncoding: 'gzip'
          },
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
    compress: {
      production: {
        options: {
          mode: 'gzip'
        },
        files: [{
          cwd: 'dist/',
          dest: 'dist/gzip/',
          expand: true,
          ext: '.css',
          src: [
            'npmap-standalone.css',
            'npmap.css'
          ]
        },{
          cwd: 'dist/',
          dest: 'dist/gzip/',
          expand: true,
          ext: '.min.css',
          src: [
            'npmap-standalone.min.css',
            'npmap.min.css'
          ]
        },{
          cwd: 'dist/',
          dest: 'dist/gzip/',
          expand: true,
          ext: '.js',
          src: [
            'npmap-bootstrap.js',
            'npmap-standalone.js',
            'npmap.js'
          ]
        },{
          cwd: 'dist/',
          dest: 'dist/gzip/',
          expand: true,
          ext: '.min.js',
          src: [
            'npmap-bootstrap.min.js',
            'npmap-standalone.min.js',
            'npmap.min.js'
          ]
        }]
      }
    },
    concat: {
      css: {
        dest: 'dist/npmap.css',
        options: {
          banner: cssNpmaki
        },
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
      },
      npmaki: {
        cwd: 'node_modules/npmaki/renders/',
        dest: 'dist/images/icon/npmaki',
        expand: true,
        src: [
          '**/*'
        ]
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
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-invalidate-cloudfront');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.registerTask('build', ['clean', 'copy', 'concat', 'browserify', 'uglify', 'cssmin', 'usebanner']); //TODO: csscomb, validation
  grunt.registerTask('deploy', ['compress', 'aws_s3', 'invalidate_cloudfront']);
  grunt.registerTask('lint', ['csslint']); //TODO: jshint
  grunt.registerTask('test', ['mocha_phantomjs']);
};
