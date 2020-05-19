
'use strict';

var STATUSCODE = {
    BAD_REQUEST:400,
    INTERNAL_SERVER_ERROR:500,
    SUCCESS:200,
    UNAUTHORIZE:401,
    CREATED:201,
    APP_ERROR: 402,
    ROLE_CHANGE: 403
};

var SERVER = {
    APP_NAME: 'csfHealthcare',
    TOKEN_EXPIRATION: 60*60*24*30, // expires in 24 hours * 7 days
    JWT_SECRET_KEY: 'csfAuthSecret',
    JWT_SECRET_KEY_ADMIN: 'PYj5YitbgSAgeVZVntAKh5LNGeCdIxZcJjez9azZhzHVBktkeTSarml7IW1y1otR',
    JWT_SECRET_VAL: 'CsfHealthcareManagementApp',
    PORT : 3002,
    GUEST_TOKEN: 'eyJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiX2lkIjoiNWNmZTIwY2E3ZTc4ZTU2ZDA1OWYyNjkyIiwibmFtZSI6IlRlc3QiLCJpYXQiOjE1NjA4NTM5NDMsImV4cCI6MTU2MTQ1ODc0M30',
    'THUMBNAIL_IMAGE_SIZE': 300,
    'THUMBNAIL_IMAGE_QUALITY': 100,
    'PAYMENT_GATEWAY': {
        URL: 'https://test.oppwa.com',
        BASIC_PATH: '/v1/checkouts',

    }

    /*GOOGLE_API_KEY : '',
    COUNTRY_CODE : '+91',
    MAX_DISTANCE_RADIUS_TO_SEARCH : '1',
    THUMB_WIDTH : 300,
    THUMB_HEIGHT : 300,*/
    /*DOMAIN_NAME : 'http://localhost:8001/',*/
};

var DATABASE = {

    USER_ROLES: {
        USER: 'USER',
        PROFESSIONAL:'PROFESSIONAL',
        FACILITY:'FACILITY',
        TEAM: 'TEAM',
        TEAM_HIRE: 'TEAM_HIRED',
        TEAM_HIRE_BY: 'TEAM_HIRED_BY',
        PATIENT: 'PATIENT'
    },

    DEVICE_TYPES: {
        IOS: 'IOS',
        ANDROID: 'ANDROID'
    },

    LANGUAGE: {
        EN: 'EN',
        AR: 'AR'
    },
    APPOINTMENT: {
        HOME: "HOME",
        ONLINE: "ONLINE",
        ONSITE: "ONSITE",
        SELF: "SELF"
    },
    APPOINTMENT_HOME: {
        CUSTOM: "CUSTOM",
        WEEKLY: "WEEKLY",
        EVERYDAY: "EVERYDAY"
    },

    APPOINTMENT_STATUS: {
        PLACED:    "PLACED",
        STARTED:   "STARTED",
        REJECTED:  "REJECTED",
        CONFIRMED: "CONFIRMED",
        CANCELLED: "CANCELLED",
        COMPLETED: "COMPLETED"
    },
    STATUS: {
        ACTIVE: "ACTIVE",
        BLOCKED: "BLOCKED",
        DELETED: "DELETED",
        INACTIVE: "INACTIVE"
    },
    CONSULT: {
        VIDEO: 1,
        IMAGE: 2,
        CHAT: 3
    },
    CONSULT_TYPES: {
        ONLINE: 1,
        OFFSITE: 2,
        HOME: 3
    },
    FOLDERS: {
        /*DOCUMENTS: "Documents",
        PHOTOS: "Photos",
        VIDEOS: "Videos",
        AUDIOS: "Audios",
        LINKS: "Links",
        MEDICATIONS: "Medications",
        REQUESTS: "Requests",
        REPORTS: "Reports",
        RADIOLOGY: "Radiology",
        LABS: "Labs"*/
        /*MEDICATIONS: process.env.ENABLE_DB_ENCRYPTION=="1" ? "ORkPD9cMNMP2aG5EshS77BsHm+yZXEC/UphzDuRSR9FXa3mrotpBWqywQUQxwDAU5JDUTdUlt3ixmTlfTDDUf5Mkap6aQtP8nYXvEs7E83zcZ/jOUvz8bMrx+LLlzpD/4DX+ilWx5tLAgqcP6zf89PUGvdWtiuRBL9YltjA/IMNx6zmS56QREgbSM/1QC4ym3M6haTw/+B+8OQlkWnx6H6jJDDUNrbrtApFc4KtOmLlg+MlxN/dnafDcCF8mj5BM/gJe26/oy0bp9HCXG9Qvr95uX1YvpFrgOS/jppp205Q2KLfXFlF+UFeCoa0idlVWjozrPPKG3kVfnSdESp2Cnw==" : "Medications",
        REQUESTS: process.env.ENABLE_DB_ENCRYPTION=="1" ? "U5+z3q914sXIkdQkH7BwXXkQamHZciWznj2xqx015PHIUsbklT4bp9c/WWSjnZok6y8RnUlogp9cmhnWv/yGZa+V99BK+8Je9FCtRgzaME4fTZAJ0qZm6G8ldR/gctJp8gsQSHH36zOz+mhCbMn0nt2qnemINB9BuZro57BUJ68UNIn/OJ5EJJvLvBpKY6tJew7e+/YlH+TOuFwke+Zt7AOaZb7hSdIo4/5ArVXWcs/PRm1Re7E2iocSk+A62Z5EcUXzGxudsm6hYSplVYSIkoc9rNqePYoHNkNwa4+ca6Sa6VuzxwkhSMH+C64OOBsGg1iIfF06UWBzBxnJDHd/ng==" : "Requests",
        REPORTS: process.env.ENABLE_DB_ENCRYPTION=="1" ? "PykXhrMNIGhiOu7cTL8xjLbWxMsUOS9STUIxWeIPZIHDtLzhnmoXZr6m3zdzJ+NVG21tXx7pUaP29+6w2Cloi4hRJliHluG91QXf8DAHxJXpyxB8rb7I3I/j9RZs2xNHWiI9ed45Xg5CkHhdwxLxNr7aVA3kJQwKzlJVTGY7eujZl1Yy/lnSUetMeFehhcYYWssii7MP2SkHso0s8Z1a3bVkz+D7EjNaqDkyJYUd9bGo3f06DfDeH/cFiMBrXXJDd7mr6jESDEXSmvQZTsICp+CdtpwZIQJGZ9T4SspX+ZFgJ7NteQP9iLvECzyEZw49TfJXurXgytE6AfAgnJJvkQ==" : "Reports",
        RADIOLOGY: process.env.ENABLE_DB_ENCRYPTION=="1" ? "cOtvA9zAoOVimdkCANZscXphWzjNRNwddY471MArI1VEI+gVQfSHJEoj24Zj5M8BGyVfepeRUqVNKJdmvrV89LGmvdUnrEazuBrg37XMlHoebTrDJN7ouh8U9wMWwe0m2Papaos40nRI8RjLr2xAdfRVH+s3a+Piwh9/RIku284MR+VUlKrjnT2ML95OmZ8D+kPD4gZvv7Nlkk0EfPzJau9mo16F9lAn8/K1tV8JmkX+rffkOZBX0jmRgOaBxfIzdc8bXOh9g89n9Cav81mA2UzACMYnVj/zoc9XtiwwGWlJzXdaY7FMLshKuux2vx6NeVccUsK1IAFWN01BXDNndA==" : "Radiology",
        LABS: process.env.ENABLE_DB_ENCRYPTION=="1" ? "H4N5gFUpcCkgUP2muDcBnxlAcga1LVBZ37gwPfMupselq3Cm/G9q17+Ysctr0GeivsWD0s79gIusiPCOEvdsTDdwookPBwF6wISXrIe+CxOTRSkIg+kADzkbWcG3lCB2Mtx1SnXgqHKpDAnUolDKB23/cAFwqZfncKQZqx42S8c/zFi8CbR3xYtJQ3iqpPmPaHhOZxfg/EjxQkaZORKQwOGa0PSIYxlDqNhE73LU6Mjk8SlGp0KdeOmxmIB42JaZQPzNUzgaiy5lEYUlzr3tukHVEDMeKiTF8SbArzRbnG+c+L1P2zZMs9+oKi886jqyYIqkZi8knuZKafBD3Qh1aA==" : "Labs"*/
        DOCUMENTS: {
            "en":"Documents",
            "ar":"مستندات"
        },
        PHOTOS: {
            "en":"Photos",
            "ar":"الصور"
        },
        VIDEOS: {
            "en":"Videos",
            "ar":"مقاطع فيديو"
        },
        AUDIOS: {
            "en":"Audios",
            "ar":"صوتيات"
        },
        LINKS: {
            "en":"Links",
            "ar":"الروابط"
        },
        MEDICATIONS: {
            "en":"Medications",
            "ar":"الأدوية"
        },
        REQUESTS: {
            "en":"Requests",
            "ar":"طلبات"
        },
        REPORTS: {
            "en":"Reports",
            "ar":"تقارير"
        },
        RADIOLOGY: {
            "en":"Radiology",
            "ar":"طب إشعاعي"
        },
        LABS: {
            "en":"Labs",
            "ar":"مختبرات"
        }
    },
    MINUTE_SLOTS: {
        FULL_DAY: [0,30,60,90,120,150,180,210,240,270,300,330,360,390,420,450,480,510,540,570,600,630,660,690,720,750,780,810,840,870,900,930,960,990,1020,1050,1080,1110,1140,1170,1200,1230,1260,1290,1320,1350,1380,1410]
        /*FULL_DAY: '["0","30","60","90","120","150","180","210","240","270","05:00 AM","05:30 AM","06:00 AM","06:30 AM","07:00 AM","07:30 AM","08:00 AM","08:30 AM","09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM","05:30 PM","06:00 PM","06:30 PM","07:00 PM","07:30 PM","08:00 PM","08:30 PM","09:00 PM","09:30 PM","10:00 PM","10:30 PM","11:00 PM","11:30 PM"]'*/
    },
    COMMON_SERVICE_TYPE: {
        'Diagnosis': 'diagnosis',
        'Labs': 'lab',
        'Radiology': 'radiology',
        'Special_Test': 'Special_Test',
        'CSFCONTRACT': 'CSF_CONTRACT'
    },
    REPORTS_STEPWISE: {
        "E_REPORT": 1,
        "TEST_REQ": 2,
        "E_PRESCRIPTION": 3,
        "FOLLOW_UP_APPOINTMENT": 4,
        "PROFESSIONAL_FACILTY": 5,
        "SKIP": 6,
        "VALIDATE": 7
    },
    MESSAGE_TYPE: {
        TEXT: 'TEXT',
        IMAGE: 'IMAGE',
        VIDEO: 'VIDEO',
        GROUP_CHAT: 'GROUP_CHAT',
        SINGLE_CHAT: 'SINGLE_CHAT',
        CALL: 'CALL',
        VIDEO_CALL: 'VIDEO_CALL',
        DOCUMENT: 'DOCUMENT',
        LOCATION: 'LOCATION',
        CONTACT: 'CONTACT',
        GROUP_NOTIFICATION: 'GROUP_NOTIFICATION'
    },
    MESSAGE_STATUS: {
        RECEIVED: 'RECEIVED',
        DELIVERED: 'DELIVERED',
        READ: 'READ'
    },
    DEFAULT_IMAGE: {
        original: "https://www.femina.in/images/default-user.png",
        thumbnail: "https://www.femina.in/images/default-user.png",
        mediaType: "IMAGE"
    },
    CHAT_TYPE: {
        ONE_TO_ONE_CHAT: 'ONE_TO_ONE_CHAT',
        GROUP_CHAT: 'GROUP_CHAT'
    },
    FOLLOW_UP_APPOINTMENT: {
        'FREE': 1,
        'PAID': 2
    },
    REPORT_TYPE: {
        "RECEIVED": 1,
        "SCANED": 2
    }
/*
    PROFILE_SETUP_STEPS:{
        FIRST : 'FIRST',
        SECOND : 'SECOND',
    },

    BLOCK_TYPE:{
        BLOCK:'BLOCK',
        UNBLOCK:'UNBLOCK'
    },
    FILE_TYPES: {
        LOGO: 'LOGO',
        DOCUMENT: 'DOCUMENT',
        OTHERS: 'OTHERS'
    },

    MEETUP_CATEGORY:{
        SPORTING_EVENT : 'SPORTING_EVENT',
        PARTY : 'PARTY',
        CONCERT : 'CONCERT',
        CULINERY_EVENT : 'CULINERY_EVENT',
        OTHERS : 'OTHERS'
    },

    REPORT_REASON:{
        ABUSIVE : 'ABUSIVE',
        INAPPROPRIATE : 'INAPPROPRIATE',
        SEXUALLY_EXPLICIT : 'SEXUALLY_EXPLICIT',
        OTHERS : 'OTHERS'
    },*/

    /*FRIEND_REQUEST_ACTION : {
        PENDING : 'PENDING',
        CONFIRM : 'CONFIRM',
        DECLINE:'DECLINE',
        REMOVED:'REMOVED',
    },

    ACTIVITY_REQUEST_STATUS : {
        DOWN : 'DOWN',
        MAY_BE : 'MAY_BE',
        NOT_FREE:'NOT_FREE',
        PENDING:'PENDING',
        CANT_GO_ANYMORE:'CANT_GO_ANYMORE',
    },
    ACTIVITY_TYPE : {
        CUSTOM : 'CUSTOM',
        PREDEFINED : 'PREDEFINED',

    },
    LIKE_UNLIKE : {
        LIKE : 'LIKE',
        UNLIKE : 'UNLIKE',
    },
    VOTE_UNVOTE : {
        VOTE : 'VOTE',
        UNVOTE : 'UNVOTE',
    },
    BLOCK_BY_ADMIN : {
        BLOCK : 'BLOCK',
        UNBLOCK : 'UNBLOCK',
    },
    ACTIVITY_STATUS : {
        ALL : 'ALL',
        ACTIVE : 'ACTIVE',
        INACTIVE : 'INACTIVE'
    },
    ADD_OR_REMOVE_MEMBER : {
        ADD : 'ADD',
        REMOVE : 'REMOVE',

    },
    IS_OPEN: {
        TRUE: 'true',
        FALSE: 'false'
    },

    PROFILE_PIC_PREFIX : {
        ORIGINAL : 'profilePic_',
        THUMB : 'profileThumb_'
    },

    LOGO_PREFIX : {
        ORIGINAL : 'logo_',
        THUMB : 'logoThumb_'
    },

    CHAT_TYPE : {
        DIRECT :'DIRECT',
        GROUP :'GROUP',
        ACTIVITY:'ACTIVITY',
    },


    PAYMENT_OPTIONS : {
        CREDIT_DEBIT_CARD : 'CREDIT_DEBIT_CARD',
        PAYPAL : 'PAYPAL',
        BITCOIN : 'BITCOIN',
        GOOGLE_WALLET : 'GOOGLE_WALLET',
        APPLE_PAY : 'APPLE_PAY',
        EIYA_CASH : 'EIYA_CASH'
    },


    USER_TYPE : {
        NEW_USER       :  'NEW_USER',
        RETAINED_USER  :  'RETAINED_USER',
        CHURNED_USER   :  'CHURNED_USER',
        RESURRECTED_USER :'RESURRECTED_USER'
    },
    RETENTION_TYPE : {
     ALL:"ALL",
     DAILY:"DAILY",
     MONTHLY:"MONTHLY",
     WEEKLY:"WEEKLY",
    }*/
};

var STATUS_MSG = {
    ERROR: {
        NOTHING_FOUND: {
            statusCode:400,
            customMessage : 'Nothing Found',
            type : 'NOTHING_FOUND'
        },
        INVALID_OTP: {
            statusCode:400,
            customMessage : 'Please enter valid OTP',
            type : 'INVALID_OTP'
        },
        INVALID_FACILITY_CODE: {
            statusCode:400,
            customMessage : 'Please enter valid joining code',
            type : 'INVALID_FACILITY_CODE'
        },
        CANNOT_DELETE_FOLDER: {
            statusCode:400,
            customMessage : 'You are not allowed to delete this folder',
            type : 'CANNOT_DELETE_FOLDER'
        },
        DEFAULT: {
            statusCode:400,
            customMessage : 'Something',
            type : 'DEFAULT'
        },
        PHONE_ALREADY_EXIST: {
            statusCode:400,
            customMessage : 'Contact Number already registered with us',
            type : 'PHONE_ALREADY_EXIST'
        },
        TOKEN_EXPIRED: {
            statusCode:401,
            customMessage : 'Token Expired',
            type : 'TOKEN_EXPIRED'
        },
        ERROR_TOKEN_AUTH: {
            statusCode:401,
            customMessage : 'Sorry, your account has been logged into other device! Please login again to continue.',
            type : 'TOKEN_EXPIRED'
        },
        EMPTY_TOKEN: {
            statusCode:401,
            customMessage : 'No token provided',
            type : 'TOKEN_EXPIRED'
        },
        NO_USER_EXISTS: {
            statusCode:400,
            customMessage : 'No such user exists',
            type : 'NO_USER_EXISTS'
        },
        NO_FB_USER_EXISTS: {
            statusCode:400,
            customMessage : 'No user exists with this Facebook id',
            type : 'NO_USER_EXISTS'
        },

        INVALID_USER_PASS: {
            statusCode:401,
            type: 'INVALID_USER_PASS',
            customMessage : 'Please enter valid contact number or password'
        },
        PHONE_NO_NOT_VERIFIED: {
            statusCode:400,
            customMessage : 'Phone Number is not verified',
            type : 'PHONE_NO_NOT_VERIFIED'
        },
        INVALID_ROLE: {
            statusCode:400,
            customMessage : 'Wrong user role sent',
            type : 'INVALID_ROLE'
        },
        BLOCK_USER: {
            statusCode:400,
            customMessage : 'This user is blocked by admin.Please contact support',
            type : 'BLOCK_USER'
        },
        WORKING_HOUR_ALREADY_EXISTS: {
            statusCode:400,
            customMessage : 'Facility already joined',
            type : 'WORKING_HOUR_ALREADY_EXISTS'
        },
        /*ACTIVITY_EXPIRED: {
            statusCode:400,
            customMessage : 'Activity expired',
            type : 'ACTIVITY_EXPIRED'
        },
        NO_ACTIVITY: {
            statusCode:400,
            customMessage : 'Activity expired',
            type : 'NO_ACTIVITY'
        },
        DESCRIPTION_REQUIRED: {
            statusCode:400,
            customMessage : 'Descriptiona required if you have specified other reason ',
            type : 'DESCRIPTION_REQUIRED'
        },
        SAME_PASSWORD_AS_BEFORE: {
            statusCode:400,
            customMessage : 'Please change password from the previous one',
            type : 'SAME_PASSWORD_AS_BEFORE'
        },
        PASSWORD_RESET_ERROR: {
            statusCode:400,
            customMessage : 'Password Does Not Match',
            type : 'PASSWORD_RESET_ERROR'
        },
        NEW_PASSWORD_RESET_ERROR: {
            statusCode:400,
            customMessage : 'New Password Does Not Match',
            type : 'NEW_PASSWORD_RESET_ERROR'
        },
        CANNOT_POST: {
            statusCode:400,
            customMessage : 'Cannot post as you are not in any Zone',
            type : 'CANNOT_POST'
        },

        CANNOT_CREATE_MEETUP: {
            statusCode:400,
            customMessage : 'Cannot create MeetUp as you are not in any Zone',
            type : 'CANNOT_CREATE_MEETUP'
        },

        ALREADY_FRIEND: {
            statusCode:400,
            customMessage : 'Already Friend',
            type : 'ALREADY_FRIEND'
        },

        FAN_REQUEST_ALREADY_SENT: {
            statusCode:400,
            customMessage : 'Fan request has been already sent',
            type : 'FAN_REQUEST_ALREADY_SENT'
        },

        OVERLAPPING_ZONE: {
            statusCode:400,
            type: 'OVERLAPPING_ZONE',
            customMessage : 'The Zone you want to create is overlapping with other Zone.'
        },


        ALREADY_EXIST: {
            statusCode:400,
            type: 'ALREADY_EXIST',
            customMessage : 'Already Exist '
        },

        DATA_NOT_FOUND: {
            statusCode:401,
            type: 'DATA_NOT_FOUND',
            customMessage : 'empty data'
        },
        NOT_IN_ZONE: {
            statusCode:400,
            type: 'NOT_IN_ZONE',
            customMessage : 'You are not in any zone'
        },

        INVALID_USER_PASS: {
            statusCode:401,
            type: 'INVALID_USER_PASS',
            customMessage : 'Invalid username or password'
        },

        TOKEN_ALREADY_EXPIRED: {
            statusCode:401,
            customMessage : 'Your login session expired!',
            type : 'TOKEN_ALREADY_EXPIRED'
        },

        DB_ERROR: {
            statusCode:400,
            customMessage : 'DB Error : ',
            type : 'DB_ERROR'
        },

        INVALID_ID: {
            statusCode:400,
            customMessage : 'Invalid Id Provided : ',
            type : 'INVALID_ID'
        },

        APP_ERROR: {
            statusCode:400,
            customMessage : 'Application Error',
            type : 'APP_ERROR'
        },

        ADDRESS_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Address not found',
            type : 'ADDRESS_NOT_FOUND'
        },

        SAME_ADDRESS_ID: {
            statusCode:400,
            customMessage : 'Pickup and Delivery Address Cannot Be Same',
            type : 'SAME_ADDRESS_ID'
        },

        IMP_ERROR: {
            statusCode:500,
            customMessage : 'Implementation Error',
            type : 'IMP_ERROR'
        },

        APP_VERSION_ERROR: {
            statusCode:400,
            customMessage : 'One of the latest version or updated version value must be present',
            type : 'APP_VERSION_ERROR'
        },

        INVALID_TOKEN: {
            statusCode:401,
            customMessage : 'Invalid token provided',
            type : 'INVALID_TOKEN'
        },

        INVALID_CODE: {
            statusCode:400,
            customMessage : 'Invalid Verification Code',
            type : 'INVALID_CODE'
        },

        DEFAULT: {
            statusCode:400,
            customMessage : 'Error',
            type : 'DEFAULT'
        },

        PHONE_NO_EXIST: {
            statusCode:400,
            customMessage : 'Phone number is not registered',
            type : 'PHONE_NO_EXIST'
        },
        PHONE_NOT_EXIST: {
            statusCode:400,
            customMessage : 'Phone number is not registered',
            type : 'PHONE_NOT_EXIST'
        },
        FACEBOOK__EXIST: {
            statusCode:400,
            customMessage : 'Facebook account already exist',
            type : 'FACEBOOK__EXIST'
        },

        EMAIL_EXIST: {
            statusCode:400,
            customMessage : 'Email Already Exist',
            type : 'EMAIL_EXIST'
        },

        DUPLICATE: {
            statusCode:400,
            customMessage : 'Duplicate Entry',
            type : 'DUPLICATE'
        },

        DUPLICATE_ADDRESS: {
            statusCode:400,
            customMessage : 'Address Already Exist',
            type : 'DUPLICATE_ADDRESS'
        },

        UNIQUE_CODE_LIMIT_REACHED: {
            statusCode:400,
            customMessage : 'Cannot Generate Unique Code, All combinations are used',
            type : 'UNIQUE_CODE_LIMIT_REACHED'
        },

        INVALID_REFERRAL_CODE: {
            statusCode:400,
            customMessage : 'Invalid Referral Code',
            type : 'INVALID_REFERRAL_CODE'
        },

        FACEBOOK_ID_PASSWORD_ERROR: {
            statusCode:400,
            customMessage : 'Only one field should be filled at a time, either facebookId or password',
            type : 'FACEBOOK_ID_PASSWORD_ERROR'
        },

        INVALID_EMAIL: {
            statusCode:400,
            customMessage : 'Invalid Email Address',
            type : 'INVALID_EMAIL'
        },

        PASSWORD_REQUIRED: {
            statusCode:400,
            customMessage : 'Password is required',
            type : 'PASSWORD_REQUIRED'
        },

        MINIMUM_AGE: {
            statusCode:400,
            customMessage : 'Minimum age to sign up is 13',
            type : 'MINIMUM_AGE'
        },

        OTP_REQUIRED: {
            statusCode:400,
            customMessage : 'Otp is required',
            type : 'OTP_REQUIRED'
        },

        PHONE_NO_REQUIRED: {
            statusCode:400,
            customMessage : 'Phone number is required',
            type : 'PHONE_NO_REQUIRED'
        },

        EMAIL_REQUIRED: {
            statusCode:400,
            customMessage : 'Email is required',
            type : 'EMAIL_REQUIRED'
        },

        INVALID_OTP: {
            statusCode:400,
            customMessage : 'OTP you have entered does not match',
            type : 'INVALID_OTP'
        },

        FIRSTNAME_REQUIRED: {
            statusCode:400,
            customMessage : 'First Name is required',
            type : 'FIRSTNAME_REQUIRED'
        },

        DOB_REQUIRED: {
            statusCode:400,
            customMessage : 'Date of birth is required',
            type : 'DOB_REQUIRED'
        },

        PHONE_NO_NOT_VERIFIED: {
            statusCode:400,
            customMessage : 'Phone Number is not verified',
            type : 'PHONE_NO_NOT_VERIFIED'
        },

        INVALID_COUNTRY_CODE: {
            statusCode:400,
            customMessage : 'Invalid Country Code, Should be in the format +52',
            type : 'INVALID_COUNTRY_CODE'
        },

        INVALID_PHONE_NO_FORMAT: {
            statusCode:400,
            customMessage : 'Phone no. cannot start with 0',
            type : 'INVALID_PHONE_NO_FORMAT'
        },

        COUNTRY_CODE_MISSING: {
            statusCode:400,
            customMessage : 'You forgot to enter the country code',
            type : 'COUNTRY_CODE_MISSING'
        },

        INVALID_PHONE_NO: {
            statusCode:400,
            customMessage : 'Phone No. & Country Code does not match to which the OTP was sent',
            type : 'INVALID_PHONE_NO'
        },

        PHONE_NO_MISSING: {
            statusCode:400,
            customMessage : 'You forgot to enter the phone no.',
            type : 'PHONE_NO_MISSING'
        },

        NOTHING_TO_UPDATE: {
            statusCode:400,
            customMessage : 'Nothing to update',
            type : 'NOTHING_TO_UPDATE'
        },

        NOT_FOUND: {
            statusCode:400,
            customMessage : 'User Not Found',
            type : 'NOT_FOUND'
        },

        INVALID_RESET_PASSWORD_TOKEN: {
            statusCode:400,
            customMessage : 'Invalid Reset Password Token',
            type : 'INVALID_RESET_PASSWORD_TOKEN'
        },

        INCORRECT_PASSWORD: {
            statusCode:400,
            customMessage : 'Incorrect Password',
            type : 'INCORRECT_PASSWORD'
        },

        EMPTY_VALUE: {
            statusCode:400,
            customMessage : 'Empty String Not Allowed',
            type : 'EMPTY_VALUE'
        },

        PHONE_NOT_MATCH: {
            statusCode:400,
            customMessage : "Phone Number Doesn't Match",
            type : 'PHONE_NOT_MATCH'
        },

        SAME_PASSWORD: {
            statusCode:400,
            customMessage : 'Old password and new password are same',
            type : 'SAME_PASSWORD'
        },

        ACTIVE_PREVIOUS_SESSIONS: {
            statusCode:400,
            customMessage : 'You already have previous active sessions, confirm for flush',
            type : 'ACTIVE_PREVIOUS_SESSIONS'
        },

        EMAIL_ALREADY_EXIST: {
            statusCode:400,
            customMessage : 'Email Address Already Exists',
            type : 'EMAIL_ALREADY_EXIST'
        },

        ERROR_PROFILE_PIC_UPLOAD: {
            statusCode:400,
            customMessage : 'Profile pic is not a valid file',
            type : 'ERROR_PROFILE_PIC_UPLOAD'
        },

        PHONE_ALREADY_EXIST: {
            statusCode:400,
            customMessage : 'Phone Number Already Exists',
            type : 'PHONE_ALREADY_EXIST'
        },

        PHONE_NOT_VERIFIED: {
            statusCode:400,
            customMessage : 'PhoneNo is not verified',
            type : 'PHONE_NOT_VERIFIED'
        },


        EMAIL_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Email Not Found',
            type : 'EMAIL_NOT_FOUND'
        },

        BLOCK_USER: {
            statusCode:400,
            customMessage : 'You are blocked by Admin',
            type : 'BLOCK_USER'
        },

        FACEBOOK_ID_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Facebook Id Not Found',
            type : 'FACEBOOK_ID_NOT_FOUND'
        },

        INCORRECT_OLD_PASS: {
            statusCode:400,
            customMessage : 'Incorrect Old Password',
            type : 'INCORRECT_OLD_PASS'
        },

        UNAUTHORIZED: {
            statusCode:401,
            customMessage : 'You are not authorized to perform this action',
            type : 'UNAUTHORIZED'
        },
        PHONE_NO_NOT_REGISTERED: {
            statusCode:400,
            customMessage : 'The phone number that you have entered does not match any account',
            type : 'PHONE_NO_NOT_REGISTERED'
        },*/
    },
    SUCCESS: {
        /*CREATED: {
            statusCode:201,
            customMessage : 'Created Successfully',
            type : 'CREATED'
        },*/
        DEFAULT: {
            statusCode:200,
            customMessage : 'Success',
            type : 'DEFAULT'
        },
        OTP_VERIFIED: {
            statusCode:200,
            customMessage : 'OTP verified successfully',
            type : 'OTP_VERIFIED'
        },
        OTP_RESENT: {
            statusCode:200,
            customMessage : 'An OTP resent to your registered contact number',
            type : 'OTP_RESENT'
        },
        CHANGE_PASSWORD_SUCCESS: {
            statusCode:200,
            customMessage : 'Password changed successfully',
            type : 'CHANGE_PASSWORD_SUCCESS'
        },
        LOGIN_SUCCESS: {
            statusCode:200,
            customMessage : 'Logged in successfully',
            type : 'LOGIN_SUCCESS'
        },
        VALID_FACILITY_CODE: {
            statusCode:200,
            customMessage : "Facility Code verified successfully",
            type : 'VALID_FACILITY_CODE'
        },
        ADD_WALLET: {
            statusCode:200,
            customMessage : "Amount added to wallet successfully",
            type : 'ADD_WALLET'
        },

        /*UPDATED: {
            statusCode:200,
            customMessage : 'Updated Successfully',
            type : 'UPDATED'
        },
        LOGOUT: {
            statusCode:200,
            customMessage : 'Logged Out Successfully',
            type : 'LOGOUT'
        },
        DELETED: {
            statusCode:200,
            customMessage : 'Deleted Successfully',
            type : 'DELETED'
        },
        OTP_VERIFIED: {
            statusCode:200,
            customMessage : 'Otp verified',
            type : 'OTP_VERIFIED'
        },
        PROFILE_COMPLETED: {
            statusCode:200,
            customMessage : 'Profile Allready completed',
            type : 'PROFILE_COMPLETED'
        },
        RESET_PASSWORD_SUCCESS: {
            statusCode:200,
            customMessage : 'Password reset successfully',
            type : 'RESET_PASSWORD'
        },

       ACCOUNT_DEACTIVATED: {
            statusCode:200,
            customMessage : 'Account Deactivated Successfully',
            type : 'ACCOUNT_DEACTIVATED'

        },*/
    }
};


var swaggerDefaultResponseMessages = [
    {code: 200, message: 'OK'},
    {code: 400, message: 'Bad Request'},
    {code: 401, message: 'Unauthorized'},
    {code: 404, message: 'Data Not Found'},
    {code: 500, message: 'Internal Server Error'}
];

var SCREEN_TO_SHOW = {
    HOMEPAGE : 'HOMEPAGE',
    TRACKING : 'TRACKING',
    FEEDBACK : 'FEEDBACK'
};

