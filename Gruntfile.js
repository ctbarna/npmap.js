/* globals grunt */

module.exports = function(grunt) {
  grunt.initConfig({
    aws: grunt.file.readJSON('aws.json'),
    cloudfront: {
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
    s3: {
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
          src: 'npmap.js/0.0.0/*'
        }],
        */
        upload: [{
          dest: 'npmap.js/0.0.0/images/',
          options: {
            verify: true
          },
          src: 'dist/images/*'
        },{
          dest: 'npmap.js/0.0.0/images/icons/',
          options: {
            verify: true
          },
          src: 'dist/images/icons/*'
        },{
          dest: 'npmap.js/0.0.0/npmap-bootstrap.js',
          options: {
            gzip: true,
            verify: true
          },
          src: 'dist/npmap-bootstrap.js'
        },{
          dest: 'npmap.js/0.0.0/npmap-bootstrap.min.js',
          options: {
            gzip: true,
            verify: true
          },
          src: 'dist/npmap-bootstrap.min.js'
        },{
          dest: 'npmap.js/0.0.0/npmap-standalone.css',
          options: {
            gzip: true,
            verify: true
          },
          src: 'dist/npmap-standalone.css'
        },{
          dest: 'npmap.js/0.0.0/npmap-standalone.js',
          options: {
            gzip: true,
            verify: true
          },
          src: 'dist/npmap-standalone.js'
        },{
          dest: 'npmap.js/0.0.0/npmap-standalone.min.js',
          options: {
            gzip: true,
            verify: true
          },
          src: 'dist/npmap-standalone.min.js'
        },{
          dest: 'npmap.js/0.0.0/npmap.css',
          options: {
            gzip: true,
            verify: true
          },
          src: 'dist/npmap.css'
        },{
          dest: 'npmap.js/0.0.0/npmap.js',
          options: {
            gzip: true,
            verify: true
          },
          src: 'dist/npmap.js'
        },{
          dest: 'npmap.js/0.0.0/npmap.min.js',
          options: {
            gzip: true,
            verify: true
          },
          src: 'dist/npmap.min.js'
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-invalidate-cloudfront');
  grunt.loadNpmTasks('grunt-s3');
};
