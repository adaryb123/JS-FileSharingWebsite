var express = require("express");
var multer = require("multer");
var crypto = require("crypto");

// initialize some variables
var hostUrl = "http://localhost:3000/";
var File = require("./model/fileSchema");
var router = express.Router();

// initialize file storage
var file_storage = multer.diskStorage({
    destination:"file_storage",
    filename: function (req, file, cb) {
        cb(null, req.uniqName + "--" + file.originalname);
        req.storedFileName = req.uniqName + "--" + file.originalname;
    }

});

// the stored file name is randomly generated
function insertFile(req, res, next){
    uniquestr = crypto.pseudoRandomBytes(16).toString("hex");
    req.uniqName = uniquestr;
    next();
}

// this uploads file to the storage
var upload = multer({storage:file_storage});

// ***********************************     GET METHODS     ***********************************

//render main screen
router.get("/",function(req,res){
    res.render("main_screen");
});

// render download screen if url links to valid file
router.get("/download/:fileKey", async (req, res) => {
    var fileKey = req.params.fileKey;
    var data = await File.findOne({downloadURL: hostUrl + "download/" + fileKey})
    if (data == null)
        res.redirect("/")
    else
        res.render("download_screen",{fileLink: fileKey, fileName: data.originalName, fileSize: data.fileSize})
});

// render manage screen if url links to valid file
router.get("/manage/:fileKey", async (req, res) => {
    var fileKey = req.params.fileKey;
    var data = await File.findOne({manageURL: hostUrl + "manage/" + fileKey})
    if (data == null)
        res.redirect("/")
    else {
       var formatedDate = data.uploadDate.toUTCString();
        
        res.render("manage_screen",{fileLink: fileKey, fileSize: data.fileSize, fileName: data.originalName, upload_date: formatedDate, times_downloaded: data.downloadCount, download_url: data.downloadURL})
    }
       
});

// download file from the download screen
router.get("/getFile/:fileKey", async (req, res) => {
    var fileKey = req.params.fileKey;
    var data = await File.findOne({downloadURL: hostUrl + "download/" + fileKey})
    if (data == null){
        return res.status(400).send();}
    else{
        var absPath = __dirname+'\\file_storage\\' + data.fileName;
        res.download(absPath,data.originalName);}
});

// download file from the manage screen
router.get("/getFileInManage/:fileKey", async (req, res) => {
    var fileKey = req.params.fileKey;
    var data = await File.findOne({manageURL: hostUrl + "manage/" + fileKey})
    if (data == null){
        return res.status(400).send();}
    else{
        var absPath = __dirname+'\\file_storage\\' + data.fileName;
        res.download(absPath,data.originalName);}
});

// ***********************************     POST METHODS     ***********************************


// upload file in the main screen
router.post("/upload", insertFile, upload.single("inputFile"), (req, res) => {
    try {
        var uniqueName = req.storedFileName;
        var fileSizeString = ""
        if (req.file.size < 1024)
            fileSizeString = req.file.size + "B"
        else if (req.file.size < 1024 * 1024)
            fileSizeString = Math.round(req.file.size / 1024) + "KB"
        else if (req.file.size < 1024 * 1024 * 1024) 
            fileSizeString = Math.round(req.file.size / 1024 / 1024) + "MB"
        else
            fileSizeString = Math.round(req.file.size / 1024 / 1024 / 1024) + "GB"
        console.log("Stored file: " + uniqueName + " with size: " + fileSizeString);
        var downloadURL = hostUrl + "download/" + crypto.pseudoRandomBytes(16).toString("hex");
        var manageURL = hostUrl + "manage/" + crypto.pseudoRandomBytes(16).toString("hex");
        var originalName = req.file.originalname;

        var newFile = new File({
            fileName: uniqueName,
            downloadURL: downloadURL,
            manageURL: manageURL,
            originalName: originalName,
            fileSize: fileSizeString
        });

        newFile.save();
        urls = {download: downloadURL,
                manage: manageURL }
        res.send(urls);

    } catch (err) {
        console.log(err);
    }


})

// update downloads counter when downloading file - in download screen
router.post("/updateDownloads", async (req, res) => {
    var URL = hostUrl + "download/" + req.body.fileURL
    try{
        await File.findOneAndUpdate({downloadURL: URL}, {$inc : {downloadCount : 1}});
    } catch (err) {
        console.log(err);
    }
    res.sendStatus(201);
})

// update downloads counter when downloading file - in manage screen
router.post("/updateDownloadsInManage", async (req, res) => {
    var URL = hostUrl + "manage/" + req.body.fileURL
    try{
        await File.findOneAndUpdate({manageURL: URL}, {$inc : {downloadCount : 1}});
    } catch (err) {
        console.log(err);
    }
    res.sendStatus(201);
})

// generate new download url for the selected file - in manage screen
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

// remove the selected file from database - in manage screen
router.post("/removeFile", async (req, res) => {
    var URL = hostUrl + "manage/" + req.body.fileURL
    try{
        await File.findOneAndRemove({manageURL: URL});
    } catch (err) {
        console.log(err);
    }
    res.redirect("/");
})


module.exports = router;