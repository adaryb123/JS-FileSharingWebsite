var mongoose = require("mongoose");

var fileSchema = mongoose.Schema({
    fileName: {type:String, required:false, unique:true},
    originalName:{type:String, required:false},
    downloadURL:{type:String, required:true, unique:true},
    manageURL:{type:String, required:true, unique:true},
    uploadDate:{type:Date,default:Date.now},
    downloadCount:{type:Number, default: 0}
});

var File = mongoose.model("File", fileSchema);

module.exports = File;