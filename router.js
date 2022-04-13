var express = require("express");
var path = require("path");
var multer = require("multer");
var crypto = require("crypto");

var File = require("./model/fileSchema");

var router = express.Router();

var file_storage = multer.diskStorage({
    destination:"file_storage",
    filename: function(req,file,cb){
        crypto.pseudoRandomBytes(16,function(err,raw){
            cb(null,raw.toString("hex") + Date.now() + path.extname(file.originalname))
        });
    }
});
 
var upload = multer({storage:file_storage});

router.get("/",function(req,res){
    res.render("main_screen");
});


// nepozna co je document- bud treba prestat pouzivat ejs alebo najst iny sposob ako zmenit hodnotu prvku
router.post("/upload", upload.single("shared_file") ,async function(req,res,next){
    // res.body.murl = "test";
    // console.log(path.basename(req.files.file.path));
    // var filename = path.basename(req.files.file.path)
    // console.log(filename)
    var filename = "testName"
    var downloadURL = "testD"
    var manageURL = "testM"

    var newFile = new File({
        filename:filename,
        downloadURL:downloadURL,
        manageURL:manageURL
    });

    newFile.save(next);
    // document.getElementById("durl").value = "test durl";
    // document.getElementById("murl").value = "test murl";
});

router.post("/download",function(req,res){
    res.render("download_screen")
});

router.post("/manage",function(req,res){
    res.render("manage_screen")
});


module.exports = router;