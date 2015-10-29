"use strict";

var should 	= require('should'),
	bunyan 	= require('bunyan'),
	rewire 	= require('rewire');

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
		this.timeout(10000);
		var d2j = require('../index.js').db2json;
		d2j(__dirname+"/data/simple.db")
			.then( function onJsonReady(world) {
				world.should.be.ok();
				done();
			});
	});
	it('should reject the returned promise if an error occurs reading the file', function doIt(done) { 
		this.timeout(10000);
		var parser = rewire('../index.js');
		parser.__set__('fs', {
			createReadStream: function() {
				throw(new Error("TESTERROR"));
			}
		});
		parser.db2json("data/simple.db")
			.then( function onJsonReady() {
				should.fail();
			}, function onReject(err) {
				should(err).be.ok();
				err.message.should.equal("TESTERROR");
				done();
			});
	});
	describe('world', function objectTest() {
		this.timeout(10000);
		describe('intro block', function introBlockTest() {
			it('should contain total number of objects', function doIt(done) { 
				var parser = rewire('../index.js');
				parser.db2json(__dirname+"/data/Minimal.db")
					.then( function onJsonReady(world) {
						should( world ).be.ok();
						should( world.intro ).be.ok();
						should( world.intro.total_number_of_objects ).be.ok();
						done();
					}, function onReject() {
						should.fail();
					});
			});
			it('should contain total number of verbs', function doIt(done) { 
				var parser = rewire('../index.js');
				parser.db2json(__dirname+"/data/Minimal.db")
					.then( function onJsonReady(world) {
						should( world ).be.ok();
						should( world.intro ).be.ok();
						should( world.intro.number_of_verbs ).be.ok();
						done();
					}, function onReject() {
						should.fail();
					});
			});
			it('should contain number of players', function doIt(done) { 
				var parser = rewire('../index.js');
				parser.db2json(__dirname+"/data/Minimal.db")
					.then( function onJsonReady(world) {
						should( world ).be.ok();
						should( world.intro ).be.ok();
						should( world.intro.number_of_players ).be.ok();
						done();
					}, function onReject() {
						should.fail();
					});
			});
		});
		describe('player block', function playerBlockTest() {
			it('should contain each player id, 1 per line',  function doIt(done) { 
				var parser = rewire('../index.js');
				parser.db2json(__dirname+"/data/Minimal.db")
					.then( function onJsonReady(world) {
						should( world ).be.ok();
						should( world.players ).be.ok();
						world.players.length.should.equal( world.intro.number_of_players );
						done();
					}, function onReject() {
						should.fail();
					});
			});
		});
		describe.only('object block', function objectBlockTest() {
			describe("object", function objectTest() {
				var suite = {};
				before(function doMinimalWorld(done) {
					var parser = rewire('../index.js');
					parser.db2json(__dirname+"/data/Minimal.db")
						.then( function onJsonReady(world) {
							should( world ).be.ok();
							suite.world=world;
							done();
						}, function onReject() {
							should.fail();
						});
				});
				it("should have recycled property set to true if the object has been recycled", function doIt() { should.fail(); });
				it("should contain object name", function doIt() {
					should( suite.world.objects ).be.ok();
					Array.isArray( suite.world.objects ).should.equal(true);
					should( suite.world.objects[0].name ).be.ok();
				});
				it("should contain object flags", function doIt() {
					should( suite.world.objects ).be.ok();
					Array.isArray( suite.world.objects ).should.equal(true);
					should( suite.world.objects[0].flags ).be.ok();
				});
				it("should contain owner id", function doIt() {
					should( suite.world.objects ).be.ok();
					Array.isArray( suite.world.objects ).should.equal(true);
					should( suite.world.objects[0].owner ).be.ok();
				});
				it("should contain object location", function doIt() {
					should( suite.world.objects ).be.ok();
					Array.isArray( suite.world.objects ).should.equal(true);
					should( suite.world.objects[0].location ).be.ok();
				});
				it("should contain first object id in object contents", function doIt() {
					should( suite.world.objects ).be.ok();
					Array.isArray( suite.world.objects ).should.equal(true);
					should( suite.world.objects[0].firstContent ).be.ok();
				});
				it("should contain next object id in objects location contents", function doIt() {
					should( suite.world.objects ).be.ok();
					Array.isArray( suite.world.objects ).should.equal(true);
					should( suite.world.objects[0].nextLocationNeighbor ).be.ok();
				});
				it("should contain object parent", function doIt() {
					should( suite.world.objects ).be.ok();
					Array.isArray( suite.world.objects ).should.equal(true);
					should( suite.world.objects[0].parent ).be.ok();
				});
				it("should contain first object id in object children", function doIt() {
					should( suite.world.objects ).be.ok();
					Array.isArray( suite.world.objects ).should.equal(true);
					should( suite.world.objects[0].firstChild ).be.ok();
				});
				it("should contain next object id in object sibliing", function doIt() {
					should( suite.world.objects ).be.ok();
					Array.isArray( suite.world.objects ).should.equal(true);
					should( suite.world.objects[0].nextSibling ).be.ok();
				});
				it("should contain world.objects[].verbs[]", function doIt() {
					should( suite.world.objects ).be.ok();
					Array.isArray( suite.world.objects ).should.equal(true);
					should( suite.world.objects[0].verbs ).be.ok();
					Array.isArray( suite.world.objects[0].verbs ).should.equal(true);
				});
				describe("verbs", function verbTest() {
					it("should contain the verb name", function doIt() {
						should( suite.world.objects ).be.ok();
						Array.isArray( suite.world.objects ).should.equal(true);
						should( suite.world.objects[0].verbs ).be.ok();
						Array.isArray( suite.world.objects[0].verbs ).should.equal(true);
						should( suite.world.objects[0].verbs[0].name ).be.ok();
					});
					it("should contain the object id of the verb owner", function doIt() {
						should( suite.world.objects ).be.ok();
						Array.isArray( suite.world.objects ).should.equal(true);
						should( suite.world.objects[0].verbs ).be.ok();
						Array.isArray( suite.world.objects[0].verbs ).should.equal(true);
						should( suite.world.objects[0].verbs[0].owner ).be.ok();
					});
					it("should contain verb permissions", function doIt() {
						should( suite.world.objects ).be.ok();
						Array.isArray( suite.world.objects ).should.equal(true);
						should( suite.world.objects[0].verbs ).be.ok();
						Array.isArray( suite.world.objects[0].verbs ).should.equal(true);
						should( suite.world.objects[0].verbs[0].permissions ).be.ok();
					});
					it("should contain an argument preposition code", function doIt() {
						should( suite.world.objects ).be.ok();
						Array.isArray( suite.world.objects ).should.equal(true);
						should( suite.world.objects[0].verbs ).be.ok();
						Array.isArray( suite.world.objects[0].verbs ).should.equal(true);
						should( suite.world.objects[0].verbs[0].argument_preposition_code ).be.ok();
					});
				});
				describe("properties", function propertiesTest() {
					describe("property", function propertyTest() {

					});
				});
			});
		});
		it('should contain version information', function doIt() {
			it('should include the version', function doIt(done) {
				var parser = rewire('../index.js');
				parser.db2json(__dirname+"/data/Minimal.db")
					.then( function onJsonReady(world) {
						should( world ).be.ok();
						should( world.version ).be.ok();
						world.version.should.equal("1");
						done();
					}, function onReject() {
						should.fail();
					});
			});
		});
	});
});
