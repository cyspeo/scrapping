var Datastore = require('nedb')
, fs = require("fs");



if (process.argv.length !== 4) {
  console.log('process.argv = ' + process.argv);
  console.log('Usage : node insertDB.js <input_json> <db name>');

} else {
  process.argv.forEach(function(arg, i) {
    console.log(i + ': ' + arg);
  });
}

var dbName = process.argv[3];

var doc = require(process.argv[2]);
var db = new Datastore({ filename: dbName, autoload: true });
  
//var doc = fs.readFileSync(__dirname+ "/"+inputfile,'utf8');
db.insert(doc, function (err, newDoc) {   
	console.log("doc inserted");
});