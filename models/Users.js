let mongoose = require('mongoose');
let async = require('async'),
    randomstring = require("randomstring"),
    user_plugin = require("../plugins").userPlugin; // import mongo plugin for pre save hook

let Schema = mongoose.Schema;

// array static schema
const workingHours = {
        endTime: {
            type: String,
            default: ""
        },
        startTime: {
            type: String,
            default: ""
        },
        slots: [Number],
        working: {
            type: Boolean
        }
    },
    image = {
        original: {
            type: String,
            default: ''
        },
        thumbnail: {
            type: String,
            default: ''
        }
    },
    consultation = {
        home: {
            type: Boolean,
            default: false
        },
        online: {
            type: Boolean,
            default: false
        },
    },
    unAvailableTime = {
        dates: {
            type: [String],
            default: []
        }, // ["YYYY-MM-DD"],
        endTime: {
            type: String,
            default: ""
        },
        isAllDay: {
            type: Boolean
        },
        startTime: {
            type: String,
            default: ""
        }
    };

let dependentSchema = new Schema({
    name: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

let Userschema = new Schema({
    name: {
        type: String,
        index: true,
        default: ""
    },
    phone: {
        type: String,
        default: "",
        index: true
    },
    email: {
        type: String,
        index: true,
        default: ""
    },
    password: {
        type: String,
        default: ""
    },
    countryCode: {
        type: String,
        default: ""
    },
    otp: {
        type: String,
        default: ""
    },
    otpExpiration: {
        type: Date,
        default: null
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    facebookId: {
        type: String,
        trim: true,
        index: true,
        sparse: true
    }, //if fb login
    currentStatus: {
        type: String,
        enum: ['ONLINE', 'OFFLINE'],
        default: 'OFFLINE'
    },
    deviceType: {
        type: String,
        enum: ["IOS", "ANDROID"],
        default: "IOS"
    },
    deviceToken: {
        type: String,
        default: ""
    },
    //fcmId:                  {type: String, default:""},
    accessToken: {
        type: String,
        trim: true,
        default: ""
    },
    loginType: {
        type: String,
        enum: ['PHONE', 'FACEBOOK'],
        default: 'PHONE'
    }, //email/fb
    lastLogin: {
        type: Date,
        default: null
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isChatOpen: {
        type: Boolean,
        default: true
    },
    allowChat: {
        enum: ["yes", "no"],
        default: "yes"
    },
    location: {
        type: [Number],
        index: '2dsphere',
        sparse: true
    }, //[long, lat]
    address: {
        type: String,
        default: ""
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    language: {
        type: String,
        enum: ['en', 'ar'],
        default: 'en'
    },
    role: [{
        type: String,
        default: []
    }], //USER,PROFESSIONAL,FACILITY
    defaultLoginRole: {
        type: String,
        default: ""
    }, //USER,PROFESSIONAL,FACILITY (A user can be a benefeciary and professional both, in that case 'role' field will have both the values ie USER AND PROFESSIONAL, so once user switch to an account, this field can help to keep a track of it)
    fbId: {
        type: String,
        default: ""
    },
    googleId: {
        type: String,
        default: ""
    },
    homeConsultation: {
        type: Boolean,
        default: false
    },
    onlineConsultation: {
        type: Boolean,
        default: false
    },
    instantConsultation: {
        type: Boolean,
        default: false
    },
    notAvailableOn: {
        type: unAvailableTime,
        default: {}
    },

    isChampion: {
        type: String,
        enum: ['0', '1', '2', '3', '4', '5'],
        default: '0'
    },
    /*
        0 - not champion (common case for all roles)
        1 - champion by followers (min. 500 followers)
        2 - champion marked by admin
        3 - not champion, marked by admin
        (1 - 3 cases are for USER role)
        4 - champion by partners (min. 5 partners for PROFESSIONAL role) 
        5 - champion by partners (min. 1 partner for FACILITY role)
    */
    csfContract: {
        type: Boolean,
        default: false
    },
    mirrorfly: {
        type: Boolean,
        default: false
    },
    mirrorflyPassword: {
        type: String,
        default: ""
    },
    mirrorFlyToken: {
        type: String,
        default: ""
    },
    mirrorFlyUserId: {
        type: String,
        default: ""
    },
    mirrorFlyDeviceToken: {
        type: String,
        default: ""
    },
    mirrorFlyAccessToken: {
        type: String,
        default: ""
    },
    jid: {
        type: String,
        default: ""
    }, //mirrorfly Chat application's unique id for user
    profilePic: {
        original: {
            type: String,
            default: ''
        },
        thumbnail: {
            type: String,
            default: ''
        }
    },
    coverPic: {
        original: {
            type: String,
            default: ''
        },
        thumbnail: {
            type: String,
            default: ''
        }
    },
    favoriteProfessionals: [{
        type: Schema.ObjectId,
        ref: 'Users',
        index: true,
        sparse: true
    }],
    favoriteFacilities: [{
        type: Schema.ObjectId,
        ref: 'Users',
        index: true,
        sparse: true
    }],
    rescuerId: {
        type: Schema.ObjectId,
        ref: 'Users',
        default: null
    },
    /*dob:                    {type: String,default:"" },
    gender:                 {type: String, enum: ['male','female'],default: ''},*/
    joiningReferralCode: {
        type: String,
        default: ""
    },
    paymentRegistrationIds: [{
        type: String,
        default: []
    }],
    wallet: {
        balance: {
            type: Number,
            default: 0
        }, //current balance in wallet
        transactionsCount: {
            type: Number,
            default: 0
        }, // total transaction done using wallet
        totalAmountAdded: {
            type: Number,
            default: 0
        }, //total amount added so far in wallet
        recentTransactionDate: {
            type: String,
            default: ""
        }
    },
    user: {
        uid: {
            type: String,
            default: "91-1907-00001"
        }, //Unique identification number
        currency: {
            type: String,
            default: ""
        },
        dob: {
            type: String,
            default: ""
        },
        //favoriteProfessional:   {type: Schema.Types.ObjectId,ref:'Users'},//ids of liked users
        haveInsurance: {
            type: Boolean,
            default: false
        },
        insuranceCompany: {
            type: Schema.Types.ObjectId,
            ref: 'InsuranceCompany'
        },
        policyNumber: {
            type: String,
            default: ""
        },
        step: {
            type: String,
            default: "1"
        },
        bio: {
            type: String,
            default: ""
        },
        dependents: [dependentSchema]
    },
    professional: {
        uid: {
            type: String,
            default: "00001"
        }, //Unique identification number
        serviceCategory: {
            type: Schema.Types.ObjectId,
            ref: 'ServiceCategory'
        },
        professionalType: {
            type: Schema.Types.ObjectId,
            ref: 'ProfessionalType'
        },
        professionalSpeciality: {
            type: Schema.Types.ObjectId,
            ref: 'ProfessionalSpeciality'
        },
        professionalSubSpeciality: [{
            type: Schema.Types.ObjectId,
            ref: 'ProfessionalSpeciality'
        }],
        license: {
            type: String,
            default: ""
        },
        licenseImage: {
            original: {
                type: String,
                default: ''
            },
            thumbnail: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: ''
            },
            fileName: {
                type: String,
                default: ''
            }
        },
        skillDescription: {
            type: String,
            default: ""
        },
        country: {
            type: Schema.Types.ObjectId,
            ref: 'Country'
        },
        city: {
            type: Schema.Types.ObjectId,
            ref: 'Country'
        },
        expertise: {
            type: String,
            default: ""
        },
        image: {
            original: {
                type: String,
                default: ''
            },
            thumbnail: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: ''
            },
            fileName: {
                type: String,
                default: ''
            }
        },
        video: {
            original: {
                type: String,
                default: ''
            },
            thumbnail: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: ''
            },
            fileName: {
                type: String,
                default: ''
            }
        },
        step: {
            type: String,
            default: "1"
        },
        workingHours: {
            type: [workingHours],
            default: [],
            required: true
        },
        isWholeWeekWorking: {
            type: Boolean,
            default: false
        },
        facilities: {
            type: [Schema.ObjectId],
            ref: 'Users',
            default: []
        }, // only for aggregate geo near else see working hours collection
        isAddedByFacility: {
            type: Boolean,
            default: false
        }, // true if professional account creaed by a Facility
        facilityId: {
            type: Schema.Types.ObjectId,
            ref: 'Users'
        } //facilityid if isAddedByFacility=true
    },
    facility: {
        uid: {
            type: String,
            default: "00001"
        }, //Unique identification number
        serviceCategory: {
            type: Schema.Types.ObjectId,
            ref: 'ServiceCategory'
        },
        facilityType: {
            type: Schema.Types.ObjectId,
            ref: 'ProfessionalSpeciality'
        },
        address: {
            type: String,
            default: ""
        },
        //joiningReferralCode:    {type: String, default: ""},
        registrationNumber: {
            type: String,
            default: ""
        },
        registrationImage: {
            original: {
                type: String,
                default: ""
            },
            thumbnail: {
                type: String,
                default: ""
            },
            type: {
                type: String,
                default: ''
            },
            fileName: {
                type: String,
                default: ''
            }
        },
        description: {
            type: String,
            default: ""
        },
        isWholeWeekWorking: {
            type: Boolean,
            default: false
        },
        workingHours: {
            type: [workingHours],
            default: [],
            required: true
        },
        services: [{
            type: Schema.Types.ObjectId,
            ref: 'ProfessionalSpeciality',
            default: []
        }],
        expertise: {
            type: String,
            default: ""
        },
        image: {
            type: [image],
            max: 5,
            default: []
        },
        video: {
            original: {
                type: String,
                default: ''
            },
            thumbnail: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: ''
            },
            fileName: {
                type: String,
                default: ''
            }
        },
        step: {
            type: String,
            default: "1"
        }

    },

}, {
    timestamps: true
});

/*// Getter
Userschema.path('wallet.balance').get(function(num) {
  return (num / 100).toFixed(2);
});
// Setter
Userschema.path('wallet.balance').set(function(num) {
  return num * 100;
});*/

Userschema.plugin(user_plugin, {
    tempCode: randomstring.generate(5)
});

const user = mongoose.model('Users', Userschema);
module.exports = user;