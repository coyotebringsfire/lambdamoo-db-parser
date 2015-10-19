"use strict";
var EventEmitter 	= require('events').EventEmitter,
	util 			= require('util');

/**
 * @class [StateMachine]
 * @param {Object[]} states - an array of machine state objects 
 * @param {string} states[].name - state name
 * @param {function} states[].onMessage - function called when a message is received in this state
 * @throws {string} "INVALIDARG" if states isn't an array
 * @emits {string} "ready" emitted when the file has been processed
 * @emits {string} "error" emitted when an error occurs
 * @returns nothing
 */
function StateMachine(states) {
	 if( !(states instanceof Array) ) {
	 	throw new Error("INVALIDARG");
	 }
	 this.states = states;
	 this.world = {
	 	states: []
	 };
	 this._currentState = 0;
}
util.inherits(StateMachine, EventEmitter);

/**
 * @function StateMachine.setState
 * @param {Object} new_state - state name to switch to
 * @returns {error|undefined} if no error happens, return undefined
 */
StateMachine.prototype.setState = function(new_state) {
	var self = this;
	var state = this.states.find( function(element, index) {
		if( element.name === new_state ) {
			self._currentState = index;
			return true;
		}
		return false;
	});
	if( state ) {
		return undefined;
	} else {
		return "INVALIDSTATE";
	}
};

/**
 * @function StateMachine.getState
 * @returns {Object} returns state object of current state
 */
StateMachine.prototype.getState = function() {
	return this.states[ this._currentState ];
};

/**
 * @function StateMachine.nextState
 * @returns {this}
 */
StateMachine.prototype.nextState = function() {
	if( this._currentState !== this.states.length-1 ) {
		this._currentState++;
	} else {
		this.emit("ready");
	}
	return this;
};

/**
 * @function StateMachine.message
 * @param {string} msg
 * @returns {?} whatever the onMessage handler returns, it should be a promise
 */
StateMachine.prototype.message = function(msg) {
	return this.states[ this._currentState ].onMessage( msg );
};

module.exports = StateMachine;