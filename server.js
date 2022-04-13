var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var database = require("./model/database")
var bodyParser = require("body-parser");

var server = express();
mongoose.connect(database.URL);
  
server.set("port", process.env.PORT || 3000);
server.set("views", path.join(__dirname,"view"));
server.set("view engine", "ejs")

var router = require("./router")
server.use(router)
server.use("/file_storage", express.static(path.resolve(__dirname,"file_storage")));
server.use(bodyParser.urlencoded({extended:false}));

server.listen(server.get("port"), function(){
    console.log("Server started on port " + server.get("port"))
});