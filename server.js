var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var database = require("./model/database")
var bodyParser = require("body-parser")
var findRemoveSync = require('find-remove');

var File = require("./model/fileSchema");

var server = express();
mongoose.connect(database.URL);
  
server.set("port", process.env.PORT || 3000);
server.set("views", path.join(__dirname,"view"));

// server.set("view engine", "ejs")

server.engine('html', require('ejs').renderFile);
server.set('view engine', 'html');
server.set(express.urlencoded({extended: true}));
server.use("/file_storage", express.static(path.resolve(__dirname,"file_storage")));


server.use(bodyParser.urlencoded({extended:false}));
// server.use(bodyParser.urlencoded({ extended:true, uploadDir: __dirname + "/file_storage" }));
//server.use(bodyParser.json());

server.use("/static", express.static(path.resolve(__dirname,"static")));


var router = require("./router")
server.use(router)

server.listen(server.get("port"), function(){
    console.log("Server started on port " + server.get("port"))
    var date_threshold = new Date(Date.now());
    date_threshold.setMinutes(date_threshold.getMinutes() - 1);
    var repeat_time = 60000;       // how often will the system delete files (in miliseconds)
    var age_threshold = 1;          //how old files will be deleted (in minutes)
    setInterval(function(){
        var date_threshold = new Date(Date.now());
        date_threshold.setMinutes(date_threshold.getMinutes() - age_threshold); 
        setInterval(findRemoveSync.bind(this,__dirname + '/file_storage', {files: "*.*", age: {minutes: age_threshold}}), repeat_time)
        File.deleteMany({uploadDate: {$lte: date_threshold}}, function(err,match){})
        console.log("Deleting files older than "  + date_threshold);
      }, repeat_time);
});