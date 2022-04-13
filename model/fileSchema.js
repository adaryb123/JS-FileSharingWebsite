var mongoose = require("mongoose");

var fileSchema = mongoose.Schema({
    filename:{type:String, required:true, unique:true},
    downloadURL:{type:String, required:true, unique:true},
    manageURL:{type:String, required:true, unique:true},
    uploadDate:{type:Date,default:Date.now}
});

var File = mongoose.model("File", fileSchema);

fileSchema.pre("save", function(done){
    console.log("saving file");
    done()
});

module.exports = File;