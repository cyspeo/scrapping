var fs = require("fs");
var cheerio = require('cheerio')


if (args.length !== 3) {
  console.log('args = ' + args);
  console.log('Usage : phantomjs crawlCote.js <date> <course>');
  phantom.exit();
} else {
  args.forEach(function(arg, i) {
    console.log(i + ': ' + arg);
  });
}

var url = "./"+args[1]+"/pages/"+args[2]+".html";
var output = "./"+args[1]+"/data/"+args[2]+".json";


var file = fs.readFileSync(url, 'utf8');
var $ = cheerio.load(file)


var course = {};
//jour.log = $("a.timeline-course-link").first().text();
var termine = ($("#infos-arrivee>.infos-arrivee-content").length);
var offset = 0;
if (termine) {
    offset = 1;
}
course.chevaux = [];

$("tbody tr.ligne-participant").each(function (index, obj) {

    var cheval = {};
    if ($(this).hasClass("non-partant")) {
        cheval.participation = false;
        $(this).find("td").each(function (index, obj) {
            if (index === (0 + offset)) {
            				cheval.numero = $(this).find("strong").text();
            }
        });
    } else {
        cheval.participation = true;
        $(this).find("td").each(function (index, obj) {
            if (index === (0 + offset)) {
            				cheval.numero = $(this).find("strong").text();
            }
        })
    }
    //console.log("cote="+JSON.stringify($(this).find("td.rapport-probable")));
    $(this).find("td.rapport-probable").each(function (i, o) {
        cheval.cote = $(this).text();
    })

    course.chevaux.push(cheval);
});
//console.log("course="+JSON.stringify(course));
fs.write(output, JSON.stringify(course), 'w');
console.log("getCote exit fine!")

