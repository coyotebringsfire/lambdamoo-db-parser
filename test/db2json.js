"use strict";

var should 	= require('should'),
	bunyan 	= require('bunyan');

var logFile = __dirname + '/logs/db2json.log';

describe('db2json', function constructorTest() {
	var log = bunyan.createLogger({
		src: true,
	    name: 'db2json',
	    streams: [
	        {
	            level: 'info',
	            path: logFile            // log INFO and above to file
	        }
	    ]
	});
	log.info('starting test');

	it('should return an error if not passed a string path to a valid db', function doIt() {
		var d2j = require('../index.js').db2json;
		should( d2j({ file:"data/world.db" }) ).not.be.ok();
	});
	it('should return a thennable', function doIt(done) { 
		var d2j = require('../index.js').db2json;
		this.timeout(10000);
		d2j("data/simple.db").
			then( function onJsonReady(world) {
				world.should.be.ok();
				done();
			});
	});
	it('should reject the returned promise if an error occurs while parsing the file', function doIt() { should.fail(); });
	describe('object', function objectTest() {
		describe('intro block', function introBlockTest() {
			it('should contain total number of objects', function doIt() { should.fail(); });
			it('should contain total number of verbs', function doIt() { should.fail(); });
			it('should contain number of players', function doIt() { should.fail(); });
		});
		describe('player block', function playerBlockTest() {
			it('should contain each player id, 1 per line', function doIt() { should.fail(); });
		});
		it('should contain version information', function doIt() { should.fail(); });
	});
});
