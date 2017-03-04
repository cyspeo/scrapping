var fs = require("fs");
var cheerio = require('cheerio')


if (process.argv.length !== 4) {
  console.log('args = ' + process.argv);
  console.log('Usage : node crawlCote.js <date> <course>');
  process.exit(1);
} 

var url = "./"+process.argv[2]+"/pages/"+process.argv[3]+".html";
var output = "./"+process.argv[2]+"/data/"+process.argv[3]+".json";
//console.log("outout="+output);
var file = fs.readFileSync(url, 'utf8');
var $ = cheerio.load(file)

/**
* Debut crawl
*/


var course = {};
//jour.log = $("a.timeline-course-link").first().text();
var termine = ($("#infos-arrivee>.infos-arrivee-content").length);
var offset = 0;
if (termine) {
    offset = 1;
}
course.chevaux = [];
var titreDate = $("h2.course-title").text();
var i = titreDate.indexOf("-");
course.heure = titreDate.substr(i+1,6).replace("h",":");
            
$("tbody tr.ligne-participant").each(function (index, obj) {

    var cheval = {};
    $(this).find("td").each(function (ind, obj) {
      if (ind === (0 + offset)) {
      		cheval.numero = $(this).find("strong").text();
      } else if (ind === (1+offset)) {
      		cheval.nom = $(this).find("span.name").attr("title").substring(17);	
	    }
    });
    $(this).find("td.rapport-probable").each(function (i, o) {
        cheval.cote = parseFloat($(this).text().replace(",","."));
    })
    if ($(this).hasClass("non-partant")) {
        cheval.participation = false;
    } else {
        cheval.participation = true;
        $(this).find("td").each(function (ind1, obj) {
          if (ind1 === (9+offset)) {
            			    cheval.musique=$(this).find("span").attr("title");
          }
        })
    }
    //console.log("cote="+JSON.stringify($(this).find("td.rapport-probable")));


    course.chevaux.push(cheval);
});
//console.log("course="+JSON.stringify(course));
fs.writeFileSync(output, JSON.stringify(course),'utf8');
//console.log("crawlCote exit fine!")

