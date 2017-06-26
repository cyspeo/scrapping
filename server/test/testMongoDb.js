
//var database = require('../lib/daoMongoDb.js');


// Initialize connection
/*
database.connect(function() {
	var objNew = { name: "GLaDOS", game: "Portal" };  
    database.saveCourse(objNew); 
});
*/


var scrap = require('../lib/scrap.js');
var database = require('../lib/daoMongoDb.js');
//scrap.scrapJournee('../../moteur/01032017/pages/01032017.html','01032017');

scrap.scrapCourse('../../moteur/01032017/pages/R1C1.html','01032017','R1C1');

/*
database.connect(function () {
        database.findCourse("01032017", "R1C1", function (docs) {
        	console.log("course="+JSON.stringify(docs[0]));
        });
});*/