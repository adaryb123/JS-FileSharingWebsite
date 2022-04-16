var mongoose = require("mongoose");

var fileSchema = mongoose.Schema({
    filename:{type:String, required:true, unique:true},
    downloadURL:{type:String, required:true, unique:true},
    manageURL:{type:String, required:true, unique:true},
    uploadDate:{type:Date,default:Date.now},
    originalName:{type:String, required:true}
});

var File = mongoose.model("File", fileSchema);

module.exports = File;