
var page = require('webpage').create();
var fs = require('fs');
var system = require('system');
var args = system.args;

if (args.length !== 3) {
  console.log('args = ' + args);
  console.log('Usage : phantomjs getPage.js <url> <output file>');
  phantom.exit();
}

var url = args[1];
var path = args[2];

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};


page.open(url, function(status) {
  //console.log("Status: " + status);
});


setTimeout(function() {
	//console.log("Start check visibility ");
	var getPage = (function() {
		//console.log("getPage ");
    	var html = page.evaluate(function () {
         	return document.getElementsByTagName('html')[0].outerHTML;
    	});
    	if(html) {
    		//page.render('screenshot.jpeg');
        	//console.log(html);
        	fs.write(path, html, 'w');
    	}
    	console.log("getPage exit fine!")
    	phantom.exit();
	});
	
	var elem = page.evaluate(function() {
		return document.getElementsByClassName('hippodrome-libelle');	
	});	
	if (elem) {
		//console.log(" elem ok "+ elem);
		getPage();
	} else {
		console.log(" elem ko ");
		phantom.exit(0);
	}
},10000);

