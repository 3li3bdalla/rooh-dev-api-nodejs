'use strict';

const async = require('async');
const Models = require('../models');

module.exports = exports = function generateString(schema, options) {
    schema.pre('save', async function(next) {
        const UserData = this.constructor;
        let criteria = {"defaultLoginRole":this.defaultLoginRole, "user.uid" : { $exists: true, $ne: null }};
        if(this.defaultLoginRole=="PROFESSIONAL"){
            criteria = {"defaultLoginRole":this.defaultLoginRole, "professional.uid" : { $exists: true, $ne: null }};
        }
        if(this.defaultLoginRole=="FACILITY"){
            criteria = {"defaultLoginRole":this.defaultLoginRole, "facility.uid" : { $exists: true, $ne: null }};
        }
        let data = await UserData.findOne(criteria).sort( { "_id": -1 } );
        if(data!=null){
            if(this.defaultLoginRole=="USER"){
                var uidAr = (data.user.uid).split("-"); //cc-yymm-xxxxx
                var dateObj = new Date();
                var month = dateObj.getUTCMonth() + 1;
                month =  ("0" + month).slice(-2); // mm format
                var year = dateObj.getUTCFullYear().toString().substr(-2);
                year =  ("0" + year).slice(-2); // yy format
                var countryCode = (this.countryCode).replace("+", "") // remove "+" from country code before adding to uid
                if(uidAr[1] == year+month){ // increment counter
                    let updatedUid = ("00000"+ (Number(uidAr[2])+1)).slice(-5);
                    this.user.uid = countryCode+"-"+year+month+"-"+updatedUid;
                }else{ //start counter from 00001
                    this.user.uid = countryCode+"-"+year+month+"-00001";
                }
            }else if(this.defaultLoginRole=="PROFESSIONAL"){
                this.professional.uid = ("00000"+ (Number(data.professional.uid)+1)).slice(-5);
                this.joiningReferralCode = options.tempCode + this.professional.uid;
                console.log("P-----------",this.joiningReferralCode)
            }else if(this.defaultLoginRole=="FACILITY"){
                this.facility.uid = ("00000"+ (Number(data.facility.uid)+1)).slice(-5);
                this.joiningReferralCode = options.tempCode + this.facility.uid;
                console.log("F-----------",this.joiningReferralCode)
            }
            delete this.tempCode;
        }
        next();
    });

};