let NOTIFICATION_TYPE = {
    'CREATE_APPOINTMENT': 'CREATE_APPOINTMENT',
    'CANCEL_APPOINTMENT': 'CANCEL_APPOINTMENT',
    'CREATE_REPORT': 'CREATE_REPORT',
    'CREATE_LAB_REPORT': 'CREATE_LAB_REPORT',
    'CREATE_POST': 'CREATE_POST',
    'FOLLOW_USER': 'FOLLOW_USER',
    'USER_CHAMPION': 'USER_CHAMPION',
    'USER_LIKE': 'USER_LIKE',
    'POST_COMMENT': 'POST_COMMENT',
    'POST_LIKE': 'POST_LIKE',
    'HIRE_PROFESSIONAL': 'HIRE_PROFESSIONAL',
    'CREATE_TASK': 'CREATE_TASK',
    'COMPLETE_TASK': 'COMPLETE_TASK',
    'REJECT_TASK': 'REJECT_TASK',
    'ACCEPT_TASK': 'ACCEPT_TASK',
    'REJECT_CONTRACT': 'REJECT_CONTRACT',
    'CONTRACT_SIGNED': 'CONTRACT_SIGNED',
    'APPOINTMENT_CONFIRMATION': 'APPOINTMENT_CONFIRMATION',
    'UPDATE_APPOINTMENT': 'UPDATE_APPOINTMENT',
    'ADD_FEEDBACK': 'ADD_FEEDBACK',
    
    'COMMENT_LIKE': 'COMMENT_LIKE',
    'CREATE_PHARMACY_REQUEST' : 'CREATE_PHARMACY_REQUEST',
    'PHARMACY_ACTIONS' : 'PHARMACY_ACTIONS',
    'HELP' : 'HELP',
    'UPCOMING_APPOINTMENT': 'UPCOMING_APPOINTMENT',
    'EDIT_CONTRACT': 'EDIT_CONTRACT',
    'JOIN_FACILITY': 'JOIN_FACILITY'
};

let NOTIFICATION_TITLE = {
    'CREATE_APPOINMENT': {
        'en': 'New Appointment Received',
        'ar': 'موعد جديد تم تلقيه'
    },
    'CANCEL_APPOINTMENT': {
        'en': 'Cancel Appointment',
        'ar': ' الغاء الموعد'
    },
    'CREATE_REPORT': {
        'en': 'Create report',
        'ar': 'إنشاء تقرير'
    },
    'CREATE_LAB_REPORT': {
        'en': 'Create report',
        'ar': 'إنشاء تقرير '
    },
    'CREATE_POST': {
        'en': 'Create post',
        'ar': 'إنشاء مشاركة'
    },
    'FOLLOW_USER': {
        'en': 'New follower',
        'ar': 'متابع جديد'
    },
    'USER_LIKE': {
        'en': 'New Message',
        'ar': 'رسالة جديدة'
    },
    'USER_CHAMPION': {
        'en': 'New Message',
        'ar': 'رسالة جديد'
    },
    'NOT_USER_CHAMPION': {
        'en': 'New Message',
        'ar': 'رسالة جديد'
    },
    'POST_COMMENT': {
        'en': 'New comment added',
        'ar': ' تمت إضافة تعليق جديد'
    },
    'POST_LIKE': {
        'en': 'User likes your post',
        'ar': 'المستخدم أُعجب بمشاركتك'
    },
    'COMMENT_LIKE': {
        'en': 'User likes your comment',
        'ar': 'المستخدم أعجب بتعليقك'
    },
    'CREATE_PHARMACY_REQUEST': {
        'en': 'New request',
        'ar': 'طلب جديد'
    },
    'PHARMACY_ACTIONS_ACCEPTED': {
        'en': 'Request accepted',
        'ar': 'تم قبول الطلب'
    },
    'PHARMACY_ACTIONS_REJECTED': {
        'en': 'Request rejected',
        'ar': 'تم رفض الطلب '
    },
    'PHARMACY_ACTIONS_COMPLETED': {
        'en': 'Request completed',
        'ar': 'اكتمل الطلب'
    },
    'HELP': {
        'en': 'User needs help',
        'ar': 'يحتاج المستخدم للمساعدة'
    },
    'UPCOMING_APPOINTMENT': {
        'en': 'You have an upcoming Appointment',
        'ar': 'لديك موعد قادم'
    },
    'HIRE_PROFESSIONAL': {
        'en': 'New hiring request',
        'ar': 'طلب توظيف جديد'
    },
    'CREATE_TASK': {
        'en': 'New task reated',
        'ar': 'تم انشاء مهمة جديدة'
    },
    'COMPLETE_TASK': {
        'en': 'Task completed',
        'ar': 'تم اكتمال المهمة'
    },
    'REJECT_TASK': {
        'en': 'Task rejected',
        'ar': 'تم رفض المهمة'
    },
    'ACCEPT_TASK': {
        'en': 'Task accepted',
        'ar': 'تم قبول المهمة'
    },
    'REJECT_CONTRACT': {
        'en': 'Contract rejected',
        'ar': 'تم رفض العقد'
    },
    'CONTRACT_SIGNED': {
        'en': 'Contract Updates',
        'ar': 'تحديثات العقد'
    },
    'APPOINTMENT_CONFIRMATION': {
        'en': 'Appointment confirmation',
        'ar': 'تأكيد الموعد'
    },
    'UPDATE_APPOINTMENT': {
        'en': 'Appointment confirmation',
        'ar': 'تأكيد الموعد'
    },
    'ADD_FEEDBACK': {
        'en': 'New Feedback',
        'ar': 'تعليق جديد'
    },
    'UPDATE_FEEDBACK': {
        'en': 'A user submitted feedback',
        'ar': ' تعليق محدث من قبل مستخدم'
    },
    'EDIT_CONTRACT': {
        'en': 'Contract modified',
        'ar': 'تم تعديل العقد'
    },
    'JOIN_FACILITY': {
        'en': 'New partner joined you',
        'ar': 'شريك جديد التحق بك'
    }
};

let NOTIFICATION_MESSAGE = {
    'CREATE_APPOINMENT': {
        'en': 'You have an appointment with ',
        'ar': 'لديك موعد مع'
    },
    'CANCEL_APPOINTMENT': {
        'en': 'Your appointment has been cancelled',
        'ar': 'تم الغاء موعدك'
    },
    'CREATE_REPORT': {
        'en': ' created your report ',
        'ar': ' تم إنشاء تقريرك '
    },
    'CREATE_LAB_REPORT': {
        'en': ' created your report ',
        'ar': ' تم إنشاء تقرير الخاص بك '
    },
    'CREATE_POST': {
        'en': ' added a new post',
        'ar': ' تم إنشاء منشور جديد'
    },
    'FOLLOW_USER': {
        'en': ' is following you',
        'ar': ' يتابعك '
    },    
    'USER_LIKE': {
        'en': ' added you to favourite list',
        'ar': ' اضافك الى قائمة المفضلة '
    },
    'USER_CHAMPION': {
        'en': 'You are a Champion now',
        'ar': ' انت قيادي الآن '
    },
    'NOT_USER_CHAMPION': {
        'en': 'You are no longer a Champion now',
        'ar': ' لم تعد قيادي الآن '
    },
    'POST_COMMENT': {
        'en': ' commented on your post ',
        'ar': ' قام بالتعليق على مشاركتك '
    },
    'POST_LIKE': {
        'en': ' likes your post ',
        'ar': ' أعجب بمشاركتك '
    },
    'COMMENT_LIKE': {
        'en': ' likes your comment ',
        'ar': ' أعجب بتعليقك '
    },
    'CREATE_PHARMACY_REQUEST': {
        //'en': 'New medications request received from ',
        'en': ' sent you a new medications request',
        'ar': ' تم تلقي طلبات أدوية جديدة '
    },
    'PHARMACY_ACTIONS_ACCEPTED': {
        'en': ' accepted your request',
        'ar': ' قبل طلبك'
    },
    'PHARMACY_ACTIONS_REJECTED': {
        'en': ' rejected your request',
        'ar': ' طلبك مرفوض'
    },
    'PHARMACY_ACTIONS_COMPLETED': {
        'en': ' completed your request',
        'ar': ' تم اكتمال طلبك'
    },
    'HELP': {
        'en': ' needs help',
        'ar': ' بحاجة للمساعدة'
    },
    'UPCOMING_APPOINTMENT': {
        'en': 'You have an upcoming Appointment ',
        'ar': 'لديك موعد قادم '
    },
    'HIRE_PROFESSIONAL': {
        'en': ' sent you hiring request',
        'ar': ' ارسل اليك طلب توظيف'
    },
    'CREATE_TASK': {
        'en': ' created a task for you',
        'ar': ' تم توكيلك بمهمة'
    },
    'COMPLETE_TASK': {
        'en': ' completed assigned task',
        'ar': ' المهمة الموكلة مكتملة'
    },
    'REJECT_TASK': {
        'en': ' rejected assigned task',
        'ar': ' تم رفض المهمة الموكلة'
    },
    'ACCEPT_TASK': {
        'en': ' accepted assigned task',
        'ar': ' المهمة الموكلة المقبولة'
    },
    'REJECT_CONTRACT': {
        'en': ' rejected your contract',
        'ar': ' تم رفض عقدك'
    },
    'CONTRACT_SIGNED': {
        'en': ' signed the contract',
        'ar': ' تم توقيع العقد'
    },
    'APPOINTMENT_CONFIRMATION': {
        'en': ' confirmed appointment with you',
        'ar': ' تم تأكيد الموعد معك'
    },
    'UPDATE_APPOINTMENT': {
        'en': 'Appointment schedule has been updated by ',
        'ar': 'تم تحديث جدول المواعيد بواسطة '
    },
    'ADD_FEEDBACK': {
        'en': ' have submitted feedback',
        'ar': ' تم التعليق '
    },
    'UPDATE_FEEDBACK': {
        'en': ' have submitted feedback',
        'ar': ' تم تحديث التعليق'
    },
    'EDIT_CONTRACT': {
        'en': ' updated contract with you',
        'ar': ' العقد المحدث معك'
    },
    'JOIN_FACILITY': {
        'en': ' joined you through referral code',
        'ar': ' التحق بك من خلال الرمز المرجعي الخاص بك'
    }
}

var notificationMessages = {
    verificationCodeMsg: 'Your 4 digit verification code for Kabootz is {{four_digit_verification_code}}',
    registrationEmail: {
        emailMessage : "Dear {{user_name}}, <br><br> Please  <a href='{{verification_url}}'>click here</a> to verify your email address",
        emailSubject: "Welcome to Seed Project"
    },
    contactDriverForm: {
        emailMessage : "A new driver has showed interest <br><br> Details : <br><br> Name : {{fullName}} <br><br> Email : {{email}} <br><br> Phone No : {{phoneNo}} <br><br> Vehicle Type : {{vehicleType}} <br><br> Bank Account : {{bankAccountBoolean}} <br><br> Heard From : {{heardFrom}}",
        emailSubject: "New Driver Contact Request"
    },
    contactBusinessForm: {
        emailMessage : "A new business has showed interest <br><br> Details : <br><br> Name : {{fullName}} <br><br> Email : {{email}} <br><br> Phone No : {{phoneNo}} <br><br> Business Name: {{businessName}} <br><br> Business Address: {{businessAddress}}  <br><br> Delivery Service : {{ownDeliveryService}} <br><br> Heard From : {{heardFrom}}",
        emailSubject: "New Business Contact Request"
    },
    forgotPassword: {
        emailMessage : "Dear {{user_name}}, <br><br>  Your reset password token is <strong>{{password_reset_token}}</strong> , <a href='{{password_reset_link}}'> Click Here </a> To Reset Your Password",
        emailSubject: "Password Reset Notification For Seed Project"
    }
};

var languageSpecificMessages = {
    verificationCodeMsg : {
        EN : 'Your 4 digit verification code for Seed Project is {{four_digit_verification_code}}',
        ES_MX : 'Your 4 digit verification code for Seed Project is {{four_digit_verification_code}}'
    }
};

