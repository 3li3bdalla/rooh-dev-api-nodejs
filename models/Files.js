let mongoose=require('mongoose');
let Schema=mongoose.Schema;
var Constants = require('../config/appConstants');

const file_types = [
	Constants.DATABASE.FOLDERS.DOCUMENTS['en'],
	Constants.DATABASE.FOLDERS.PHOTOS['en'],
	Constants.DATABASE.FOLDERS.VIDEOS['en'],
	Constants.DATABASE.FOLDERS.AUDIOS['en'],
	Constants.DATABASE.FOLDERS.LINKS['en'],
	Constants.DATABASE.FOLDERS.MEDICATIONS['en'],
	Constants.DATABASE.FOLDERS.REQUESTS['en'],
	Constants.DATABASE.FOLDERS.REPORTS['en'],
	Constants.DATABASE.FOLDERS.RADIOLOGY['en'],
	Constants.DATABASE.FOLDERS.LABS['en'],
	Constants.DATABASE.FOLDERS.CUSTOM,
];

let FileSchema = new Schema({
    file: {
        original:   {type:String, default:""},
        thumbnail:  {type:String, default:""}
    },
    fileName:   	{type:String, default:""},
    fileType:  		{ type: String, enum: file_types, default: file_types[0], index: true}, // Documents is default folder
    folderId:      	{ type: Schema.Types.ObjectId,ref:'Folder'},
    userId:      	{ type: Schema.Types.ObjectId,ref:'Users'},
    dependentId:    { type:Schema.Types.ObjectId,ref:'Users.dependents', default:null},
    doctor:      	{ type: Schema.Types.ObjectId,ref:'Users', default:null},
    isDeleted: 		{ type: Boolean, default:false }
},{timestamps:true});

module.exports = mongoose.model('File',FileSchema);



