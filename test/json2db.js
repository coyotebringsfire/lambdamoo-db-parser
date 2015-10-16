"use strict";

var should 	= require('should'),
	bunyan 	= require('bunyan');

var logFile = __dirname + '/logs/json2db.log';

describe('json2db', function constructorTest() {
	var log = bunyan.createLogger({
		src: true,
	    name: 'json2db',
	    streams: [
	        {
	            level: 'info',
	            path: logFile           // log INFO and above to file
	        }
	    ]
	});
	log.info('starting test');

	it('should return an error if not passed a JSON object as the first argument', function doIt() { should.fail(); });
	it('should return an error if not passed a File object as the second argument', function doIt() { should.fail(); });
	it('should return a Promise', function doIt() { should.fail(); });
	it('should reject the returned promise if an error occurs while writing the file', function doIt() { should.fail(); });
	it('should fulfill the returned promise if no error happens', function doIt() { should.fail(); });
});