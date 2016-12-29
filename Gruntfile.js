var _ = require('underscore');

module.exports = function(grunt) {
  'use strict';

  var files = {
    src: 'lib/**/*.js'
  };

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });

  // On watch events, configure jshint:all to run only on changed file
  grunt.event.on('watch', function(action, filepath) {
    grunt.config(['jshint', 'all'], filepath);
  });

};
