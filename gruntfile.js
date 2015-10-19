module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		babel: {
			options: {
				sourceMap: false,
				stage: 0
			},
			dist: {
				files: {
					'bin.js': 'socketMiddlewareCreator.js'
				}
			}
		}
	});

	grunt.registerTask('default', ['babel']);
};
