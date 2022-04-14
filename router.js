var express = require("express");
var path = require("path");
var multer = require("multer");
var crypto = require("crypto");

var File = require("./model/fileSchema");

var router = express.Router();

var file_storage = multer.diskStorage({
    destination:"file_storage",
    filename: function (req, file, cb) {
        cb(null, Date.now() + "--" + file.originalname);
    }
});
 
var upload = multer({storage:file_storage});

router.get("/",function(req,res){
    res.render("main_screen");
});

router.post("/upload", upload.single("shared_file") ,function(req,res,next){
    var filename = req.file.filename;
    var downloadURL = "download/" + crypto.pseudoRandomBytes(20).toString("hex")
    var manageURL = "manage/" + crypto.pseudoRandomBytes(20).toString("hex")

    console.log(filename)
    console.log(downloadURL)
    console.log(manageURL)

    var newFile = new File({
        filename:filename,
        downloadURL:downloadURL,
        manageURL:manageURL
    });

    newFile.save(next);
    /*res.render("main_screen")
    res.body.durl = downloadURL;
    res.body.murl = manageURL;*/
});

router.post("/download",function(req,res){
    res.render("download_screen")
});

router.post("/manage",function(req,res){
    res.render("manage_screen")
});


module.exports = router;