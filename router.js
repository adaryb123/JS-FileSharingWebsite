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
const { ok } = require("assert");

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
    req.uniqName = uniquestr;
    next();
}

// Upload file handler. Listen for upload post.
router.post("/upload", insertFile, upload.single("inputFile"), (req, res) => {
    try {
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
        urls = {download: downloadURL,
                manage: manageURL }
        res.send(urls);

    } catch (err) {
        console.log(err);
    }

    
})

router.post("/updateDownloads", async (req, res) => {
    var URL = hostUrl + "download/" + req.body.fileURL
    try{
        await File.findOneAndUpdate({downloadURL: URL}, {$inc : {downloadCount : 1}});
    } catch (err) {
        console.log(err);
    }
    res.sendStatus(201);
})

router.post("/updateURL", async(req,res) => {
    var manageURL = hostUrl + "manage/" + req.body.fileURL
    uniquestr = crypto.pseudoRandomBytes(16).toString("hex");
    var newURL = hostUrl + "download/" + uniquestr
    try{
        await File.findOneAndUpdate({manageURL: manageURL}, {downloadURL : newURL});
    } catch (err) {
        console.log(err);
    }
    res.send({URL: newURL})
})

router.get("/getFile/:fileKey", async (req, res) => {
    var fileKey = req.params.fileKey;
    var data = await File.findOne({downloadURL: hostUrl + "download/" + fileKey})
    var absPath = __dirname+'\\file_storage\\' + data.fileName;

    res.download(absPath,data.originalName);
});

router.get("/getFileInManage/:fileKey", async (req, res) => {
    var fileKey = req.params.fileKey;
    var data = await File.findOne({manageURL: hostUrl + "manage/" + fileKey})
    var absPath = __dirname+'\\file_storage\\' + data.fileName;

    res.download(absPath,data.originalName);
});

router.get("/download/:fileKey", (req, res) => {
    var fileKey = req.params.fileKey;
    res.render("download_screen",{fileLink: fileKey})
});

router.get("/manage/:fileKey", async (req, res) => {
    var fileKey = req.params.fileKey;
    var data = await File.findOne({manageURL: hostUrl + "manage/" + fileKey})
    res.render("manage_screen",{fileLink: fileKey, upload_date: data.uploadDate, times_downloaded: data.downloadCount, download_url: data.downloadURL})
});


module.exports = router;