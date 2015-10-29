"use strict";
var Q 				= require('q'),
	fs 				= require('fs'),
	async 			= require('async'),
	StateMachine 	= require('./StateMachine'),
	bunyan 			= require('bunyan'),
	logfile 		= "logs/parse.bnyn";

var log = bunyan.createLogger({
	src: true,
    name: 'db2json',
    streams: [
        {
            level: 'info',
            path: logfile            // log INFO and above to file
        }
    ]
});

var types = {
    "TYPE_INT":0, "TYPE_OBJ":1, "_TYPE_STR":2, "TYPE_ERR":3, "_TYPE_LIST":4, /* user-visible */
    "TYPE_CLEAR":5,     /* in clear properties' value slot */
    "TYPE_NONE":6,      /* in uninitialized MOO variables */
    "TYPE_CATCH":7,     /* on-stack marker for an exception handler */
    "TYPE_FINALLY":8,   /* on-stack marker for a TRY-FINALLY clause */
    "_TYPE_FLOAT":9,    /* floating-point number; user-visible */
    "_TYPE_MAP":10,      /* map; user-visible */
    "_TYPE_ITER":11,     /* map iterator; not visible */
    "_TYPE_ANON":12,     /* anonymous object; user-visible */
    /* THE END - complex aliases come next */
    "TYPE_STR": (types._TYPE_STR | types.TYPE_COMPLEX_FLAG),
    "TYPE_FLOAT": (types._TYPE_FLOAT | types.TYPE_COMPLEX_FLAG),
    "TYPE_LIST": (types._TYPE_LIST | types.TYPE_COMPLEX_FLAG),
    "TYPE_MAP": (types._TYPE_MAP | types.TYPE_COMPLEX_FLAG),
    "TYPE_ITER": (types._TYPE_ITER | types.TYPE_COMPLEX_FLAG),
    "TYPE_ANON": (types._TYPE_ANON | types.TYPE_COMPLEX_FLAG)
};

