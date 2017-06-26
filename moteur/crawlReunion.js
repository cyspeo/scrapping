var scrap = require('../server/lib/scrap.js');
var database = require('../server/lib/daoMongoDb.js');
if (process.argv.length !== 3) {
  console.log('args = ' + process.argv);
  console.log('Usage : node crawlJournee.js <date>');
  process.exit(1);
}
var date = process.argv[2];
scrap.scrapJournee('./'+date+'/pages/'+date+'.html','01032017');
database.connect(function () {
        database.findJournee(date, function (docs) {
        	if (docs.length > 0) {
        		console.log(JSON.stringify(docs[0]));
        	} else {
        		console.log("journee non trouve en base !");
        	}
        	console.log("Done")
        });
});
