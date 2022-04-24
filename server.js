var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var database = require("./model/database")
var fs = require('fs');
var rimraf = require('rimraf')
var bodyParser = require('body-parser')

// Declare server
var server = express();

// Init database and conncet
var File = require("./model/fileSchema");
mongoose.connect(database.URL);

// Uploaded files are stored in this folder
server.use("/file_storage", express.static(path.resolve(__dirname,"file_storage")));
  
// Server runs on localhost:3000
server.set("port", process.env.PORT || 3000);

// Init server variables for views, engine, html
server.set("views", path.join(__dirname,"view"));
server.engine('html', require('ejs').renderFile);
server.set('view engine', 'html');
server.set(express.urlencoded({extended: true}));
server.use("/static", express.static(path.resolve(__dirname,"static")));
server.use(bodyParser.json());
  
// Router module will control the get and post requests
var router = require("./router")
server.use(router)

// Server listener with old file deletion
server.listen(server.get("port"), function(){
    console.log("Server started on port " + server.get("port"))

    //Server deletes files older than hour
    var date_threshold = new Date(Date.now());
    date_threshold.setMinutes(date_threshold.getMinutes() - 1);
    var repeat_time = 60000;        // how often will the system delete files (in miliseconds)
    var age_threshold = 60;          // how old files will be deleted (in minutes)
    var uploadsDir = __dirname + '/file_storage';

    setInterval(function(){
        var date_threshold = new Date(Date.now());
        date_threshold.setMinutes(date_threshold.getMinutes() - age_threshold); 

        // Delete from database
        File.deleteMany({uploadDate: {$lte: date_threshold}}, function(err,match){})

        // Delete from filesystem
        fs.readdir(uploadsDir, function(err, files) {
          files.forEach(function(file, index) {
            fs.stat(path.join(uploadsDir, file), function(err, stat) {
              if (err) {return console.error(err);}
              var fileTime = new Date(stat.ctime).getTime();
              if (date_threshold > fileTime) {
                return rimraf(path.join(uploadsDir, file), function(err) {
                  if (err) {return console.error(err);
                  }});}});});});
        console.log("Deleting files older than "  + date_threshold);
      }, repeat_time);
});