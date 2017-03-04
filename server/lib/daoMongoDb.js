var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost/turf';
var db;

exports.connect = function(callback) {
  MongoClient.connect(mongoUrl, function(err, database) {
    if( err ) throw err;
    db = database;
    callback();
  });
};

exports.saveCourse = function(course, callback){
  // this is using the same db connection
  db.collection('courses').save(course,null , function (error, results) {
    	if (error) throw error;
    	console.log("Le document course a bien été inséré");    
    	callback(result);
	});
};



exports.saveReunion = function(course, callback){
  // this is using the same db connection
  db.collection('courses').save(course,null , function (error, results) {
    	if (error) throw error;
    	console.log("Le document course a bien été inséré");    
    	callback(result);
	});
};