module.exports 	= {
	db2json: function converttoJson(file) {
		log.info({file:file}, "db2json called");
		var conversionPromise 	= Q.defer(),
			states 				= [{
				name: "INTROBLOCK",
				onMessage: function(line) {
					log.info( { line: line }, "processing message");
					if( !this.world ) {
						log.info("adding world");
						this.world = {
							version: Number.parseInt(line.match(/\*\* LambdaMOO Database, Format Version ([^\s]+) \*\*/)[1]),
							intro: {}
						};
					} else if( !this.world.intro.total_number_of_objects ) {
						log.info( { objects: line }, "adding total_number_of_objects");
						this.world.intro.total_number_of_objects = Number.parseInt(line);
					} else if( !this.world.intro.number_of_verbs ) {
						log.info( { verbs: line }, "adding number_of_verbs");
						this.world.intro.number_of_verbs = Number.parseInt(line);
					} else if( this.world.intro.uninteresting_number === undefined ) {
						log.info({ players: line },"adding uninteresting number");
						this.world.intro.uninteresting_number = Number.parseInt(line);
					} else if( !this.world.intro.number_of_players ) {
						log.info({ players: line },"adding number_of_players");
						this.world.intro.number_of_players = Number.parseInt(line);
						state.setState("PLAYERBLOCK");
					}
				}
			},{
				name: "PLAYERBLOCK",
				onMessage: function(line) {
					log.info( { line: line }, "processing message");
					if( !this.world.players ) {
						log.info( { line: line }, "processing message");
						if( this.world.intro.number_of_players === 0 ) {
							log.info("no players to add");
							state.nextState().message(line);
						} else {
							log.info("adding players");
							this.world.players = [];						
						}
	
					} else {
						log.info({ player:line }, "adding player");
						this.world.players.push( line );
						if( this.world.players.length === this.world.intro.number_of_players ) {
							state.setState("OBJECTBLOCK");
						}					
					}
				}
			},{
				name: "OBJECTBLOCK",
				onMessage: function(line) {
					var match;
					log.info( { line: line }, "processing message");
					if( !this.world.objects ) {
						this.world.objects = [];
						match = line.match(/(#[0-9]+) (recycled){0,1}/);
						if( match ) {
							this.world.objects.push({
								id: match[1],
								recycled: match[2]
							});
							this.last_object_index = this.world.objects.length-1;
						}
					} else if( this.world.objects[ this.last_object_index ].recycled ) {
						match = line.match(/#([0-9]+) (recycled){0,1}/);
						if( match ) {
							this.world.objects.push({
								id: match[1],
								recycled: match[2]
							});
							this.last_object_index = this.world.objects.length-1;
						}
					} else if( !this.world.objects[ this.last_object_index ].name ) {
						this.world.objects[ this.last_object_index ].name = line;
					} else if( !this.world.objects[ this.last_object_index ].unused_line ) {
						this.world.objects[ this.last_object_index ].unused_line = line;
					} else if( !this.world.objects[ this.last_object_index ].flags ) {
						this.world.objects[ this.last_object_index ].flags = Number.parseInt(line);
					} else if( !this.world.objects[ this.last_object_index ].owner ) {
						this.world.objects[ this.last_object_index ].owner = line;
					} else if( !this.world.objects[ this.last_object_index ].location ) {
						this.world.objects[ this.last_object_index ].location = line
					} else if( !this.world.objects[ this.last_object_index ].firstContent ) {
						this.world.objects[ this.last_object_index ].firstContent = line;
					} else if( !this.world.objects[ this.last_object_index ].nextLocationNeighbor ) {
						this.world.objects[ this.last_object_index ].nextLocationNeighbor = line;
					} else if( !this.world.objects[ this.last_object_index ].parent ) {
						this.world.objects[ this.last_object_index ].parent = line;
					} else if( !this.world.objects[ this.last_object_index ].firstChild ) {
						this.world.objects[ this.last_object_index ].firstChild = line;
					} else if( !this.world.objects[ this.last_object_index ].nextSibling ) {
						this.world.objects[ this.last_object_index ].nextSibling = line;
					} else {
						state.setState("VERBBLOCK").onMessage(line);
					}
				}
			},{
				name: "VERBBLOCK",
				onMessage: function(line) {
					if( !this.world.objects[ this.last_object_index ].number_of_verbs ) {
						this.world.objects[ this.last_object_index ].number_of_verbs = Number.parseInt(line);
						if( this.world.objects[ this.last_object_index ].number_of_verbs > 0 ) {
							this.world.objects[ this.last_object_index ].verbs = [{}];
							this.last_verb_index = 0;
						}
					} else if( this.world.objects[ this.last_object_index ].verbs && !this.world.objects[ this.last_object_index ].verbs[ this.last_verb_index ].name ) {
						this.world.objects[ this.last_object_index ].verbs[ this.last_verb_index ].name = line;
					} else if( this.world.objects[ this.last_object_index ].verbs && !this.world.objects[ this.last_object_index ].verbs[ this.last_verb_index ].owner ) {
						this.world.objects[ this.last_object_index ].verbs[ this.last_verb_index ].owner = line;
					} else if( this.world.objects[ this.last_object_index ].verbs && !this.world.objects[ this.last_object_index ].verbs[ this.last_verb_index ].permissions ) {
						this.world.objects[ this.last_object_index ].verbs[ this.last_verb_index ].permissions = line;
					} else {
						state.setState("PROPERTIESBLOCK").onMessage(line);
					}
				}
			},{
				name: "PROPERTIESBLOCK",
				onMessage: function(line) {
					if( this.world.objects[ this.last_object_index ].verbs && !this.world.objects[ this.last_object_index ].verbs[ this.last_verb_index ].argument_preposition_code ) {
						this.world.objects[ this.last_object_index ].verbs[ this.last_verb_index ].argument_preposition_code = line;
						if( this.world.objects[ this.last_object_index ].verbs.length === this.world.objects[ this.last_object_index ].number_of_verbs ) {
							this.world.objects[ this.last_object_index ].properties = [];
						} else {
							this.world.objects[ this.last_object_index ].verbs.push({});
						}
						this.last_verb_index++;
					} else if( this.world.objects[ this.last_object_index ].properties && !this.world.objects[ this.last_object_index ].num_properties ) {
						this.world.objects[ this.last_object_index ].num_properties = line;
					} else if( this.world.objects[ this.last_object_index ].num_properties && this.world.objects[ this.last_object_index ].properties.length < this.world.objects[ this.last_object_index ].num_properties ) {
						this.world.objects[ this.last_object_index ].properties.push(line);
					} else {
						state.setState("PROPERTYVALUESBLOCK").onMessage(line);
					} 
				}
			}, {
				name: "PROPERTYVALUESBLOCK",
				onMessage: function(line) {
					if( !this.num_property_values ) {
						this.num_property_values = line;
						if( this.num_property_values > 0 ) {
							this.world.objects[ this.last_object_index ].property_values = [{}];
							this.current_property_index = 0;
						} else {
							if( this.world.objects.length < this.world.intro.total_number_of_objects ) {
								this.world.objects.push({});
								this.last_object_index++;
								state.setState("OBJECTBLOCK").onMessage(line);
							} else {
								state.setState("VERBCODEBLOCK").onMessage(line);
							}
						}
					} else if( !this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].datatype ) {
						this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].datatype = Number.parseInt(line);
						if( this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].datatype === types.TYPE_CLEAR ) {
							if( this.num_property_values > this.world.objects[ this.last_object_index ].property_values ) {
								this.world.objects[ this.last_object_index ].property_values.push({});
								this.current_property_index++;
							}
						//	"TYPE_INT":0, "TYPE_OBJ":1, "_TYPE_STR":2, "TYPE_ERR":3, "_TYPE_LIST":4,
						} else if( this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].datatype === types.TYPE_INT || this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].datatype === types.TYPE_OBJ || this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].datatype === types._TYPE_STR ) {
							this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].value = line;
						} else if( this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].datatype === types._TYPELIST ) {
							this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].list = [{}];
							this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].num_list_items = line;
						}
					} else if( this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].datatype === types._TYPELIST &&  this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].list.length < this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].num_list_items ) {
						this.world.objects[ this.last_object_index ].property_values[ this.current_property_index ].list.push()
					} else if( this.world.objects[ this.last_object_index ].properties.length === this.world.objects[ this.last_object_index ].num_properties ) {
						if( this.world.objects.length < this.world.intro.total_number_of_objects ) {
							this.world.objects.push({});
							this.last_object_index++;
							state.setState("OBJECTBLOCK").onMessage(line);
						} else {
							state.setState("VERBCODEBLOCK").onMessage(line);
						}
					}
				}
			},{
				name: "VERBCODEBLOCK",
				onMessage: function(line) {

				}

			},{
				name: "FINALE",
				onMessage: function(line) {
					log.info( { line: line }, "processing message");
				}
			}],
			state 				= new StateMachine( states ),
			stream 				= require('stream'),
			liner 				= new stream.Transform( { objectMode: true } );

		if( typeof(file) === 'string' ) {
			var source;
			liner._transform = function (chunk, encoding, done) {
			    var data = chunk.toString();
			    log.info( { data: data }, "transforming chunk");
			    if (this._lastLineData) { 
			    	data = this._lastLineData + data;
			    }

			    var lines = data.split('\n'); 
			    this._lastLineData = lines.splice(lines.length-1,1)[0]; 

			    lines.forEach(this.push.bind(this)); 
			    done();
			};
			liner._flush = function (done) {
				log.info("flushing stream");
			    if (this._lastLineData) {
			    	this.push(this._lastLineData);
			    }
			    this._lastLineData = null;
			    done();
			};
			setTimeout( function() {
				try {
					source = fs.createReadStream(file);
				} catch(e) {
					return conversionPromise.reject(e);
				}
				
				source.pipe(liner);
				liner.on('readable', function () {
				    var line;
				    async.whilst( function truthTest() {
				    	liner.resume();
				    	if( line !== null ) { 
				    		line = liner.read();
				    	}
				    	liner.pause();
				    	return line;
				    }, function perLine(done) {
				    	log.info( { line:line }, "processing line");
				    	state.getState().onMessage.call( liner, line );
			          	done();
				    });
				});
				liner.on('error', function onLinerError(err) {
					log.error({ error:err }, "error processing lines");
					conversionPromise.reject(err);
				});
				liner.on('end', function onClose() {
					log.info({ world:liner.world }, "all lines processed");
					conversionPromise.resolve(liner.world);
				});
			}, 0);
			return conversionPromise.promise;
		} else {
			return null;
		}
	},
	json2db: function convertToDb() {}
};
