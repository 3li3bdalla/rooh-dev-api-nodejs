let mongoose = require('mongoose');
let Schema = mongoose.Schema;
    
let FollowSchema = new Schema({
    followById : {type: Schema.ObjectId, ref: 'Users', index : true},
    followedId : {type: Schema.ObjectId, ref: 'Users', index : true},
    type	   : {type: String, enum: ['1','2'],default: '1'},//type 1 - for follow/unfollow, type 2 - contacts
    //first this table was created for followers only then new feature of add contact was added and instead of creating a new table, we decied to use this table only and added 'type' parameter in it, and that is the reason we are not changing the followById and followedId keys. So, we are going to use followById as 'contactAddedBy' and followedId as 'contactId'
    contactStatus: {type: String, enum: ['0','1'],default: ''}, //0 - pending, 1 - accepted [this field will be added only for type - 2] 
    //isRescuer: {type: Boolean, default: false} // only for type - 2 ie for contacts, a user can add another user as rescuer only if they are in contact list of each other.
}, {timestamp: true});

module.exports = mongoose.model('Follow', FollowSchema);
