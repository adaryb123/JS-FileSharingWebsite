var express = require("express");
var multer = require("multer");
var crypto = require("crypto");

// Initializing constants
const hostUrl = "http://localhost:3000/";
// Database conector
var File = require("./model/fileSchema");
const { render } = require("express/lib/response");
var router = express.Router();

// Initialize file storage
var file_storage = multer.diskStorage({
    destination:"file_storage",
    // Name under which file is stored
    filename: function (req, file, cb) {
        cb(null, req.uniqName + "--" + file.originalname);
        req.storedFileName = req.uniqName + "--" + file.originalname;
    }

});

// The stored file name is randomly generated
function insertFile(req, res, next){
    uniquestr = crypto.pseudoRandomBytes(16).toString("hex");
    req.uniqName = uniquestr;
    next();
}

// This uploads file to the storage
var upload = multer({storage:file_storage});

// ***********************************     GET METHODS     ***********************************

// Render main upload screen
router.get("/",function(req,res){
    res.render("main_screen");
});

// Render download screen if valid file has was appended
router.get("/download/:fileKey", async (req, res) => {
    var fileKey = req.params.fileKey;
    // Find the file in database
    var data = await File.findOne({downloadURL: hostUrl + "download/" + fileKey})
    if (data == null)
        res.redirect("/")
    else
        res.render("download_screen",{fileLink: fileKey, fileName: data.originalName, fileSize: data.fileSize})
});

// Render manage screen if url links to valid file
router.get("/manage/:fileKey", async (req, res) => {
    var fileKey = req.params.fileKey;
    // Find the file in database
    var data = await File.findOne({manageURL: hostUrl + "manage/" + fileKey})
    if (data == null)
        res.redirect("/")
    else {
        // Convert The date into readable string
        var formatedDate = data.uploadDate.toUTCString();
        res.render("manage_screen",{fileLink: fileKey, fileSize: data.fileSize, fileName: data.originalName, upload_date: formatedDate, times_downloaded: data.downloadCount, download_url: data.downloadURL})
    }
       
});

// Download file from the download screen
router.get("/getFile/:fileKey", async (req, res) => {
    var fileKey = req.params.fileKey;
    // Find the file in DB
    var data = await File.findOne({downloadURL: hostUrl + "download/" + fileKey})
    // Check if file was found
    if (data == null){
        return res.status(400).send();}
    else{
        var absPath = __dirname+'\\file_storage\\' + data.fileName;
        res.download(absPath,data.originalName);}
});

// Download file from the manage screen
router.get("/getFileInManage/:fileKey", async (req, res) => {
    var fileKey = req.params.fileKey;
    // Find the file in DB
    var data = await File.findOne({manageURL: hostUrl + "manage/" + fileKey})
    // Check if file was found
    if (data == null){
        return res.status(400).send();}
    else{
        var absPath = __dirname+'\\file_storage\\' + data.fileName;
        res.download(absPath,data.originalName);}
});



// Prints About screen
router.get("/about", (req, res) => {
    res.render("about_screen");
});

// ***********************************     POST METHODS     ***********************************


// Upload file from the main screen
router.post("/upload", insertFile, upload.single("inputFile"), (req, res) => {
    try {
        var uniqueName = req.storedFileName;
        // Get the correct size format for output
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

        // Generate pseudo random strings for download and manage link
        var downloadURL = hostUrl + "download/" + crypto.pseudoRandomBytes(16).toString("hex");
        var manageURL = hostUrl + "manage/" + crypto.pseudoRandomBytes(16).toString("hex");
        // Save the original name
        var originalName = req.file.originalname;

        // Create database object for storing metadata
        var newFile = new File({
            fileName: uniqueName,
            downloadURL: downloadURL,
            manageURL: manageURL,
            originalName: originalName,
            fileSize: fileSizeString
        });

        // Save file to database
        newFile.save();
        urls = {download: downloadURL,
                manage: manageURL }
        
        // Render site
        res.send(urls);

    } catch (err) {
        console.log(err);
    }


})

// Update downloads counter when downloading file - in download screen
router.post("/updateDownloads", async (req, res) => {
    var URL = hostUrl + "download/" + req.body.fileURL
    // Find file and update
    try{
        await File.findOneAndUpdate({downloadURL: URL}, {$inc : {downloadCount : 1}});
    } catch (err) {
        console.log(err);
    }
    res.sendStatus(201);
})

// Update downloads counter when downloading file - in manage screen
router.post("/updateDownloadsInManage", async (req, res) => {
    var URL = hostUrl + "manage/" + req.body.fileURL
     // Find file and update
    try{
        await File.findOneAndUpdate({manageURL: URL}, {$inc : {downloadCount : 1}});
    } catch (err) {
        console.log(err);
    }
    res.sendStatus(201);
})

// Generate new download url for the selected file - in manage screen
router.post("/updateURL", async(req,res) => {
    // Manage url for searching in DB
    var manageURL = hostUrl + "manage/" + req.body.fileURL
    // New download url
    uniquestr = crypto.pseudoRandomBytes(16).toString("hex");
    var newURL = hostUrl + "download/" + uniquestr

    // Update the new download url based on manage url
    try{
        await File.findOneAndUpdate({manageURL: manageURL}, {downloadURL : newURL});
    } catch (err) {
        console.log(err);
    }
    res.send({URL: newURL})
})

// Remove the selected file from database - in manage screen
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