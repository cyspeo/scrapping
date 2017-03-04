
var database = require('../lib/daoMongoDb.js');


// Initialize connection
database.connect(function() {
	var objNew = { name: "GLaDOS", game: "Portal" };  
    database.saveCourse(objNew); 
});