var LABS_TESTS = [{
    "code": "2160-0",
    "display": "Creatinine [Mass/volume] in Serum or Plasma"
},
    {
        "code": "718-7",
        "display": "Hemoglobin [Mass/volume] in Blood"
    },
    {
        "code": "2823-3",
        "display": "Potassium [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "2345-7",
        "display": "Glucose [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2951-2",
        "display": "Sodium [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "3094-0",
        "display": "Urea nitrogen [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2028-9",
        "display": "Carbon dioxide, total [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "2075-0",
        "display": "Chloride [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "789-8",
        "display": "Erythrocytes [#/volume] in Blood by Automated count"
    },
    {
        "code": "786-4",
        "display": "Erythrocyte mean corpuscular hemoglobin concentration [Mass/volume] by Automated count"
    },
    {
        "code": "785-6",
        "display": "Erythrocyte mean corpuscular hemoglobin [Entitic mass] by Automated count"
    },
    {
        "code": "17861-6",
        "display": "Calcium [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2339-0",
        "display": "Glucose [Mass/volume] in Blood"
    },
    {
        "code": "4544-3",
        "display": "Hematocrit [Volume Fraction] of Blood by Automated count"
    },
    {
        "code": "6690-2",
        "display": "Leukocytes[#/volume] in Blood by Automated count"
    },
    {
        "code": "1742-6",
        "display": "Alanine aminotransferase [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "787-2",
        "display": "Erythrocyte mean corpuscular volume [Entitic volume] by Automated count"
    },
    {
        "code": "777-3",
        "display": "Platelets [#/volume] in Blood by Automated count"
    },
    {
        "code": "1920-8",
        "display": "Aspartate aminotransferase [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "1751-7",
        "display": "Albumin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "1975-2",
        "display": "Bilirubin.total [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2885-2",
        "display": "Protein [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "6768-6",
        "display": "Alkaline phosphatase [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "788-0",
        "display": "Erythrocyte distribution width [Ratio] by Automated count"
    },
    {
        "code": "770-8",
        "display": "Neutrophils/100 leukocytes in Blood by Automated count"
    },
    {
        "code": "33914-3",
        "display": "Glomerular filtration rate/1.73 sq M.predicted by Creatinine-based formula (MDRD)"
    },
    {
        "code": "704-7",
        "display": "Basophils [#/volume] in Blood by Automated count"
    },
    {
        "code": "20570-8",
        "display": "Hematocrit [Volume Fraction] of Blood"
    },
    {
        "code": "48642-3",
        "display": "Glomerular filtration rate/1.73 sq M predicted among non-blacks by Creatinine-based formula (MDRD)"
    },
    {
        "code": "48643-1",
        "display": "Glomerular filtration rate/1.73 sq M predicted among blacks by Creatinine-based formula (MDRD)"
    },
    {
        "code": "26515-7",
        "display": "Platelets [#/volume] in Blood"
    },
    {
        "code": "2093-3",
        "display": "Cholesterol [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "26464-8",
        "display": "Leukocytes [#/volume] in Blood"
    },
    {
        "code": "30428-7",
        "display": "Erythrocyte mean corpuscular volume [Entitic volume]"
    },
    {
        "code": "731-0",
        "display": "Lymphocytes [#/volume] in Blood by Automated count"
    },
    {
        "code": "2571-8",
        "display": "Triglyceride [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "10466-1",
        "display": "Anion gap 3 in Serum or Plasma"
    },
    {
        "code": "2085-9",
        "display": "Cholesterol in HDL [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "6463-4",
        "display": "Bacteria identified in Unspecified specimen by Culture"
    },
    {
        "code": "26485-3",
        "display": "Monocytes/100 leukocytes in Blood"
    },
    {
        "code": "736-9",
        "display": "Lymphocytes/100 leukocytes in Blood by Automated count"
    },
    {
        "code": "706-2",
        "display": "Basophils/100 leukocytes in Blood by Automated count"
    },
    {
        "code": "713-8",
        "display": "Eosinophils/100 leukocytes in Blood by Automated count"
    },
    {
        "code": "5905-5",
        "display": "Monocytes/100 leukocytes in Blood by Automated count"
    },
    {
        "code": "26478-8",
        "display": "Lymphocytes/100 leukocytes in Blood"
    },
    {
        "code": "751-8",
        "display": "Neutrophils [#/volume] in Blood by Automated count"
    },
    {
        "code": "5902-2",
        "display": "Prothrombin time (PT) in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "33069-6",
        "display": "Fetal Neck.soft tissue Translucency width US"
    },
    {
        "code": "26450-7",
        "display": "Eosinophils/100 leukocytes in Blood"
    },
    {
        "code": "711-2",
        "display": "Eosinophils [#/volume] in Blood by Automated count"
    },
    {
        "code": "22637-3",
        "display": "Pathology report final diagnosis"
    },
    {
        "code": "742-7",
        "display": "Monocytes [#/volume] in Blood by Automated count"
    },
    {
        "code": "6301-6",
        "display": "INR in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "30180-4",
        "display": "Basophils/100 leukocytes in Blood"
    },
    {
        "code": "3097-3",
        "display": "Urea nitrogen/Creatinine [Mass ratio] in Serum or Plasma"
    },
    {
        "code": "5802-4",
        "display": "Nitrite [Presence] in Urine by Test strip"
    },
    {
        "code": "26499-4",
        "display": "Neutrophils [#/volume] in Blood"
    },
    {
        "code": "5778-6",
        "display": "Color of Urine"
    },
    {
        "code": "5803-2",
        "display": "pH of Urine by Test strip"
    },
    {
        "code": "1759-0",
        "display": "Albumin/Globulin [Mass ratio] in Serum or Plasma"
    },
    {
        "code": "26484-6",
        "display": "Monocytes [#/volume] in Blood"
    },
    {
        "code": "10834-0",
        "display": "Globulin [Mass/volume] in Serum by calculation"
    },
    {
        "code": "13457-7",
        "display": "Cholesterol in LDL [Mass/volume] in Serum or Plasma by calculation"
    },
    {
        "code": "5770-3",
        "display": "Bilirubin [Presence] in Urine by Test strip"
    },
    {
        "code": "5799-2",
        "display": "Leukocyte esterase [Presence] in Urine by Test strip"
    },
    {
        "code": "5767-9",
        "display": "Appearance of Urine"
    },
    {
        "code": "26449-9",
        "display": "Eosinophils [#/volume] in Blood"
    },
    {
        "code": "13458-5",
        "display": "Cholesterol in VLDL [Mass/volume] in Serum or Plasma by calculation"
    },
    {
        "code": "2777-1",
        "display": "Phosphate [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "26474-7",
        "display": "Lymphocytes [#/volume] in Blood"
    },
    {
        "code": "5811-5",
        "display": "Specific gravity of Urine by Test strip"
    },
    {
        "code": "5794-3",
        "display": "Hemoglobin [Presence] in Urine by Test strip"
    },
    {
        "code": "5792-7",
        "display": "Glucose [Mass/volume] in Urine by Test strip"
    },
    {
        "code": "5804-0",
        "display": "Protein [Mass/volume] in Urine by Test strip"
    },
    {
        "code": "11579-0",
        "display": "Thyrotropin [Units/volume] in Serum or Plasma by Detection limit <= 0.05 mIU/L"
    },
    {
        "code": "26511-6",
        "display": "Neutrophils/100 leukocytes in Blood"
    },
    {
        "code": "3173-2",
        "display": "Activated partial thromboplastin time (aPTT) in Blood by Coagulation assay"
    },
    {
        "code": "2601-3",
        "display": "Magnesium [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "5821-4",
        "display": "Leukocytes [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "5797-6",
        "display": "Ketones [Mass/volume] in Urine by Test strip"
    },
    {
        "code": "4548-4",
        "display": "Hemoglobin A1c/Hemoglobin.total in Blood"
    },
    {
        "code": "1968-7",
        "display": "Bilirubin.direct [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2336-6",
        "display": "Globulin [Mass/volume] in Serum"
    },
    {
        "code": "11555-0",
        "display": "Base excess in Blood"
    },
    {
        "code": "47527-7",
        "display": "Cytology report of Cervical or vaginal smear or scraping Cyto stain.thin prep"
    },
    {
        "code": "11557-6",
        "display": "Carbon dioxide [Partial pressure] in Blood"
    },
    {
        "code": "11556-8",
        "display": "Oxygen [Partial pressure] in Blood"
    },
    {
        "code": "22636-5",
        "display": "Pathology report relevant history"
    },
    {
        "code": "5769-5",
        "display": "Bacteria [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "2157-6",
        "display": "Creatine kinase [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "9830-1",
        "display": "Cholesterol.total/Cholesterol in HDL [Mass ratio] in Serum or Plasma"
    },
    {
        "code": "2089-1",
        "display": "Cholesterol in LDL [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "630-4",
        "display": "Bacteria identified in Urine by Culture"
    },
    {
        "code": "19123-9",
        "display": "Magnesium [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2713-6",
        "display": "Oxygen saturation.calculated from oxygen partial pressure in Blood"
    },
    {
        "code": "22638-1",
        "display": "Pathology report comments"
    },
    {
        "code": "11558-4",
        "display": "pH of Blood"
    },
    {
        "code": "22639-9",
        "display": "Pathology report supplemental reports"
    },
    {
        "code": "20454-5",
        "display": "Protein [Presence] in Urine by Test strip"
    },
    {
        "code": "13945-1",
        "display": "Erythrocytes [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "738-5",
        "display": "Macrocytes [Presence] in Blood by Light microscopy"
    },
    {
        "code": "2514-8",
        "display": "Ketones [Presence] in Urine by Test strip"
    },
    {
        "code": "741-9",
        "display": "Microcytes [Presence] in Blood by Light microscopy"
    },
    {
        "code": "19146-0",
        "display": "Reference lab test results"
    },
    {
        "code": "3016-3",
        "display": "Thyrotropin [Units/volume] in Serum or Plasma"
    },
    {
        "code": "6298-4",
        "display": "Potassium [Moles/volume] in Blood"
    },
    {
        "code": "3107-0",
        "display": "Urobilinogen [Mass/volume] in Urine"
    },
    {
        "code": "19764-0",
        "display": "Statement of adequacy [interpretation] of Cervical or vaginal smear or scraping by Cyto stain"
    },
    {
        "code": "19767-3",
        "display": "Cytologist who read Cyto stain of Cervical or vaginal smear or scraping"
    },
    {
        "code": "19763-2",
        "display": "Specimen source [Identifier] in Cervical or vaginal smear or scraping by Cyto stain"
    },
    {
        "code": "13969-1",
        "display": "Creatine kinase.MB [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "18314-5",
        "display": "Morphology [interpretation] in Blood Narrative"
    },
    {
        "code": "10839-9",
        "display": "Troponin I.cardiac [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "19773-1",
        "display": "Recommended follow-up [Identifier] in Cervical or vaginal smear or scraping by Cyto stain"
    },
    {
        "code": "19769-9",
        "display": "Pathologist who read Cyto stain of Cervical or vaginal smear or scraping"
    },
    {
        "code": "2349-9",
        "display": "Glucose [Presence] in Urine"
    },
    {
        "code": "20405-7",
        "display": "Urobilinogen [Mass/volume] in Urine by Test strip"
    },
    {
        "code": "33037-3",
        "display": "Anion gap in Serum or Plasma"
    },
    {
        "code": "728-6",
        "display": "Hypochromia [Presence] in Blood by Light microscopy"
    },
    {
        "code": "1959-6",
        "display": "Bicarbonate [Moles/volume] in Blood"
    },
    {
        "code": "26444-0",
        "display": "Basophils [#/volume] in Blood"
    },
    {
        "code": "2965-2",
        "display": "Specific gravity of Urine"
    },
    {
        "code": "23658-8",
        "display": "Other Antibiotic [Susceptibility]"
    },
    {
        "code": "2857-1",
        "display": "Prostate specific Ag [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "1971-1",
        "display": "Bilirubin.indirect [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "20409-9",
        "display": "Erythrocytes [#/volume] in Urine by Test strip"
    },
    {
        "code": "1989-3",
        "display": "Calcidiol [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "8247-9",
        "display": "Mucus [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "2947-0",
        "display": "Sodium [Moles/volume] in Blood"
    },
    {
        "code": "1994-3",
        "display": "Calcium.ionized [Moles/volume] in Blood"
    },
    {
        "code": "600-7",
        "display": "Bacteria identified in Blood by Culture"
    },
    {
        "code": "6742-1",
        "display": "Erythrocyte morphology finding [Identifier] in Blood"
    },
    {
        "code": "3024-7",
        "display": "Thyroxine (T4) free [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "5818-0",
        "display": "Urobilinogen [Presence] in Urine by Test strip"
    },
    {
        "code": "11054-4",
        "display": "Cholesterol in LDL/Cholesterol in HDL [Mass ratio] in Serum or Plasma"
    },
    {
        "code": "764-1",
        "display": "Neutrophils.band form/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "4537-7",
        "display": "Erythrocyte sedimentation rate by Westergren method"
    },
    {
        "code": "8310-5",
        "display": "Body temperature"
    },
    {
        "code": "3040-3",
        "display": "Lipase [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "2498-4",
        "display": "Iron [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "9317-9",
        "display": "Platelets [Presence] in Blood by Light microscopy"
    },
    {
        "code": "3084-1",
        "display": "Urate [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "20565-8",
        "display": "Carbon dioxide, total [Moles/volume] in Blood"
    },
    {
        "code": "925-8",
        "display": "Blood product disposition [Type]"
    },
    {
        "code": "3026-2",
        "display": "Thyroxine (T4) [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "13317-3",
        "display": "Methicillin resistant Staphylococcus aureus [Presence] in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "14979-9",
        "display": "Activated partial thromboplastin time (aPTT) in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "11277-1",
        "display": "Epithelial cells.squamous [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "32623-1",
        "display": "Platelet mean volume [Entitic volume] in Blood by Automated count"
    },
    {
        "code": "2132-9",
        "display": "Cobalamin (Vitamin B12) [Mass/volume] in Serum"
    },
    {
        "code": "20453-7",
        "display": "Epithelial cells [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "1798-8",
        "display": "Amylase [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "2276-4",
        "display": "Ferritin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "1988-5",
        "display": "C reactive protein [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "5808-1",
        "display": "Erythrocytes [#/volume] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "2532-0",
        "display": "Lactate dehydrogenase [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "2500-7",
        "display": "Iron binding capacity [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "5782-8",
        "display": "Crystals [type] in Urine sediment by Light microscopy"
    },
    {
        "code": "21000-5",
        "display": "Erythrocyte distribution width [Entitic volume] by Automated count"
    },
    {
        "code": "2753-2",
        "display": "pH of Serum or Plasma"
    },
    {
        "code": "2161-8",
        "display": "Creatinine [Mass/volume] in Urine"
    },
    {
        "code": "20408-1",
        "display": "Leukocytes [#/volume] in Urine by Test strip"
    },
    {
        "code": "27045-4",
        "display": "Microscopic exam [interpretation] of Urine by Cytology"
    },
    {
        "code": "31100-1",
        "display": "Hematocrit [Volume Fraction] of Blood by Impedance"
    },
    {
        "code": "11580-8",
        "display": "Thyrotropin [Units/volume] in Serum or Plasma by Detection limit <= 0.005 mIU/L"
    },
    {
        "code": "5787-7",
        "display": "Epithelial cells [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "735-1",
        "display": "Lymphocytes Variant/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "934-0",
        "display": "Blood product unit ID [#]"
    },
    {
        "code": "882-1",
        "display": "ABO & Rh group [Type] in Blood"
    },
    {
        "code": "19161-9",
        "display": "Urobilinogen [Units/volume] in Urine by Test strip"
    },
    {
        "code": "1978-6",
        "display": "Bilirubin [Mass/volume] in Urine"
    },
    {
        "code": "30167-1",
        "display": "Human papilloma virus 16+18+31+33+35+39+45+51+52+56+58+59+68 DNA [Presence] in Cervix by Probe & signal amplification method"
    },
    {
        "code": "20507-0",
        "display": "Reagin Ab [Presence] in Serum by RPR"
    },
    {
        "code": "3151-8",
        "display": "Inhaled oxygen flow rate"
    },
    {
        "code": "14957-5",
        "display": "Microalbumin [Mass/volume] in Urine"
    },
    {
        "code": "58448-2",
        "display": "Microalbumin ug/min [Mass/time] in 24 hour Urine"
    },
    {
        "code": "26508-2",
        "display": "Neutrophils.band form/100 leukocytes in Blood"
    },
    {
        "code": "24111-7",
        "display": "Neisseria gonorrhoeae DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "11279-7",
        "display": "Urine sediment comments by Light microscopy Narrative"
    },
    {
        "code": "21613-5",
        "display": "Chlamydia trachomatis DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "2284-8",
        "display": "Folate [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "1995-0",
        "display": "Calcium.ionized [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "11282-1",
        "display": "Cells Counted Total [#] in Blood"
    },
    {
        "code": "2106-3",
        "display": "Choriogonadotropin (Pregnancy test) [Presence] in Urine"
    },
    {
        "code": "933-2",
        "display": "Blood product type"
    },
    {
        "code": "737-7",
        "display": "Lymphocytes/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "2744-1",
        "display": "pH of Arterial blood"
    },
    {
        "code": "30313-1",
        "display": "Hemoglobin [Mass/volume] in Arterial blood"
    },
    {
        "code": "10378-8",
        "display": "Polychromasia [Presence] in Blood by Light microscopy"
    },
    {
        "code": "2324-2",
        "display": "Gamma glutamyl transferase [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "25162-9",
        "display": "Hyaline casts [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "2502-3",
        "display": "Iron saturation [Mass Fraction] in Serum or Plasma"
    },
    {
        "code": "2703-7",
        "display": "Oxygen [Partial pressure] in Arterial blood"
    },
    {
        "code": "664-3",
        "display": "Microscopic observation [Identifier] in Unspecified specimen by Gram stain"
    },
    {
        "code": "3879-4",
        "display": "Opiates [Presence] in Urine"
    },
    {
        "code": "3390-2",
        "display": "Benzodiazepines [Presence] in Urine"
    },
    {
        "code": "27353-2",
        "display": "Glucose mean value [Mass/volume] in Blood Estimated from glycated hemoglobin"
    },
    {
        "code": "890-4",
        "display": "Blood group antibody screen [Presence] in Serum or Plasma"
    },
    {
        "code": "26507-4",
        "display": "Neutrophils.band form [#/volume] in Blood"
    },
    {
        "code": "3050-2",
        "display": "Triiodothyronine resin uptake (T3RU) in Serum or Plasma"
    },
    {
        "code": "30405-5",
        "display": "Leukocytes [#/volume] in Urine"
    },
    {
        "code": "48345-3",
        "display": "HIV 1+O+2 Ab [Presence] in Serum or Plasma"
    },
    {
        "code": "2986-8",
        "display": "Testosterone [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "30934-4",
        "display": "Natriuretic peptide B [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2019-8",
        "display": "Carbon dioxide [Partial pressure] in Arterial blood"
    },
    {
        "code": "34714-6",
        "display": "INR in Blood by Coagulation assay"
    },
    {
        "code": "3377-9",
        "display": "Barbiturates [Presence] in Urine"
    },
    {
        "code": "8061-4",
        "display": "Nuclear Ab [Presence] in Serum"
    },
    {
        "code": "11529-5",
        "display": "Surgical pathology study"
    },
    {
        "code": "5196-1",
        "display": "Hepatitis B virus surface Ag [Presence] in Serum by Immunoassay"
    },
    {
        "code": "49136-5",
        "display": "Creatine kinase.MB/Creatine kinase.total [Ratio] in Serum or Plasma"
    },
    {
        "code": "14959-1",
        "display": "Microalbumin/Creatinine [Mass ratio] in Urine"
    },
    {
        "code": "48346-1",
        "display": "HIV 1+O+2 Ab [Units/volume] in Serum or Plasma"
    },
    {
        "code": "3349-8",
        "display": "Amphetamines [Presence] in Urine"
    },
    {
        "code": "17856-6",
        "display": "Hemoglobin A1c/Hemoglobin.total in Blood by HPLC"
    },
    {
        "code": "11253-2",
        "display": "Tacrolimus [Mass/volume] in Blood"
    },
    {
        "code": "33903-6",
        "display": "Ketones [Presence] in Urine"
    },
    {
        "code": "883-9",
        "display": "ABO group [Type] in Blood"
    },
    {
        "code": "2091-7",
        "display": "Cholesterol in VLDL [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2458-8",
        "display": "IgA [Mass/volume] in Serum"
    },
    {
        "code": "2501-5",
        "display": "Iron binding capacity.unsaturated [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "32215-6",
        "display": "Thyroxine (T4) free index in Serum or Plasma"
    },
    {
        "code": "3053-6",
        "display": "Triiodothyronine (T3) [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "18282-4",
        "display": "Cannabinoids [Presence] in Urine by Screen method"
    },
    {
        "code": "744-3",
        "display": "Monocytes/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "5195-3",
        "display": "Hepatitis B virus surface Ag [Presence] in Serum"
    },
    {
        "code": "1003-3",
        "display": "Indirect antiglobulin test.complement specific reagent [Presence] in Serum or Plasma"
    },
    {
        "code": "769-0",
        "display": "Neutrophils.segmented/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "714-6",
        "display": "Eosinophils/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "15067-2",
        "display": "Follitropin [Units/volume] in Serum or Plasma"
    },
    {
        "code": "2243-4",
        "display": "Estradiol (E2) [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "53927-0",
        "display": "Neisseria gonorrhoeae rRNA [Presence] in Urethra by Probe & target amplification method"
    },
    {
        "code": "60256-5",
        "display": "Neisseria gonorrhoeae rRNA [Presence] in Urine by Probe & target amplification method"
    },
    {
        "code": "702-1",
        "display": "Anisocytosis [Presence] in Blood by Light microscopy"
    },
    {
        "code": "707-0",
        "display": "Basophils/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "19145-2",
        "display": "Reference lab test name"
    },
    {
        "code": "29265-6",
        "display": "Calcium [Moles/volume] corrected for albumin in Serum or Plasma"
    },
    {
        "code": "5796-8",
        "display": "Hyaline casts [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "5198-7",
        "display": "Hepatitis C virus Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "2731-8",
        "display": "Parathyrin.intact [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2465-3",
        "display": "IgG [Mass/volume] in Serum"
    },
    {
        "code": "53925-4",
        "display": "Chlamydia trachomatis rRNA [Presence] in Urethra by Probe & target amplification method"
    },
    {
        "code": "774-0",
        "display": "Ovalocytes [Presence] in Blood by Light microscopy"
    },
    {
        "code": "12454-5",
        "display": "Urate crystals amorphous [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "30341-2",
        "display": "Erythrocyte sedimentation rate"
    },
    {
        "code": "798-9",
        "display": "Erythrocytes [#/volume] in Urine by Automated count"
    },
    {
        "code": "1250-0",
        "display": "Major crossmatch [interpretation]"
    },
    {
        "code": "22634-0",
        "display": "Pathology report gross observation"
    },
    {
        "code": "18262-6",
        "display": "Cholesterol in LDL [Mass/volume] in Serum or Plasma by Direct assay"
    },
    {
        "code": "56598-6",
        "display": "Epstein Barr virus early IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "11572-5",
        "display": "Rheumatoid factor [Units/volume] in Serum"
    },
    {
        "code": "19080-1",
        "display": "Choriogonadotropin [Units/volume] in Serum or Plasma"
    },
    {
        "code": "18998-5",
        "display": "Trimethoprim+Sulfamethoxazole [Susceptibility]"
    },
    {
        "code": "43304-5",
        "display": "Chlamydia trachomatis rRNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "10331-7",
        "display": "Rh [Type] in Blood"
    },
    {
        "code": "43305-2",
        "display": "Neisseria gonorrhoeae rRNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "10701-1",
        "display": "Ova+Parasites identified in Stool by Concentration"
    },
    {
        "code": "13362-9",
        "display": "Collection duration of Urine"
    },
    {
        "code": "11125-2",
        "display": "Platelet morphology finding [Identifier] in Blood"
    },
    {
        "code": "15180-3",
        "display": "Hypochromia [Presence] in Blood by Automated count"
    },
    {
        "code": "12258-0",
        "display": "Epithelial cells.squamous [Presence] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "22633-2",
        "display": "Pathology report site of origin"
    },
    {
        "code": "2472-9",
        "display": "IgM [Mass/volume] in Serum"
    },
    {
        "code": "31208-2",
        "display": "Specimen source [Identifier] of Unspecified specimen"
    },
    {
        "code": "18928-2",
        "display": "Gentamicin [Susceptibility]"
    },
    {
        "code": "5671-3",
        "display": "Lead [Mass/volume] in Blood"
    },
    {
        "code": "3255-7",
        "display": "Fibrinogen [Mass/volume] in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "3184-9",
        "display": "Activated clotting time in Blood by Coagulation assay"
    },
    {
        "code": "19139-5",
        "display": "Pathologist name"
    },
    {
        "code": "6462-6",
        "display": "Bacteria identified in Wound by Culture"
    },
    {
        "code": "10501-5",
        "display": "Lutropin [Units/volume] in Serum or Plasma"
    },
    {
        "code": "19244-3",
        "display": "Character of Urine"
    },
    {
        "code": "19659-2",
        "display": "Phencyclidine [Presence] in Urine by Screen method"
    },
    {
        "code": "3051-0",
        "display": "Triiodothyronine (T3) Free [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "624-7",
        "display": "Bacteria identified in Sputum by Respiratory culture"
    },
    {
        "code": "634-6",
        "display": "Bacteria identified in Unspecified specimen by Aerobe culture"
    },
    {
        "code": "50387-0",
        "display": "Chlamydia trachomatis rRNA [Presence] in Cervix by Probe & target amplification method"
    },
    {
        "code": "50388-8",
        "display": "Neisseria gonorrhoeae rRNA [Presence] in Cervix by Probe & target amplification method"
    },
    {
        "code": "35691-5",
        "display": "XXX microorganism DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "51656-7",
        "display": "Hepatitis C virus Ab Signal/Cutoff [Ratio] in Body fluid"
    },
    {
        "code": "4679-7",
        "display": "Reticulocytes/100 erythrocytes in Blood"
    },
    {
        "code": "22635-7",
        "display": "Pathology report microscopic observation Other stain"
    },
    {
        "code": "38483-4",
        "display": "Creatinine [Mass/volume] in Blood"
    },
    {
        "code": "15150-6",
        "display": "Anisocytosis [Presence] in Blood by Automated count"
    },
    {
        "code": "14338-8",
        "display": "Prealbumin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "15198-5",
        "display": "Macrocytes [Presence] in Blood by Automated count"
    },
    {
        "code": "33051-4",
        "display": "Erythrocytes [Presence] in Urine"
    },
    {
        "code": "6299-2",
        "display": "Urea nitrogen [Mass/volume] in Blood"
    },
    {
        "code": "43396-1",
        "display": "Cholesterol non HDL [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2842-3",
        "display": "Prolactin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "6598-7",
        "display": "Troponin T.cardiac [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2888-6",
        "display": "Protein [Mass/volume] in Urine"
    },
    {
        "code": "3393-6",
        "display": "Benzoylecgonine [Presence] in Urine"
    },
    {
        "code": "9842-6",
        "display": "Casts [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "2069-3",
        "display": "Chloride [Moles/volume] in Blood"
    },
    {
        "code": "5334-8",
        "display": "Rubella virus IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "20569-0",
        "display": "Creatine kinase.MB/Creatine kinase.total in Serum or Plasma"
    },
    {
        "code": "42931-6",
        "display": "Chlamydia trachomatis rRNA [Presence] in Urine by Probe & target amplification method"
    },
    {
        "code": "15199-3",
        "display": "Microcytes [Presence] in Blood by Automated count"
    },
    {
        "code": "20629-2",
        "display": "Levofloxacin [Susceptibility]"
    },
    {
        "code": "3397-7",
        "display": "Cocaine [Presence] in Urine"
    },
    {
        "code": "779-9",
        "display": "Poikilocytosis [Presence] in Blood by Light microscopy"
    },
    {
        "code": "35591-7",
        "display": "Creatinine renal clearance predicted by Cockcroft-Gault formula"
    },
    {
        "code": "32356-8",
        "display": "Yeast [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "18878-9",
        "display": "Cefazolin [Susceptibility]"
    },
    {
        "code": "740-1",
        "display": "Metamyelocytes/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "12851-2",
        "display": "Protein Fractions [interpretation] in Serum or Plasma by Electrophoresis"
    },
    {
        "code": "31147-2",
        "display": "Reagin Ab [Titer] in Serum by RPR"
    },
    {
        "code": "25428-4",
        "display": "Glucose [Presence] in Urine by Test strip"
    },
    {
        "code": "1960-4",
        "display": "Bicarbonate [Moles/volume] in Arterial blood"
    },
    {
        "code": "2111-3",
        "display": "Choriogonadotropin.beta subunit [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "2039-6",
        "display": "Carcinoembryonic Ag [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2862-1",
        "display": "Albumin [Mass/volume] in Serum or Plasma by Electrophoresis"
    },
    {
        "code": "2871-2",
        "display": "Beta globulin [Mass/volume] in Serum or Plasma by Electrophoresis"
    },
    {
        "code": "2865-4",
        "display": "Alpha 1 globulin [Mass/volume] in Serum or Plasma by Electrophoresis"
    },
    {
        "code": "2868-8",
        "display": "Alpha 2 globulin [Mass/volume] in Serum or Plasma by Electrophoresis"
    },
    {
        "code": "18906-8",
        "display": "Ciprofloxacin [Susceptibility]"
    },
    {
        "code": "2839-9",
        "display": "Progesterone [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "13950-1",
        "display": "Hepatitis A virus IgM Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "28541-1",
        "display": "Metamyelocytes/100 leukocytes in Blood"
    },
    {
        "code": "3936-2",
        "display": "Phencyclidine [Presence] in Urine"
    },
    {
        "code": "48159-8",
        "display": "Hepatitis C virus Ab Signal/Cutoff [Ratio] in Serum or Plasma by Immunoassay"
    },
    {
        "code": "2874-6",
        "display": "Gamma globulin [Mass/volume] in Serum or Plasma by Electrophoresis"
    },
    {
        "code": "31201-7",
        "display": "HIV 1+2 Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "2991-8",
        "display": "Testosterone Free [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "58413-6",
        "display": "Nucleated erythrocytes/100 leukocytes [Ratio] in Blood by Automated count"
    },
    {
        "code": "36903-3",
        "display": "Chlamydia trachomatis+Neisseria gonorrhoeae DNA [Identifier] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "580-1",
        "display": "Fungus identified in Unspecified specimen by Culture"
    },
    {
        "code": "2692-2",
        "display": "Osmolality of Serum or Plasma"
    },
    {
        "code": "18865-6",
        "display": "Ampicillin+Sulbactam [Susceptibility]"
    },
    {
        "code": "18864-9",
        "display": "Ampicillin [Susceptibility]"
    },
    {
        "code": "1558-6",
        "display": "Fasting glucose [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "635-3",
        "display": "Bacteria identified in Unspecified specimen by Anaerobe culture"
    },
    {
        "code": "547-0",
        "display": "Streptococcus.beta-hemolytic [Presence] in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "5194-6",
        "display": "Hepatitis B virus surface Ab [Units/volume] in Serum by Radioimmunoassay (RIA)"
    },
    {
        "code": "18955-5",
        "display": "Nitrofurantoin [Susceptibility]"
    },
    {
        "code": "18481-2",
        "display": "Streptococcus pyogenes Ag [Presence] in Throat"
    },
    {
        "code": "1504-0",
        "display": "Glucose [Mass/volume] in Serum or Plasma --1 hour post 50 g glucose PO"
    },
    {
        "code": "12235-8",
        "display": "Microscopic observation [Identifier] in Urine sediment by Light microscopy"
    },
    {
        "code": "7791-7",
        "display": "Dacrocytes [Presence] in Blood by Light microscopy"
    },
    {
        "code": "2143-6",
        "display": "Cortisol [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "46744-9",
        "display": "Organic acidemias newborn screen interpretation"
    },
    {
        "code": "14611-8",
        "display": "Nuclear Ab pattern [interpretation] in Serum"
    },
    {
        "code": "8099-4",
        "display": "Thyroperoxidase Ab [Units/volume] in Serum or Plasma"
    },
    {
        "code": "5048-4",
        "display": "Nuclear Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "2524-7",
        "display": "Lactate [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "763-3",
        "display": "Neutrophils.band form [#/volume] in Blood by Manual count"
    },
    {
        "code": "30522-7",
        "display": "C reactive protein [Mass/volume] in Serum or Plasma by High sensitivity method"
    },
    {
        "code": "11156-7",
        "display": "Leukocyte morphology finding [Identifier] in Blood"
    },
    {
        "code": "19000-9",
        "display": "Vancomycin [Susceptibility]"
    },
    {
        "code": "2335-8",
        "display": "Hemoglobin.gastrointestinal [Presence] in Stool"
    },
    {
        "code": "6824-7",
        "display": "Color of Body fluid"
    },
    {
        "code": "24113-3",
        "display": "Hepatitis B virus core IgM Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "14578-9",
        "display": "ABO group [Type] in Blood from Blood product unit"
    },
    {
        "code": "14907-0",
        "display": "Rh [Type] in Blood from Blood product unit"
    },
    {
        "code": "3968-5",
        "display": "Phenytoin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "10535-3",
        "display": "Digoxin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "13965-9",
        "display": "Homocysteine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "35674-1",
        "display": "Creatinine [Mass/volume] in unspecified time Urine"
    },
    {
        "code": "18893-8",
        "display": "Ceftazidime [Susceptibility]"
    },
    {
        "code": "18970-4",
        "display": "Piperacillin+Tazobactam [Susceptibility]"
    },
    {
        "code": "54218-3",
        "display": "CD3+CD4+ (T4 helper) cells/CD3+CD8+ (T8 suppressor cells) cells [# Ratio] in Blood"
    },
    {
        "code": "800-3",
        "display": "Schistocytes [Presence] in Blood by Light microscopy"
    },
    {
        "code": "21198-7",
        "display": "Choriogonadotropin.beta subunit [Units/volume] in Serum or Plasma"
    },
    {
        "code": "5643-2",
        "display": "Ethanol [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "22763-7",
        "display": "Ammonia [Mass/volume] in Plasma"
    },
    {
        "code": "16362-6",
        "display": "Ammonia [Moles/volume] in Plasma"
    },
    {
        "code": "3426-4",
        "display": "Tetrahydrocannabinol [Presence] in Urine"
    },
    {
        "code": "26487-9",
        "display": "Monocytes/100 leukocytes in Body fluid"
    },
    {
        "code": "11031-2",
        "display": "Lymphocytes/100 leukocytes in Body fluid"
    },
    {
        "code": "749-2",
        "display": "Myelocytes/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "18932-4",
        "display": "Imipenem [Susceptibility]"
    },
    {
        "code": "18943-1",
        "display": "Meropenem [Susceptibility]"
    },
    {
        "code": "32673-6",
        "display": "Creatine kinase.MB [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "22322-2",
        "display": "Hepatitis B virus surface Ab [Presence] in Serum"
    },
    {
        "code": "13655-6",
        "display": "Leukocytes [Presence] in Stool by Light microscopy"
    },
    {
        "code": "8123-2",
        "display": "CD3+CD4+ (T4 helper) cells/100 cells in Blood"
    },
    {
        "code": "26498-6",
        "display": "Myelocytes/100 leukocytes in Blood"
    },
    {
        "code": "19162-7",
        "display": "Varicella zoster virus IgG Ab [Presence] in Serum"
    },
    {
        "code": "18879-7",
        "display": "Cefepime [Susceptibility]"
    },
    {
        "code": "5783-6",
        "display": "Unidentified crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "4092-3",
        "display": "Vancomycin [Mass/volume] in Serum or Plasma --trough"
    },
    {
        "code": "8124-0",
        "display": "CD3 cells/100 cells in Blood"
    },
    {
        "code": "31017-7",
        "display": "Tissue transglutaminase IgA Ab [Units/volume] in Serum"
    },
    {
        "code": "3150-0",
        "display": "Inhaled oxygen concentration (FIO2)"
    },
    {
        "code": "1834-1",
        "display": "Alpha-1-Fetoprotein [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "3167-4",
        "display": "Volume of 24 hour Urine"
    },
    {
        "code": "18895-3",
        "display": "Ceftriaxone [Susceptibility]"
    },
    {
        "code": "1925-7",
        "display": "Base excess in Arterial blood"
    },
    {
        "code": "1990-1",
        "display": "Cholecalciferol (Vit D3) [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2236-8",
        "display": "Calciferol (Vit D2) [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "20448-7",
        "display": "Insulin [Units/volume] in Serum or Plasma"
    },
    {
        "code": "18993-6",
        "display": "Tetracycline [Susceptibility]"
    },
    {
        "code": "17790-7",
        "display": "Leukocytes Left Shift [Presence] in Blood by Automated count"
    },
    {
        "code": "13955-0",
        "display": "Hepatitis C virus Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "18996-9",
        "display": "Tobramycin [Susceptibility]"
    },
    {
        "code": "8101-8",
        "display": "CD3+CD8+ (T8 suppressor cells) cells/100 cells in Blood"
    },
    {
        "code": "13451-0",
        "display": "Creatinine dialysis fluid clearance"
    },
    {
        "code": "1305-2",
        "display": "D Ag [Presence] in Blood"
    },
    {
        "code": "5130-0",
        "display": "DNA double strand Ab [Units/volume] in Serum"
    },
    {
        "code": "46737-3",
        "display": "Galactosemias newborn screen interpretation"
    },
    {
        "code": "3298-7",
        "display": "Acetaminophen [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "14895-7",
        "display": "Protein Fractions [interpretation] in Serum or Plasma by Immunofixation"
    },
    {
        "code": "18886-2",
        "display": "Cefotaxime [Susceptibility]"
    },
    {
        "code": "46733-2",
        "display": "Amino acidemias newborn screen interpretation"
    },
    {
        "code": "35492-8",
        "display": "Methicillin resistant Staphylococcus aureus (MRSA) DNA [Presence] by Probe & target amplification method"
    },
    {
        "code": "46736-5",
        "display": "Fatty acid oxidation defects newborn screen interpretation"
    },
    {
        "code": "4086-5",
        "display": "Valproate [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "38478-4",
        "display": "Biotinidase [Presence] in Dried blood spot"
    },
    {
        "code": "34148-7",
        "display": "Borrelia burgdorferi IgG+IgM Ab [Units/volume] in Serum"
    },
    {
        "code": "18969-6",
        "display": "Piperacillin [Susceptibility]"
    },
    {
        "code": "2955-3",
        "display": "Sodium [Moles/volume] in Urine"
    },
    {
        "code": "10381-2",
        "display": "Target cells [Presence] in Blood by Light microscopy"
    },
    {
        "code": "18860-7",
        "display": "Amikacin [Susceptibility]"
    },
    {
        "code": "12238-2",
        "display": "Neutrophils/100 leukocytes in Body fluid by Manual count"
    },
    {
        "code": "8098-6",
        "display": "Thyroglobulin Ab [Units/volume] in Serum or Plasma"
    },
    {
        "code": "3773-9",
        "display": "Methadone [Presence] in Urine"
    },
    {
        "code": "26452-3",
        "display": "Eosinophils/100 leukocytes in Body fluid"
    },
    {
        "code": "18961-3",
        "display": "Oxacillin [Susceptibility]"
    },
    {
        "code": "10352-3",
        "display": "Bacteria identified in Genital specimen by Aerobe culture"
    },
    {
        "code": "4073-3",
        "display": "Tricyclic antidepressants [Presence] in Serum or Plasma"
    },
    {
        "code": "1006-6",
        "display": "Direct antiglobulin test.IgG specific reagent [interpretation] on Red Blood Cells"
    },
    {
        "code": "31160-5",
        "display": "Polymorphonuclear cells/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "7790-9",
        "display": "Burr cells [Presence] in Blood by Light microscopy"
    },
    {
        "code": "543-9",
        "display": "Mycobacterium sp identified in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "20564-1",
        "display": "Oxygen saturation in Blood"
    },
    {
        "code": "8122-4",
        "display": "CD3 cells [#/volume] in Blood"
    },
    {
        "code": "21667-1",
        "display": "F5 gene mutations found [Identifier] in Blood or Tissue by Molecular genetics method Nominal"
    },
    {
        "code": "584-3",
        "display": "Streptococcus agalactiae [Presence] in Vaginal fluid by Organism specific culture"
    },
    {
        "code": "10334-1",
        "display": "Cancer Ag 125 [Units/volume] in Serum or Plasma"
    },
    {
        "code": "34713-8",
        "display": "Clostridium difficile toxin A+B [Presence] in Stool"
    },
    {
        "code": "26510-8",
        "display": "Neutrophils.band form/100 leukocytes in Body fluid"
    },
    {
        "code": "8246-1",
        "display": "Amorphous sediment [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "18919-1",
        "display": "Erythromycin [Susceptibility]"
    },
    {
        "code": "26455-6",
        "display": "Erythrocytes [#/volume] in Body fluid"
    },
    {
        "code": "4485-9",
        "display": "Complement C3 [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "4498-2",
        "display": "Complement C4 [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "57845-0",
        "display": "Leukocytes [#/volume] in Body fluid by Automated count"
    },
    {
        "code": "5176-3",
        "display": "Helicobacter pylori IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "16128-1",
        "display": "Hepatitis C virus Ab [Presence] in Serum"
    },
    {
        "code": "14135-8",
        "display": "CD3+CD8+ (T8 suppressor cells) cells [#/volume] in Blood"
    },
    {
        "code": "7918-6",
        "display": "HIV 1+2 Ab [Presence] in Serum"
    },
    {
        "code": "19312-8",
        "display": "Tricyclic antidepressants [Presence] in Urine by Screen method"
    },
    {
        "code": "18908-4",
        "display": "Clindamycin [Susceptibility]"
    },
    {
        "code": "2162-6",
        "display": "Creatinine [Mass/time] in 24 hour Urine"
    },
    {
        "code": "13518-6",
        "display": "Lymphocytes Variant/100 leukocytes in Body fluid by Manual count"
    },
    {
        "code": "12179-8",
        "display": "Basophils/100 leukocytes in Body fluid by Manual count"
    },
    {
        "code": "6864-3",
        "display": "Hemoglobin S [Presence] in Blood by Solubility test"
    },
    {
        "code": "49563-0",
        "display": "Troponin I.cardiac [Mass/volume] in Serum or Plasma by Detection limit = 0.01 ng/mL"
    },
    {
        "code": "33255-1",
        "display": "Cell Fractions/Differential [interpretation] in Blood"
    },
    {
        "code": "2708-6",
        "display": "Oxygen saturation in Arterial blood"
    },
    {
        "code": "5209-2",
        "display": "Herpes simplex virus 2 IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "18964-7",
        "display": "Penicillin [Susceptibility]"
    },
    {
        "code": "18868-0",
        "display": "Aztreonam [Susceptibility]"
    },
    {
        "code": "1863-0",
        "display": "Anion gap 4 in Serum or Plasma"
    },
    {
        "code": "29574-1",
        "display": "Thyrotropin [Presence] in Dried blood spot"
    },
    {
        "code": "19994-3",
        "display": "Oxygen/Inspired gas setting [Volume Fraction] Ventilator"
    },
    {
        "code": "32854-2",
        "display": "17-Hydroxyprogesterone [Presence] in Dried blood spot"
    },
    {
        "code": "29571-7",
        "display": "Phenylalanine [Presence] in Dried blood spot"
    },
    {
        "code": "21654-9",
        "display": "CFTR gene mutations found [Identifier] in Blood or Tissue by Molecular genetics method Nominal"
    },
    {
        "code": "38486-7",
        "display": "Homocystine [Presence] in Dried blood spot"
    },
    {
        "code": "38479-2",
        "display": "Branched chain keto-acid dehydrogenase complex [Presence] in Dried blood spot"
    },
    {
        "code": "46779-5",
        "display": "Medium/Short chain acyl-CoA dehydrogenase deficiency newborn screen interpretation"
    },
    {
        "code": "4024-6",
        "display": "Salicylates [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2095-8",
        "display": "Cholesterol in HDL/Cholesterol.total [Mass ratio] in Serum or Plasma"
    },
    {
        "code": "19113-0",
        "display": "IgE [Units/volume] in Serum"
    },
    {
        "code": "12232-5",
        "display": "Measles virus Ag [Presence] in Unspecified specimen by Immunofluorescence"
    },
    {
        "code": "2191-5",
        "display": "Dehydroepiandrosterone sulfate (DHEA-S) [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "625-4",
        "display": "Bacteria identified in Stool by Culture"
    },
    {
        "code": "24475-6",
        "display": "F2 gene p.G20210A [Presence] in Blood or Tissue by Molecular genetics method"
    },
    {
        "code": "30318-0",
        "display": "Base deficit in Blood"
    },
    {
        "code": "743-5",
        "display": "Monocytes [#/volume] in Blood by Manual count"
    },
    {
        "code": "5569-9",
        "display": "Acetone [Presence] in Urine"
    },
    {
        "code": "3520-4",
        "display": "Cyclosporine [Mass/volume] in Blood"
    },
    {
        "code": "32693-4",
        "display": "Lactate [Moles/volume] in Blood"
    },
    {
        "code": "48065-7",
        "display": "Fibrin D-dimer FEU [Mass/volume] in Platelet poor plasma"
    },
    {
        "code": "2110-5",
        "display": "Choriogonadotropin.beta subunit (pregnancy test) [Presence] in Serum or Plasma"
    },
    {
        "code": "13952-7",
        "display": "Hepatitis B virus core Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "610-6",
        "display": "Bacteria identified in Body fluid by Aerobe culture"
    },
    {
        "code": "5403-1",
        "display": "Varicella zoster virus IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "803-7",
        "display": "Toxic granules [Presence] in Blood by Light microscopy"
    },
    {
        "code": "33358-3",
        "display": "Protein.monoclonal [Mass/volume] in Serum or Plasma by Electrophoresis"
    },
    {
        "code": "65633-0",
        "display": "Hepatitis B virus surface Ag [Presence] in Serum by Confirmatory method"
    },
    {
        "code": "10524-7",
        "display": "Microscopic observation [Identifier] in Cervix by Cyto stain"
    },
    {
        "code": "29247-4",
        "display": "Sirolimus [Mass/volume] in Blood"
    },
    {
        "code": "739-3",
        "display": "Metamyelocytes [#/volume] in Blood by Manual count"
    },
    {
        "code": "2889-4",
        "display": "Protein [Mass/time] in 24 hour Urine"
    },
    {
        "code": "18887-0",
        "display": "Cefotetan [Susceptibility]"
    },
    {
        "code": "10335-8",
        "display": "Color of Cerebral spinal fluid"
    },
    {
        "code": "2505-6",
        "display": "Iron/Iron binding capacity.total [Mass ratio] in Serum or Plasma"
    },
    {
        "code": "30089-7",
        "display": "Transitional cells [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "20761-3",
        "display": "Clostridium difficile [Presence] in Stool by Agglutination"
    },
    {
        "code": "2828-2",
        "display": "Potassium [Moles/volume] in Urine"
    },
    {
        "code": "29891-9",
        "display": "Helicobacter pylori [Presence] in Stomach by urea breath test"
    },
    {
        "code": "19107-2",
        "display": "Histoplasma capsulatum Ag [Units/volume] in Serum by Radioimmunoassay (RIA)"
    },
    {
        "code": "2639-3",
        "display": "Myoglobin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "5028-6",
        "display": "Neisseria gonorrhoeae rRNA [Presence] in Unspecified specimen by DNA probe"
    },
    {
        "code": "1922-4",
        "display": "Base deficit in Arterial blood"
    },
    {
        "code": "48058-2",
        "display": "Fibrin D-dimer DDU [Mass/volume] in Platelet poor plasma by Immunoassay"
    },
    {
        "code": "35365-6",
        "display": "Vitamin D+Metabolites [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "772-4",
        "display": "Nucleated erythrocytes [#/volume] in Blood by Manual count"
    },
    {
        "code": "806-0",
        "display": "Leukocytes [#/volume] in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "1649-3",
        "display": "Calcitriol [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "3181-5",
        "display": "Cardiolipin IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "3182-3",
        "display": "Cardiolipin IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "4546-8",
        "display": "Hemoglobin A/Hemoglobin.total in Blood"
    },
    {
        "code": "49541-6",
        "display": "Fasting status [Presence] - Reported"
    },
    {
        "code": "4576-5",
        "display": "Hemoglobin F/Hemoglobin.total in Blood"
    },
    {
        "code": "2890-2",
        "display": "Protein/Creatinine [Mass ratio] in Urine"
    },
    {
        "code": "33935-8",
        "display": "Cyclic citrullinated peptide IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "16935-9",
        "display": "Hepatitis B virus surface Ab [Units/volume] in Serum"
    },
    {
        "code": "5193-8",
        "display": "Hepatitis B virus surface Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "20399-2",
        "display": "Nuclear Ab pattern.nucleolar [Titer] in Serum"
    },
    {
        "code": "25145-4",
        "display": "Bacteria [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "24467-3",
        "display": "CD3+CD4+ (T4 helper) cells [#/volume] in Blood"
    },
    {
        "code": "33762-6",
        "display": "Natriuretic peptide.B prohormone [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "48066-5",
        "display": "Fibrin D-dimer DDU [Mass/volume] in Platelet poor plasma"
    },
    {
        "code": "4625-0",
        "display": "Hemoglobin S/Hemoglobin.total in Blood"
    },
    {
        "code": "2746-6",
        "display": "pH of Venous blood"
    },
    {
        "code": "3376-1",
        "display": "Barbiturates [Presence] in Serum, Plasma or Blood"
    },
    {
        "code": "546-2",
        "display": "Streptococcus.beta-hemolytic [Presence] in Throat by Organism specific culture"
    },
    {
        "code": "21484-1",
        "display": "Mother's race"
    },
    {
        "code": "2021-4",
        "display": "Carbon dioxide [Partial pressure] in Venous blood"
    },
    {
        "code": "30446-9",
        "display": "Myelocytes [#/volume] in Blood"
    },
    {
        "code": "748-4",
        "display": "Myelocytes [#/volume] in Blood by Manual count"
    },
    {
        "code": "17898-8",
        "display": "Bacteria identified in Throat by Aerobe culture"
    },
    {
        "code": "673-4",
        "display": "Microscopic observation [Identifier] in Unspecified specimen by Ova & Parasite Preparation"
    },
    {
        "code": "5064-1",
        "display": "Borrelia burgdorferi IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "32998-7",
        "display": "Tissue transglutaminase IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "56537-4",
        "display": "Tissue transglutaminase IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "11011-4",
        "display": "Hepatitis C virus RNA [Units/volume] (viral load) in Serum or Plasma by Probe & target amplification method"
    },
    {
        "code": "12841-3",
        "display": "Prostate Specific Ag Free/Prostate specific Ag.total in Serum or Plasma"
    },
    {
        "code": "11006-4",
        "display": "Borrelia burgdorferi Ab [Presence] in Serum"
    },
    {
        "code": "2880-3",
        "display": "Protein [Mass/volume] in Cerebral spinal fluid"
    },
    {
        "code": "33944-0",
        "display": "Immunoglobulin light chains.lambda.free [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "3389-4",
        "display": "Benzodiazepines [Presence] in Serum or Plasma"
    },
    {
        "code": "5206-8",
        "display": "Herpes simplex virus 1 IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "19066-0",
        "display": "Blood bank comment"
    },
    {
        "code": "48803-1",
        "display": "Neural tube defect risk in Fetus"
    },
    {
        "code": "4563-3",
        "display": "Hemoglobin C/Hemoglobin.total in Blood"
    },
    {
        "code": "49049-0",
        "display": "Collection time of Unspecified specimen"
    },
    {
        "code": "13503-8",
        "display": "Borrelia burgdorferi Ab.IgM band pattern [interpretation] in Serum by Immunoblot (IB)"
    },
    {
        "code": "14725-6",
        "display": "[Type] of Body fluid"
    },
    {
        "code": "21299-3",
        "display": "Gestational age method"
    },
    {
        "code": "4545-0",
        "display": "Hematocrit [Volume Fraction] of Blood by Centrifugation"
    },
    {
        "code": "46765-4",
        "display": "Sickle cell anemia newborn screen interpretation"
    },
    {
        "code": "10362-2",
        "display": "Endomysium IgA Ab [Presence] in Serum"
    },
    {
        "code": "49048-2",
        "display": "Protein feed time"
    },
    {
        "code": "18862-3",
        "display": "Amoxicillin+Clavulanate [Susceptibility]"
    },
    {
        "code": "2342-4",
        "display": "Glucose [Mass/volume] in Cerebral spinal fluid"
    },
    {
        "code": "18965-4",
        "display": "Penicillin G [Susceptibility]"
    },
    {
        "code": "9587-7",
        "display": "Borrelia burgdorferi 41kD IgM Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "18390-5",
        "display": "Opiates [Presence] in Urine by Confirmatory method"
    },
    {
        "code": "10886-0",
        "display": "Prostate Specific Ag Free [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "14196-0",
        "display": "Reticulocytes [#/volume] in Blood"
    },
    {
        "code": "2695-5",
        "display": "Osmolality of Urine"
    },
    {
        "code": "42481-2",
        "display": "Human papilloma virus 6+11+42+43+44 DNA [Presence] in Cervix by Probe & signal amplification method"
    },
    {
        "code": "13951-9",
        "display": "Hepatitis A virus Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "13502-0",
        "display": "Borrelia burgdorferi Ab.IgG band pattern [interpretation] in Serum by Immunoblot (IB)"
    },
    {
        "code": "11090-8",
        "display": "Smith extractable nuclear Ab [Units/volume] in Serum"
    },
    {
        "code": "606-4",
        "display": "Bacteria identified in Cerebral spinal fluid by Culture"
    },
    {
        "code": "6561-5",
        "display": "Treponema pallidum IgG Ab [Presence] in Serum"
    },
    {
        "code": "47238-1",
        "display": "Treponema pallidum IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "18185-9",
        "display": "Gestational age"
    },
    {
        "code": "9597-6",
        "display": "Borrelia burgdorferi 93kD IgG Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "31418-7",
        "display": "Heterophile Ab [Presence] in Serum"
    },
    {
        "code": "17792-3",
        "display": "Sjogrens syndrome-A extractable nuclear Ab [Units/volume] in Serum"
    },
    {
        "code": "11004-9",
        "display": "Tricyclic antidepressants [Presence] in Urine"
    },
    {
        "code": "17791-5",
        "display": "Sjogrens syndrome-B extractable nuclear Ab [Units/volume] in Serum"
    },
    {
        "code": "9593-5",
        "display": "Borrelia burgdorferi 41kD IgG Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9590-1",
        "display": "Borrelia burgdorferi 28kD IgG Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9594-3",
        "display": "Borrelia burgdorferi 45kD IgG Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9589-3",
        "display": "Borrelia burgdorferi 23kD IgG Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9591-9",
        "display": "Borrelia burgdorferi 30kD IgG Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9592-7",
        "display": "Borrelia burgdorferi 39kD IgG Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9599-2",
        "display": "Borrelia burgdorferi 39kD IgM Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9598-4",
        "display": "Borrelia burgdorferi 23kD IgM Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9595-0",
        "display": "Borrelia burgdorferi 58kD IgG Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9596-8",
        "display": "Borrelia burgdorferi 66kD IgG Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "47000-5",
        "display": "Candida sp rRNA [Presence] in Vaginal fluid by DNA probe"
    },
    {
        "code": "9588-5",
        "display": "Borrelia burgdorferi 18kD IgG Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "44357-2",
        "display": "Galactomannan Ag [Units/volume] in Serum or Plasma by Immunoassay"
    },
    {
        "code": "6410-5",
        "display": "Gardnerella vaginalis rRNA [Presence] in Genital specimen by DNA probe"
    },
    {
        "code": "6568-0",
        "display": "Trichomonas vaginalis rRNA [Presence] in Genital specimen by DNA probe"
    },
    {
        "code": "14564-9",
        "display": "Hemoglobin.gastrointestinal [Presence] in Stool --2nd specimen"
    },
    {
        "code": "2164-2",
        "display": "Creatinine renal clearance in 24 hour Urine"
    },
    {
        "code": "43371-4",
        "display": "Salmonella sp/Shigella sp identified in Stool by Organism specific culture"
    },
    {
        "code": "6331-3",
        "display": "Campylobacter sp identified in Stool by Organism specific culture"
    },
    {
        "code": "21262-1",
        "display": "Escherichia coli shiga-like [Presence] in Stool by Immunoassay"
    },
    {
        "code": "29374-6",
        "display": "Ribonucleoprotein extractable nuclear Ab [Units/volume] in Serum"
    },
    {
        "code": "9335-1",
        "display": "Appearance of Body fluid"
    },
    {
        "code": "19157-7",
        "display": "Tube number of Cerebral spinal fluid"
    },
    {
        "code": "29463-7",
        "display": "Body weight"
    },
    {
        "code": "36916-5",
        "display": "Immunoglobulin light chains.kappa.free [Mass/volume] in Serum"
    },
    {
        "code": "15189-4",
        "display": "Immunoglobulin light chains.kappa/Immunoglobulin light chains.lambda [Mass ratio] in Serum"
    },
    {
        "code": "4542-7",
        "display": "Haptoglobin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "5640-8",
        "display": "Ethanol [Mass/volume] in Blood"
    },
    {
        "code": "19993-5",
        "display": "Oxygen/Inspired gas Inhaled gas by Gas dilution.rebreath"
    },
    {
        "code": "6420-4",
        "display": "Helicobacter pylori IgA Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "14565-6",
        "display": "Hemoglobin.gastrointestinal [Presence] in Stool --3rd specimen"
    },
    {
        "code": "17842-6",
        "display": "Cancer Ag 27-29 [Units/volume] in Serum or Plasma"
    },
    {
        "code": "32515-9",
        "display": "CD3+CD4+ (T4 helper) cells [#/volume] in Unspecified specimen"
    },
    {
        "code": "7886-5",
        "display": "Epstein Barr virus capsid IgM Ab [Units/volume] in Serum"
    },
    {
        "code": "5159-9",
        "display": "Epstein Barr virus capsid IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "26052-1",
        "display": "Epithelial cells.renal [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "7885-7",
        "display": "Epstein Barr virus capsid IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "5157-3",
        "display": "Epstein Barr virus capsid IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "33768-3",
        "display": "Leukocyte clumps [#/volume] in Urine by Automated count"
    },
    {
        "code": "23811-3",
        "display": "Alpha-1-Fetoprotein [Multiple of the median] adjusted in Serum or Plasma"
    },
    {
        "code": "3013-0",
        "display": "Thyroglobulin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "6206-7",
        "display": "Peanut IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "2756-5",
        "display": "pH of Urine"
    },
    {
        "code": "46769-6",
        "display": "Cystic fibrosis newborn screen interpretation"
    },
    {
        "code": "2484-4",
        "display": "Insulin-like growth factor-I [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2118-8",
        "display": "Choriogonadotropin (pregnancy test) [Presence] in Serum or Plasma"
    },
    {
        "code": "18974-6",
        "display": "Rifampin [Susceptibility]"
    },
    {
        "code": "12710-0",
        "display": "Hemoglobin pattern [interpretation] in Blood"
    },
    {
        "code": "34705-4",
        "display": "Carbon dioxide [Partial pressure] adjusted to patients actual temperature in Blood"
    },
    {
        "code": "19254-2",
        "display": "Oxygen [Partial pressure] adjusted to patients actual temperature in Blood"
    },
    {
        "code": "4993-2",
        "display": "Chlamydia trachomatis rRNA [Presence] in Unspecified specimen by DNA probe"
    },
    {
        "code": "1977-8",
        "display": "Bilirubin [Presence] in Urine"
    },
    {
        "code": "44877-9",
        "display": "Insulin dependent diabetes mellitus [Presence]"
    },
    {
        "code": "23641-4",
        "display": "Quinupristin+Dalfopristin [Susceptibility] by Minimum inhibitory concentration (MIC)"
    },
    {
        "code": "46740-7",
        "display": "Hemoglobin disorders newborn screen interpretation"
    },
    {
        "code": "14563-1",
        "display": "Hemoglobin.gastrointestinal [Presence] in Stool --1st specimen"
    },
    {
        "code": "20447-9",
        "display": "HIV 1 RNA [#/volume] (viral load) in Serum or Plasma by Probe & target amplification method"
    },
    {
        "code": "5244-9",
        "display": "Measles virus IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "2250-9",
        "display": "Estriol (E3).unconjugated [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "19550-3",
        "display": "Methadone [Presence] in Urine by Screen method"
    },
    {
        "code": "49090-4",
        "display": "Trisomy 21 risk based on maternal age in Fetus"
    },
    {
        "code": "21026-0",
        "display": "Pathologist interpretation of Blood tests"
    },
    {
        "code": "62292-8",
        "display": "25-Hydroxyvitamin D2+25-Hydroxyvitamin D3 [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2761-5",
        "display": "Phenylketones [Presence] in Blood"
    },
    {
        "code": "3779-6",
        "display": "Methamphetamine [Presence] in Urine"
    },
    {
        "code": "35663-4",
        "display": "Protein [Mass/volume] in unspecified time Urine"
    },
    {
        "code": "20506-2",
        "display": "Specimen drawn from"
    },
    {
        "code": "19057-9",
        "display": "ABO & Rh group [Type] in Blood from newborn"
    },
    {
        "code": "626-2",
        "display": "Bacteria identified in Throat by Culture"
    },
    {
        "code": "13532-7",
        "display": "Xanthochromia [Presence] of Cerebral spinal fluid"
    },
    {
        "code": "34660-1",
        "display": "Hemoglobin A2/Hemoglobin.total in Blood by Chromatography column"
    },
    {
        "code": "26454-9",
        "display": "Erythrocytes [#/volume] in Cerebral spinal fluid"
    },
    {
        "code": "10333-3",
        "display": "Appearance of Cerebral spinal fluid"
    },
    {
        "code": "5822-2",
        "display": "Yeast [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "49092-0",
        "display": "Second trimester quad maternal screen [interpretation] in Serum or Plasma Narrative"
    },
    {
        "code": "6276-0",
        "display": "Wheat IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6248-9",
        "display": "Soybean IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "75882-1",
        "display": "Lupus anticoagulant three screening tests W Reflex [interpretation]"
    },
    {
        "code": "6095-4",
        "display": "American house dust mite IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "25160-3",
        "display": "Granular casts [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "33804-6",
        "display": "RBC casts [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "703-9",
        "display": "Basophilic stippling [Presence] in Blood by Light microscopy"
    },
    {
        "code": "6020-2",
        "display": "Alternaria alternata IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "20496-6",
        "display": "Gliadin IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "29541-0",
        "display": "HIV 1 RNA [Log #/volume] (viral load) in Plasma by Probe & target amplification method"
    },
    {
        "code": "6584-7",
        "display": "Virus identified in Unspecified specimen by Culture"
    },
    {
        "code": "19343-3",
        "display": "Amphetamine [Presence] in Urine by Screen method"
    },
    {
        "code": "13964-2",
        "display": "Methylmalonate [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "802-9",
        "display": "Spherocytes [Presence] in Blood by Light microscopy"
    },
    {
        "code": "10704-5",
        "display": "Ova+Parasites identified in Stool by Light microscopy"
    },
    {
        "code": "5185-4",
        "display": "Hepatitis B virus core IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "49054-0",
        "display": "25-Hydroxycalciferol [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "7258-7",
        "display": "Cow milk IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "19554-5",
        "display": "Methamphetamine [Presence] in Urine by Screen method"
    },
    {
        "code": "10328-3",
        "display": "Lymphocytes/100 leukocytes in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "2705-2",
        "display": "Oxygen [Partial pressure] in Venous blood"
    },
    {
        "code": "43994-3",
        "display": "Trisomy 18 risk in Fetus"
    },
    {
        "code": "14334-7",
        "display": "Lithium [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "41477-1",
        "display": "Bacterial sialidase [Presence] in Unspecified specimen"
    },
    {
        "code": "33254-4",
        "display": "pH of Arterial blood adjusted to patients actual temperature"
    },
    {
        "code": "21612-7",
        "display": "Age - Reported"
    },
    {
        "code": "3432-2",
        "display": "Carbamazepine [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "43995-0",
        "display": "Trisomy 21 risk in Fetus"
    },
    {
        "code": "5124-3",
        "display": "Cytomegalovirus IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "10366-3",
        "display": "Cotinine [Mass/volume] in Urine"
    },
    {
        "code": "6096-2",
        "display": "European house dust mite IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "26473-9",
        "display": "Leukocytes other/100 leukocytes in Body fluid"
    },
    {
        "code": "24108-3",
        "display": "Cancer Ag 19-9 [Units/volume] in Serum or Plasma"
    },
    {
        "code": "5859-4",
        "display": "Herpes simplex virus identified in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "5774-5",
        "display": "Calcium oxalate crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "49121-7",
        "display": "Erythrocyte inclusion bodies [Identifier] in Blood"
    },
    {
        "code": "13967-5",
        "display": "Sex hormone binding globulin [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "3095-7",
        "display": "Urea nitrogen [Mass/volume] in Urine"
    },
    {
        "code": "6025-1",
        "display": "Aspergillus fumigatus IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "21264-7",
        "display": "Estriol (E3).unconjugated [Multiple of the median] adjusted in Serum or Plasma"
    },
    {
        "code": "25836-8",
        "display": "HIV 1 RNA [#/volume] (viral load) in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "46640-9",
        "display": "Secondary diagnosis RFC"
    },
    {
        "code": "42216-2",
        "display": "Reference lab name [Identifier]"
    },
    {
        "code": "48391-7",
        "display": "Carbon dioxide, total [Moles/volume] in Venous blood by calculation"
    },
    {
        "code": "35678-2",
        "display": "Sodium [Moles/volume] in unspecified time Urine"
    },
    {
        "code": "10459-6",
        "display": "Alpha-1-Fetoprotein Ag [Presence] in Tissue by Immune stain"
    },
    {
        "code": "5793-5",
        "display": "Granular casts [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "6099-6",
        "display": "Dog epithelium IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "34701-3",
        "display": "Platelet Ab.heparin induced [Presence] in Serum"
    },
    {
        "code": "20495-8",
        "display": "Gliadin IgA Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "1761-6",
        "display": "Aldolase [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "8248-7",
        "display": "Spermatozoa [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "2078-4",
        "display": "Chloride [Moles/volume] in Urine"
    },
    {
        "code": "31374-2",
        "display": "Epstein Barr virus nuclear IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "30083-0",
        "display": "Epstein Barr virus nuclear IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "47223-3",
        "display": "Trisomy 18 risk based on maternal age in Fetus"
    },
    {
        "code": "1986-9",
        "display": "C peptide [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "23883-2",
        "display": "Inhibin A [Mass/volume] in Serum"
    },
    {
        "code": "34468-9",
        "display": "Clostridium difficile toxin A+B [Presence] in Stool by Immunoassay"
    },
    {
        "code": "2881-1",
        "display": "Protein [Mass/volume] in Body fluid"
    },
    {
        "code": "3243-3",
        "display": "Thrombin time in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "19270-8",
        "display": "Barbiturates [Presence] in Urine by Screen method"
    },
    {
        "code": "15432-8",
        "display": "Testosterone Free/Testosterone.total in Serum or Plasma"
    },
    {
        "code": "26466-3",
        "display": "Leukocytes [#/volume] in Body fluid"
    },
    {
        "code": "21440-3",
        "display": "Human papilloma virus 16+18+31+33+35+45+51+52+56 DNA [Presence] in Cervix by DNA probe"
    },
    {
        "code": "3948-7",
        "display": "Phenobarbital [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "10835-7",
        "display": "Lipoprotein a [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "22330-5",
        "display": "Hepatitis D virus Ab [Units/volume] in Serum"
    },
    {
        "code": "38526-0",
        "display": "Number of specimens tested of Stool"
    },
    {
        "code": "40752-8",
        "display": "Epstein Barr virus early IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "6833-8",
        "display": "Cat dander IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "5813-1",
        "display": "Trichomonas vaginalis [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "6189-5",
        "display": "White Oak IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6075-6",
        "display": "Cladosporium herbarum IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "14314-9",
        "display": "Benzoylecgonine [Presence] in Urine by Screen method"
    },
    {
        "code": "5332-2",
        "display": "Rubella virus Ab [Presence] in Serum by Latex agglutination"
    },
    {
        "code": "12248-1",
        "display": "Epithelial cells.renal [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "5892-5",
        "display": "Protein S [Units/volume] in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "4552-6",
        "display": "Hemoglobin A2/Hemoglobin.total in Blood by Electrophoresis"
    },
    {
        "code": "22314-9",
        "display": "Hepatitis A virus IgM Ab [Presence] in Serum"
    },
    {
        "code": "46154-1",
        "display": "Trichomonas vaginalis rRNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "6357-8",
        "display": "Chlamydia trachomatis DNA [Presence] in Urine by Probe & target amplification method"
    },
    {
        "code": "36904-1",
        "display": "Inhibin A [Multiple of the median] adjusted in Serum"
    },
    {
        "code": "5862-8",
        "display": "Influenza virus A Ag [Presence] in Unspecified specimen by Immunoassay"
    },
    {
        "code": "45371-2",
        "display": "Multiple pregancy"
    },
    {
        "code": "2742-5",
        "display": "Angiotensin converting enzyme [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "32764-3",
        "display": "Clue cells [Presence] in Unspecified specimen by Wet preparation"
    },
    {
        "code": "42247-7",
        "display": "Hemoglobin pattern [interpretation] in Blood by HPLC Narrative"
    },
    {
        "code": "11153-4",
        "display": "Hematocrit [Volume Fraction] of Body fluid"
    },
    {
        "code": "6875-9",
        "display": "Cancer Ag 15-3 [Units/volume] in Serum or Plasma"
    },
    {
        "code": "32166-1",
        "display": "Choriogonadotropin [Multiple of the median] adjusted in Serum or Plasma"
    },
    {
        "code": "6741-3",
        "display": "Erythrocytes [#/volume] in Body fluid by Manual count"
    },
    {
        "code": "7900-4",
        "display": "Helicobacter pylori Ab [Units/volume] in Serum"
    },
    {
        "code": "6087-1",
        "display": "Corn IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "5763-8",
        "display": "Zinc [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "11259-9",
        "display": "Hepatitis C virus RNA [Presence] in Serum or Plasma by Probe & target amplification method"
    },
    {
        "code": "38180-6",
        "display": "Hepatitis C virus RNA [log units/volume] (viral load) in Serum or Plasma by Probe & target amplification method"
    },
    {
        "code": "3299-5",
        "display": "Acetaminophen [Presence] in Urine"
    },
    {
        "code": "2283-0",
        "display": "Folate [Mass/volume] in Red Blood Cells"
    },
    {
        "code": "5370-2",
        "display": "Streptolysin O Ab [Units/volume] in Serum"
    },
    {
        "code": "6041-8",
        "display": "Bermuda grass IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "53962-7",
        "display": "Alpha-1-fetoprotein.tumor marker [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "17859-0",
        "display": "Helicobacter pylori IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "6212-5",
        "display": "Penicillium notatum IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "22496-4",
        "display": "Rubella virus Ab [Presence] in Serum"
    },
    {
        "code": "49050-8",
        "display": "Microscopic observation [Identifier] in Endocervical brush by Cyto stain"
    },
    {
        "code": "21190-4",
        "display": "Chlamydia trachomatis DNA [Presence] in Cervix by Probe and target amplification method"
    },
    {
        "code": "30457-6",
        "display": "Nonhematic cells/100 leukocytes in Body fluid"
    },
    {
        "code": "34985-2",
        "display": "Unidentified cells/100 leukocytes in Body fluid"
    },
    {
        "code": "7966-5",
        "display": "Mumps virus IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "20512-0",
        "display": "Turbidity [Presence] of Cerebral spinal fluid"
    },
    {
        "code": "32198-4",
        "display": "Neisseria gonorrhoeae rRNA [Presence] in Cervix by DNA probe"
    },
    {
        "code": "6085-5",
        "display": "Common Ragweed IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6110-1",
        "display": "English Plantain IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6303-2",
        "display": "dRVVT LA screen"
    },
    {
        "code": "27811-9",
        "display": "Antithrombin actual/normal in Platelet poor plasma by Chromogenic method"
    },
    {
        "code": "47213-4",
        "display": "Cholesterol in LDL real size pattern [Identifier] in Serum or Plasma"
    },
    {
        "code": "31144-9",
        "display": "Thyroxine (T4) [Mass/volume] in Dried blood spot"
    },
    {
        "code": "2087-5",
        "display": "Cholesterol in IDL [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "50194-0",
        "display": "Cholesterol in IDL+Cholesterol in VLDL 3 [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "46986-6",
        "display": "Cholesterol in VLDL 3 [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "49062-3",
        "display": "Lipid risk factors [Finding]"
    },
    {
        "code": "32046-5",
        "display": "Pregnancy associated plasma protein A (PAPPA) [Units/volume] in Serum or Plasma"
    },
    {
        "code": "26760-9",
        "display": "Cannabinoids [Units/volume] in Urine"
    },
    {
        "code": "13183-9",
        "display": "White Elm IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "29967-7",
        "display": "Neutrophil cytoplasmic IgG Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "1795-4",
        "display": "Amylase [Enzymatic activity/volume] in Body fluid"
    },
    {
        "code": "1871-3",
        "display": "Apolipoprotein B-100 [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "33716-2",
        "display": "Non-gynecological cytology method study"
    },
    {
        "code": "1763-2",
        "display": "Aldosterone [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "34574-4",
        "display": "Pathology report final diagnosis"
    },
    {
        "code": "45353-0",
        "display": "Date of analysis of unspecified specimen"
    },
    {
        "code": "2064-4",
        "display": "Ceruloplasmin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "792-2",
        "display": "Erythrocytes [#/volume] in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "29771-3",
        "display": "Hemoglobin.gastrointestinal [Presence] in Stool by Immunologic method"
    },
    {
        "code": "30170-5",
        "display": "American Cockroach IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "14627-4",
        "display": "Bicarbonate [Moles/volume] in Venous blood"
    },
    {
        "code": "31204-1",
        "display": "Hepatitis B virus core IgM Ab [Presence] in Serum"
    },
    {
        "code": "1952-1",
        "display": "Beta-2-Microglobulin [Mass/volume] in Serum"
    },
    {
        "code": "13514-5",
        "display": "Hemoglobin pattern [interpretation] in Blood by Electrophoresis Narrative"
    },
    {
        "code": "24012-7",
        "display": "HIV 1 Ag [Presence] in Serum"
    },
    {
        "code": "5222-5",
        "display": "HIV 1 Ag [Presence] in Serum by Immunoassay"
    },
    {
        "code": "13953-5",
        "display": "Hepatitis B virus e Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "2344-0",
        "display": "Glucose [Mass/volume] in Body fluid"
    },
    {
        "code": "15205-8",
        "display": "Rheumatoid factor [Units/volume] in Serum by Nephlometry"
    },
    {
        "code": "29770-5",
        "display": "Karyotype [Identifier] in Blood or Tissue Nominal"
    },
    {
        "code": "709-6",
        "display": "Blasts/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "20444-6",
        "display": "Herpes simplex virus 1+2 DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "19153-6",
        "display": "Volume of unspecified time Urine"
    },
    {
        "code": "3209-4",
        "display": "Coagulation factor VIII activity actual/normal in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "7155-5",
        "display": "Boxelder IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "5866-9",
        "display": "Influenza virus B Ag [Presence] in Unspecified specimen by Immunoassay"
    },
    {
        "code": "13590-5",
        "display": "Activated protein C resistance [Time Ratio] in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "47528-5",
        "display": "Cytology report of Cervical or vaginal smear or scraping Cyto stain"
    },
    {
        "code": "6106-9",
        "display": "Egg white IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "2006-5",
        "display": "Cancer Ag 125 [Presence] in Serum or Plasma"
    },
    {
        "code": "655-1",
        "display": "Microscopic observation [Identifier] in Unspecified specimen by Acid fast stain.Kinyoun modified"
    },
    {
        "code": "3854-7",
        "display": "Nicotine [Mass/volume] in Urine"
    },
    {
        "code": "16131-5",
        "display": "Herpes simplex virus 2 DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "13954-3",
        "display": "Hepatitis B virus e Ag [Presence] in Serum by Immunoassay"
    },
    {
        "code": "26446-5",
        "display": "Blasts/100 leukocytes in Blood"
    },
    {
        "code": "7792-5",
        "display": "Dohle body [Presence] in Blood by Light microscopy"
    },
    {
        "code": "2529-6",
        "display": "Lactate dehydrogenase [Enzymatic activity/volume] in Body fluid"
    },
    {
        "code": "41399-7",
        "display": "Herpes simplex virus 1+2 IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "3034-6",
        "display": "Transferrin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "10900-9",
        "display": "Hepatitis B virus surface Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "3284-7",
        "display": "Lupus anticoagulant neutralization platelet [Time] in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "3414-0",
        "display": "Buprenorphine [Presence] in Urine"
    },
    {
        "code": "20404-0",
        "display": "Fibronectin.fetal [Presence] in Vaginal fluid"
    },
    {
        "code": "10998-3",
        "display": "Oxycodone [Presence] in Urine"
    },
    {
        "code": "10976-9",
        "display": "6-Monoacetylmorphine (6-MAM) [Presence] in Urine"
    },
    {
        "code": "2141-0",
        "display": "Corticotropin [Mass/volume] in Plasma"
    },
    {
        "code": "13046-8",
        "display": "Lymphocytes Variant/100 leukocytes in Blood"
    },
    {
        "code": "5351-2",
        "display": "Sjogrens syndrome-A extractable nuclear Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "6412-1",
        "display": "Giardia lamblia Ag [Presence] in Stool by Immunoassay"
    },
    {
        "code": "2614-6",
        "display": "Methemoglobin/Hemoglobin.total in Blood"
    },
    {
        "code": "5353-8",
        "display": "Sjogrens syndrome-B extractable nuclear Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "2915-7",
        "display": "Renin [Enzymatic activity/volume] in Plasma"
    },
    {
        "code": "27416-7",
        "display": "SCL-70 extractable nuclear Ab [Units/volume] in Serum"
    },
    {
        "code": "6565-6",
        "display": "Trichomonas vaginalis [Identifier] in Genital specimen by Wet preparation"
    },
    {
        "code": "21003-9",
        "display": "Fungus identified in Unspecified specimen by Fungus stain"
    },
    {
        "code": "5639-0",
        "display": "Ethanol [Presence] in Blood"
    },
    {
        "code": "6182-0",
        "display": "Mucor racemosus IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "49544-0",
        "display": "Newborn screening recommended follow-up [interpretation]"
    },
    {
        "code": "3297-9",
        "display": "Acetaminophen [Presence] in Serum or Plasma"
    },
    {
        "code": "5177-1",
        "display": "Helicobacter pylori IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "13516-0",
        "display": "Neutrophils/100 leukocytes in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "4023-8",
        "display": "Salicylates [Presence] in Serum or Plasma"
    },
    {
        "code": "2193-1",
        "display": "Dehydroepiandrosterone (DHEA) [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "30243-0",
        "display": "Choriogonadotropin.intact [Units/volume] in Serum or Plasma"
    },
    {
        "code": "1518-0",
        "display": "Glucose [Mass/volume] in Serum or Plasma --2 hours post 75 g glucose PO"
    },
    {
        "code": "4547-6",
        "display": "Hemoglobin A1/Hemoglobin.total in Blood"
    },
    {
        "code": "51724-3",
        "display": "Cefuroxime [Susceptibility]"
    },
    {
        "code": "15061-5",
        "display": "Erythropoietin (EPO) [Units/volume] in Serum or Plasma"
    },
    {
        "code": "6152-3",
        "display": "Johnson grass IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "46735-7",
        "display": "Endocrine disorders newborn screen interpretation"
    },
    {
        "code": "6252-1",
        "display": "Stemphylium botryosum IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "32286-7",
        "display": "Hepatitis C virus genotype [Identifier] in Serum or Plasma by Probe & target amplification method"
    },
    {
        "code": "17948-1",
        "display": "Fungus # 3 identified in Unspecified specimen by Culture"
    },
    {
        "code": "5199-5",
        "display": "Hepatitis C virus Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "17947-3",
        "display": "Fungus # 2 identified in Unspecified specimen by Culture"
    },
    {
        "code": "17949-9",
        "display": "Fungus # 4 identified in Unspecified specimen by Culture"
    },
    {
        "code": "42637-9",
        "display": "Natriuretic peptide B [Mass/volume] in Blood"
    },
    {
        "code": "9327-8",
        "display": "Phosphatidylserine IgM Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "9813-7",
        "display": "Cortisol [Mass/volume] in Serum or Plasma --morning specimen"
    },
    {
        "code": "1668-3",
        "display": "17-Hydroxyprogesterone [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "14604-3",
        "display": "Blood group antibodies present [Identifier] in Serum or Plasma from Blood product unit"
    },
    {
        "code": "20513-8",
        "display": "Turbidity [Presence] of Body fluid"
    },
    {
        "code": "48035-0",
        "display": "Hemoglobin [Presence] in Cerebral spinal fluid"
    },
    {
        "code": "1825-9",
        "display": "Alpha 1 antitrypsin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "5213-4",
        "display": "Heterophile Ab [Presence] in Serum by Latex agglutination"
    },
    {
        "code": "13440-3",
        "display": "Immunofixation [interpretation] for Urine"
    },
    {
        "code": "6039-2",
        "display": "Beef IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "18929-0",
        "display": "Gentamicin.high potency [Susceptibility]"
    },
    {
        "code": "17862-4",
        "display": "Calcium [Mass/volume] in Urine"
    },
    {
        "code": "6034-3",
        "display": "Bahia grass IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "5358-7",
        "display": "Smooth muscle Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "5388-4",
        "display": "Toxoplasma gondii IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "27948-9",
        "display": "Herpes simplex virus 1+2 IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "9439-1",
        "display": "Casts [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "2745-8",
        "display": "pH of Capillary blood"
    },
    {
        "code": "33022-5",
        "display": "Carbon dioxide [Partial pressure] in Capillary blood by Transcutaneous CO2 monitor"
    },
    {
        "code": "13438-7",
        "display": "Protein Fractions [interpretation] in Urine by Electrophoresis"
    },
    {
        "code": "8117-4",
        "display": "CD19 cells/100 cells in Blood"
    },
    {
        "code": "38527-8",
        "display": "Number of specimens received of Stool"
    },
    {
        "code": "35597-4",
        "display": "Salicylates [Mass/volume] in Serum or Plasma by Screen method"
    },
    {
        "code": "3665-7",
        "display": "Gentamicin [Mass/volume] in Serum or Plasma --trough"
    },
    {
        "code": "1501-6",
        "display": "Glucose [Mass/volume] in Serum or Plasma --1 hour post 100 g glucose PO"
    },
    {
        "code": "13527-7",
        "display": "Unidentified cells/100 leukocytes in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "32765-0",
        "display": "Yeast [Presence] in Unspecified specimen by Wet preparation"
    },
    {
        "code": "20563-3",
        "display": "Carboxyhemoglobin/Hemoglobin.total in Blood"
    },
    {
        "code": "1507-3",
        "display": "Glucose [Mass/volume] in Serum or Plasma --1 hour post 75 g glucose PO"
    },
    {
        "code": "14836-1",
        "display": "Methotrexate [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "6924-5",
        "display": "Gliadin IgA Ab [Units/volume] in Serum"
    },
    {
        "code": "18983-7",
        "display": "Streptomycin.high potency [Susceptibility]"
    },
    {
        "code": "20437-0",
        "display": "Glucose [Mass/volume] in Serum or Plasma --3 hours post dose glucose"
    },
    {
        "code": "5876-8",
        "display": "Respiratory syncytial virus Ag [Presence] in Unspecified specimen by Immunoassay"
    },
    {
        "code": "56490-6",
        "display": "Hemoglobin.gastrointestinal [Presence] in Stool by Immunologic method --2nd specimen"
    },
    {
        "code": "56491-4",
        "display": "Hemoglobin.gastrointestinal [Presence] in Stool by Immunologic method --3rd specimen"
    },
    {
        "code": "20436-2",
        "display": "Glucose [Mass/volume] in Serum or Plasma --2 hours post dose glucose"
    },
    {
        "code": "8665-2",
        "display": "Date last menstrual period"
    },
    {
        "code": "27819-2",
        "display": "Protein C actual/normal in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "5076-5",
        "display": "Cardiolipin IgA Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "26486-1",
        "display": "Monocytes/100 leukocytes in Cerebral spinal fluid"
    },
    {
        "code": "1884-6",
        "display": "Apolipoprotein B [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "29953-7",
        "display": "Nuclear Ab [Titer] in Serum"
    },
    {
        "code": "7291-8",
        "display": "Whole Egg IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "5645-7",
        "display": "Ethanol [Mass/volume] in Urine"
    },
    {
        "code": "11545-1",
        "display": "Microscopic observation [Identifier] in Unspecified specimen by Acid fast stain"
    },
    {
        "code": "6473-3",
        "display": "Microscopic observation [Identifier] in Tissue by Trichrome stain"
    },
    {
        "code": "20460-2",
        "display": "Cefuroxime Oral [Susceptibility] by Minimum inhibitory concentration (MIC)"
    },
    {
        "code": "1514-9",
        "display": "Glucose [Mass/volume] in Serum or Plasma --2 hours post 100 g glucose PO"
    },
    {
        "code": "21033-6",
        "display": "Yeast.budding [Presence] in Urine sediment"
    },
    {
        "code": "19941-4",
        "display": "Oxygen gas flow Oxygen delivery system"
    },
    {
        "code": "6073-1",
        "display": "Chocolate IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "12208-5",
        "display": "Eosinophils/100 leukocytes in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "12278-8",
        "display": "Neutrophils.band form/100 leukocytes in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "6874-2",
        "display": "Calcium [Mass/time] in 24 hour Urine"
    },
    {
        "code": "13519-4",
        "display": "Basophils/100 leukocytes in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "3160-9",
        "display": "Volume of Semen"
    },
    {
        "code": "38908-0",
        "display": "Poikilocytosis [Presence] in Blood by Automated count"
    },
    {
        "code": "13517-8",
        "display": "Lymphocytes Variant/100 leukocytes in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "20505-4",
        "display": "Bilirubin [Mass/volume] in Urine by Test strip"
    },
    {
        "code": "13529-3",
        "display": "Nucleated erythrocytes [#/volume] in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "10329-1",
        "display": "Monocytes/100 leukocytes in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "26472-1",
        "display": "Leukocytes other/100 leukocytes in Cerebral spinal fluid"
    },
    {
        "code": "13508-7",
        "display": "Hematocrit [Volume Fraction] of Cerebral spinal fluid by Centrifugation"
    },
    {
        "code": "11135-1",
        "display": "Appearance of Spun Cerebral spinal fluid"
    },
    {
        "code": "13525-1",
        "display": "Nonhematic cells/100 leukocytes in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "1530-5",
        "display": "Glucose [Mass/volume] in Serum or Plasma --3 hours post 100 g glucose PO"
    },
    {
        "code": "28008-1",
        "display": "Cytomegalovirus DNA [Presence] in Blood by Probe & signal amplification method"
    },
    {
        "code": "6244-8",
        "display": "Sheep Sorrel IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6219-0",
        "display": "Pork IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "11050-2",
        "display": "Immunoglobulin light chains.kappa [Mass/volume] in Serum"
    },
    {
        "code": "783-1",
        "display": "Promyelocytes/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "2254-1",
        "display": "Estrogen [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "11064-3",
        "display": "Urea nitrogen [Mass/volume] in Serum or Plasma --post dialysis"
    },
    {
        "code": "6273-7",
        "display": "Walnut IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "14638-1",
        "display": "Calculus analysis [interpretation] in Stone"
    },
    {
        "code": "8191-9",
        "display": "Cocaine [Presence] in Serum or Plasma by Screen method"
    },
    {
        "code": "13068-2",
        "display": "Nuclear Ab pattern [interpretation] in Serum by Immunofluorescence"
    },
    {
        "code": "8149-7",
        "display": "Amphetamines [Presence] in Serum or Plasma by Screen method"
    },
    {
        "code": "6153-1",
        "display": "Kentucky blue grass IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "20438-8",
        "display": "Glucose [Mass/volume] in Serum or Plasma --1 hour post dose glucose"
    },
    {
        "code": "26524-9",
        "display": "Promyelocytes/100 leukocytes in Blood"
    },
    {
        "code": "8234-7",
        "display": "Phencyclidine [Presence] in Meconium by Screen method"
    },
    {
        "code": "11065-0",
        "display": "Urea nitrogen [Mass/volume] in Serum or Plasma --pre dialysis"
    },
    {
        "code": "19141-1",
        "display": "Propoxyphene [Presence] in Urine"
    },
    {
        "code": "19415-9",
        "display": "Tetrahydrocannabinol [Presence] in Urine by Screen method"
    },
    {
        "code": "35741-8",
        "display": "Prostate specific Ag [Mass/volume] in Serum or Plasma by Detection limit = 0.01 ng/mL"
    },
    {
        "code": "6265-3",
        "display": "Timothy IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6233-1",
        "display": "Rough Pigweed IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "4090-7",
        "display": "Vancomycin [Mass/volume] in Serum or Plasma --peak"
    },
    {
        "code": "2026-3",
        "display": "Carbon dioxide, total [Moles/volume] in Arterial blood"
    },
    {
        "code": "2714-4",
        "display": "Fractional oxyhemoglobin in Arterial blood"
    },
    {
        "code": "22131-7",
        "display": "Borrelia burgdorferi IgG+IgM Ab [Presence] in Serum"
    },
    {
        "code": "5404-9",
        "display": "Varicella zoster virus IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "2923-1",
        "display": "Retinol [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "33718-8",
        "display": "Cytology report of Tissue fine needle aspirate Cyto stain"
    },
    {
        "code": "8112-5",
        "display": "CD3-CD16+CD56+ (Natural killer) cells/100 cells in Blood"
    },
    {
        "code": "19774-9",
        "display": "Cytology study comment Cervical or vaginal smear or scraping Cyto stain"
    },
    {
        "code": "19128-8",
        "display": "Bacteria identified in Catheter tip by Culture"
    },
    {
        "code": "6281-0",
        "display": "White mulberry IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "24013-5",
        "display": "HIV 1 RNA [interpretation] in Serum"
    },
    {
        "code": "17780-8",
        "display": "Helicobacter pylori Ag [Presence] in Stool by Immunoassay"
    },
    {
        "code": "13169-8",
        "display": "Immunoelectrophoresis [interpretation] for Serum or Plasma"
    },
    {
        "code": "15210-8",
        "display": "Thyroglobulin Ab [Presence] in Serum"
    },
    {
        "code": "4532-8",
        "display": "Complement total hemolytic CH50 [Units/volume] in Serum or Plasma"
    },
    {
        "code": "2748-2",
        "display": "pH of Body fluid"
    },
    {
        "code": "26513-2",
        "display": "Neutrophils/100 leukocytes in Body fluid"
    },
    {
        "code": "8130-7",
        "display": "CD45 (Lymphs) cells/100 cells in Blood"
    },
    {
        "code": "11276-3",
        "display": "Tubular cells [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "6948-4",
        "display": "Lamotrigine [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "29641-8",
        "display": "Neutrophil Cytoplasmic Ab atypical [Presence] in Serum by Immunofluorescence"
    },
    {
        "code": "5034-4",
        "display": "Streptococcus agalactiae rRNA [Presence] in Unspecified specimen by DNA probe"
    },
    {
        "code": "773-2",
        "display": "Nucleated erythrocytes/100 erythrocytes in Blood by Manual count"
    },
    {
        "code": "35383-9",
        "display": "Galactomannan Ag [Units/volume] in Serum or Plasma"
    },
    {
        "code": "22587-0",
        "display": "Treponema pallidum Ab [Presence] in Serum"
    },
    {
        "code": "6178-8",
        "display": "Mountain Juniper IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "11266-4",
        "display": "Streptococcus agalactiae Ag [Presence] in Unspecified specimen"
    },
    {
        "code": "3663-2",
        "display": "Gentamicin [Mass/volume] in Serum or Plasma --peak"
    },
    {
        "code": "1927-3",
        "display": "Base excess in Venous blood"
    },
    {
        "code": "5247-2",
        "display": "Mitochondria Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "5126-8",
        "display": "Cytomegalovirus IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "48378-4",
        "display": "Immunoglobulin light chains.kappa.free/Immunoglobulin light chains.lambda.free [Mass Ratio] in Serum"
    },
    {
        "code": "15069-8",
        "display": "Fructosamine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "15218-1",
        "display": "Food Allergen Mix 2 (Cod+Blue Mussel+Shrimp+Salmon+Tuna) IgE Ab [Presence] in Serum by Multidisk"
    },
    {
        "code": "28005-7",
        "display": "MTHFR gene p.C677T [Presence] in Blood or Tissue by Molecular genetics method"
    },
    {
        "code": "8014-3",
        "display": "Rubella virus IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "14912-0",
        "display": "Smudge cells/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "12230-9",
        "display": "Macrophages/100 leukocytes in Body fluid by Manual count"
    },
    {
        "code": "27038-9",
        "display": "Endomysium IgA Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "20573-2",
        "display": "Histoplasma capsulatum mycelial phase Ab [Titer] in Serum by Complement fixation"
    },
    {
        "code": "6246-3",
        "display": "Shrimp IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "42176-8",
        "display": "1,3 beta glucan [Mass/volume] in Serum"
    },
    {
        "code": "19075-1",
        "display": "Cells Counted Total [#] in Cerebral spinal fluid"
    },
    {
        "code": "33910-1",
        "display": "Rheumatoid factor [Presence] in Serum"
    },
    {
        "code": "9822-8",
        "display": "Bacteria identified in Dialysis fluid by Culture"
    },
    {
        "code": "931-6",
        "display": "Blood product source [Type]"
    },
    {
        "code": "32140-6",
        "display": "Hemoglobin F [Presence] in Blood by Kleihauer-Betke method"
    },
    {
        "code": "53982-5",
        "display": "Centromere protein B Ab [Units/volume] in Serum"
    },
    {
        "code": "51775-5",
        "display": "Chromatin Ab [Units/volume] in Serum or Plasma"
    },
    {
        "code": "19295-5",
        "display": "Opiates [Presence] in Urine by Screen method"
    },
    {
        "code": "24011-9",
        "display": "Hepatitis C virus Ab band pattern [interpretation] in Serum by Immunoblot (IB)"
    },
    {
        "code": "5187-0",
        "display": "Hepatitis B virus core Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "2963-7",
        "display": "Somatotropin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "13530-1",
        "display": "Nucleated erythrocytes [#/volume] in Body fluid by Manual count"
    },
    {
        "code": "6082-2",
        "display": "Codfish IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6156-4",
        "display": "Goosefoot IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6186-1",
        "display": "Nettle IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "11565-9",
        "display": "Jo-1 extractable nuclear Ab [Units/volume] in Serum"
    },
    {
        "code": "30376-8",
        "display": "Blasts [#/volume] in Blood"
    },
    {
        "code": "35676-6",
        "display": "Chloride [Moles/volume] in unspecified time Urine"
    },
    {
        "code": "32637-1",
        "display": "Urease [Presence] in Tissue"
    },
    {
        "code": "46248-1",
        "display": "Borrelia burgdorferi IgG & IgM [interpretation] in Serum by Immunoassay"
    },
    {
        "code": "1721-0",
        "display": "Adenosine triphosphate [Mass/volume] in Blood"
    },
    {
        "code": "9780-8",
        "display": "Spermatozoa [#/volume] in Semen"
    },
    {
        "code": "6002-0",
        "display": "Platelet factor 4 [Units/volume] in Platelet poor plasma"
    },
    {
        "code": "6014-5",
        "display": "von Willebrand factor (vWf) ristocetin cofactor actual/normal in Platelet poor plasma by Aggregation"
    },
    {
        "code": "20475-0",
        "display": "Cytomegalovirus IgG Ab [interpretation] in Serum"
    },
    {
        "code": "33248-6",
        "display": "Diabetes status [Identifier]"
    },
    {
        "code": "33006-8",
        "display": "Cytomegalovirus DNA [#/volume] (viral load) in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "22415-4",
        "display": "Mumps virus IgG Ab [Presence] in Serum"
    },
    {
        "code": "6476-6",
        "display": "Mumps virus IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "49053-2",
        "display": "History of neural tube defect Narrative"
    },
    {
        "code": "21024-5",
        "display": "Pathologist interpretation of Cerebral spinal fluid tests"
    },
    {
        "code": "38506-2",
        "display": "Thyroxine (T4) [Presence] in Dried blood spot"
    },
    {
        "code": "13522-8",
        "display": "Blasts/100 leukocytes in Body fluid by Manual count"
    },
    {
        "code": "5274-6",
        "display": "Parvovirus B19 IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "5273-8",
        "display": "Parvovirus B19 IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "13992-3",
        "display": "Albumin/Protein.total in Urine by Electrophoresis"
    },
    {
        "code": "5393-4",
        "display": "Treponema pallidum Ab [Presence] in Serum by Immunofluorescence"
    },
    {
        "code": "13990-7",
        "display": "Alpha 1 globulin/Protein.total in Urine by Electrophoresis"
    },
    {
        "code": "801-1",
        "display": "Sickle cells [Presence] in Blood by Light microscopy"
    },
    {
        "code": "5568-1",
        "display": "Acetone [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "7407-0",
        "display": "White Hickory IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "46420-6",
        "display": "Leukocyte clumps [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "30471-7",
        "display": "Levetiracetam [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "40750-2",
        "display": "Epstein Barr virus capsid IgG Ab [Presence] in Serum by Immunofluorescence"
    },
    {
        "code": "6019-4",
        "display": "Almond IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "41874-9",
        "display": "White Birch IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "2466-1",
        "display": "IgG subclass 1 [Mass/volume] in Serum"
    },
    {
        "code": "6968-2",
        "display": "Proteinase 3 Ab [Units/volume] in Serum"
    },
    {
        "code": "42768-2",
        "display": "HIV 1 & 2 Ab [interpretation] in Serum Narrative"
    },
    {
        "code": "16126-5",
        "display": "Helicobacter pylori IgG Ab [Presence] in Serum"
    },
    {
        "code": "11258-1",
        "display": "Hepatitis B virus DNA [Units/volume] in Serum"
    },
    {
        "code": "667-6",
        "display": "Microscopic observation [Identifier] in Unspecified specimen by KOH preparation"
    },
    {
        "code": "1747-5",
        "display": "Albumin [Mass/volume] in Body fluid"
    },
    {
        "code": "9586-9",
        "display": "Borrelia burgdorferi Ab [interpretation] in Serum"
    },
    {
        "code": "681-7",
        "display": "Microscopic observation [Identifier] in Unspecified specimen by Wright stain"
    },
    {
        "code": "6942-7",
        "display": "Albumin [Mass/volume] in Urine by Electrophoresis"
    },
    {
        "code": "6969-0",
        "display": "Myeloperoxidase Ab [Units/volume] in Serum"
    },
    {
        "code": "6183-8",
        "display": "Mugwort IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "3719-2",
        "display": "Lithium [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2469-5",
        "display": "IgG subclass 4 [Mass/volume] in Serum"
    },
    {
        "code": "2467-9",
        "display": "IgG subclass 2 [Mass/volume] in Serum"
    },
    {
        "code": "2468-7",
        "display": "IgG subclass 3 [Mass/volume] in Serum"
    },
    {
        "code": "32146-3",
        "display": "Platelets Large [Presence] in Blood by Light microscopy"
    },
    {
        "code": "14277-8",
        "display": "Neutrophil cytoplasmic Ab.classic [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "14278-6",
        "display": "Neutrophil cytoplasmic Ab.perinuclear [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "17864-0",
        "display": "Calcium.ionized [Mass/volume] in Serum or Plasma by Ion-selective membrane electrode (ISE)"
    },
    {
        "code": "48344-6",
        "display": "Kaolin activated time in Platelet poor plasma"
    },
    {
        "code": "28637-7",
        "display": "Base deficit in Venous cord blood"
    },
    {
        "code": "18500-9",
        "display": "Microscopic observation [Identifier] in Cervix by Cyto stain.thin prep"
    },
    {
        "code": "13987-3",
        "display": "Alpha 2 globulin/Protein.total in 24 hour Urine by Electrophoresis"
    },
    {
        "code": "13989-9",
        "display": "Gamma globulin/Protein.total in 24 hour Urine by Electrophoresis"
    },
    {
        "code": "78012-2",
        "display": "Streptococcus pyogenes Ag [Presence] in Throat by Rapid immunoassay"
    },
    {
        "code": "34661-9",
        "display": "Actin IgG Ab [Units/volume] in Serum or Plasma"
    },
    {
        "code": "41274-2",
        "display": "Alpha-1-Fetoprotein interpretation [interpretation] in Serum or Plasma"
    },
    {
        "code": "33719-6",
        "display": "Flow cytometry study"
    },
    {
        "code": "5158-1",
        "display": "Epstein Barr virus capsid IgG Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "24476-4",
        "display": "F2 gene mutations found [Identifier] in Blood or Tissue by Molecular genetics method Nominal"
    },
    {
        "code": "3052-8",
        "display": "Triiodothyronine (T3).reverse [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "25700-6",
        "display": "Immunofixation [interpretation] for Serum or Plasma"
    },
    {
        "code": "4049-3",
        "display": "Theophylline [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "11878-6",
        "display": "Number of fetuses by US"
    },
    {
        "code": "2147-7",
        "display": "Cortisol Free [Mass/time] in 24 hour Urine"
    },
    {
        "code": "21020-3",
        "display": "Bacteria identified in Unspecified specimen by Anaerobe+Aerobe culture"
    },
    {
        "code": "19108-0",
        "display": "Histoplasma capsulatum Ag [Presence] in Serum"
    },
    {
        "code": "44525-4",
        "display": "Histoplasma capsulatum Ag [Presence] in Serum by Immunoassay"
    },
    {
        "code": "2115-4",
        "display": "Choriogonadotropin.beta subunit free [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "32167-9",
        "display": "Clarity of Urine"
    },
    {
        "code": "26518-1",
        "display": "Polymorphonuclear cells/100 leukocytes in Body fluid"
    },
    {
        "code": "19076-9",
        "display": "Cells Counted Total [#] in Unspecified specimen"
    },
    {
        "code": "33673-5",
        "display": "Thrombin time.factor substitution in Platelet poor plasma by Coagulation assay --immediately after addition of protamine sulfate"
    },
    {
        "code": "32133-1",
        "display": "Lactate [Moles/volume] in Plasma venous"
    },
    {
        "code": "12286-1",
        "display": "Drugs identified in Urine by Screen method"
    },
    {
        "code": "6263-8",
        "display": "American Sycamore IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "5095-5",
        "display": "Coccidioides immitis Ab [Presence] in Serum by Immune diffusion (ID)"
    },
    {
        "code": "8187-7",
        "display": "Benzoylecgonine [Presence] in Meconium"
    },
    {
        "code": "13994-9",
        "display": "Beta globulin/Protein.total in Urine by Electrophoresis"
    },
    {
        "code": "26523-1",
        "display": "Promyelocytes [#/volume] in Blood"
    },
    {
        "code": "6098-8",
        "display": "Dog dander IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "22310-7",
        "display": "Helicobacter pylori Ab [Presence] in Serum"
    },
    {
        "code": "20124-4",
        "display": "Ventilation mode [Identifier] Ventilator"
    },
    {
        "code": "6107-7",
        "display": "Egg yolk IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6604-3",
        "display": "Influenza virus identified in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "28647-6",
        "display": "pH of Venous cord blood"
    },
    {
        "code": "6800-7",
        "display": "Spermatozoa Motile/100 spermatozoa in Semen"
    },
    {
        "code": "6718-1",
        "display": "Cashew Nut IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "5181-3",
        "display": "Hepatitis A virus IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "1961-2",
        "display": "Bicarbonate [Moles/volume] in Capillary blood"
    },
    {
        "code": "28646-8",
        "display": "pH of Arterial cord blood"
    },
    {
        "code": "11051-0",
        "display": "Immunoglobulin light chains.lambda [Mass/volume] in Serum"
    },
    {
        "code": "32032-5",
        "display": "Phosphatidylserine IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "18488-7",
        "display": "Calcium [Mass/volume] in 24 hour Urine"
    },
    {
        "code": "7793-3",
        "display": "Howell-Jolly bodies [Presence] in Blood by Light microscopy"
    },
    {
        "code": "35668-3",
        "display": "Gentamicin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "11274-8",
        "display": "Elliptocytes [Presence] in Blood by Light microscopy"
    },
    {
        "code": "46995-7",
        "display": "HLA-DP+DQ+DR (class II) Ab in Serum"
    },
    {
        "code": "46994-0",
        "display": "HLA-A+B+C (class I) Ab in Serum"
    },
    {
        "code": "6208-3",
        "display": "Pecan or Hickory Nut IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "17851-7",
        "display": "Herpes simplex virus 2 IgG Ab [Presence] in Serum"
    },
    {
        "code": "43180-9",
        "display": "Herpes simplex virus 2 IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "30166-3",
        "display": "Thyroid stimulating immunoglobulins actual/normal in Serum"
    },
    {
        "code": "9631-3",
        "display": "Viscosity of Semen"
    },
    {
        "code": "10585-8",
        "display": "Round cells [#/volume] in Semen"
    },
    {
        "code": "33217-1",
        "display": "Spermatozoa Agglutinated [Presence] in Semen"
    },
    {
        "code": "5218-3",
        "display": "Histoplasma capsulatum Ab [Presence] in Serum by Immune diffusion (ID)"
    },
    {
        "code": "27822-6",
        "display": "Protein S actual/normal in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "17793-1",
        "display": "Immunoglobulin light chains [Mass/volume] in 24 hour Urine"
    },
    {
        "code": "17850-9",
        "display": "Herpes simplex virus 1 IgG Ab [Presence] in Serum"
    },
    {
        "code": "51916-5",
        "display": "Herpes simplex virus 1 IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "31844-4",
        "display": "Hepatitis B virus e Ag [Presence] in Serum"
    },
    {
        "code": "20450-3",
        "display": "Alpha-1-Fetoprotein [Multiple of the median] in Serum or Plasma"
    },
    {
        "code": "48343-8",
        "display": "Hemoglobin.other/Hemoglobin.total in Blood"
    },
    {
        "code": "5160-7",
        "display": "Epstein Barr virus capsid IgM Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "29615-2",
        "display": "Hepatitis B virus DNA [#/volume] (viral load) in Serum or Plasma by Probe & target amplification method"
    },
    {
        "code": "21032-8",
        "display": "Thrombin time [interpretation] in Blood"
    },
    {
        "code": "5791-9",
        "display": "Fungi.yeastlike [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "20423-0",
        "display": "Beta lactamase organism identified in Isolate"
    },
    {
        "code": "8146-3",
        "display": "Amphetamines [Presence] in Meconium by Screen method"
    },
    {
        "code": "20991-6",
        "display": "Antithrombin [interpretation] in Platelet poor plasma"
    },
    {
        "code": "33720-4",
        "display": "Blood bank consult"
    },
    {
        "code": "2483-6",
        "display": "Insulin-like growth factor binding protein 3 [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "34712-0",
        "display": "Clostridium difficile [Presence] in Stool"
    },
    {
        "code": "33594-3",
        "display": "Platelet factor 4 [Presence] in Platelet poor plasma"
    },
    {
        "code": "8169-5",
        "display": "Tetrahydrocannabinol [Presence] in Meconium by Screen method"
    },
    {
        "code": "2258-2",
        "display": "Estrone (E1) [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "17849-1",
        "display": "Reticulocytes/100 erythrocytes in Blood by Automated count"
    },
    {
        "code": "8216-4",
        "display": "Opiates [Presence] in Meconium by Screen method"
    },
    {
        "code": "27816-8",
        "display": "von Willebrand factor (vWf) Ag actual/normal in Platelet poor plasma by Immunologic method"
    },
    {
        "code": "8116-6",
        "display": "CD19 cells [#/volume] in Blood"
    },
    {
        "code": "7798-2",
        "display": "Smudge cells [Presence] in Blood by Light microscopy"
    },
    {
        "code": "9795-6",
        "display": "Composition in Stone"
    },
    {
        "code": "5390-0",
        "display": "Toxoplasma gondii IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "32218-0",
        "display": "Cyclic citrullinated peptide Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "46266-3",
        "display": "Myeloperoxidase Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "20479-2",
        "display": "Measles virus IgG Ab [Presence] in Serum"
    },
    {
        "code": "35275-7",
        "display": "Measles virus IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "5781-0",
        "display": "Crystals [type] in Synovial fluid by Light microscopy"
    },
    {
        "code": "26043-0",
        "display": "HLA-B27 [Presence] by Probe & target amplification method"
    },
    {
        "code": "16136-4",
        "display": "Beta 2 glycoprotein 1 IgM Ab [Units/volume] in Serum"
    },
    {
        "code": "44449-7",
        "display": "Beta 2 glycoprotein 1 IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "19296-3",
        "display": "Opiates tested for in Urine by Screen method Nominal"
    },
    {
        "code": "14115-0",
        "display": "Collagen crosslinked N-telopeptide/Creatinine [Molar ratio] in Urine"
    },
    {
        "code": "1521-4",
        "display": "Glucose [Mass/volume] in Serum or Plasma --2 hours post meal"
    },
    {
        "code": "5290-2",
        "display": "Reagin Ab [Presence] in Cerebral spinal fluid by VDRL"
    },
    {
        "code": "5817-2",
        "display": "Urate crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "46267-1",
        "display": "Proteinase 3 Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "2270-7",
        "display": "Fat [Presence] in Stool"
    },
    {
        "code": "6278-6",
        "display": "White Ash IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "7369-2",
        "display": "Perennial rye grass IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "8091-1",
        "display": "Ribonucleoprotein extractable nuclear Ab [Presence] in Serum"
    },
    {
        "code": "41222-1",
        "display": "Yeast [Presence] in Body fluid by Light microscopy"
    },
    {
        "code": "38505-4",
        "display": "Thyroglobulin recovery in Serum or Plasma"
    },
    {
        "code": "16135-6",
        "display": "Beta 2 glycoprotein 1 IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "44448-9",
        "display": "Beta 2 glycoprotein 1 IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "6076-4",
        "display": "Clam IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "593-4",
        "display": "Legionella sp identified in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "33437-5",
        "display": "Oxygen [Partial pressure] in Capillary blood by Transcutaneous O2 monitor"
    },
    {
        "code": "48683-7",
        "display": "Streptococcus agalactiae DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "20574-0",
        "display": "Histoplasma capsulatum yeast phase Ab [Titer] in Serum by Complement fixation"
    },
    {
        "code": "49539-0",
        "display": "Cytomegalovirus IgM Ab [Presence] in Serum by Immunofluorescence"
    },
    {
        "code": "33721-2",
        "display": "Bone marrow Pathology biopsy report"
    },
    {
        "code": "5127-6",
        "display": "Cytomegalovirus IgM Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "33773-3",
        "display": "Karyotype [Identifier] in Amniotic fluid Nominal"
    },
    {
        "code": "49051-6",
        "display": "Gestational age in weeks"
    },
    {
        "code": "7789-1",
        "display": "Acanthocytes [Presence] in Blood by Light microscopy"
    },
    {
        "code": "8338-6",
        "display": "Body weight Measured --ante partum"
    },
    {
        "code": "5117-7",
        "display": "Cryoglobulin [Presence] in Serum"
    },
    {
        "code": "2752-4",
        "display": "pH of Semen"
    },
    {
        "code": "15359-3",
        "display": "dRVVT actual/?normal (normalized LA screen)"
    },
    {
        "code": "2077-6",
        "display": "Chloride [Moles/volume] in Sweat"
    },
    {
        "code": "41499-5",
        "display": "Legionella pneumophila 1 Ag [Presence] in Urine by Immunoassay"
    },
    {
        "code": "3141-9",
        "display": "Body weight Measured"
    },
    {
        "code": "5348-8",
        "display": "SCL-70 extractable nuclear Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "15761-0",
        "display": "Sweetgum IgE Ab RAST class in Serum"
    },
    {
        "code": "2615-3",
        "display": "Methemoglobin/Hemoglobin.total in Arterial blood"
    },
    {
        "code": "5053-4",
        "display": "Aspergillus sp Ab [Titer] in Serum by Complement fixation"
    },
    {
        "code": "33247-8",
        "display": "Weight of Sweat"
    },
    {
        "code": "5183-9",
        "display": "Hepatitis A virus Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "29893-5",
        "display": "HIV 1 Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "20465-1",
        "display": "Choriogonadotropin [Multiple of the median] in Serum or Plasma"
    },
    {
        "code": "20466-9",
        "display": "Estriol (E3).unconjugated [Multiple of the median] in Serum or Plasma"
    },
    {
        "code": "38404-0",
        "display": "CFTR gene mutation analysis in Blood or Tissue by Molecular genetics method Narrative"
    },
    {
        "code": "27923-2",
        "display": "Ubiquinone 10 [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "26512-4",
        "display": "Neutrophils/100 leukocytes in Cerebral spinal fluid"
    },
    {
        "code": "48039-2",
        "display": "Fibronectin.fetal [Presence] in Unspecified specimen"
    },
    {
        "code": "5631-7",
        "display": "Copper [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "5880-0",
        "display": "Rotavirus Ag [Presence] in Stool by Immunoassay"
    },
    {
        "code": "2671-6",
        "display": "Normetanephrine [Mass/time] in 24 hour Urine"
    },
    {
        "code": "1924-0",
        "display": "Base deficit in Venous blood"
    },
    {
        "code": "49573-9",
        "display": "HIV genotype [Susceptibility] in Isolate by Genotype method Narrative"
    },
    {
        "code": "15191-0",
        "display": "Lupus anticoagulant neutralization dilute phospholipid [Presence] in Platelet poor plasma"
    },
    {
        "code": "5356-1",
        "display": "Smith extractable nuclear Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "23761-0",
        "display": "Neutrophils/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "5297-7",
        "display": "Rheumatoid factor [Presence] in Serum by Latex agglutination"
    },
    {
        "code": "5301-7",
        "display": "Ribonucleoprotein extractable nuclear Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "9783-2",
        "display": "Ehrlichia chaffeensis IgG Ab [Titer] in Serum"
    },
    {
        "code": "25156-1",
        "display": "Eosinophils [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "19839-0",
        "display": "Breath rate spontaneous --on ventilator"
    },
    {
        "code": "2778-9",
        "display": "Phosphate [Mass/volume] in Urine"
    },
    {
        "code": "13988-1",
        "display": "Beta globulin/Protein.total in 24 hour Urine by Electrophoresis"
    },
    {
        "code": "4621-9",
        "display": "Hemoglobin S [Presence] in Blood"
    },
    {
        "code": "26471-3",
        "display": "Leukocytes other/100 leukocytes in Blood"
    },
    {
        "code": "46082-4",
        "display": "Influenza virus A Ag [Presence] in Nasopharynx by Immunoassay"
    },
    {
        "code": "46083-2",
        "display": "Influenza virus B Ag [Presence] in Nasopharynx by Immunoassay"
    },
    {
        "code": "2357-2",
        "display": "Glucose-6-Phosphate dehydrogenase [Enzymatic activity/volume] in Red Blood Cells"
    },
    {
        "code": "28645-0",
        "display": "Carbon dioxide [Partial pressure] in Venous cord blood"
    },
    {
        "code": "2900-9",
        "display": "Pyridoxine (Vitamin B6) [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "5809-9",
        "display": "Reducing substances [Presence] in Urine"
    },
    {
        "code": "28649-2",
        "display": "Oxygen [Partial pressure] in Venous cord blood"
    },
    {
        "code": "6825-4",
        "display": "Crystals [type] in Body fluid by Light microscopy"
    },
    {
        "code": "20458-6",
        "display": "Rubella virus IgG Ab [interpretation] in Serum"
    },
    {
        "code": "27818-4",
        "display": "Protein C actual/normal in Platelet poor plasma by Chromogenic method    *NOTE: enzymatic method"
    },
    {
        "code": "7691-9",
        "display": "Scallop IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "20474-3",
        "display": "Bacteria identified in Tissue by Biopsy culture"
    },
    {
        "code": "28641-9",
        "display": "Bicarbonate [Moles/volume] in Venous cord blood"
    },
    {
        "code": "12234-1",
        "display": "Mesothelial cells/100 leukocytes in Body fluid by Manual count"
    },
    {
        "code": "23877-4",
        "display": "Anaplasma phagocytophilum IgG Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "28644-3",
        "display": "Carbon dioxide [Partial pressure] in Arterial cord blood"
    },
    {
        "code": "2956-1",
        "display": "Sodium [Moles/time] in 24 hour Urine"
    },
    {
        "code": "28648-4",
        "display": "Oxygen [Partial pressure] in Arterial cord blood"
    },
    {
        "code": "14252-1",
        "display": "Smooth muscle Ab [Presence] in Serum"
    },
    {
        "code": "21108-6",
        "display": "Beta 2 glycoprotein 1 IgA Ab [Units/volume] in Serum"
    },
    {
        "code": "44447-1",
        "display": "Beta 2 glycoprotein 1 IgA Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "9784-0",
        "display": "Ehrlichia chaffeensis IgM Ab [Titer] in Serum"
    },
    {
        "code": "49701-6",
        "display": "pH of Blood adjusted to patients actual temperature"
    },
    {
        "code": "6891-6",
        "display": "Testosterone.bioavailable/Testosterone.total in Serum or Plasma"
    },
    {
        "code": "11261-5",
        "display": "Bacteria identified in Vaginal fluid by Aerobe culture"
    },
    {
        "code": "23878-2",
        "display": "Anaplasma phagocytophilum IgM Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "2112-1",
        "display": "Choriogonadotropin.beta subunit (Pregnancy test) [Presence] in Urine"
    },
    {
        "code": "49047-4",
        "display": "Globulin [Mass/volume] in Urine by Electrophoresis"
    },
    {
        "code": "28640-1",
        "display": "Bicarbonate [Moles/volume] in Arterial cord blood"
    },
    {
        "code": "1527-1",
        "display": "Glucose [Mass/volume] in Serum or Plasma --30 minutes post 75 g glucose PO"
    },
    {
        "code": "10912-4",
        "display": "Lead [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "57804-7",
        "display": "Number of occult blood specimens recommended by testing kit protocol [#] in Stool"
    },
    {
        "code": "32207-3",
        "display": "Platelet distribution width [Entitic volume] in Blood by Automated count"
    },
    {
        "code": "12190-5",
        "display": "Creatinine [Mass/volume] in Body fluid"
    },
    {
        "code": "3174-0",
        "display": "Antithrombin [Units/volume] in Platelet poor plasma by Chromogenic method"
    },
    {
        "code": "33393-0",
        "display": "Coarse Granular Casts [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "9490-4",
        "display": "Aspergillus flavus Ab [Presence] in Serum"
    },
    {
        "code": "26447-3",
        "display": "Blasts/100 leukocytes in Cerebral spinal fluid"
    },
    {
        "code": "8095-2",
        "display": "Smooth muscle Ab [Titer] in Serum"
    },
    {
        "code": "2232-7",
        "display": "Epinephrine [Mass/time] in 24 hour Urine"
    },
    {
        "code": "6136-6",
        "display": "Hazelnut IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "9660-2",
        "display": "HIV 1 gp160 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "2873-8",
        "display": "Gamma globulin [Mass/volume] in Cerebral spinal fluid by Electrophoresis"
    },
    {
        "code": "9668-5",
        "display": "HIV 1 p55 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9667-7",
        "display": "HIV 1 p51 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "24469-9",
        "display": "Hemoglobin XXX/Hemoglobin.total in Blood by Electrophoresis"
    },
    {
        "code": "771-6",
        "display": "Nucleated erythrocytes [#/volume] in Blood by Automated count"
    },
    {
        "code": "9664-4",
        "display": "HIV 1 p24 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9661-0",
        "display": "HIV 1 gp120 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9666-9",
        "display": "HIV 1 p31 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "11070-0",
        "display": "Microscopic observation [Identifier] in Urine by Cyto stain"
    },
    {
        "code": "6687-8",
        "display": "Citrate [Mass/time] in 24 hour Urine"
    },
    {
        "code": "1854-9",
        "display": "Androstenedione [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "13993-1",
        "display": "Alpha 2 globulin/Protein.total in Urine by Electrophoresis"
    },
    {
        "code": "5785-1",
        "display": "Eosinophils [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "13995-6",
        "display": "Gamma globulin/Protein.total in Urine by Electrophoresis"
    },
    {
        "code": "2668-2",
        "display": "Norepinephrine [Mass/time] in 24 hour Urine"
    },
    {
        "code": "5354-6",
        "display": "Sjogrens syndrome-B extractable nuclear Ab [Presence] in Serum by Immune diffusion (ID)"
    },
    {
        "code": "85991-8",
        "display": "Streptococcus pneumoniae Danish serotype 14 IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "85992-6",
        "display": "Streptococcus pneumoniae Danish serotype 14 IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "1869-7",
        "display": "Apolipoprotein A-I [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "33332-8",
        "display": "Linezolid [Susceptibility] by Gradient strip"
    },
    {
        "code": "5352-0",
        "display": "Sjogrens syndrome-A extractable nuclear Ab [Presence] in Serum by Immune diffusion (ID)"
    },
    {
        "code": "2640-1",
        "display": "Myoglobin [Presence] in Urine"
    },
    {
        "code": "2998-3",
        "display": "Thiamine [Mass/volume] in Blood"
    },
    {
        "code": "38544-3",
        "display": "Spermatozoa [#/volume] in Semen --pre washing"
    },
    {
        "code": "38540-1",
        "display": "Spermatozoa Motile/100 spermatozoa in Semen --pre washing"
    },
    {
        "code": "3746-5",
        "display": "Meperidine [Presence] in Urine"
    },
    {
        "code": "12195-4",
        "display": "Creatinine renal clearance/1.73 sq M in 24 hour Urine"
    },
    {
        "code": "2218-6",
        "display": "Dopamine [Mass/time] in 24 hour Urine"
    },
    {
        "code": "19049-6",
        "display": "Metanephrine [Mass/time] in 24 hour Urine"
    },
    {
        "code": "28643-5",
        "display": "Oxygen saturation (SO2) in Venous cord blood"
    },
    {
        "code": "5057-5",
        "display": "Blastomyces dermatitidis Ab [Titer] in Serum by Complement fixation"
    },
    {
        "code": "6092-1",
        "display": "Crab IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "13926-1",
        "display": "Glutamate decarboxylase 65 Ab [Units/volume] in Serum"
    },
    {
        "code": "2513-0",
        "display": "Ketones [Presence] in Serum or Plasma"
    },
    {
        "code": "2518-9",
        "display": "Lactate [Moles/volume] in Arterial blood"
    },
    {
        "code": "6007-9",
        "display": "Protein C [Units/volume] in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "14708-2",
        "display": "Endomysium Ab [Titer] in Serum"
    },
    {
        "code": "7984-8",
        "display": "Parvovirus B19 IgM Ab [Units/volume] in Serum"
    },
    {
        "code": "11039-5",
        "display": "C reactive protein [Presence] in Serum or Plasma"
    },
    {
        "code": "32680-1",
        "display": "Fine Granular Casts [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "30340-4",
        "display": "Epstein Barr virus capsid IgM Ab [Presence] in Serum"
    },
    {
        "code": "24115-8",
        "display": "Epstein Barr virus capsid IgM Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "28642-7",
        "display": "Oxygen saturation (SO2) in Arterial cord blood"
    },
    {
        "code": "25489-6",
        "display": "Normetanephrine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "19942-2",
        "display": "Oxygen gas flow setting Oxymizer"
    },
    {
        "code": "18319-4",
        "display": "Neutrophils.vacuolated [Presence] in Blood by Light microscopy"
    },
    {
        "code": "15530-9",
        "display": "Alternaria alternata IgE Ab RAST class in Serum"
    },
    {
        "code": "3256-5",
        "display": "Fibrinogen Ag [Mass/volume] in Platelet poor plasma by Immunologic method"
    },
    {
        "code": "35789-7",
        "display": "Daptomycin [Susceptibility]"
    },
    {
        "code": "21365-2",
        "display": "Leptin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "21441-1",
        "display": "Human papilloma virus 6+11+42+43+44 DNA [Presence] in Cervix by DNA probe"
    },
    {
        "code": "14956-7",
        "display": "Microalbumin [Mass/time] in 24 hour Urine"
    },
    {
        "code": "3087-4",
        "display": "Urate [Mass/time] in 24 hour Urine"
    },
    {
        "code": "5863-6",
        "display": "Influenza virus A Ag [Presence] in Unspecified specimen by Immunofluorescence"
    },
    {
        "code": "34524-9",
        "display": "Neutrophils.band form [Presence] in Blood by Automated count"
    },
    {
        "code": "23841-0",
        "display": "Choriogonadotropin.beta subunit [Multiple of the median] adjusted in Serum or Plasma"
    },
    {
        "code": "1857-2",
        "display": "Angiotensin converting enzyme [Enzymatic activity/volume] in Blood"
    },
    {
        "code": "31797-4",
        "display": "Cytomegalovirus Ag [Presence] in Unspecified specimen"
    },
    {
        "code": "6379-2",
        "display": "Cytomegalovirus Ag [Presence] in Unspecified specimen by Immunoassay"
    },
    {
        "code": "16264-4",
        "display": "Calcium oxalate monohydrate crystals [Presence] in Stone by Infrared spectroscopy"
    },
    {
        "code": "49542-4",
        "display": "Date and time of pheresis procedure"
    },
    {
        "code": "30339-6",
        "display": "Epstein Barr virus capsid IgG Ab [Presence] in Serum"
    },
    {
        "code": "24114-1",
        "display": "Epstein Barr virus capsid IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "32554-8",
        "display": "Thiamine [Moles/volume] in Blood"
    },
    {
        "code": "14316-4",
        "display": "Benzodiazepines [Presence] in Urine by Screen method"
    },
    {
        "code": "9796-4",
        "display": "Color of Stone"
    },
    {
        "code": "9802-0",
        "display": "Size [Entitic volume] of Stone"
    },
    {
        "code": "2428-1",
        "display": "Homocysteine [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "35538-8",
        "display": "Baker's yeast IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "48050-9",
        "display": "Neutrophils [Presence] in Stool by Wright stain"
    },
    {
        "code": "20593-0",
        "display": "CD19 cells/100 cells in Unspecified specimen"
    },
    {
        "code": "5685-3",
        "display": "Mercury [Mass/volume] in Blood"
    },
    {
        "code": "2605-4",
        "display": "Meat fibers [Presence] in Stool by Light microscopy"
    },
    {
        "code": "730-2",
        "display": "Leukocytes other/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "8249-5",
        "display": "Transitional cells [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "30427-9",
        "display": "Macrophages/100 leukocytes in Body fluid"
    },
    {
        "code": "19835-8",
        "display": "Breath rate setting Ventilator synchronized intermittent mandatory"
    },
    {
        "code": "27395-3",
        "display": "Streptococcus pneumoniae Danish serotype 18C IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "40913-6",
        "display": "Streptococcus pneumoniae Danish serotype 18C IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "15212-4",
        "display": "Lipase [Enzymatic activity/volume] in Body fluid"
    },
    {
        "code": "3507-1",
        "display": "Codeine [Presence] in Urine"
    },
    {
        "code": "86024-7",
        "display": "Streptococcus pneumoniae Danish serotype 19F IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "86021-3",
        "display": "Streptococcus pneumoniae Danish serotype 19F IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "86064-3",
        "display": "Streptococcus pneumoniae Danish serotype 23F IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "86061-9",
        "display": "Streptococcus pneumoniae Danish serotype 23F IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "86107-0",
        "display": "Streptococcus pneumoniae Danish serotype 4 IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "86108-8",
        "display": "Streptococcus pneumoniae Danish serotype 4 IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "4575-7",
        "display": "Hemoglobin E/Hemoglobin.total in Blood"
    },
    {
        "code": "30153-1",
        "display": "Streptococcus pneumoniae Danish serotype 9V IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "40926-8",
        "display": "Streptococcus pneumoniae Danish serotype 9V IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "35127-0",
        "display": "Hemoglobin A2.prime/Hemoglobin.total in Blood"
    },
    {
        "code": "31156-3",
        "display": "Hemoglobin Barts/Hemoglobin.total in Blood"
    },
    {
        "code": "4569-0",
        "display": "Hemoglobin D/Hemoglobin.total in Blood"
    },
    {
        "code": "33593-5",
        "display": "Hemoglobin G - Coushatta/Hemoglobin.total in Blood"
    },
    {
        "code": "35125-4",
        "display": "Hemoglobin Lepore/Hemoglobin.total in Blood"
    },
    {
        "code": "35126-2",
        "display": "Hemoglobin O - Arab/Hemoglobin.total in Blood"
    },
    {
        "code": "13986-5",
        "display": "Albumin/Protein.total in 24 hour Urine by Electrophoresis"
    },
    {
        "code": "6165-5",
        "display": "Lobster IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "21709-1",
        "display": "MTHFR gene mutations found [Identifier] in Blood or Tissue by Molecular genetics method Nominal"
    },
    {
        "code": "29573-3",
        "display": "Phenylalanine [Moles/volume] in Dried blood spot"
    },
    {
        "code": "35572-7",
        "display": "Phenylalanine/Tyrosine [Molar ratio] in Dried blood spot"
    },
    {
        "code": "2609-6",
        "display": "Metanephrines [Mass/time] in 24 hour Urine"
    },
    {
        "code": "35571-9",
        "display": "Tyrosine [Moles/volume] in Dried blood spot"
    },
    {
        "code": "13984-0",
        "display": "Alpha 1 globulin/Protein.total in 24 hour Urine by Electrophoresis"
    },
    {
        "code": "38415-6",
        "display": "MTHFR gene mutation analysis in Blood or Tissue by Molecular genetics method Narrative"
    },
    {
        "code": "42484-6",
        "display": "Protein.monoclonal/Protein.total in 24 hour Urine by Electrophoresis"
    },
    {
        "code": "10863-9",
        "display": "Endomysium IgA Ab [Titer] in Serum"
    },
    {
        "code": "3830-7",
        "display": "Morphine [Presence] in Urine"
    },
    {
        "code": "3122-9",
        "display": "Vanillylmandelate [Mass/time] in 24 hour Urine"
    },
    {
        "code": "5693-7",
        "display": "Methanol [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "13499-9",
        "display": "HIV 1 Ab band pattern [interpretation] in Serum by Immunoblot (IB)"
    },
    {
        "code": "49540-8",
        "display": "Acid citrate dextrose [Volume] in Blood product unit"
    },
    {
        "code": "5292-8",
        "display": "Reagin Ab [Presence] in Serum by VDRL"
    },
    {
        "code": "31102-7",
        "display": "Protein S actual/normal in Platelet poor plasma by Chromogenic method    *NOTE: enzymatic method"
    },
    {
        "code": "25157-9",
        "display": "Epithelial casts [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "33333-6",
        "display": "Colistin [Susceptibility] by Gradient strip"
    },
    {
        "code": "35675-8",
        "display": "Calcium [Mass/volume] in unspecified time Urine"
    },
    {
        "code": "588-4",
        "display": "Legionella pneumophila Ag [Presence] in Unspecified specimen by Immunofluorescence"
    },
    {
        "code": "8150-5",
        "display": "Amphetamines [Mass/volume] in Urine"
    },
    {
        "code": "10449-7",
        "display": "Glucose [Mass/volume] in Serum or Plasma --1 hour post meal"
    },
    {
        "code": "17607-3",
        "display": "Volume of Cerebral spinal fluid"
    },
    {
        "code": "43583-4",
        "display": "Lipoprotein a [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "9426-8",
        "display": "Barbiturates [Mass/volume] in Urine"
    },
    {
        "code": "9428-4",
        "display": "Benzodiazepines [Mass/volume] in Urine"
    },
    {
        "code": "31032-6",
        "display": "Baker's yeast IgA Ab [Units/volume] in Serum"
    },
    {
        "code": "47320-7",
        "display": "Baker's yeast IgA Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "22086-3",
        "display": "Aspergillus niger Ab [Presence] in Serum"
    },
    {
        "code": "6164-8",
        "display": "Virginia Live Oak IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "33915-0",
        "display": "Anabasine [Mass/volume] in Urine"
    },
    {
        "code": "13358-7",
        "display": "Collection time of Semen"
    },
    {
        "code": "2837-3",
        "display": "Pregnenolone [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "34519-9",
        "display": "HFE gene mutation analysis in Blood or Tissue by Molecular genetics method Narrative"
    },
    {
        "code": "28545-2",
        "display": "Mucus [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "6113-5",
        "display": "Gum-Tree IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "27118-9",
        "display": "Streptococcus pneumoniae Danish serotype 6B IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "40905-2",
        "display": "Streptococcus pneumoniae Danish serotype 6B IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "12856-1",
        "display": "HIV 1 p65 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "19077-7",
        "display": "Cells identified in Body fluid"
    },
    {
        "code": "86080-9",
        "display": "Streptococcus pneumoniae Danish serotype 3 IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "86081-7",
        "display": "Streptococcus pneumoniae Danish serotype 3 IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "25296-5",
        "display": "Streptococcus pneumoniae Danish serotype 7F IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "40911-0",
        "display": "Streptococcus pneumoniae Danish serotype 7F IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "86147-6",
        "display": "Streptococcus pneumoniae Danish serotype 8 IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "86148-4",
        "display": "Streptococcus pneumoniae Danish serotype 8 IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "86169-0",
        "display": "Streptococcus pneumoniae Danish serotype 9N IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "86166-6",
        "display": "Streptococcus pneumoniae Danish serotype 9N IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "15048-2",
        "display": "Creatine kinase.BB/Creatine kinase.total in Serum or Plasma by Electrophoresis"
    },
    {
        "code": "12187-1",
        "display": "Creatine kinase.MB/Creatine kinase.total in Serum or Plasma by Electrophoresis"
    },
    {
        "code": "15049-0",
        "display": "Creatine kinase.MM/Creatine kinase.total in Serum or Plasma by Electrophoresis"
    },
    {
        "code": "9662-8",
        "display": "HIV 1 gp41 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "85954-6",
        "display": "Streptococcus pneumoniae Danish serotype 1 IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "85955-3",
        "display": "Streptococcus pneumoniae Danish serotype 1 IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "26019-0",
        "display": "Creatine Kinase.macromolecular type 1/Creatine kinase.total in Serum or Plasma"
    },
    {
        "code": "26020-8",
        "display": "Creatine Kinase.macromolecular type 2/Creatine kinase.total in Serum or Plasma"
    },
    {
        "code": "41763-4",
        "display": "Rubella virus IgG Ab [Titer] in Serum"
    },
    {
        "code": "42483-8",
        "display": "Protein.monoclonal/Protein.total in Urine by Electrophoresis"
    },
    {
        "code": "12859-5",
        "display": "HIV 1 p18 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "6050-9",
        "display": "Brazil Nut IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "85977-7",
        "display": "Streptococcus pneumoniae Danish serotype 12F IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "85974-4",
        "display": "Streptococcus pneumoniae Danish serotype 12F IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "21619-2",
        "display": "APOE gene mutations found [Identifier] in Blood or Tissue by Molecular genetics method Nominal"
    },
    {
        "code": "3086-6",
        "display": "Urate [Mass/volume] in Urine"
    },
    {
        "code": "18267-5",
        "display": "CD16+CD56+ cells/100 cells in Blood"
    },
    {
        "code": "48560-7",
        "display": "Human papilloma virus genotype [Identifier] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "33536-4",
        "display": "Miscellaneous allergen IgE Ab RAST class in Serum"
    },
    {
        "code": "14288-5",
        "display": "Carnitine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20402-4",
        "display": "CD16+CD56+ cells [#/volume] in Blood"
    },
    {
        "code": "2333-3",
        "display": "Gastrin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "11778-8",
        "display": "Delivery date Estimated"
    },
    {
        "code": "42810-2",
        "display": "Hemoglobin [Entitic mass] in Reticulocytes"
    },
    {
        "code": "5191-2",
        "display": "Hepatitis B virus e Ag [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "26458-0",
        "display": "Erythrocytes [#/volume] in Synovial fluid"
    },
    {
        "code": "14664-7",
        "display": "Color of Synovial fluid"
    },
    {
        "code": "8214-9",
        "display": "Opiates [Presence] in Meconium"
    },
    {
        "code": "14286-9",
        "display": "Carnitine free (C0) [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "27939-8",
        "display": "Collagen crosslinked N-telopeptide [Moles/volume] in Urine"
    },
    {
        "code": "16130-7",
        "display": "Herpes simplex virus 1 DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "32766-8",
        "display": "Trichomonas vaginalis [Presence] in Unspecified specimen by Wet preparation"
    },
    {
        "code": "17284-1",
        "display": "Mitochondria Ab [Presence] in Serum by Immunofluorescence"
    },
    {
        "code": "16268-5",
        "display": "Calcium phosphate crystals [Presence] in Stone by Infrared spectroscopy"
    },
    {
        "code": "7905-3",
        "display": "Hepatitis B virus surface Ag [Presence] in Serum by Neutralization test"
    },
    {
        "code": "19126-2",
        "display": "Bacteria identified in Bone marrow by Aerobe culture"
    },
    {
        "code": "6158-0",
        "display": "Latex IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "3282-1",
        "display": "aPTT W excess hexagonal phase phospholipid in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "32031-7",
        "display": "Phosphatidylserine IgA Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "6266-1",
        "display": "Tomato IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6009-5",
        "display": "Protein C Ag [Units/volume] in Platelet poor plasma by Immunologic method"
    },
    {
        "code": "936-5",
        "display": "Blood product unit [Identifier]"
    },
    {
        "code": "9820-2",
        "display": "Cryptococcus sp Ag [Titer] in Serum by Latex agglutination"
    },
    {
        "code": "11013-0",
        "display": "DNA double strand Ab [Titer] in Serum"
    },
    {
        "code": "31080-5",
        "display": "Cannabinoids [Presence] in Meconium by Screen method"
    },
    {
        "code": "5909-7",
        "display": "Blood smear finding [Identifier] in Blood by Light microscopy"
    },
    {
        "code": "22296-8",
        "display": "Epstein Barr virus nuclear Ab [Presence] in Serum"
    },
    {
        "code": "575-1",
        "display": "Fungus identified in Skin by Culture"
    },
    {
        "code": "5820-6",
        "display": "WBC casts [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "2999-1",
        "display": "Thiamine [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "35452-2",
        "display": "HIV 1 gp40 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "20449-5",
        "display": "Borrelia burgdorferi Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "6174-7",
        "display": "Milk IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "13047-6",
        "display": "Plasma cells/100 leukocytes in Blood"
    },
    {
        "code": "20999-9",
        "display": "Cell Fractions/Differential [interpretation] in Body fluid"
    },
    {
        "code": "16250-3",
        "display": "Codeine [Mass/volume] in Urine by Confirmatory method"
    },
    {
        "code": "15283-5",
        "display": "Silver Birch IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "1903-4",
        "display": "Ascorbate [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "40527-4",
        "display": "Cocaine [Presence] in Meconium"
    },
    {
        "code": "1695-6",
        "display": "5-Hydroxyindoleacetate [Mass/time] in 24 hour Urine"
    },
    {
        "code": "1549-5",
        "display": "Glucose [Mass/volume] in Serum or Plasma --pre 100 g glucose PO"
    },
    {
        "code": "21525-1",
        "display": "Sodium [Moles/volume] in 24 hour Urine"
    },
    {
        "code": "14906-2",
        "display": "Rh [Type] in Cord blood"
    },
    {
        "code": "20112-9",
        "display": "Tidal volume setting Ventilator"
    },
    {
        "code": "8144-8",
        "display": "Amphetamines [Presence] in Meconium"
    },
    {
        "code": "6242-2",
        "display": "Sesame Seed IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "21023-7",
        "display": "Neutrophil cytoplasmic Ab [Titer] in Serum"
    },
    {
        "code": "7983-0",
        "display": "Parvovirus B19 IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "30361-0",
        "display": "HIV 2 Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "781-5",
        "display": "Promyelocytes [#/volume] in Blood by Manual count"
    },
    {
        "code": "51892-8",
        "display": "ABO group [Type] in Cord blood"
    },
    {
        "code": "42803-7",
        "display": "Bacteria identified in Isolate"
    },
    {
        "code": "25631-3",
        "display": "Parvovirus B19 IgM Ab [Titer] in Serum"
    },
    {
        "code": "32787-4",
        "display": "Neutrophil cytoplasmic Ab.perinuclear [Titer] in Serum"
    },
    {
        "code": "19429-0",
        "display": "Propoxyphene [Presence] in Urine by Screen method"
    },
    {
        "code": "2282-2",
        "display": "Folate [Mass/volume] in Blood"
    },
    {
        "code": "16251-1",
        "display": "Morphine [Mass/volume] in Urine by Confirmatory method"
    },
    {
        "code": "32585-2",
        "display": "Epstein Barr virus DNA [#/volume] (viral load) in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "15410-4",
        "display": "Varicella zoster virus IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "5357-9",
        "display": "Smith extractable nuclear Ab [Presence] in Serum by Immune diffusion (ID)"
    },
    {
        "code": "5036-9",
        "display": "Streptococcus pyogenes rRNA [Presence] in Unspecified specimen by DNA probe"
    },
    {
        "code": "40974-8",
        "display": "Streptococcus pneumoniae Danish serotype 19A IgG Ab [Mass/volume] in Serum"
    },
    {
        "code": "40915-1",
        "display": "Streptococcus pneumoniae Danish serotype 19A IgG Ab [Mass/volume] in Serum by Immunoassay"
    },
    {
        "code": "31019-3",
        "display": "10-Hydroxycarbazepine [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "11040-3",
        "display": "Cortisol Free [Mass/volume] in Urine"
    },
    {
        "code": "9704-8",
        "display": "Spermatozoa [Morphology] in Semen"
    },
    {
        "code": "601-5",
        "display": "Fungus identified in Blood by Culture"
    },
    {
        "code": "19803-6",
        "display": "Specimen site"
    },
    {
        "code": "2779-7",
        "display": "Phosphate [Mass/time] in 24 hour Urine"
    },
    {
        "code": "21695-2",
        "display": "HFE gene p.C282Y [Presence] in Blood or Tissue by Molecular genetics method"
    },
    {
        "code": "38256-4",
        "display": "Cells Counted Total [#] in Body fluid"
    },
    {
        "code": "10587-4",
        "display": "Sexual abstinence duration"
    },
    {
        "code": "41479-7",
        "display": "BK virus DNA [#/volume] (viral load) in Serum or Plasma by Probe & target amplification method"
    },
    {
        "code": "21260-5",
        "display": "Epstein Barr virus nuclear Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "35270-8",
        "display": "Candida sp Ab [Presence] in Serum by Immune diffusion (ID)"
    },
    {
        "code": "14194-5",
        "display": "Spermatozoa Progressive/100 spermatozoa in Semen"
    },
    {
        "code": "6190-3",
        "display": "Oat IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6222-4",
        "display": "Queen Palm IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "27820-0",
        "display": "Protein C Ag actual/normal in Platelet poor plasma by Immunologic method"
    },
    {
        "code": "10579-1",
        "display": "Leukocytes [#/volume] in Semen"
    },
    {
        "code": "30247-1",
        "display": "Cytomegalovirus DNA [#/volume] (viral load) in Serum or Plasma by Probe & target amplification method"
    },
    {
        "code": "30165-5",
        "display": "Phosphatidylcholine/Albumin [Mass ratio] in Amniotic fluid"
    },
    {
        "code": "12782-9",
        "display": "Protein fractions.oligoclonal bands [interpretation] in Cerebral spinal fluid by Electrophoresis"
    },
    {
        "code": "3422-3",
        "display": "Caffeine [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "6892-4",
        "display": "Thyroxine (T4) free [Mass/volume] in Serum or Plasma by Dialysis"
    },
    {
        "code": "6151-5",
        "display": "Italian Cypress IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "5946-9",
        "display": "aPTT.factor substitution in Platelet poor plasma by Coagulation assay --immediately after addition of normal plasma"
    },
    {
        "code": "6230-7",
        "display": "Rice IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "10525-4",
        "display": "Microscopic observation [Identifier] in Unspecified specimen by Cyto stain"
    },
    {
        "code": "40692-6",
        "display": "Volume of Semen--pre washing"
    },
    {
        "code": "11884-4",
        "display": "Gestational age Estimated"
    },
    {
        "code": "19171-8",
        "display": "Alpha-1-Fetoprotein [Units/volume] in Amniotic fluid"
    },
    {
        "code": "7287-6",
        "display": "Dog Fennel IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "44528-8",
        "display": "Histoplasma capsulatum M Ab [Presence] in Serum"
    },
    {
        "code": "12227-5",
        "display": "Leukocytes [#/volume] corrected for nucleated erythrocytes in Blood"
    },
    {
        "code": "3545-1",
        "display": "Propoxyphene [Mass/volume] in Urine"
    },
    {
        "code": "20473-5",
        "display": "Polymorphonuclear cells [Presence] in Unspecified specimen by Wright stain"
    },
    {
        "code": "35732-7",
        "display": "Histoplasma capsulatum H Ab [Presence] in Serum by Immune diffusion (ID)"
    },
    {
        "code": "19261-7",
        "display": "Amphetamines [Presence] in Urine by Screen method"
    },
    {
        "code": "11235-9",
        "display": "Fentanyl [Presence] in Urine"
    },
    {
        "code": "5221-7",
        "display": "HIV 1 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "6109-3",
        "display": "White Elm IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "10353-1",
        "display": "Bacteria identified in Nose by Aerobe culture"
    },
    {
        "code": "7124-1",
        "display": "Bayberry Pollen IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "8251-1",
        "display": "Service comment"
    },
    {
        "code": "38996-5",
        "display": "Neutrophils [Presence] in Urine by Light microscopy"
    },
    {
        "code": "15197-7",
        "display": "Lymphocytes Fissured/100 leukocytes in Blood by Manual count"
    },
    {
        "code": "14207-5",
        "display": "Streptococcal DNAse B [Titer] in Serum"
    },
    {
        "code": "44547-8",
        "display": "Human papilloma virus DNA [Presence] in Unspecified specimen by Probe & signal amplification method"
    },
    {
        "code": "28543-7",
        "display": "Basophils/100 leukocytes in Body fluid"
    },
    {
        "code": "6012-9",
        "display": "von Willebrand factor (vWf) Ag [Units/volume] in Platelet poor plasma by Immunologic method"
    },
    {
        "code": "7902-0",
        "display": "Helicobacter pylori IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "10728-4",
        "display": "Trichomonas sp identified in Genital specimen by Organism specific culture"
    },
    {
        "code": "8118-2",
        "display": "CD2 cells/100 cells in Blood"
    },
    {
        "code": "38496-6",
        "display": "Retinyl palmitate [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "48053-3",
        "display": "Turbidity [Presence] of Synovial fluid"
    },
    {
        "code": "33984-6",
        "display": "Coagulation factor X activity actual/normal in Platelet poor plasma by Chromogenic method"
    },
    {
        "code": "49839-4",
        "display": "Eosinophils [Presence] in Urine sediment by Wright stain"
    },
    {
        "code": "5669-7",
        "display": "Isopropanol [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "7816-2",
        "display": "Blastomyces dermatitidis Ab [Presence] in Serum"
    },
    {
        "code": "7477-3",
        "display": "Mango Pollen IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "36913-2",
        "display": "FMR1 gene mutation analysis in Blood or Tissue by Molecular genetics method Narrative"
    },
    {
        "code": "13943-6",
        "display": "Fructose [Presence] in Semen"
    },
    {
        "code": "34441-6",
        "display": "Spermatozoa [Velocity] in Semen"
    },
    {
        "code": "7110-0",
        "display": "Groundsel Tree IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "2464-6",
        "display": "IgG [Mass/volume] in Cerebral spinal fluid"
    },
    {
        "code": "6195-2",
        "display": "Cocksfoot IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "4059-2",
        "display": "Tobramycin [Mass/volume] in Serum or Plasma --trough"
    },
    {
        "code": "48051-7",
        "display": "Erythrocytes [Presence] in Vaginal fluid"
    },
    {
        "code": "19710-3",
        "display": "Tramadol [Presence] in Urine by Screen method"
    },
    {
        "code": "22297-6",
        "display": "Epstein Barr virus nuclear Ab [Titer] in Serum"
    },
    {
        "code": "27823-4",
        "display": "Protein S Ag actual/normal in Platelet poor plasma by Immunologic method"
    },
    {
        "code": "560-3",
        "display": "Chlamydia sp identified in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "20427-1",
        "display": "Acetylcholine receptor Ab [Moles/volume] in Serum"
    },
    {
        "code": "48038-4",
        "display": "Pathologist interpretation of Synovial fluid tests"
    },
    {
        "code": "4551-8",
        "display": "Hemoglobin A2/Hemoglobin.total in Blood"
    },
    {
        "code": "47383-5",
        "display": "Nuclear Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "9557-0",
        "display": "CD2 cells [#/volume] in Blood"
    },
    {
        "code": "41476-3",
        "display": "Rickettsia rickettsii IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "9804-6",
        "display": "Weight of Stone"
    },
    {
        "code": "20468-5",
        "display": "Thiamine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "33242-9",
        "display": "Fungi.filamentous [Presence] in Urine by Computer assisted method"
    },
    {
        "code": "27821-8",
        "display": "Protein S Free Ag actual/normal in Platelet poor plasma by Immunologic method"
    },
    {
        "code": "3175-7",
        "display": "Antithrombin Ag [Units/volume] in Platelet poor plasma by Immunologic method"
    },
    {
        "code": "49572-1",
        "display": "Second trimester triple maternal screen [interpretation] in Serum or Plasma Narrative"
    },
    {
        "code": "23301-5",
        "display": "Mycoplasma sp DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "5256-3",
        "display": "Mycoplasma pneumoniae IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "21760-4",
        "display": "FRAXE gene CGG repeats [Presence] in Blood or Tissue by Molecular genetics method"
    },
    {
        "code": "16117-4",
        "display": "Babesia microti IgG Ab [Titer] in Serum"
    },
    {
        "code": "41475-5",
        "display": "Rickettsia rickettsii IgM Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "21416-3",
        "display": "Neisseria gonorrhoeae DNA [Presence] in Urine by Probe & target amplification method"
    },
    {
        "code": "24119-0",
        "display": "Cytomegalovirus IgM Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "21582-2",
        "display": "Tryptase [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "5255-5",
        "display": "Mycoplasma pneumoniae IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "13947-7",
        "display": "Coccidioides immitis IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "2251-7",
        "display": "Estriol (E3) [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "24125-7",
        "display": "Androgen free Index in Serum or Plasma"
    },
    {
        "code": "13948-5",
        "display": "Coccidioides immitis IgM Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "25474-8",
        "display": "Metanephrines [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "49580-4",
        "display": "HIV 1+2 Ab [Presence] in Unspecified specimen by Rapid test"
    },
    {
        "code": "6021-0",
        "display": "Apple IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "26451-5",
        "display": "Eosinophils/100 leukocytes in Cerebral spinal fluid"
    },
    {
        "code": "5908-9",
        "display": "Platelets Giant [Presence] in Blood by Light microscopy"
    },
    {
        "code": "16118-2",
        "display": "Babesia microti IgM Ab [Titer] in Serum"
    },
    {
        "code": "4057-6",
        "display": "Tobramycin [Mass/volume] in Serum or Plasma --peak"
    },
    {
        "code": "30525-0",
        "display": "Age"
    },
    {
        "code": "32546-4",
        "display": "Glucose-6-Phosphate dehydrogenase [Enzymatic activity/mass] in Red Blood Cells"
    },
    {
        "code": "32164-6",
        "display": "Cells [#/volume] in Synovial fluid by Manual count"
    },
    {
        "code": "9811-1",
        "display": "Chromogranin A [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "10355-6",
        "display": "Microscopic observation [Identifier] in Bone marrow by Wright Giemsa stain"
    },
    {
        "code": "1848-1",
        "display": "Androstanolone [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "3969-3",
        "display": "Phenytoin Free [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "6270-3",
        "display": "Tuna IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "7613-3",
        "display": "Pistachio IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "14083-0",
        "display": "Epstein Barr virus early Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "18182-6",
        "display": "Osmolality of Serum or Plasma by calculation"
    },
    {
        "code": "41279-1",
        "display": "Borrelia burgdorferi IgG Ab/IgM Ab [Ratio] in Serum"
    },
    {
        "code": "7883-2",
        "display": "Epstein Barr virus nuclear IgG Ab [Presence] in Serum"
    },
    {
        "code": "20425-5",
        "display": "Cardiolipin IgM Ab [interpretation] in Serum"
    },
    {
        "code": "1746-7",
        "display": "Albumin [Mass/volume] in Cerebral spinal fluid"
    },
    {
        "code": "20424-8",
        "display": "Cardiolipin IgG Ab [interpretation] in Serum"
    },
    {
        "code": "26479-6",
        "display": "Lymphocytes/100 leukocytes in Cerebral spinal fluid"
    },
    {
        "code": "3043-7",
        "display": "Triglyceride [Mass/volume] in Blood"
    },
    {
        "code": "609-8",
        "display": "Bacteria identified in Eye by Aerobe culture"
    },
    {
        "code": "15643-0",
        "display": "Clam IgE Ab RAST class in Serum"
    },
    {
        "code": "14869-2",
        "display": "Pathologist review of Blood tests"
    },
    {
        "code": "5814-9",
        "display": "Triple phosphate crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "30193-7",
        "display": "Acylcarnitine/Carnitine.free (C0) [Molar ratio] in Serum or Plasma"
    },
    {
        "code": "8047-3",
        "display": "Varicella zoster virus IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "38476-8",
        "display": "Mullerian inhibiting substance [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "5834-7",
        "display": "Adenovirus Ag [Presence] in Unspecified specimen by Immunofluorescence"
    },
    {
        "code": "6257-0",
        "display": "Strawberry IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "28009-9",
        "display": "Volume of Urine"
    },
    {
        "code": "19111-4",
        "display": "Mother's hospital number"
    },
    {
        "code": "13349-6",
        "display": "Leukocytes [#/volume] in Stool by Manual count"
    },
    {
        "code": "1992-7",
        "display": "Calcitonin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "26607-2",
        "display": "Cystathionine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "16263-6",
        "display": "Calcium oxalate dihydrate crystals [Presence] in Stone by Infrared spectroscopy"
    },
    {
        "code": "47387-6",
        "display": "Neisseria gonorrhoeae DNA [Presence] in Genital specimen by Probe & target amplification method"
    },
    {
        "code": "698-1",
        "display": "Neisseria gonorrhoeae [Presence] in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "5646-5",
        "display": "Ethylene glycol [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "7917-8",
        "display": "HIV 1 Ab [Presence] in Serum"
    },
    {
        "code": "17122-3",
        "display": "CD19+Kappa+ cells/100 cells in Blood"
    },
    {
        "code": "32786-6",
        "display": "Thyroperoxidase Ab [Titer] in Serum or Plasma"
    },
    {
        "code": "5724-0",
        "display": "Selenium [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "6209-1",
        "display": "Pecan or Hickory Tree IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "4633-4",
        "display": "Hemoglobin F/Hemoglobin.total in Blood by Kleihauer-Betke method"
    },
    {
        "code": "4821-5",
        "display": "HLA-B27 [Presence]"
    },
    {
        "code": "22203-4",
        "display": "Clostridium tetani IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "6237-2",
        "display": "Salmon IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "48049-1",
        "display": "Eosinophils [Presence] in Stool by Wright stain"
    },
    {
        "code": "5202-7",
        "display": "Herpes simplex virus Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "12308-3",
        "display": "Hydrocodone [Presence] in Urine"
    },
    {
        "code": "9834-3",
        "display": "Hydromorphone [Presence] in Urine"
    },
    {
        "code": "42192-5",
        "display": "Nidus [Presence] in Stone"
    },
    {
        "code": "16249-5",
        "display": "Oxycodone [Mass/volume] in Urine by Confirmatory method"
    },
    {
        "code": "30437-8",
        "display": "Monocytes+Macrophages/100 leukocytes in Body fluid"
    },
    {
        "code": "6035-0",
        "display": "Banana IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "19643-6",
        "display": "Oxycodone [Presence] in Urine by Confirmatory method"
    },
    {
        "code": "18325-1",
        "display": "Oxymorphone [Presence] in Urine by Confirmatory method"
    },
    {
        "code": "47226-6",
        "display": "Fetal lung maturity [interpretation] in Amniotic fluid"
    },
    {
        "code": "17395-5",
        "display": "Oxymorphone [Mass/volume] in Urine by Confirmatory method"
    },
    {
        "code": "19074-4",
        "display": "Carnitine esters [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "12598-9",
        "display": "Fat.neutral [Presence] in Stool"
    },
    {
        "code": "17123-1",
        "display": "CD19+Lambda+ cells/100 cells in Blood"
    },
    {
        "code": "36922-3",
        "display": "TPMT gene mutation analysis in Blood or Tissue by Molecular genetics method Narrative"
    },
    {
        "code": "6194-5",
        "display": "Orange IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "5170-6",
        "display": "Gliadin IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "26528-0",
        "display": "Cortisol [Mass/volume] in Serum or Plasma --1 hour post dose corticotropin"
    },
    {
        "code": "49581-2",
        "display": "Reference lab test identifier and name [Identifier]"
    },
    {
        "code": "12210-1",
        "display": "Eosinophils/100 leukocytes in Urine sediment by Manual count"
    },
    {
        "code": "7042-5",
        "display": "Penicillin V [Susceptibility] by Gradient strip"
    },
    {
        "code": "7041-7",
        "display": "Penicillin G [Susceptibility] by Gradient strip"
    },
    {
        "code": "29901-6",
        "display": "HTLV 1+2 Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "22110-1",
        "display": "Bartonella henselae IgG Ab [Titer] in Serum"
    },
    {
        "code": "14251-3",
        "display": "Mitochondria M2 IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "26530-6",
        "display": "Cortisol [Mass/volume] in Serum or Plasma --30 minutes post dose corticotropin"
    },
    {
        "code": "19593-3",
        "display": "6-Monoacetylmorphine (6-MAM) [Mass/volume] in Urine by Confirmatory method"
    },
    {
        "code": "59417-6",
        "display": "Oxygen saturation in Arterial blood by Pulse oximetry --resting"
    },
    {
        "code": "59412-7",
        "display": "Oxygen saturation in Arterial blood by Pulse oximetry --post exercise"
    },
    {
        "code": "6448-5",
        "display": "Legionella pneumophila Ag [Presence] in Urine by Radioimmunoassay (RIA)"
    },
    {
        "code": "6137-4",
        "display": "Hazelnut Pollen IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "5644-0",
        "display": "Ethanol [Presence] in Urine"
    },
    {
        "code": "3093-2",
        "display": "Urea nitrogen [Mass/volume] in Body fluid"
    },
    {
        "code": "2701-1",
        "display": "Oxalate [Mass/time] in 24 hour Urine"
    },
    {
        "code": "1007-4",
        "display": "Direct antiglobulin test.poly specific reagent [Presence] on Red Blood Cells"
    },
    {
        "code": "59841-7",
        "display": "Vendor name [Identifier] in Unspecified specimen"
    },
    {
        "code": "19768-1",
        "display": "Reviewing cytologist who read Cyto stain of Cervical or vaginal smear or scraping"
    },
    {
        "code": "5381-9",
        "display": "Thyroglobulin Ab [Titer] in Serum by Latex agglutination"
    },
    {
        "code": "808-6",
        "display": "Leukocytes [#/volume] in Pleural fluid by Manual count"
    },
    {
        "code": "35331-8",
        "display": "Oxcarbazepine [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "14862-7",
        "display": "Oxalate [Moles/time] in 24 hour Urine"
    },
    {
        "code": "25835-0",
        "display": "HIV 1 RNA [Presence] in Serum or Plasma by Probe & target amplification method"
    },
    {
        "code": "35051-2",
        "display": "Leukocytes other [#/volume] in Body fluid"
    },
    {
        "code": "7893-1",
        "display": "Gliadin Ab [Units/volume] in Serum"
    },
    {
        "code": "15015-1",
        "display": "Alkaline phosphatase.liver/Alkaline phosphatase.total in Serum or Plasma"
    },
    {
        "code": "33917-6",
        "display": "Nornicotine [Mass/volume] in Urine"
    },
    {
        "code": "15013-6",
        "display": "Alkaline phosphatase.bone/Alkaline phosphatase.total in Serum or Plasma"
    },
    {
        "code": "24378-2",
        "display": "Platelet aggregation epinephrine induced [Presence] in Platelet rich plasma"
    },
    {
        "code": "6062-4",
        "display": "Casein IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6220-8",
        "display": "Potato IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6873-4",
        "display": "Beta hydroxybutyrate [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "47440-3",
        "display": "Hepatitis B virus core Ab [Presence] in Serum from donor"
    },
    {
        "code": "44533-8",
        "display": "HIV 1+2 Ab [Presence] in Serum from donor"
    },
    {
        "code": "44538-7",
        "display": "HTLV 1+2 Ab [Presence] in Serum from donor"
    },
    {
        "code": "5877-6",
        "display": "Respiratory syncytial virus Ag [Presence] in Unspecified specimen by Immunofluorescence"
    },
    {
        "code": "49846-9",
        "display": "Hepatitis C virus Ag [Presence] in Blood or Marrow from donor"
    },
    {
        "code": "9632-1",
        "display": "Aspergillus fumigatus Ab [Presence] in Serum"
    },
    {
        "code": "2032-1",
        "display": "Carboxyhemoglobin/Hemoglobin.total in Venous blood"
    },
    {
        "code": "19050-4",
        "display": "Metanephrines [Mass/volume] in 24 hour Urine"
    },
    {
        "code": "47364-5",
        "display": "Hepatitis B virus surface Ag [Presence] in Serum from donor by Immunoassay"
    },
    {
        "code": "13942-8",
        "display": "Spermatozoa Motile [Presence] in Semen by Light microscopy"
    },
    {
        "code": "22463-4",
        "display": "Reagin Ab [Presence] in Serum from donor"
    },
    {
        "code": "10622-9",
        "display": "Spermatozoa Normal/100 spermatozoa in Semen"
    },
    {
        "code": "19088-4",
        "display": "Collection of urine specimen start date"
    },
    {
        "code": "47441-1",
        "display": "Hepatitis C virus Ab [Presence] in Serum from donor"
    },
    {
        "code": "19089-2",
        "display": "Collection of urine specimen start time"
    },
    {
        "code": "15174-6",
        "display": "Cryocrit of Serum by Spun Westergren"
    },
    {
        "code": "5000-5",
        "display": "Cytomegalovirus DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "19086-8",
        "display": "Collection of urine specimen end date"
    },
    {
        "code": "19087-6",
        "display": "Collection of urine specimen end time"
    },
    {
        "code": "7558-0",
        "display": "Oyster IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "29280-5",
        "display": "Fibrin D-dimer [Presence] in Platelet poor plasma by Latex agglutination"
    },
    {
        "code": "43399-5",
        "display": "JAK2 gene p.V617F [Presence] in Blood or Tissue by Molecular genetics method"
    },
    {
        "code": "13462-7",
        "display": "Apolipoprotein A-I/Apolipoprotein B [Mass ratio] in Serum or Plasma"
    },
    {
        "code": "49295-9",
        "display": "Protein Fractions [interpretation] in Cerebral spinal fluid by Electrophoresis Narrative"
    },
    {
        "code": "43441-5",
        "display": "Bacteria identified in Bronchoalveolar lavage by Aerobe culture"
    },
    {
        "code": "21482-5",
        "display": "Protein [Mass/volume] in 24 hour Urine"
    },
    {
        "code": "2597-3",
        "display": "Magnesium [Moles/volume] in Red Blood Cells"
    },
    {
        "code": "2669-0",
        "display": "Normetanephrine [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "35603-0",
        "display": "Clonazepam [Mass/volume] in Serum or Plasma by Screen method"
    },
    {
        "code": "21422-1",
        "display": "Normetanephrine [Mass/volume] in 24 hour Urine"
    },
    {
        "code": "13327-2",
        "display": "Parainfluenza virus Ag [Presence] in Unspecified specimen by Immunofluorescence"
    },
    {
        "code": "26517-3",
        "display": "Polymorphonuclear cells/100 leukocytes in Cerebral spinal fluid"
    },
    {
        "code": "3193-0",
        "display": "Coagulation factor V activity actual/normal in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "2895-1",
        "display": "Protoporphyrin.zinc [Mass/volume] in Red Blood Cells"
    },
    {
        "code": "6367-7",
        "display": "Clostridium tetani IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "41480-5",
        "display": "BK virus DNA [#/volume] (viral load) in Urine by Probe & target amplification method"
    },
    {
        "code": "31788-3",
        "display": "Cryptococcus sp Ag [Presence] in Cerebral spinal fluid"
    },
    {
        "code": "31843-6",
        "display": "Helicobacter pylori Ag [Presence] in Stool"
    },
    {
        "code": "888-8",
        "display": "Blood group antibodies identified in Serum or Plasma"
    },
    {
        "code": "25987-9",
        "display": "Testosterone Free [Moles/volume] in Serum or Plasma by Radioimmunoassay (RIA)"
    },
    {
        "code": "40464-0",
        "display": "Drugs identified in Urine by Confirmatory method"
    },
    {
        "code": "13227-4",
        "display": "Corynebacterium diphtheriae IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "58787-3",
        "display": "Corynebacterium diphtheriae IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "32284-2",
        "display": "BK virus DNA [Units/volume] (viral load) in Serum or Plasma by Probe & target amplification method"
    },
    {
        "code": "19287-2",
        "display": "Cannabinoids tested for in Urine by Screen method Nominal"
    },
    {
        "code": "17852-5",
        "display": "Ureaplasma urealyticum [Presence] in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "6078-0",
        "display": "Cockroach IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "15388-2",
        "display": "Mycoplasma hominis [Presence] in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "31036-7",
        "display": "Gatifloxacin [Susceptibility] by Minimum inhibitory concentration (MIC)"
    },
    {
        "code": "23871-7",
        "display": "Hepatitis C virus NS5 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "15917-8",
        "display": "Peanut IgE Ab RAST class in Serum"
    },
    {
        "code": "9610-7",
        "display": "Hepatitis C virus c33c Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "9609-9",
        "display": "Hepatitis C virus 22-3 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "3187-2",
        "display": "Coagulation factor IX activity actual/normal in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "43993-5",
        "display": "Age at delivery"
    },
    {
        "code": "23860-0",
        "display": "Erythrocytes [#/volume] in Body fluid by Automated count"
    },
    {
        "code": "3096-5",
        "display": "Urea nitrogen [Mass/time] in 24 hour Urine"
    },
    {
        "code": "6998-9",
        "display": "Ceftriaxone [Susceptibility] by Gradient strip"
    },
    {
        "code": "25630-5",
        "display": "Parvovirus B19 IgG Ab [Titer] in Serum"
    },
    {
        "code": "2350-7",
        "display": "Glucose [Mass/volume] in Urine"
    },
    {
        "code": "19098-3",
        "display": "Erythrocytes [Presence] in Amniotic fluid"
    },
    {
        "code": "12229-1",
        "display": "Macrophages/100 leukocytes in Cerebral spinal fluid by Manual count"
    },
    {
        "code": "20446-1",
        "display": "Herpes simplex virus IgG Ab [interpretation] in Serum by Immunoassay"
    },
    {
        "code": "6059-0",
        "display": "Candida albicans IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "13337-1",
        "display": "CD8+HLA-DR+ cells/100 cells in Blood"
    },
    {
        "code": "21112-8",
        "display": "Birth date"
    },
    {
        "code": "25435-9",
        "display": "Herpes simplex virus IgM Ab [Presence] in Serum"
    },
    {
        "code": "49835-2",
        "display": "CD19+IgD+ cells/100 cells in Unspecified specimen"
    },
    {
        "code": "32632-2",
        "display": "HEXA gene mutations found [Identifier] in Blood or Tissue by Molecular genetics method Nominal"
    },
    {
        "code": "49041-7",
        "display": "Testosterone [Mass/volume] in Serum or Plasma by Detection limit = 1.0 ng/dL"
    },
    {
        "code": "5096-3",
        "display": "Coccidioides immitis Ab [Titer] in Serum by Complement fixation"
    },
    {
        "code": "7774-3",
        "display": "Cow whey IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "5052-6",
        "display": "Aspergillus sp Ab [Presence] in Serum by Immune diffusion (ID)"
    },
    {
        "code": "29675-6",
        "display": "Parvovirus B19 IgG Ab [Presence] in Serum"
    },
    {
        "code": "29660-8",
        "display": "Parvovirus B19 IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "7981-4",
        "display": "Parvovirus B19 IgM Ab [Presence] in Serum"
    },
    {
        "code": "40658-7",
        "display": "Parvovirus B19 IgM Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "32147-1",
        "display": "Reducing substances [Mass/volume] in Urine"
    },
    {
        "code": "22111-9",
        "display": "Bartonella henselae IgM Ab [Titer] in Serum"
    },
    {
        "code": "22362-8",
        "display": "HTLV 1+2 Ab [Presence] in Serum"
    },
    {
        "code": "2892-8",
        "display": "Protoporphyrin Free [Mass/volume] in Blood"
    },
    {
        "code": "3198-9",
        "display": "Coagulation factor VII activity actual/normal in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "49042-5",
        "display": "Testosterone Free [Mass/volume] in Serum or Plasma by Detection limit = 1.0 ng/dL"
    },
    {
        "code": "10386-1",
        "display": "Albumin given [Volume]"
    },
    {
        "code": "13589-7",
        "display": "Activated protein C resistance [Presence] in Blood by Probe & target amplification method"
    },
    {
        "code": "16201-6",
        "display": "Oxazepam [Mass/volume] in Urine by Confirmatory method"
    },
    {
        "code": "8087-9",
        "display": "Parietal cell Ab [Units/volume] in Serum"
    },
    {
        "code": "8220-6",
        "display": "Opiates [Mass/volume] in Urine"
    },
    {
        "code": "16228-9",
        "display": "Nordiazepam [Mass/volume] in Urine by Confirmatory method"
    },
    {
        "code": "23876-6",
        "display": "HIV 1 RNA [Units/volume] (viral load) in Plasma by Probe & signal amplification method"
    },
    {
        "code": "42621-3",
        "display": "Mycoplasma hominis DNA [Presence] in Blood by Probe & target amplification method"
    },
    {
        "code": "4477-6",
        "display": "Complement C1 esterase inhibitor [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "6138-2",
        "display": "Helminthosporium halodes IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "2216-0",
        "display": "Dopamine [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "6037-6",
        "display": "Barley IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "7632-3",
        "display": "Privet IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "10580-9",
        "display": "Liquefaction [Time] in Semen"
    },
    {
        "code": "6460-0",
        "display": "Bacteria identified in Sputum by Culture"
    },
    {
        "code": "20416-4",
        "display": "Hepatitis C virus RNA [#/volume] (viral load) in Serum or Plasma by Probe & target amplification method"
    },
    {
        "code": "13941-0",
        "display": "Lymphocytes/100 leukocytes in Body fluid by Manual count"
    },
    {
        "code": "47252-2",
        "display": "Hepatitis C virus RNA [Log #/volume] (viral load) in Serum or Plasma by Probe & target amplification method"
    },
    {
        "code": "41487-0",
        "display": "Cryptosporidium parvum Ag [Presence] in Stool by Immunoassay"
    },
    {
        "code": "14116-8",
        "display": "IgG synthesis rate [Mass/time] in Serum & CSF by calculation"
    },
    {
        "code": "29539-4",
        "display": "HIV 1 RNA [Log #/volume] (viral load) in Plasma by Probe & signal amplification method"
    },
    {
        "code": "33630-5",
        "display": "HIV protease gene mutations detected [Identifier] in Isolate"
    },
    {
        "code": "21821-4",
        "display": "t(9,22)(ABL1,BCR) Translocation [Presence] in Blood or Tissue by Molecular genetics method"
    },
    {
        "code": "33893-9",
        "display": "Karyotype [Identifier] in Bone marrow Nominal"
    },
    {
        "code": "20398-4",
        "display": "Nuclear Ab Pattern Homogenous [Titer] in Serum"
    },
    {
        "code": "5583-0",
        "display": "Arsenic [Mass/volume] in Blood"
    },
    {
        "code": "5234-0",
        "display": "Jo-1 extractable nuclear Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "16074-7",
        "display": "Walnut IgE Ab RAST class in Serum"
    },
    {
        "code": "35622-0",
        "display": "Nordiazepam [Mass/volume] in Serum or Plasma by Screen method"
    },
    {
        "code": "15014-4",
        "display": "Alkaline phosphatase.intestinal/Alkaline phosphatase.total in Serum or Plasma"
    },
    {
        "code": "20431-3",
        "display": "Microscopic observation [Identifier] in Unspecified specimen by Smear"
    },
    {
        "code": "49588-7",
        "display": "First trimester maternal screen with nuchal translucency [interpretation] Narrative"
    },
    {
        "code": "611-4",
        "display": "Bacteria identified in Body fluid by Culture"
    },
    {
        "code": "23905-3",
        "display": "Mycophenolate [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "31112-6",
        "display": "Reticulocytes/100 erythrocytes in Blood by Manual"
    },
    {
        "code": "25418-5",
        "display": "Mumps virus IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "65757-7",
        "display": "Pathology biopsy report in Kidney Narrative"
    },
    {
        "code": "65752-8",
        "display": "Pathology biopsy report in Liver Narrative"
    },
    {
        "code": "65751-0",
        "display": "Pathology biopsy report in Muscle Narrative"
    },
    {
        "code": "65754-4",
        "display": "Pathology biopsy report in Skin Narrative"
    },
    {
        "code": "2217-8",
        "display": "Dopamine [Mass/volume] in Urine"
    },
    {
        "code": "11046-0",
        "display": "Epinephrine [Mass/volume] in Urine"
    },
    {
        "code": "2667-4",
        "display": "Norepinephrine [Mass/volume] in Urine"
    },
    {
        "code": "25383-1",
        "display": "Cow milk IgE Ab RAST class in Serum"
    },
    {
        "code": "6234-9",
        "display": "Saltwort IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "3786-1",
        "display": "Methaqualone [Presence] in Urine"
    },
    {
        "code": "11060-1",
        "display": "Reducing substances [Presence] in Stool"
    },
    {
        "code": "20469-3",
        "display": "Acetone [Presence] in Serum or Plasma by Screen method"
    },
    {
        "code": "50970-3",
        "display": "XXX blood group Ab [Titer] in Serum or Plasma by Antihuman globulin"
    },
    {
        "code": "22315-6",
        "display": "Hepatitis A virus IgM Ab [Units/volume] in Serum"
    },
    {
        "code": "17713-9",
        "display": "Topiramate [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "19125-4",
        "display": "Meconium [Presence] in Amniotic fluid"
    },
    {
        "code": "49578-8",
        "display": "Aminocaproate cutoff [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "2749-0",
        "display": "pH of Gastric fluid"
    },
    {
        "code": "11559-2",
        "display": "Fractional oxyhemoglobin in Blood"
    },
    {
        "code": "7415-3",
        "display": "Cladosporium sphaerospermum IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "34696-5",
        "display": "Collection method [Type] of Semen"
    },
    {
        "code": "7901-2",
        "display": "Helicobacter pylori IgA Ab [Units/volume] in Serum"
    },
    {
        "code": "38494-1",
        "display": "Metanephrine Free [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "13627-5",
        "display": "Erythrocytes [Presence] in Semen by Light microscopy"
    },
    {
        "code": "15192-8",
        "display": "Lymphocytes Variant [Presence] in Blood by Automated count"
    },
    {
        "code": "2030-5",
        "display": "Carboxyhemoglobin/Hemoglobin.total in Arterial blood"
    },
    {
        "code": "11034-6",
        "display": "Acetylcholine receptor binding Ab [Moles/volume] in Serum"
    },
    {
        "code": "5838-8",
        "display": "Cytomegalovirus [Presence] in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "24312-1",
        "display": "Treponema pallidum Ab [Presence] in Serum by Agglutination"
    },
    {
        "code": "35595-8",
        "display": "Acetaminophen [Mass/volume] in Serum or Plasma by Screen method"
    },
    {
        "code": "550-4",
        "display": "Bordetella pertussis Ag [Presence] in Unspecified specimen by Immunofluorescence"
    },
    {
        "code": "25148-8",
        "display": "Calcium oxalate crystals [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "14117-6",
        "display": "IgG index in Serum & CSF"
    },
    {
        "code": "26509-0",
        "display": "Neutrophils.band form/100 leukocytes in Cerebral spinal fluid"
    },
    {
        "code": "12209-3",
        "display": "Eosinophils/100 leukocytes in Body fluid by Manual count"
    },
    {
        "code": "666-8",
        "display": "Microscopic observation [Identifier] in Unspecified specimen by India ink prep"
    },
    {
        "code": "12215-0",
        "display": "Fatty acids.very long chain [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "19734-3",
        "display": "Chicken droppings IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "2638-5",
        "display": "Myelin basic protein [Mass/volume] in Cerebral spinal fluid"
    },
    {
        "code": "14875-9",
        "display": "Phenylalanine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20643-3",
        "display": "Glutamine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20636-7",
        "display": "Alanine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "5005-4",
        "display": "Epstein Barr virus DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "25473-0",
        "display": "Metanephrine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20661-5",
        "display": "Valine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "3861-2",
        "display": "Nordiazepam [Presence] in Urine"
    },
    {
        "code": "12361-2",
        "display": "Oxazepam [Presence] in Urine"
    },
    {
        "code": "9624-8",
        "display": "Vanillylmandelate [Mass/volume] in Urine"
    },
    {
        "code": "14121-8",
        "display": "Pyruvate [Moles/volume] in Blood"
    },
    {
        "code": "46268-9",
        "display": "ABO & Rh group [Type] in Blood from Blood product unit--after transfusion reaction"
    },
    {
        "code": "3436-3",
        "display": "Carboxy tetrahydrocannabinol [Mass/volume] in Urine"
    },
    {
        "code": "41163-7",
        "display": "Treponema pallidum DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "20648-2",
        "display": "Isoleucine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20649-0",
        "display": "Leucine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "24139-8",
        "display": "Cockroach IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "11183-1",
        "display": "Macadamia IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "44607-0",
        "display": "HIV 1 [interpretation] in Serum by Immunoassay"
    },
    {
        "code": "8015-0",
        "display": "Rubella virus IgM Ab [Units/volume] in Serum"
    },
    {
        "code": "6239-8",
        "display": "Lenscale IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "5116-9",
        "display": "Corynebacterium diphtheriae Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "1777-2",
        "display": "Alkaline phosphatase.bone [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "22568-0",
        "display": "Streptolysin O Ab [Titer] in Serum"
    },
    {
        "code": "13538-4",
        "display": "Carbon dioxide, total [Moles/volume] in Urine"
    },
    {
        "code": "14976-5",
        "display": "Lecithin/Sphingomyelin [Ratio] in Amniotic fluid"
    },
    {
        "code": "19201-3",
        "display": "Prostate Specific Ag Free [Units/volume] in Serum or Plasma"
    },
    {
        "code": "18482-0",
        "display": "Yeast [Presence] in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "32789-0",
        "display": "Viscosity of Semen Qualitative"
    },
    {
        "code": "7445-0",
        "display": "Lactalbumin alpha IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "35670-9",
        "display": "Tobramycin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "17819-4",
        "display": "Albumin/Protein.total in unspecified time Urine by Electrophoresis"
    },
    {
        "code": "17811-1",
        "display": "Alpha 1 globulin/Protein.total in unspecified time Urine by Electrophoresis"
    },
    {
        "code": "17813-7",
        "display": "Alpha 2 globulin/Protein.total in unspecified time Urine by Electrophoresis"
    },
    {
        "code": "17815-2",
        "display": "Beta globulin/Protein.total in unspecified time Urine by Electrophoresis"
    },
    {
        "code": "17817-8",
        "display": "Gamma globulin/Protein.total in unspecified time Urine by Electrophoresis"
    },
    {
        "code": "21027-8",
        "display": "Platelet aggregation [interpretation] in Platelet poor plasma"
    },
    {
        "code": "13088-0",
        "display": "Complement total hemolytic CH100 [Units/volume] in Serum or Plasma"
    },
    {
        "code": "34165-1",
        "display": "Granulocytes Immature [Presence] in Blood by Automated count"
    },
    {
        "code": "8072-1",
        "display": "Insulin Ab [Units/volume] in Serum"
    },
    {
        "code": "20660-7",
        "display": "Tyrosine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20401-6",
        "display": "Nuclear Ab pattern.speckled [Titer] in Serum"
    },
    {
        "code": "533-0",
        "display": "Mycobacterium sp identified in Blood by Organism specific culture"
    },
    {
        "code": "20651-6",
        "display": "Methionine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "9360-9",
        "display": "Bartonella quintana IgG Ab [Titer] in Serum"
    },
    {
        "code": "23870-9",
        "display": "Hepatitis C virus 100+5-1-1 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "59408-5",
        "display": "Oxygen saturation in Arterial blood by Pulse oximetry"
    },
    {
        "code": "9812-9",
        "display": "Cortisol [Mass/volume] in Serum or Plasma --evening specimen"
    },
    {
        "code": "2700-3",
        "display": "Oxalate [Mass/volume] in Urine"
    },
    {
        "code": "4991-6",
        "display": "Borrelia burgdorferi DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "22070-7",
        "display": "HP gene mutations found [Identifier] in Blood or Tissue by Molecular genetics method Nominal"
    },
    {
        "code": "6286-9",
        "display": "Wormwood IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "32220-6",
        "display": "Liver kidney microsomal 1 Ab [Units/volume] in Serum"
    },
    {
        "code": "9326-0",
        "display": "Phosphatidylserine IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "9361-7",
        "display": "Bartonella quintana IgM Ab [Titer] in Serum"
    },
    {
        "code": "20637-5",
        "display": "Arginine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20640-9",
        "display": "Citrulline [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20644-1",
        "display": "Glycine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20656-5",
        "display": "Serine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20658-1",
        "display": "Threonine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20657-3",
        "display": "Taurine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "6029-3",
        "display": "Aureobasidium pullulans IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "20642-5",
        "display": "Glutamate [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20645-8",
        "display": "Histidine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "20655-7",
        "display": "Proline [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "18903-5",
        "display": "Chloramphenicol [Susceptibility]"
    },
    {
        "code": "17788-1",
        "display": "Large unstained cells/100 leukocytes in Blood by Automated count"
    },
    {
        "code": "14246-3",
        "display": "Phosphatidylserine IgM Ab [Units/volume] in Serum"
    },
    {
        "code": "3218-5",
        "display": "Coagulation factor X activity actual/normal in Platelet poor plasma by Coagulation assay"
    },
    {
        "code": "49058-1",
        "display": "Activated partial thromboplastin time (aPTT) in Blood drawn from CRRT circuit by Coagulation assay"
    },
    {
        "code": "6061-6",
        "display": "Carrot IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "20781-1",
        "display": "Cryptosporidium sp [Presence] in Stool by Acid fast stain"
    },
    {
        "code": "32217-2",
        "display": "von Willebrand factor (vWf) multimers [Presence] in Platelet poor plasma"
    },
    {
        "code": "22412-1",
        "display": "Saccharopolyspora rectivirgula Ab [Presence] in Serum"
    },
    {
        "code": "20652-4",
        "display": "Ornithine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "6733-0",
        "display": "Pigeon serum Ab [Presence] in Serum by Immune diffusion (ID)"
    },
    {
        "code": "20650-8",
        "display": "Lysine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "10853-0",
        "display": "Isospora belli [Presence] in Unspecified specimen by Acid fast stain.Kinyoun modified"
    },
    {
        "code": "5869-3",
        "display": "Parainfluenza virus 1 Ag [Presence] in Unspecified specimen by Immunofluorescence"
    },
    {
        "code": "7059-9",
        "display": "Vancomycin [Susceptibility] by Gradient strip"
    },
    {
        "code": "2159-2",
        "display": "Creatinine [Mass/volume] in Amniotic fluid"
    },
    {
        "code": "1974-5",
        "display": "Bilirubin [Mass/volume] in Body fluid"
    },
    {
        "code": "20638-3",
        "display": "Asparagine [Moles/volume] in Serum or Plasma"
    },
    {
        "code": "12201-0",
        "display": "Cryoglobulin [Presence] in Serum by 1 day cold incubation"
    },
    {
        "code": "20499-0",
        "display": "Phosphatidylglycerol/Surfactant.total in Amniotic fluid"
    },
    {
        "code": "50758-2",
        "display": "Herpes simplex virus 1 IgM Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "26927-4",
        "display": "Herpes simplex virus 2 IgM Ab [Titer] in Serum by Immunofluorescence"
    },
    {
        "code": "16195-0",
        "display": "Benzodiazepines [Presence] in Urine by Confirmatory method"
    },
    {
        "code": "6081-4",
        "display": "Coconut IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "721-1",
        "display": "Free Hemoglobin [Mass/volume] in Plasma"
    },
    {
        "code": "31209-0",
        "display": "Islet cell 512 Ab [Units/volume] in Serum"
    },
    {
        "code": "1779-8",
        "display": "Alkaline phosphatase.liver [Enzymatic activity/volume] in Serum or Plasma"
    },
    {
        "code": "2334-1",
        "display": "Hemoglobin.gastrointestinal [Presence] in Gastric fluid    *NOTE: from occult blood"
    },
    {
        "code": "16085-3",
        "display": "Wheat IgE Ab RAST class in Serum"
    },
    {
        "code": "29591-5",
        "display": "Enterovirus RNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "24103-4",
        "display": "Plasma cells [#/volume] in Blood by Manual count"
    },
    {
        "code": "6038-4",
        "display": "American Beech IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "38168-1",
        "display": "Major crossmatch [interpretation] by Low ionic strenght saline (LISS)"
    },
    {
        "code": "2142-8",
        "display": "Cortisol [Mass/volume] in Saliva"
    },
    {
        "code": "15568-9",
        "display": "Soybean IgE Ab RAST class in Serum"
    },
    {
        "code": "43734-3",
        "display": "aPTT in Platelet poor plasma by Coagulation 1:1 saline"
    },
    {
        "code": "75513-2",
        "display": "dRVVT with 1:1 PNP (LA mix)"
    },
    {
        "code": "16982-1",
        "display": "HTLV 1+2 Ab [Presence] in Serum by Immunoblot (IB)"
    },
    {
        "code": "20420-6",
        "display": "Prostatic acid phosphatase [Mass/volume] in Serum"
    },
    {
        "code": "6125-9",
        "display": "Gluten IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "30374-3",
        "display": "Basophils/100 leukocytes in Cerebral spinal fluid"
    },
    {
        "code": "3714-3",
        "display": "Lidocaine [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "10526-2",
        "display": "Microscopic observation [Identifier] in Sputum by Cyto stain"
    },
    {
        "code": "7796-6",
        "display": "Platelet clump [Presence] in Blood by Light microscopy"
    },
    {
        "code": "5959-2",
        "display": "Prothrombin time (PT) factor substitution in Platelet poor plasma by Coagulation assay --immediately after addition of normal plasma"
    },
    {
        "code": "29559-2",
        "display": "Haemophilus ducreyi DNA [Presence] in Unspecified specimen by Probe & target amplification method"
    },
    {
        "code": "18743-5",
        "display": "Autopsy report"
    },
    {
        "code": "6901-3",
        "display": "Insulin Free [Units/volume] in Serum or Plasma"
    },
    {
        "code": "6121-8",
        "display": "Fusarium moniliforme IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "49838-6",
        "display": "Neural tube defect risk in population"
    },
    {
        "code": "6090-5",
        "display": "Cottonwood IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "30192-9",
        "display": "Acetylcholine receptor modulation Ab/Acetylcholine Ab.total in Serum"
    },
    {
        "code": "6287-7",
        "display": "Baker's yeast IgE Ab [Units/volume] in Serum"
    },
    {
        "code": "6349-5",
        "display": "Chlamydia trachomatis [Presence] in Unspecified specimen by Organism specific culture"
    },
    {
        "code": "4635-9",
        "display": "Free Hemoglobin [Mass/volume] in Serum"
    },
    {
        "code": "46128-5",
        "display": "Tissue transglutaminase IgA Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "2711-0",
        "display": "Oxygen saturation (SO2) in Venous blood"
    },
    {
        "code": "7797-4",
        "display": "Rouleaux [Presence] in Blood by Light microscopy"
    },
    {
        "code": "8277-6",
        "display": "Body surface area"
    },
    {
        "code": "765-8",
        "display": "Neutrophils.hypersegmented [Presence] in Blood by Light microscopy"
    },
    {
        "code": "1926-5",
        "display": "Base excess in Capillary blood"
    },
    {
        "code": "7795-8",
        "display": "Pappenheimer bodies [Presence] in Blood by Light microscopy"
    },
    {
        "code": "20456-0",
        "display": "Fungi.yeastlike [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "2716-9",
        "display": "Fractional oxyhemoglobin (HbO2) in Venous blood"
    },
    {
        "code": "5819-8",
        "display": "Waxy casts [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "5807-3",
        "display": "RBC casts [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "38995-7",
        "display": "Mixed cellular casts [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "46138-4",
        "display": "Urate crystals [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "5335-5",
        "display": "Rubella virus IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "25154-6",
        "display": "Unidentified crystals [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "33215-5",
        "display": "Neutrophils.agranular [Presence] in Blood by Light microscopy"
    },
    {
        "code": "5788-5",
        "display": "Oval fat bodies (globules) [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "2272-3",
        "display": "Fat [Presence] in Urine"
    },
    {
        "code": "10380-4",
        "display": "Stomatocytes [Presence] in Blood by Light microscopy"
    },
    {
        "code": "7817-0",
        "display": "Borrelia burgdorferi IgG Ab [Units/volume] in Serum"
    },
    {
        "code": "5062-5",
        "display": "Borrelia burgdorferi IgG Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "5786-9",
        "display": "Epithelial casts [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "33216-3",
        "display": "Platelets agranular [Presence] in Blood by Light microscopy"
    },
    {
        "code": "18311-1",
        "display": "Pelger Huet cells [Presence] in Blood by Light microscopy"
    },
    {
        "code": "11281-3",
        "display": "Auer rods [Presence] in Blood by Light microscopy"
    },
    {
        "code": "30003-8",
        "display": "Microalbumin [Mass/volume] in 24 hour Urine"
    },
    {
        "code": "5784-4",
        "display": "Cystine crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "5775-2",
        "display": "Calcium phosphate crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "5789-3",
        "display": "Fatty casts [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "5773-7",
        "display": "Calcium carbonate crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "20624-3",
        "display": "Creatinine [Mass/volume] in 24 hour Urine"
    },
    {
        "code": "14958-3",
        "display": "Microalbumin/Creatinine [Mass ratio] in 24 hour Urine"
    },
    {
        "code": "33647-9",
        "display": "Protein.monoclonal/Protein.total in Serum or Plasma by Electrophoresis"
    },
    {
        "code": "716-1",
        "display": "Heinz bodies [Presence] in Blood by Light microscopy"
    },
    {
        "code": "5798-4",
        "display": "Leucine crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "2027-1",
        "display": "Carbon dioxide, total [Moles/volume] in Venous blood"
    },
    {
        "code": "5815-6",
        "display": "Tyrosine crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "5766-1",
        "display": "Ammonium urate crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "30350-3",
        "display": "Hemoglobin [Mass/volume] in Venous blood"
    },
    {
        "code": "27200-5",
        "display": "Nuclear Ab [Units/volume] in Serum"
    },
    {
        "code": "25149-6",
        "display": "Calcium phosphate crystals [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "25158-7",
        "display": "Oval fat bodies (globules) [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "18487-9",
        "display": "Broad casts [#/area] in Urine sediment by Microscopy low power field"
    },
    {
        "code": "24015-0",
        "display": "Influenza virus A+B Ag [Presence] in Unspecified specimen"
    },
    {
        "code": "6437-8",
        "display": "Influenza virus A+B Ag [Presence] in Unspecified specimen by Immunoassay"
    },
    {
        "code": "20457-8",
        "display": "Fungi.filamentous [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "5812-3",
        "display": "Sulfonamide crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "5771-1",
        "display": "Bilirubin crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "25147-0",
        "display": "Calcium carbonate crystals [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "40729-6",
        "display": "Herpes simplex virus IgM Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "53835-5",
        "display": "1,5-Anhydroglucitol [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "5777-8",
        "display": "Cholesterol crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "20455-2",
        "display": "Leukocytes [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "33905-1",
        "display": "Trichomonas sp [#/area] in Urine sediment by Microscopy high power field"
    },
    {
        "code": "45068-4",
        "display": "Chlamydia trachomatis+Neisseria gonorrhoeae DNA [Presence] in Cervix by Probe and target amplification method"
    },
    {
        "code": "30394-1",
        "display": "Granulocytes [#/volume] in Blood"
    },
    {
        "code": "5795-0",
        "display": "Hippurate crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "18312-9",
        "display": "Platelet satellitism [Presence] in Blood by Light microscopy"
    },
    {
        "code": "5776-0",
        "display": "Calcium sulfate crystals [Presence] in Urine sediment by Light microscopy"
    },
    {
        "code": "27071-0",
        "display": "CD45 cells [#/volume] in Blood"
    },
    {
        "code": "11043-7",
        "display": "Cryofibrinogen [Presence] in Plasma"
    },
    {
        "code": "32033-3",
        "display": "Phosphatidylserine IgM Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "20578-1",
        "display": "Vancomycin [Mass/volume] in Serum or Plasma"
    },
    {
        "code": "33256-9",
        "display": "Leukocytes [#/volume] corrected for nucleated erythrocytes in Blood by Automated count"
    },
    {
        "code": "708-8",
        "display": "Blasts [#/volume] in Blood by Manual count"
    },
    {
        "code": "18309-5",
        "display": "Nucleated erythrocytes/100 leukocytes [Ratio] in Blood by Manual count"
    },
    {
        "code": "5156-5",
        "display": "Epstein Barr virus nuclear IgG Ab [Presence] in Serum by Immunoassay"
    },
    {
        "code": "51928-0",
        "display": "Ribonucleoprotein extractable nuclear Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "33569-5",
        "display": "Sjogrens syndrome-A extractable nuclear Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "45142-7",
        "display": "Sjogrens syndrome-B extractable nuclear Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "43182-5",
        "display": "Smith extractable nuclear Ab [Units/volume] in Serum by Immunoassay"
    },
    {
        "code": "53151-7",
        "display": "Valine/Phenylalanine [Molar ratio] in Dried blood spot"
    },
    {
        "code": "47799-2",
        "display": "Valine [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53159-0",
        "display": "Tryptophan [Moles/volume] in Dried blood spot"
    },
    {
        "code": "48633-2",
        "display": "Trypsinogen I Free [Mass/volume] in Dried blood spot"
    },
    {
        "code": "29575-8",
        "display": "Thyrotropin [Units/volume] in Dried blood spot"
    },
    {
        "code": "68325-0",
        "display": "Thrombin time actual/?Normal"
    },
    {
        "code": "47784-4",
        "display": "Threonine [Moles/volume] in Dried blood spot"
    },
    {
        "code": "64119-1",
        "display": "Third most predominant hemoglobin in Dried blood spot"
    },
    {
        "code": "70159-9",
        "display": "Tetradecenoylcarnitine (C14:1)/Tetradecanoylcarnitine (C14) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53195-4",
        "display": "Tetradecenoylcarnitine (C14:1)/Palmitoylcarnitine (C16) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53194-7",
        "display": "Tetradecenoylcarnitine (C14:1)/Dodecenoylcarnitine (C12:1) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53193-9",
        "display": "Tetradecenoylcarnitine (C14:1)/Acetylcarnitine (C2) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53191-3",
        "display": "Tetradecenoylcarnitine (C14:1) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53192-1",
        "display": "Tetradecanoylcarnitine (C14) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53190-5",
        "display": "Tetradecadienoylcarnitine (C14:2) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "62320-7",
        "display": "T-cell receptor excision circle [#/volume] in Dried blood spot by Probe and target amplification method"
    },
    {
        "code": "53231-7",
        "display": "Succinylacetone [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53241-6",
        "display": "Stearoylcarnitine (C18) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "64118-3",
        "display": "Second most predominant hemoglobin in Dried blood spot"
    },
    {
        "code": "68326-8",
        "display": "Reptilase time actual/?Normal"
    },
    {
        "code": "6683-7",
        "display": "Reptilase time"
    },
    {
        "code": "5894-1",
        "display": "Prothrombin time (PT) actual/?Normal"
    },
    {
        "code": "75211-3",
        "display": "Propionylcarnitine (C3)+Palmitoylcarnitine (C16) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53164-0",
        "display": "Propionylcarnitine (C3)/Palmitoylcarnitine (C16) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53162-4",
        "display": "Propionylcarnitine (C3)/Carnitine.free (C0) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53163-2",
        "display": "Propionylcarnitine (C3)/Acetylcarnitine (C2) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53160-8",
        "display": "Propionylcarnitine (C3) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53199-6",
        "display": "Palmitoylcarnitine (C16) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53198-8",
        "display": "Palmitoleylcarnitine (C16:1) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "73696-7",
        "display": "Oxygen saturation.preductal-oxygen saturation.postductal [Mass fraction difference] in Bld.preductal and Bld.postductal"
    },
    {
        "code": "59407-7",
        "display": "Oxygen saturation in Blood Preductal by Pulse oximetry"
    },
    {
        "code": "59418-4",
        "display": "Oxygen saturation in Blood Postductal by Pulse oximetry"
    },
    {
        "code": "53202-8",
        "display": "Oleoylcarnitine (C18:1) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53177-2",
        "display": "Octanoylcarnitine (C8)/Decanoylcarnitine (C10) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53176-4",
        "display": "Octanoylcarnitine (C8)/Acetylcarnitine (C2) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53175-6",
        "display": "Octanoylcarnitine (C8) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "73967-2",
        "display": "Noninvasive prenatal fetal aneuploidy test panel - Plasma cell-free DNA"
    },
    {
        "code": "75547-0",
        "display": "Noninvasive prenatal fetal aneuploidy and microdeletion panel based on Plasma cell-free+WBC DNA by Dosage of chromosome-specific circulating cell free (ccf) DNA"
    },
    {
        "code": "77019-8",
        "display": "Noninvasive prenatal fetal 18 and 21 aneuploidy panel - Plasma cell-free DNA by Sequencing"
    },
    {
        "code": "77018-0",
        "display": "Noninvasive prenatal fetal 13 and 18 and 21 aneuploidy panel - Plasma cell-free DNA by Sequencing"
    },
    {
        "code": "54109-4",
        "display": "Newborn hearing screen of Ear - right"
    },
    {
        "code": "54108-6",
        "display": "Newborn hearing screen of Ear - left"
    },
    {
        "code": "54106-0",
        "display": "Newborn hearing screen method"
    },
    {
        "code": "43384-7",
        "display": "Neisseria sp identified in Urethra by Organism specific culture"
    },
    {
        "code": "80369-2",
        "display": "Neisseria sp identified in Rectum by Organism specific culture"
    },
    {
        "code": "80366-8",
        "display": "Neisseria gonorrhoeae rRNA [Presence] in Rectum by Probe and target amplification method"
    },
    {
        "code": "57289-1",
        "display": "Neisseria gonorrhoeae rRNA [Presence] in Nasopharynx by Probe and target amplification method"
    },
    {
        "code": "21415-5",
        "display": "Neisseria gonorrhoeae DNA [Presence] in Urethra by Probe and target amplification method"
    },
    {
        "code": "53879-3",
        "display": "Neisseria gonorrhoeae Ag [Presence] in Urethra"
    },
    {
        "code": "32705-6",
        "display": "Neisseria gonorrhoeae Ag [Presence] in Genital specimen"
    },
    {
        "code": "693-2",
        "display": "Neisseria gonorrhoeae [Presence] in Vaginal fluid by Organism specific culture"
    },
    {
        "code": "697-3",
        "display": "Neisseria gonorrhoeae [Presence] in Urethra by Organism specific culture"
    },
    {
        "code": "80368-4",
        "display": "Neisseria gonorrhoeae [Presence] in Rectum by Organism specific culture"
    },
    {
        "code": "30099-6",
        "display": "Neisseria gonorrhoeae [Presence] in Conjunctival specimen by Organism specific culture"
    },
    {
        "code": "688-2",
        "display": "Neisseria gonorrhoeae [Presence] in Cervix by Organism specific culture"
    },
    {
        "code": "64117-5",
        "display": "Most predominant hemoglobin in Dried blood spot"
    },
    {
        "code": "67709-6",
        "display": "Methylmalonylcarnitine (C4-DC)+3-Hydroxyisovalerylcarnitine (C5-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53181-4",
        "display": "Methylmalonylcarnitine (C4-DC)/3-Hydroxyisovalerylcarnitine (C5-OH) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "45222-7",
        "display": "Methylmalonylcarnitine (C4-DC) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53187-1",
        "display": "Methylglutarylcarnitine (C6-DC) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53156-6",
        "display": "Methionine/Phenylalanine [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53397-6",
        "display": "Methionine/Alloisoleucine+Isoleucine+Leucine+Hydroxyproline [Molar ratio] in Dried blood spot"
    },
    {
        "code": "47700-0",
        "display": "Methionine [Moles/volume] in Dried blood spot"
    },
    {
        "code": "45217-7",
        "display": "Linoleoylcarnitine (C18:2) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53240-8",
        "display": "Isovalerylcarnitine+Methylbutyrylcarnitine (C5)/Propionylcarnitine (C3) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53401-6",
        "display": "Isovalerylcarnitine+Methylbutyrylcarnitine (C5)/Octanoylcarnitine (C8) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53238-2",
        "display": "Isovalerylcarnitine+Methylbutyrylcarnitine (C5)/Carnitine.free (C0) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53239-0",
        "display": "Isovalerylcarnitine+Methylbutyrylcarnitine (C5)/Acetylcarnitine (C2) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "45216-9",
        "display": "Isovalerylcarnitine+Methylbutyrylcarnitine (C5) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "45211-0",
        "display": "Hexanoylcarnitine (C6) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "64122-5",
        "display": "Hemoglobins that can be presumptively identified based on available controls in Dried blood spot"
    },
    {
        "code": "67701-3",
        "display": "Glutarylcarnitine (C5-DC)+3-Hydroxyhexanoylcarnitine (C6-OH)/Palmitoylcarnitine (C16) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "67711-2",
        "display": "Glutarylcarnitine (C5-DC)+3-Hydroxyhexanoylcarnitine (C6-OH)/Octanoylcarnitine (C8) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "67710-4",
        "display": "Glutarylcarnitine (C5-DC)+3-Hydroxyhexanoylcarnitine (C6-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53186-3",
        "display": "Glutarylcarnitine (C5-DC)+3-Hydroxydecanoylcarnitine (C10-OH)/Palmitoylcarnitine (C16) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53185-5",
        "display": "Glutarylcarnitine (C5-DC)+3-Hydroxydecanoylcarnitine (C10-OH)/Octanoylcarnitine (C8) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53403-2",
        "display": "Glutarylcarnitine (C5-DC)+3-Hydroxydecanoylcarnitine (C10-OH)/Butyrylcarnitine+Isobutyrylcarnitine (C4) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53184-8",
        "display": "Glutarylcarnitine (C5-DC)+3-Hydroxydecanoylcarnitine (C10-OH)/3-Hydroxyisovalerylcarnitine (C5-OH) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53183-0",
        "display": "Glutarylcarnitine (C5-DC)+3-Hydroxydecanoylcarnitine (C10-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "33288-2",
        "display": "Galactose 1 phosphate uridyl transferase [Presence] in Dried blood spot"
    },
    {
        "code": "42906-8",
        "display": "Galactose 1 phosphate uridyl transferase [Enzymatic activity/volume] in Dried blood spot"
    },
    {
        "code": "54084-9",
        "display": "Galactose [Mass/volume] in Dried blood spot"
    },
    {
        "code": "64120-9",
        "display": "Fourth most predominant hemoglobin in Dried blood spot"
    },
    {
        "code": "64121-7",
        "display": "Fifth most predominant hemoglobin in Dried blood spot"
    },
    {
        "code": "50410-0",
        "display": "dRVVT/?dRVVT W excess phospholipid (screen to confirm ratio)"
    },
    {
        "code": "75512-4",
        "display": "dRVVT with 1:1 PNP actual/?normal (normalized LA mix)"
    },
    {
        "code": "75511-6",
        "display": "dRVVT W excess phospholipid percent correction"
    },
    {
        "code": "68916-6",
        "display": "dRVVT W excess phospholipid actual/?normal (normalized LA confirm)"
    },
    {
        "code": "57838-5",
        "display": "dRVVT W excess phospholipid (LA confirm)"
    },
    {
        "code": "45200-3",
        "display": "Dodecenoylcarnitine (C12:1) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "45199-7",
        "display": "Dodecanoylcarnitine (C12) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "45198-9",
        "display": "Decenoylcarnitine (C10:1) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "45197-1",
        "display": "Decanoylcarnitine (C10) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53345-5",
        "display": "Cortisol [Mass/volume] in Dried blood spot"
    },
    {
        "code": "53399-2",
        "display": "Citrulline/Tyrosine [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53157-4",
        "display": "Citrulline/Phenylalanine [Molar ratio] in Dried blood spot"
    },
    {
        "code": "54092-2",
        "display": "Citrulline/Arginine [Molar ratio] in Dried blood spot"
    },
    {
        "code": "42892-0",
        "display": "Citrulline [Moles/volume] in Dried blood spot"
    },
    {
        "code": "80362-7",
        "display": "Chlamydia trachomatis+Neisseria gonorrhoeae rRNA [Presence] in Vaginal fluid by Probe and target amplification method"
    },
    {
        "code": "80360-1",
        "display": "Chlamydia trachomatis+Neisseria gonorrhoeae rRNA [Presence] in Urine by Probe and target amplification method"
    },
    {
        "code": "80365-0",
        "display": "Chlamydia trachomatis+Neisseria gonorrhoeae rRNA [Presence] in Rectum by Probe and target amplification method"
    },
    {
        "code": "80361-9",
        "display": "Chlamydia trachomatis+Neisseria gonorrhoeae rRNA [Presence] in Cervix by Probe and target amplification method"
    },
    {
        "code": "70164-9",
        "display": "Chlamydia trachomatis+Neisseria gonorrhoeae DNA [Presence] in Urine by Probe and target amplification method"
    },
    {
        "code": "53926-2",
        "display": "Chlamydia trachomatis rRNA [Presence] in Vaginal fluid by Probe and target amplification method"
    },
    {
        "code": "80364-3",
        "display": "Chlamydia trachomatis rRNA [Presence] in Rectum by Probe and target amplification method"
    },
    {
        "code": "57288-3",
        "display": "Chlamydia trachomatis rRNA [Presence] in Nasopharynx by Probe and target amplification method"
    },
    {
        "code": "80363-5",
        "display": "Chlamydia trachomatis DNA [Presence] in Rectum by Probe and target amplification method"
    },
    {
        "code": "45086-6",
        "display": "Chlamydia trachomatis DNA [Presence] in Nasopharynx by Probe and target amplification method"
    },
    {
        "code": "45084-1",
        "display": "Chlamydia trachomatis and Neisseria gonorrhoeae rRNA panel - Vaginal fluid by Probe and target amplification method"
    },
    {
        "code": "6351-1",
        "display": "Chlamydia trachomatis Ag [Presence] in Conjunctival specimen by Immunofluorescence"
    },
    {
        "code": "14464-2",
        "display": "Chlamydia trachomatis [Presence] in Vaginal fluid by Organism specific culture"
    },
    {
        "code": "14465-9",
        "display": "Chlamydia trachomatis [Presence] in Urethra by Organism specific culture"
    },
    {
        "code": "80367-6",
        "display": "Chlamydia trachomatis [Presence] in Rectum by Organism specific culture"
    },
    {
        "code": "45094-0",
        "display": "Chlamydia trachomatis [Presence] in Conjunctival specimen by Organism specific culture"
    },
    {
        "code": "14463-4",
        "display": "Chlamydia trachomatis [Presence] in Cervix by Organism specific culture"
    },
    {
        "code": "54083-1",
        "display": "CFTR gene mutations found [Identifier] in Dried blood spot Nominal"
    },
    {
        "code": "73697-5",
        "display": "CCHD newborn screening protocol used [Type]"
    },
    {
        "code": "73700-7",
        "display": "CCHD newborn screening interpretation"
    },
    {
        "code": "53236-6",
        "display": "Carnitine.free (C0)+Acetylcarnitine (C2)+Propionylcarnitine (C3)+Palmitoylcarnitine (C16)+Oleoylcarnitine (C18:1)+Stearoylcarnitine (C18)/Citrulline [Molar ratio] in Dried blood spot"
    },
    {
        "code": "38481-8",
        "display": "Carnitine free (C0) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "75217-0",
        "display": "Biotinidase [Enzymatic activity/volume] in Dried blood spot"
    },
    {
        "code": "53200-2",
        "display": "Argininosuccinate/Arginine [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53062-6",
        "display": "Argininosuccinate [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53398-4",
        "display": "Arginine/Phenylalanine [Molar ratio] in Dried blood spot"
    },
    {
        "code": "47562-4",
        "display": "Arginine [Moles/volume] in Dried blood spot"
    },
    {
        "code": "75884-7",
        "display": "aPTT.lupus sensitive/?aPTT.lupus sensitive W excess phospholipid (screen to confirm ratio)"
    },
    {
        "code": "75509-0",
        "display": "aPTT.lupus sensitive with 1:1 PNP actual/?Normal (normalized LA mix)"
    },
    {
        "code": "75510-8",
        "display": "aPTT.lupus sensitive with 1:1 PNP (LA mix)"
    },
    {
        "code": "75507-4",
        "display": "aPTT.lupus sensitive W excess phospholipid percent correction"
    },
    {
        "code": "75508-2",
        "display": "aPTT.lupus sensitive W excess phospholipid actual/?Normal (normalized LA confirm)"
    },
    {
        "code": "75506-6",
        "display": "aPTT.lupus sensitive W excess phospholipid (LA confirm)"
    },
    {
        "code": "48022-8",
        "display": "aPTT.lupus sensitive actual/?normal (normalized LA screen)"
    },
    {
        "code": "34571-0",
        "display": "aPTT.lupus sensitive (LA screen)"
    },
    {
        "code": "53343-0",
        "display": "Androstenedione [Mass/volume] in Dried blood spot"
    },
    {
        "code": "53393-5",
        "display": "Alloisoleucine+Isoleucine+Leucine+Hydroxyproline+Valine/Phenylalanine+Tyrosine [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53153-3",
        "display": "Alloisoleucine+Isoleucine+Leucine+Hydroxyproline/Phenylalanine [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53154-1",
        "display": "Alloisoleucine+Isoleucine+Leucine+Hydroxyproline/Alanine [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53152-5",
        "display": "Alloisoleucine+Isoleucine+Leucine+Hydroxyproline [Moles/volume] in Dried blood spot"
    },
    {
        "code": "50157-7",
        "display": "Acetylcarnitine (C2) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53197-0",
        "display": "3-Hydroxytetradecenoylcarnitine (C14:1-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "50281-5",
        "display": "3-Hydroxytetradecanoylcarnitine (C14-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53196-2",
        "display": "3-Hydroxytetradecadienoylcarnitine (C14:2-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "50132-0",
        "display": "3-Hydroxystearoylcarnitine (C18-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53201-0",
        "display": "3-Hydroxypalmitoylcarnitine (C16-OH)/Palmitoylcarnitine (C16) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "50125-4",
        "display": "3-Hydroxypalmitoylcarnitine (C16-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "50121-3",
        "display": "3-Hydroxypalmitoleylcarnitine (C16:1-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "50113-0",
        "display": "3-Hydroxyoleoylcarnitine (C18:1-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "50109-8",
        "display": "3-Hydroxylinoleoylcarnitine (C18:2-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53172-3",
        "display": "3-Hydroxyisovalerylcarnitine (C5-OH)/Octanoylcarnitine (C8) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "53171-5",
        "display": "3-Hydroxyisovalerylcarnitine (C5-OH)/Carnitine.free (C0) [Molar ratio] in Dried blood spot"
    },
    {
        "code": "50106-4",
        "display": "3-Hydroxyisovalerylcarnitine (C5-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53188-9",
        "display": "3-Hydroxydodecenoylcarnitine (C12:1-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53189-7",
        "display": "3-Hydroxydodecanoylcarnitine (C12-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53182-2",
        "display": "3-Hydroxydecenoylcarnitine (C10:1-OH) [Moles/volume] in Dried blood spot"
    },
    {
        "code": "53341-4",
        "display": "21-Deoxycortisol [Mass/volume] in Dried blood spot"
    },
    {
        "code": "53336-4",
        "display": "17-Hydroxyprogesterone+Androstenedione/Cortisol [Mass Ratio] in Dried blood spot"
    },
    {
        "code": "38473-5",
        "display": "17-Hydroxyprogesterone [Mass/volume] in Dried blood spot"
    },
    {
        "code": "53338-0",
        "display": "11-Deoxycortisol [Mass/volume] in Dried blood spot"
    },
    {
        "code": "53347-1",
        "display": "11-Deoxycorticosterone [Mass/volume] in Dried blood spot"
    }
];

var APP_CONSTANTS = {
    SERVER: SERVER,
    DATABASE: DATABASE,
    SCREEN_TO_SHOW : SCREEN_TO_SHOW,
    STATUS_MSG: STATUS_MSG,
    notificationMessages: notificationMessages,
    NOTIFICATION_TITLE: NOTIFICATION_TITLE,
    NOTIFICATION_TYPE: NOTIFICATION_TYPE,
    NOTIFICATION_MESSAGE: NOTIFICATION_MESSAGE,
    languageSpecificMessages: languageSpecificMessages,
    swaggerDefaultResponseMessages: swaggerDefaultResponseMessages,
    STATUSCODE: STATUSCODE,
    LABS_TESTS: LABS_TESTS
};

module.exports = APP_CONSTANTS;
