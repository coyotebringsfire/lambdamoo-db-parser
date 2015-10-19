"use strict";
var should 	= require('should');

describe("StateMachine", function() {
	it("should throw an exception if passed a non-array argument", function doIt() { 
		var StateMachine = require('../StateMachine');
		(function() {
			var stateMachine = new StateMachine();
			stateMachine.setState("FAIL");
		}).should.throw();
	});
	it("should initialize the state to the first state in the passed array", function doIt() { 
		var StateMachine 	= require('../StateMachine'),
			testStates 		= [
				{
					name: "TESTSTATE0",
					onMessage: function() {}
				},{
					name: "TESTSTATE1",
					onMessage: function() {}
				},{
					name: "TESTSTATE2",
					onMessage: function() {}
				}
			],
			stateMachine 	= new StateMachine( testStates );
		stateMachine._currentState.should.equal(0);
	});
	it.skip("should throw an exception if an error happens initializing the state machine", function() { should.fail(); });
	it.skip("should emit an error event if an error occurs during processing", function() { should.fail(); });
	it("should emit a ready event when the final state exits", function(done) { 
		this.timeout(10000);
		var StateMachine 	= require('../StateMachine'),
			testStates 		= [
				{
					name: "TESTSTATE0",
					onMessage: function() {
						stateMachine.world.states.push("TESTSTATE0");
						stateMachine.nextState();
					}
				}
			],
			stateMachine 	= new StateMachine( testStates );
			stateMachine.on('ready', function() {
				stateMachine.world.states.length.should.equal(1);
				done();
			});
			stateMachine.message("TEST");
	});
	describe("#setState", function() {
		it("should return an error if passed an invalid state", function doIt() { 
			var StateMachine 	= require('../StateMachine'),
			testStates 		= [
				{
					name: "TESTSTATE0",
					onMessage: function() {}
				}
			],
			stateMachine 	= new StateMachine( testStates );
			stateMachine.setState("TEST").should.equal("INVALIDSTATE");
		});
		it("should change the state", function doIt() { 
			var StateMachine 	= require('../StateMachine'),
				testStates 		= [
					{
						name: "TESTSTATE0",
						onMessage: function() {}
					},{
						name: "TESTSTATE1",
						onMessage: function() {}
					}
				],
				stateMachine 	= new StateMachine( testStates );
			stateMachine.setState("TESTSTATE1");
			stateMachine._currentState.should.equal(1);
		});
	});
	describe("#getState", function() {
		it("should get the current state", function doIt() { 
			var StateMachine 	= require('../StateMachine'),
				testStates 		= [
					{
						name: "TESTSTATE0",
						onMessage: function() {}
					},{
						name: "TESTSTATE1",
						onMessage: function() {}
					}
				],
				stateMachine 	= new StateMachine( testStates );
				stateMachine.setState("TESTSTATE1");
				stateMachine.getState().name.should.equal("TESTSTATE1");
		});
	});
	describe("#nextState", function() {
		it("should move to the next state in the state machine", function doIt() { 
			var StateMachine 	= require('../StateMachine'),
				testStates 		= [
					{
						name: "TESTSTATE0",
						onMessage: function() {}
					},{
						name: "TESTSTATE1",
						onMessage: function() {}
					}
				],
				stateMachine 	= new StateMachine( testStates );
			stateMachine.nextState().getState().name.should.equal("TESTSTATE1");
		});
	});
	describe("#message", function() {
		it("should return an error if passed a non-string argument", function doIt() { 
			var StateMachine 	= require('../StateMachine'),
			testStates 		= [
				{
					name: "TESTSTATE0",
					onMessage: function() {}
				}
			],
			stateMachine 	= new StateMachine( testStates );
			should(stateMachine.message({msg:"TEST"})).not.be.ok();
		});
		it("should process the passed message according to the current state", function doIt(done) { 
			var StateMachine 	= require('../StateMachine'),
			testStates 		= [
				{
					name: "TESTSTATE0",
					onMessage: function(msg) {
						msg.should.equal("TEST0");
					}
				},{
					name: "TESTSTATE1",
					onMessage: function(msg) {
						msg.should.equal("TEST1");
					}
				},{
					name: "TESTSTATE2",
					onMessage: function(msg) {
						msg.should.equal("TEST2");
						stateMachine.nextState();
					}
				}
			],
			stateMachine 	= new StateMachine( testStates );

			stateMachine.on('ready', function() {
				done();
			});
			stateMachine.message("TEST0");
			stateMachine.nextState().message("TEST1");
			stateMachine.nextState().message("TEST2");
		});
	});
});