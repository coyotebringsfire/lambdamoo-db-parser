"use strict";
var Q 	= require('q'),
	fs 	= require('fs');

module.exports 	= {
	db2json: function converttoJson(file) {
		var conversionPromise = Q.defer();

		if( file instanceof String ) {
			fs.readFile(file, function inputFileRead(err, data) {
				if( err ) {
					conversionPromise.reject(err);
				} else {
					// if an error happens while processing the file, reject the promise
					conversionPromise.resolve(data);
				}
			});
			return conversionPromise.promise;
		} else {
			return null;
		}
	},
	json2db: function convertToDb() {}
};
