
/*SEE IF YOU CAN BRING JSHINT INTO THIS SOMEHOW*/

/*
instantiate casper obj via the Casper module
although .require() looks like Node this is actually a Casper method
*/
var casper = require('casper').create();

//this is Phantom's module for accessing local file system
var fs = require('fs');

/* can reset user agent thus
var casper = require('casper').create({
	pageSettings: {
		userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
	}	
});
*/

//using Colorizer module implicitly
casper.echo('starting up...', 'WARN_BAR');

/*
.start() proceeds to callback after page load
callback operates in page context, returns to script context
*/
casper.start('https://www.google.com/', function(){

	//'this' refers to the casper object
	this.capture('./output/test.png');

	//can pass arguments from script context to .evaluate()
	var title = this.evaluate(function(){
		return document.title;
	});

	var userAgent = this.evaluate(function(){
		return window.navigator.userAgent;
	});

	//'foo' is in script context and wouldn't be visible within .evaluate
	var foo; 


	casper.echo("page title: " + title, 'GREEN_BAR');
	casper.echo("user agent: " + userAgent, 'GREEN_BAR');
	casper.echo("casper provides native methods to find the title (like " + this.getTitle() + ") and the URL " + this.getCurrentUrl(), 'RED_BAR');

	this.fill('form', {q:'philadelphia weather'}, true);
});

casper.wait(2000, function(){
	this.capture('./output/weatherReport.png');
});

/*
data need to be in global scope 
so it can be 'filled up' by the .wait() callback
*/
var data; 

casper.wait(2000, function(){
	data = this.evaluate(function(){
		
		var targetEl = document.querySelectorAll('.g h3 a');
		var data = [];
		for (var index = 0; index < targetEl.length; index++){
			var currentEl = targetEl[index];
			var currentLink = currentEl.getAttribute('href');
			var currentTitle = currentEl.text;
			var currentItem = {
				'link': currentLink, 
				'title': currentTitle, 
			};
			data.push(currentItem);
		}
		return data;

	});

	//console.log(JSON.stringify(data));
});

// .then() another approach here
casper.thenOpen('https://news.ycombinator.com/news', function(){
	this.capture('./output/test1.png');
});



/*
.run() begins the execution of the event queue at .start()
.run() calls .exit() implicitly
Phantom scripts won't stop executing unless explicitly told to do so
if you pass .run() a callback you also need to call .exit() explicitly 
*/

casper.run(function(){
	fs.write('./output/output.JSON', JSON.stringify(data, null, '\t'));
	this.exit();
});