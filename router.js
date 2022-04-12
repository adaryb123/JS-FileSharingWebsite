var express = require("express");
var path = require("path");
var multer = require("multer");
var crypto = require("crypto");

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

router.post("/upload", upload.single("shared_file") ,async function(req,res){

});

module.exports = router;