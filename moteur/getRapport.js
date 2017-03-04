
var page = require('webpage').create();
var fs = require('fs');
var system = require('system');
var args = system.args;
console.log("");
console.log("");
console.log("*** getPage ***");

if (args.length !== 3) {
  console.log('args = ' + args);
  console.log('Usage : phantomjs getPage.js <url> <output file>');
  phantom.exit();
} else {
  args.forEach(function(arg, i) {
    console.log(i + ': ' + arg);
  });
}

var url = args[1];
var path = args[2];
var pageCourse = false;
if (url.indexOf("/R")) {
	pageCourse = true;
}

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
  console.log("Status: " + status);
  	
});


setTimeout(function() {
	console.log("Start check visibility ");
	var getPage = (function() {
		console.log("getPage ");

    	var done = page.evaluate(function () {
    		if (document.querySelector(".rapports-probables")) {
    		
			  document.querySelector(".rapports-probables").click();
			  return true;
			} 
			return false;
    	});
    	if (done) {
    		waitFor(
    			page,
    			"rapports-probables-table", // wait for this object to appear
    			(new Date()).getTime() + 5000, // timeout at 5 seconds from now
    			function () {
    				var html = page.evaluate(function () {
    						return document.getElementsByTagName('html')[0].outerHTML;
    				});
    				if(html) {
    				//page.render('screenshot.jpeg');
        			//console.log(html);
        				fs.write(path, html, 'w');
    				}
    				console.log("getPage exit fine!")
    			}
    		);
		} else {
			console.log("rapports probabla not clicked");
		}
		

    	//phantom.exit();
	});
	
	console.log("working dir="+fs.workingDirectory);
	//page.includeJs("file://"+fs.workingDirectory+"/lib/jquery.min.js", function() {
		console.log("jquery injected ");
		var elem = page.evaluate(function() {
			return document.getElementsByClassName('hippodrome-libelle');	
		});	
		if (elem) {
			console.log(" elem ok "+ elem);
			getPage();
		} else {
			console.log(" elem ko ");
			//phantom.exit(0);
		}
},10000);

setTimeout(function() {
	page.render('screenshot.jpeg');
	var html = page.evaluate(function() {
		return document.getElementsByTagName('html')[0].outerHTML;	
	});	
	if(html) {
    		//page.render('screenshot.jpeg');
        	//console.log(html);
        	fs.write(path, html, 'w');
   	}
   	phantom.exit();
},13000);


function waitFor( page, selector, expiry, callback ) {
    //system.stderr.writeLine( "- waitFor( " + selector + ", " + expiry + " )" );
 
    // try and fetch the desired element from the page
    var result = page.evaluate(
        function (selector) {
            return document.querySelector( selector );
        }, selector
    );
 
    // if desired element found then call callback after 50ms
    if ( result ) {
        //system.stderr.writeLine( "- trigger " + selector + " found" );
        window.setTimeout(
            function () {
                callback( true );
            },
            50
        );
        return;
    }
 
    // determine whether timeout is triggered
    var finish = (new Date()).getTime();
    if ( finish > expiry ) {
        system.stderr.writeLine( "- timed out" );
        callback( false );
        return;
    }
 
    // haven't timed out, haven't found object, so poll in another 100ms
    window.setTimeout(
        function () {
            waitFor( page, selector, expiry, callback );
        },
        100
    );
}
