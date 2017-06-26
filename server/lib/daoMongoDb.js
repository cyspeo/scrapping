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

exports.close = function() {
	db.close();
}

/**
 * Lecture du doc reunion pou rl adate donnee.
 * @param {string JJMMAA} date, Date d ela réunion.
 * @callback {fn} callback, fonction appelé pour le retour.
 * 
 **/ 
exports.findJournee = function(date, callback) {
	var dt = new Date(date.substr(4,4),(parseInt(date.substr(2,2))-1),date.substr(0,2));
	//console.log("findJournee dt = "+ date.substr(4,4) +"-" + (parseInt(date.substr(2,2))-1) +"-" +date.substr(0,2) + " date  " + dt);
	db.collection('journee').find({date:dt}).toArray( function(err, docs) {
		if (err) throw err;
		callback(docs);
	});
}

/**
 * Sauvegarde l'objet journee
 * @param objet journee
 **/ 
exports.saveJournee = function(journee, callback){
  // this is using the same db connection
  db.collection('journee').save(journee,{w: 1}, function(err) {
  	if (err) throw err;
  	//console.log("collection journee mise à jour");
  	callback();
  });
};


/**
 * Recherche une course par sa date et son nom
 **/ 
exports.findCourse = function(date, nom, callback) {
	var dt = new Date(date.substr(4,4),(parseInt(date.substr(2,2))-1),date.substr(0,2));
	db.collection('course').find({date:dt,nom:nom}).toArray(function(err,docs) {
		if (err) throw err;
		callback(docs);
	});
}

/**
 * Sauvegarde un objet  course
 **/ 
exports.saveCourse = function(course, callback){
  // this is using the same db connection
  db.collection('course').save(course,{w: 1}, function (err) {
    	if (err) throw err;
    	callback();
	});
};




