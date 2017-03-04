var Datastore = require('nedb')
, fs = require("fs");



if (process.argv.length !== 4) {
  console.log('process.argv = ' + process.argv);
  console.log('Usage : node update.js <jour> <course> ');
  process.exit(1);
} 

var dbName = "../storage/courses";
//console.log("fichier cote = " + process.argv[2]);
//var cote = require(process.argv[2]);
//console.log("cote=" + JSON.stringify(cote));
var nom=process.argv[3];
var jour = process.argv[2]


var db = new Datastore({ filename: dbName, autoload: true });
var dbnew = new Datastore({ filename: '../storage/courses.new', autoload: true });
//console.log("nom="+nom+"  jour="+jour);  
db.find({date:jour}).sort({ nom: 1 }).exec(function (err, course) {
  if (err) {
  	console.log("ERROR on find" + err);
  	process.exit(1);
  }
  console.log("nb course " + course.length);
  for (var i=0;i<course.length;i++) {
  	    dbnew.insert(course[i],function (err, doc) {
  	    	
  	    });
  }
});


