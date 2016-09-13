var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');


//var START_URL = "http://www.ufcespanol.com/fighter";
var START_URL = "http://www.tvynovelas.com/mx";
var MAX_PAGES_TO_VISIT = 10;

var pageVisited = {}
var numPagesVisited = 0;
var pagesToVisit = [];

var url = new URL(START_URL);

var base_url = url.protocol + "//" + url.hostname;

pagesToVisit.push(base_url);

crawl();

function crawl(){
	if(numPagesVisited >= MAX_PAGES_TO_VISIT){
		console.log("Reached max limit of number of pages to visit");
		return;
	}

	var nextPage = pagesToVisit.pop();

	if(nextPage in pageVisited){
		crawl();
	}else {
		visitPage(nextPage, crawl);
	}
}

function visitPage(url, callback){
	//ADD Page to the set
	pageVisited[url] = true;

	numPagesVisited++;

	console.log("-----PAGES VISITED-------" + numPagesVisited);

	console.log("Visiting page " + url);

	request(url,function(error, response, body){

		if(error){
			console.log("Error: " + error);
		}

		//Check for status code (200 HTTP OK)
		console.log("Status code:" +  response.statusCode);

		if(response.statusCode !== 200){
			callback();
			return
		}

		//Parse the document body
			var $ = cheerio.load(body);


			console.log("Page title " + $('title').text());

			collectInternalLinks($);
			callback();

	});

}
/********

****/

//Search for word
function searchForWord($, word){
	var bodyText = $('body').text();

	if(bodyText.toLowerCase().indexOf(word.toLowerCase()) != -1){
		return true;
	}

	return false;
}

function collectInternalLinks($){
	var allRelativeLinks = [];
	var allAbsoluteLinks = [];

	var relativeLinks = $("a[href^='/']");
	relativeLinks.each(function(){
		allRelativeLinks.push($(this).attr('href'));
		pagesToVisit.push(base_url + $(this).attr('href'));
	});

	var absoluteLinks = $("a[href^='http']");

	absoluteLinks.each(function(){
		allAbsoluteLinks.push($(this).attr('href'));
		
	});

	console.log("Found " + allRelativeLinks.length + " relativeLinks");
	console.log("Found " + allAbsoluteLinks.length + " absoluteLinks");
}