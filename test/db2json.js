/*jslint node: true */
"use strict";

var should 	= require('should'),
	bunyan 	= require('bunyan');

describe('db2json', function constructorTest() {
	var log = bunyan.createLogger({name: "db2json"});
	log('starting test');

	it('should return an error if not passed a File object', function doIt() { should.fail(); });
	it('should return a Promise', function doIt() { should.fail(); });
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