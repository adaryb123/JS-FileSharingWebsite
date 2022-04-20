var express = require("express");
var path = require("path");
var multer = require("multer");
var crypto = require("crypto");

var fs = require('fs');
var mime = require('mime');

var hostUrl = "http://localhost:3000/";

// File scheme
var File = require("./model/fileSchema");
const { runInNewContext } = require("vm");
const req = require("express/lib/request");

// Get express router
var router = express.Router();

// Init file storage
var file_storage = multer.diskStorage({
    destination:"file_storage",
    filename: function (req, file, cb) {
        cb(null, req.uniqName + "--" + file.originalname);
        req.storedFileName = req.uniqName + "--" + file.originalname;
    }
    
});

var upload = multer({storage:file_storage});


router.get("/",function(req,res){
    res.render("main_screen");
});


function insertFile(req, res, next){
    uniquestr = crypto.pseudoRandomBytes(16).toString("hex");
    console.log(uniquestr)
    req.uniqName = uniquestr;
    next();
}

// Upload file handler. Listen for upload post.
router.post("/upload", insertFile, upload.single("inputFile"), (req, res) => {
    try {
        console.log('Started database saving');
        var uniqueName = req.storedFileName;

        console.log("Stored file: " + uniqueName);
        var downloadURL = hostUrl + "download/" + crypto.pseudoRandomBytes(16).toString("hex");
        var manageURL = hostUrl + "manage/" + crypto.pseudoRandomBytes(16).toString("hex");
        var originalName = req.file.originalname;

        var newFile = new File({
            fileName: uniqueName,
            downloadURL: downloadURL,
            manageURL: manageURL,
            originalName: originalName
        });
    
        newFile.save();
        console.log('Finished database saving');
        urls = {down: downloadURL,
                mana: manageURL }
        res.send(urls);

    } catch (err) {
        console.log(err);
    }

    
})


router.post("/getfile", (req, res) => {
    var fileKey = "req.fileLink;"
    console.log(req.body);
    File.findOne({downloadURL: hostUrl + "download/" + fileKey}, (err,data) =>{
        if(err)
            console.log(err);
        else
            console.log(data);
            var absPath = __dirname+'\\file_storage\\' + data.fileName;

            res.download(absPath,data.originalName);
    })
});

router.get("/getfile/:fileKey", async (req, res) => {
    console.log("Get");
    var fileKey = req.params.fileKey;
    console.log(hostUrl + "download/" + fileKey);
    var data = await File.findOne({downloadURL: hostUrl + "download/" + fileKey})
    console.log(data);
    var absPath = __dirname+'\\file_storage\\' + data.fileName;

    res.download(absPath,data.originalName);
});


router.get("/download/:fileKey?", (req, res) => {
    var fileKey = req.params.fileKey;
    res.render("download_screen",{fileLink: fileKey})

});


router.get("/manage",function(req,res){
    res.render("manage_screen")
});

module.exports = router;