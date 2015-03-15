var Crawler = require("crawler");
var url = require('url');
var http = require('http');
var fs = require('fs');
var mkdirp = require('mkdirp');

title = '';

var c = new Crawler({
  maxConnections : 10,
  // This will be called for each crawled page
  jQuery: 'cheerio',
  callback : function (error, result, $) {
    // $ is Cheerio by default
    //a lean implementation of core jQuery designed specifically for the server
    $('a.mp3_download_link').each(function(index, a) {
      var downloadLink = $(a).attr('href');
      var file = fs.createWriteStream("./downloads/"+title+"/"+downloadLink.split("/").pop());
      var request = http.get(downloadLink, function(response) {
        response.pipe(file);
        console.log("[DONE]", $('title').text());
      });
    });
  }
});

if (process.argv.length < 3) {
  console.log('Usage: node main.js ddab01a43208');
  process.exit(1);
}

// Queue just one URL, with default callback
c.queue([{
  uri: 'http://www.radiojavan.com/playlists/playlist/mp3/'+process.argv[2],
  jQuery: 'cheerio',
  // The global callback won't be called
  callback: function (error, result, $) {
    title = $('title').text().replace("'","").trim();
    mkdirp("./downloads/"+title,function(error){
      playlist = $('#playlist');
      songs = playlist.find('.simple_table tr td:first-child a');
      songs.each(function(index, a){
        if(index % 3 === 0){
          var song = "http://www.radiojavan.com"+$(a).attr('href');
          c.queue(song);
        }
      });
      console.log(title);
    });
  }
}]);
