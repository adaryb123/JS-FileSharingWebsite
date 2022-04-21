var mongoose = require("mongoose");

// attributes of the file stored in database
var fileSchema = mongoose.Schema({
    fileName: {type:String, required:false, unique:true},
    originalName:{type:String, required:false},
    downloadURL:{type:String, required:true, unique:true},
    manageURL:{type:String, required:true, unique:true},
    uploadDate:{type:Date,default:Date.now},
    downloadCount:{type:Number, default: 0},
    fileSize:{type:String, required:true}
});

var File = mongoose.model("File", fileSchema);

module.exports = File;
