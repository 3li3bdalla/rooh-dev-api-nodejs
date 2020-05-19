let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let FolderSchema = new Schema({
    folderName: { type:String,default:"" },
    folderNameByLang: {
        'en': { type:String,default:"" },
        'ar': { type:String,default:"" }
    },
    //folderName:     { type:String,default:"" },
    folderIcon:    	{ type:String,default:"" },
    folderType:    	{ type: String, enum: ['1','2','3'],default:'3'}, // 1 - medical folders, 2 - personal folders, 3 - custom folders
    userId:      	{ type:Schema.Types.ObjectId,ref:'Users'},
    dependentId:   	{ type:Schema.Types.ObjectId,ref:'Users.dependents', default:null},
    isDeleted: 		{ type:Boolean,default:false },
    isPrivate: 		{ type:Boolean,default:false }
},{timestamps:true});

module.exports = mongoose.model('Folder',FolderSchema);



