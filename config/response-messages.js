
module.exports = {
    PAYMENT_MESSAGES : {
        ADD_WALLET: {
            statusCode:200,
            message : {
                en : 'Money added to Wallet',
                ar : ' المبلغ المضاف الى المحفظة '
            },
            type : 'ADD_WALLET'
        },
        APPOINTMENT: {
            statusCode:200,
            message : {
                en : ' consultation',
                ar : ' استشارة '
            },
            type : 'APPOINTMENT'
        },
        COURSE: {
            statusCode:200,
            message : {
                en : ' Course Purchased',
                ar : ' تم شراء المادة التدريبية '
            },
            type : 'COURSE'
        },
        /*PROFESSIONAL_NOT_AVAILABLE : {
            statusCode: 400,
            message: {
                en : 'Doctor is not available on this date',
                ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
            },
            type: 'PROFESSIONAL_NOT_AVAILABLE'
        },
        FACILITY_REQUIRED : {
            statusCode: 400,
            message: {
                en : 'Facility parameter is required here.'
            },
            type: 'FACILITY_REQUIRED'
        },
        BUSINESS_PHONE : {
            statusCode: 400,
            message: {
                en : 'Business with this phone number already exists.'
            },
            type: 'BUSINESS_DUPLICATE_NAME'
        },
        SUBSCRIPTION_EXPIRED: {
            statusCode: 400,
            message: {
                en : 'Your subscription has been expired, Please renew your subscription.'
            },
            type: 'SUBSCRIPTION_EXPIRED'
        },
        BUY_SUBSCRIPTION: {
            statusCode: 400,
            message: {
                en : 'You have to buy a subscription to add a sub branch.'
            },
            type: 'BUY_SUBSCRIPTION'
        },
        LIMIT_EXCEEDING: {
            statusCode: 400,
            message: {
                en : 'You have reached limit to add branches.'
            },
            type: 'LIMIT_EXCEEDING'
        },*/
    },
  STATUS_MSG: {
    SUCCESS: {
       DEFAULT: {
            statusCode: 200,
            message: {
                en : 'Success',
                ar : ' تم بنجاح '
            },
            type: 'DEFAULT'
        },
      SUCCESS: {
        statusCode: 200,
        message: {
                    en : 'Success.',
                    ar : ' تم بنجاح '
                },
        type: 'SUCCESS'
      },
      CREATED: {
                statusCode: 200,
                message: {
                    en : 'Successfully created.',
                    ar : ' تم الإنشاء بنجاح '
                },
        type: 'CREATED'
      },
      DELETED: {
                statusCode: 200,
                message: {
                    en : 'Successfully deleted.',
                    ar : ' تم الحذف بنجاح '
                },
        type: 'DELETED'
      },
      OTP_VERIFIED: {
                statusCode: 200,
                message: {
                    en : 'OTP verified successfully',
                    ar : ' تم التحقق بنجاح '
                },
            type : 'OTP_VERIFIED'
      },
      OTP_RESENT: {
                statusCode: 200,
                message: {
                    en : 'An OTP resent to your registered contact number',
                    ar : ' تمت إعادة ارسال رمز التحقق الى رقم الاتصال المسجل الخاص بك '
                },
            type : 'OTP_RESENT'
      },
      CHANGE_PASSWORD_SUCCESS: {
                statusCode: 200,
                message: {
                    en : 'Password reset successfully',
                    ar : ' تمت إعادة تعيين كلمة المرور بنجاح '
                },
            type : 'CHANGE_PASSWORD_SUCCESS'
      },
      LOGIN_SUCCESS: {
                statusCode: 200,
                message: {
                    en : 'Logged in successfully',
                    ar : ' تم تسجيل الدخول بنجاح '
                },
            type : 'LOGIN_SUCCESS'
      },
      VALID_FACILITY_CODE: {
                statusCode: 200,
                message: {
                    en : 'Facility Code verified successfully',
                    ar : ' تم التحقق من الرمز الخاص بالمنشأة '
                },
            type : 'VALID_FACILITY_CODE'
      },
      NEED_MERGE: {
                statusCode: 200,
                message: {
                    en : 'need_merge'
                },
            type : 'NEED_MERGE'
      },
      NEED_FACEBOOK_MERGE: {
                statusCode: 200,
                message: {
                    en : 'Need facebook merge',
                    ar : ' بحاجة الى دمج '
                },
            type : 'NEED_MERGE'
      },


      NO_NEARBY_PHARMACY: {
            statusCode:200,
            message: {
                en : 'No pharmacy is nearby you',
                ar : 'لا توجد صيدلية بالقرب منك'
            },
            type : 'NO_NEARBY_PHARMACY'
      },


      REGISTRATION_OTP: {
            statusCode:200,
            message: {
                en : ' is your ROOH verification code',
                ar : ' رمز التحقق الخاص بك بتطبيق رَوْح '
            },
            type : 'REGISTRATION_OTP'
      },


      LOGIN_OTP: {
            statusCode:200,
            message: {
                en : ' is your ROOH verification code',
                ar : ' رمز التحقق الخاص بك بتطبيق رَوْح '
            },
            type : 'LOGIN_OTP'
      },


      PASSWORD_RESET_OTP: {
            statusCode:200,
            message: {
                en : ' is your ROOH verification code',
                ar : ' رمز التحقق الخاص بك بتطبيق رَوْح '
            },
            type : 'PASSWORD_RESET_OTP'
      },


      ONLINE_PUSH_MESSAGE: {
            statusCode:200,
            message: {
                en : 'You have have online appointment at ',
                ar : ' لديك موعد عن بعد عند '
            },
            type : 'ONLINE_PUSH_MESSAGE'
      },

      HOME_PUSH_MESSAGE: {
            statusCode:200,
            message: {
                en : 'You have have home appointment at ',
                ar : ' لديك موعد منزلي عند '
            },
            type : 'HOME_PUSH_MESSAGE'
      },

      NO_SLOTS_AVAILABLE: {
            statusCode:200,
            message: {
                en : 'No Slots available',
                ar : ' ليس هناك مواعيد متاحة '
            },
            type : 'NO_SLOTS_AVAILABLE'
      },
      NO_FACILITY_AVAILABLE: {
            statusCode:200,
            message: {
                en : 'No Facility available',
                ar : ' ليس هناك منشأة متاحة'
            },
            type : 'NO_FACILITY_AVAILABLE'
      },
    },

    ERROR: {

       DEFAULT: {
            statusCode: 400,
            message: {
                en : 'Error',
                ar : ' حدث خطأ '
            },
            type: 'DEFAULT'
        },

        NOTHING_FOUND: {
            statusCode:400,
            message: {
                en : 'Nothing Found',
                ar : ' لم يتم العثور على أي شيء '
            },
            type : 'NOTHING_FOUND'
        },


        RESCUER_NOT_FOUND: {
            statusCode:400,
            message: {
                en : 'No rescuer found',
                ar : 'لم يتم العثور على منقذ'
            },
            type : 'RESCUER_NOT_FOUND'
        },

        INVALID_FACILITY_CODE: {
            statusCode:400,
            message: {
                en : 'Please enter valid joining code',
                ar : ' ادخل رمز انضمام صحيح'
            },
            type : 'INVALID_FACILITY_CODE'
        },

        PENDING_TASKS: {
            statusCode:400,
            message: {
                en : 'You cannot edit contract, you have pending tasks',
                ar : 'لا يمكنك تعديل العقد ، لديك مهام معلقة'
            },
            type : 'PENDING_TASKS'
        },
        EDIT_DATE_PASSED: {
            statusCode:400,
            message: {
                en : 'You can edit this contract, contract end date have already passed',
                ar : 'يمكنك تعديل هذا العقد ، لقد انقضى تاريخ انتهاء العقد بالفعل'
            },
            type : 'EDIT_DATE_PASSED'
        },

        CANNOT_DELETE_FOLDER: {
            statusCode:400,
            message: {
                en : 'You are not allowed to delete this folder',
                ar : ' غير مسموح لك بحذف هذا المجلد '
            },
            type : 'CANNOT_DELETE_FOLDER'
        },


    TOKEN_EXPIRED: {
        statusCode:401,
        message: {
            en : 'Token Expired',
                ar : ' انتهت صلاحية الرمز '
        },
        type : 'TOKEN_EXPIRED'
    },
    ERROR_TOKEN_AUTH: {
        statusCode:401,
        message: {
            en : 'Sorry, your account has been logged into other device! Please login again to continue.',
            ar : ' عفوا، تم الدخول لحسابك من جهاز آخر! فضلا اعد تسجيل الدخول للاستمرار '
        },
        type : 'TOKEN_EXPIRED'
    },
    EMPTY_TOKEN: {
        statusCode:401,
        message: {
            en : 'No token provided',
                ar : ' لم يتم تقديم رمز '
        },
        type : 'TOKEN_EXPIRED'
    },
    NO_USER_EXISTS: {
        statusCode:400,
        message: {
            en : 'No such user exists',
                ar : ' لا يوجد مستخدم كهذا '
        },
        type : 'NO_USER_EXISTS'
    },
    NO_FB_USER_EXISTS: {
        statusCode:400,
        message: {
            en : 'No user exists with this Facebook id',
                ar : ' لا يوجد مستخدم لمعرف فيسبوك هذا  '
        },
        type : 'NO_USER_EXISTS'
    },

    INVALID_USER_PASS: {
        statusCode:401,
        type: 'INVALID_USER_PASS',
        message: {
            en : 'Please enter valid contact number or password',
                ar : ' ادخل رقم الجوال او كلمة المرور الصحيحة فضلاً'
        },
    },
    PHONE_NO_NOT_VERIFIED: {
        statusCode:400,
        message: {
            en : 'Phone Number is not verified',
                ar : ' لم يتم التحقق من رقم الجوال'
        },
        type : 'PHONE_NO_NOT_VERIFIED'
    },
    INVALID_ROLE: {
        statusCode:400,
        message: {
            en : 'Wrong user role sent',
                ar : ' تم ارسال دور المستخدم الخاطئ '
        },
        type : 'INVALID_ROLE'
    },
    BLOCK_USER: {
        statusCode:400,
        message: {
            en : 'This user is blocked by admin.Please contact support',
                ar : ' تم حظر هذا المستخدم من قِبل المسؤول، فضلاً اتصل بالدعم'
        },
        type : 'BLOCK_USER'
    },
    WORKING_HOUR_ALREADY_EXISTS: {
        statusCode:400,
        message: {
            en : 'Facility already joined',
                ar : ' المنشأة تم انضمامها بالفعل '
        },
        type : 'WORKING_HOUR_ALREADY_EXISTS'
    },



      INVALID_TOKEN_TYPE: {
                statusCode: 400,
                message: {
                    en : 'Token type must be of Bearer type.',
                ar : ' حامل الرمز يجب أن يكون نوعه '
                },
        type: 'INVALID_TOKEN_TYPE'
      },
      INVALID_TOKEN: {
                statusCode: 401,
                message: {
                    en : 'Invalid token.',
                ar : ' رمز غير صالح '
                },
        type: 'UNAUTHORIZED'
      },
      UNAUTHORIZED: {
                statusCode: 401,
                message: {
                    en : 'Sorry, your account has been logged in other device! Please login again to continue.',
                ar : ' عذرا، تم تسجيل دخولك بجهاز آخر، الرجاء تسجيل الدخول مرة أخرى للاستمرار '
                },
        type: 'UNAUTHORIZED'
      },
        SUBSCRIPTION_EXPIRED: {
                statusCode: 400,
                message: {
                    en : 'Your subscription has been expired, Please renew your subscription.',
                ar : ' انتهت صلاحية اشتراكك، يرجى التجديد '
                },
        type: 'SUBSCRIPTION_EXPIRED'
      },
      ONELOGIN_TOKEN_NOT_COMES: {
                statusCode: 500,
                message: {
                    en : 'Sorry token is not given by one login.',
                ar : ' عذراً، لا يتم إعطاء رمز من تسجيل دخول لمرة واحدة '
                },
        type: 'ONELOGIN_TOKEN_NOT_COMES'
      },
      SOMETHING_WENT_WRONG_ONELOGIN: {
                statusCode: 500,
                message: {
                    en : 'Something went wrong on onelogin side.',
                ar : ' حدث خطأ ما في تسجيل الدخول '
                },
        type: 'SOMETHING_WENT_WRONG_ONELOGIN'
      },
      SOMETHING_WENT_WRONG: {
                statusCode: 500,
                message: {
                    en : 'Something went wrong on server.',
                ar : ' حدث خطأ ما في الخادم '
                },
                type: 'SOMETHING_WENT_WRONG'
            },
      DB_ERROR: {
                statusCode: 400,
                message: {
                    en : 'DB Error : ',
                ar : ' خطأ ديسيبل '
                },
                type: 'DB_ERROR'
            },
      DUPLICATE: {
                statusCode: 400,
                message: {
                    en : 'Duplicate Entry',
                ar : ' إدخال مكرر '
                },
                type: 'DUPLICATE'
            },
      INVALID_EMAIL: {
                statusCode: 400,
                message: {
                    en : 'Please enter valid credentials.',
                ar : ' الرجاء إدخال بيانات اعتماد صالحة '
                },
                type: 'INVALID_EMAIL'
            },
        FACEBOOK_REQUIRED: {
                statusCode: 400,
                message: {
                    en : 'facebookId is required for facebook signup/login.',
                ar : ' معرف الفيسبوك مطلوب للتسجيل/تسجيل الدخول في فيسبوك'
                },
                type: 'FACEBOOK_REQUIRED'
            },
        INVALID_PHONE: {
                statusCode: 400,
                message: {
                    en : 'Please enter valid credentials.',
                ar : ' الرجاء إدخال بيانات اعتماد صالحة '
                },
                type: 'INVALID_PHONE'
            },
        PHONE_VALIDATION: {
                statusCode: 400,
                message: {
                    en : 'Phone number should be in between 7-17 digits.',
                ar : ' يجب ان يكون رقم الجوال بين 7-17 رقم '
                },
                type: 'PHONE_VALIDATION'
            },
      INVALID_PASSWORD: {
                statusCode: 400,
                message: {
                    en : 'Please enter valid credentials.',
                ar : ' الرجاء إدخال بيانات اعتماد صالحة '
                },
                type: 'INVALID_PASSWORD'
            },
        OLD_PASSWORD: {
                statusCode: 400,
                message: {
                    en : 'Please enter valid current password.',
                ar : ' الرجاء ادخال كلمة المرور الحالية صحيحة '
                },
                type: 'OLD_PASSWORD'
            },
        SAME_PASSWORD: {
                statusCode: 400,
                message: {
                    en : 'Current password and new password can not be same.',
                ar : ' يجب أن تكون كلمة المرور الحالية وكلمة المرور الجديدة مختلفة '
                },
                type: 'SAME_PASSWORD'
            },
        INVALID_OTP: {
                statusCode: 400,
                message: {
                    en : 'Please enter valid OTP.',
                ar : ' ادخل رمز تحقق صالح '
                },
                type: 'INVALID_OTP'
            },
        ALREADY_VERIFIED: {
                statusCode: 400,
                message: {
                    en : 'Your account is already verified.',
                ar : 'تم التحقق من حسابك بالفعل '
                },
                type: 'ALREADY_VERIFIED'
            },
        ALREADY_VERIFIED_ADMIN: {
                statusCode: 400,
                message: {
                    en : 'This account is already verified.',
                ar : ' تم التحقق من هذا الحساب بالفعل'
                },
                type: 'ALREADY_VERIFIED_ADMIN'
            },
        ALREADY_REQUESTED: {
                statusCode: 400,
                message: {
                    en : 'You have already requested this friend.',
                ar : ' لقد أرسلت طلب لهذا الصديق بالفعل '
                },
                type: 'ALREADY_REQUESTED'
            },
        ALREADY_UNFRIEND: {
                statusCode: 400,
                message: {
                    en : 'You are not friends.',
                ar : ' انتم لستم اصدقاء '
                },
                type: 'ALREADY_UNFRIEND'
            },
        ALREADY_FOLLOWED: {
                statusCode: 400,
                message: {
                    en : 'You have already followed this business.',
                ar : ' يجب عليك بالفعل متابعة هذا العمل '
                },
                type: 'ALREADY_FOLLOWED'
            },
        ALREADY_UNFOLLOWED: {
                statusCode: 400,
                message: {
                    en : 'You have already unfollowed this business.',
                ar : ' يجب عليك بالفعل عدم متابعة هذا العمل '
                },
                type: 'ALREADY_UNFOLLOWED'
            },
        LINK_EXPIRED: {
                statusCode: 400,
                message: {
                    en : 'Link expired.',
                ar : ' انتهت صلاحية الرابط '
                },
                type: 'LINK_EXPIRED'
            },
        ALREADY_ACCEPTED: {
                statusCode: 400,
                message: {
                    en : 'Your friend have already accepted this request.',
                ar : ' لقد قبل صديقك هذا الطلب بالفعل'
                },
                type: 'ALREADY_ACCEPTED'
            },
        ALREADY_FRIEND: {
                statusCode: 400,
                message: {
                    en : 'You are already friends.',
                ar : ' انتم بالفعل اصدقاء '
                },
                type: 'ALREADY_FRIEND'
            },
        TIME_SLOT_NOT_FOUND: {
            statusCode: 400,
            message: {
                en : 'Time slots already booked by another user.',
                ar : ' تم حجز المواعيد من قِبل مستخدم آخر '
            },
            type: 'ALREADY_FRIEND'
        },
        TIME_SLOT_NOT_AVAILABLE: {
            statusCode: 400,
            message: {
                en : 'You can\'t choose a past time for your appointment.',
                ar : ' لا يمكنك اختيار وقت سابق لموعدك  '
            },
            type: 'TIME_SLOT_NOT_AVAILABLE'
        },

        ALREADY_ACCEPTED_RECEIVER: {
                statusCode: 400,
                message: {
                    en : 'You have already accepted this request.',
                ar : 'بالفعل لقد قبلت هذا الطلب'
                },
                type: 'ALREADY_ACCEPTED_RECEIVER'
            },
        ALREADY_REJECTED_RECEIVER: {
                statusCode: 400,
                message: {
                    en : 'You have already accepted this request.',
                ar : ' بالفعل لقد قبلت هذا الطلب'
                },
                type: 'ALREADY_REJECTED_RECEIVER'
            },
        SUBSCRIPTION_ALREADY_BLOCKED: {
                statusCode: 400,
                message: {
                    en : 'This subscription is already blocked.',
                ar : ' تم حظر هذا الاشتراك بالفعل '
                },
                type: 'SUBSCRIPTION_ALREADY_BLOCKED'
            },
        USER_ALREADY_BLOCKED: {
                statusCode: 400,
                message: {
                    en : 'This user is already blocked.',
                ar : ' تم حظر هذا المستخدم بالفعل '
                },
                type: 'USER_ALREADY_BLOCKED'
            },
        SUBSCRIPTION_ALREADY_UNBLOCKED: {
                statusCode: 400,
                message: {
                    en : 'This subscription is already unblocked.',
                ar : 'تم إلغاء حظر هذا الاشتراك بالفعل'
                },
                type: 'SUBSCRIPTION_ALREADY_UNBLOCKED'
            },
        USER_ALREADY_UNBLOCKED: {
                statusCode: 400,
                message: {
                    en : 'This user is already unblocked.',
                ar : ' تم إلغاء حظر هذا المستخدم بالفعل '
                },
                type: 'USER_ALREADY_UNBLOCKED'
            },
        BUSINESS_ALREADY_BLOCKED: {
                statusCode: 400,
                message: {
                    en : 'This business is already blocked.',
                ar : ' تم حظر هذا العمل بالفعل '
                },
                type: 'BUSINESS_ALREADY_BLOCKED'
            },
        BUSINESS_ALREADY_UNBLOCKED: {
                statusCode: 400,
                message: {
                    en : 'This business is already unblocked.',
                ar : ' تم الغاء حظر هذا العمل بالفعل '
                },
                type: 'BUSINESS_ALREADY_UNBLOCKED'
            },
        FILTER_ALREADY_UNBLOCKED: {
                statusCode: 400,
                message: {
                    en : 'This filter is already unblocked.',
                ar : ' تم الغاء حظر هذا الحاجز بالفعل '
                },
                type: 'FILTER_ALREADY_UNBLOCKED'
            },
        FILTER_ALREADY_BLOCKED: {
                statusCode: 400,
                message: {
                    en : 'This filter is already unblocked.',
                ar : ' تم الغاء حظر هذا الحاجز بالفعل '
                },
                type: 'FILTER_ALREADY_BLOCKED'
            },
        OBJECT_ALREADY_UNBLOCKED: {
                statusCode: 400,
                message: {
                    en : 'This object is already unblocked.',
                ar : ' تم الغاء حظر هذا الامر بالفعل '
                },
                type: 'OBJECT_ALREADY_UNBLOCKED'
            },
        OBJECT_ALREADY_BLOCKED: {
                statusCode: 400,
                message: {
                    en : 'This object is already unblocked.',
                ar : ' تم الغاء حظر هذا الامر بالفعل '
                },
                type: 'OBJECT_ALREADY_BLOCKED'
            },
        PACKAGE_ALREADY_UNBLOCKED: {
                statusCode: 400,
                message: {
                    en : 'This package is already unblocked.',
                ar : ' تم الغاء حظر هذه الحزمة بالفعل '
                },
                type: 'OBJECT_ALREADY_UNBLOCKED'
            },
        PAYMENT_ERROR: {
            statusCode: 400,
            message: {
                en : 'Something wrong in the payment gateway',
                ar: 'حدث خطأ ما في بوابة الدفع'
            },
            type: 'PAYMENT_ERROR'
        },
        NOT_ENOUGH_WALLET_AMOUNT: {
            statusCode: 400,
            message: {
                en : 'You donot have enough balance in wallet',
                ar: 'ليس لديك رصيد كافِ في المحفظة'
            },
            type: 'NOT_ENOUGH_WALLET_AMOUNT'
        },
        NO_WORKING_HOURS_ADDED: {
            statusCode: 400,
            message: {
                en : 'Something wrong in the payment gateway.',
                ar : ' حدث خطأ ما في بوابة الدفع '
            },
            type: 'NO_WORKING_HOURS_ADDED'
        },
        PACKAGE_ALREADY_BLOCKED: {
                statusCode: 400,
                message: {
                    en : 'This package is already unblocked.',
                    ar : ' تم الغاء حظر هذه الحزمة بالفعل '
                },
                type: 'OBJECT_ALREADY_BLOCKED'
            },
      INVALID_ID: {
                statusCode: 400,
                message: {
                    en : 'Invalid id provided.',
                ar : ' المعرف المقدم غير صالح '
                },
                type: 'INVALID_ID'
            },
        INVALID_TEMPLATE_ID: {
            statusCode: 400,
            message: {
                en : 'This template id is not valid.',
                ar : ' نموذج المعرف هذا غير صالح '
            },
            type: 'INVALID_TEMPLATE_ID'
        },
        ALREADY_CONTRACT_PERIOD: {
            statusCode: 400,
            message: {
                en : 'You have already contract with CSF Team.',
                ar : ' لديك عقد بالفعل مع فريق استشاريون بلا حدود '
            },
            type: 'ALREADY_CONTRACT_PERIOD'
        },
        REPORT_ALREADY_GENERATED: {
            statusCode: 400,
            message: {
                en : 'Report already generated for this appointment.',
                ar : ' تم انشاء التقرير بالفعل لهذا الموعد '
            },
            type: 'REPORT_ALREADY_GENERATED'
        },
        ALREADY_GENERATE_REPORT: {
            statusCode: 400,
            message: {
                en : 'Report has been already generated for this appointment.',
                ar : ' تم انشاء التقرير بالفعل لهذا الموعد '
            },
            type: 'ALREADY_GENERATE_REPORT'
        },
        ALREADY_CANCELED_APPOINTMENT: {
            statusCode: 400,
            message: {
                en : 'You can not create report fro this appointment because of this appoinment is already cancelled.',
                ar : ' لا يمكنك انشاء تقرير لهذا الموعد لان هذا الموعد تم الغاءه بالفعل '
            },
            type: 'ALREADY_CANCELED_APPOINTMENT'
        },
      APP_ERROR: {
                statusCode: 400,
                message: {
                    en : 'Application Error.',
                ar : ' حدث خطأ في التطبيق '
                },
                type: 'APP_ERROR'
            },
      EMAIL_ALREADY_EXIST: {
            statusCode: 400,
            message: {
                en : 'Email address you have entered is already registered with us.',
                ar : ' عنوان البريد الالكتروني الذي ادخلته تم تسجيله لدينا بالفعل'
            },
            type: 'ALREADY_EXIST'
        },
      PHONE_ALREADY_EXIST: {
            statusCode: 400,
            message: {
                en : 'Contact Number already registered with us',
                ar : ' رقم الاتصال تم تسجيله من قبل '
            },
            type: 'PHONE_ALREADY_EXIST'
        },
        BLOCKED: {
            statusCode: 401,
            message: {
                en : 'This account has been blocked by admin.'
            },
            type: 'BLOCKED'
        },
        VERIFY_ACCOUNT: {
            statusCode: 400,
            message: {
                en : 'Please verify your account to login.'
            },
            type: 'VERIFY_ACCOUNT'
        },
        ACCOUNT_DELETED: {
            statusCode: 400,
            message: {
                en : 'This account has been deleted.'
            },
            type: 'ACCOUNT_DELETED'
        },
        ADMIN_VERIFIED: {
            statusCode: 400,
            message: {
                en : 'Admin has not verified your account yet, Please try again after some time.'
            },
            type: 'VERIFY_ACCOUNT'
        },
        VERIFY_ACCOUNT_FORGOT: {
            statusCode: 400,
            message: {
                en : 'Please verify your account first.'
            },
            type: 'VERIFY_ACCOUNT'
        },
      COUNTRY_CODE: {
            statusCode: 400,
            message: {
                en : 'Country code is required.'
            },
            type: 'COUNTRY_CODE'
        },
      NOT_REGISTERED: {
            statusCode: 400,
            message: {
                en : 'Currently, you are not registered with us.'
            },
            type: 'NOT_REGISTERED'
        },
      SUBSCRIPTION : {
        SUBSCRIPTION_DUPLICATE : {
            statusCode: 400,
            message: {
                en : 'Subscription with this name already exists.'
            },
            type: 'SUBSCRIPTION_DUPLICATE'
        },
        SUBSCRIPTION_DUPLICATE_DEFAULT : {
            statusCode: 400,
            message: {
                en : 'Default subscription already exists.'
            },
            type: 'SUBSCRIPTION_DUPLICATE_DEFAULT'
        },
      },
        INCORRECT_OLD_PASSWORD: {
            message : {
                en : 'Your old password is incorrect.',
                ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
            },
            statusCode: 400,
            type: 'INCORRECT_OLD_PASSWORD'
        },


        INCORRECT_OLD_NEW_PASSWORD: {
            message : {
                en :  'Old and New password both are same.Please change new password.',
                ar : 'لا تملك الصلاحية لتنفيذ هذا الإجراء'
            },
            statusCode: 400,
            type: 'INCORRECT_OLD_NEW_PASSWORD'
        },
        
    PROFESSIONAL_FACILITY : {
            PROFESSIONAL_NOT_AVAILABLE : {
                statusCode: 400,
                message: {
                    en : 'Doctor is not available on this date'
                },
                type: 'PROFESSIONAL_NOT_AVAILABLE'
            },
            FACILITY_REQUIRED : {
                statusCode: 400,
                message: {
                    en : 'Facility parameter is required here.'
                },
                type: 'FACILITY_REQUIRED'
            },
            BUSINESS_PHONE : {
                statusCode: 400,
                message: {
                    en : 'Business with this phone number already exists.'
                },
                type: 'BUSINESS_DUPLICATE_NAME'
            },
            SUBSCRIPTION_EXPIRED: {
                statusCode: 400,
                message: {
                    en : 'Your subscription has been expired, Please renew your subscription.'
                },
                type: 'SUBSCRIPTION_EXPIRED'
            },
            BUY_SUBSCRIPTION: {
                statusCode: 400,
                message: {
                    en : 'You have to buy a subscription to add a sub branch.'
                },
                type: 'BUY_SUBSCRIPTION'
            },
        LIMIT_EXCEEDING: {
            statusCode: 400,
            message: {
                en : 'You have reached limit to add branches.'
            },
            type: 'LIMIT_EXCEEDING'
        },
      },
    FILTER : {
        FILTER_DUPLICATE_NAME : {
            statusCode: 400,
            message: {
                en : 'Filter with this name already exists.'
            },
            type: 'FILTER_DUPLICATE_NAME'
        }
      },
    LENSE : {
        LENSE_DUPLICATE_NAME : {
            statusCode: 400,
            message: {
                en : 'Lense with this name already exists.'
            },
            type: 'LENSE_DUPLICATE_NAME'
        }
      },
    OBJECT : {
        OBJECT_DUPLICATE_NAME : {
            statusCode: 400,
            message: {
                en : 'Object with this name already exists.'
            },
            type: 'OBJECT_DUPLICATE_NAME'
        },
        SUBSCRIPTION_EXPIRED: {
            statusCode: 400,
            message: {
                en : 'Your subscription has been expired, Please renew your subscription.'
            },
            type: 'SUBSCRIPTION_EXPIRED'
        },
        LIMIT_EXCEEDING: {
            statusCode: 400,
            message: {
                en : 'You have reached limit to add objects.'
            },
            type: 'LIMIT_EXCEEDING'
        },

      },
    PACKAGE : {
        PACKAGE_DUPLICATE_NAME : {
            statusCode: 400,
            message: {
                en : 'Package with this name already exists.'
            },
            type: 'OBJECT_DUPLICATE_NAME'
        },
        SUBSCRIPTION_EXPIRED: {
            statusCode: 400,
            message: {
                en : 'Your subscription has been expired, Please renew your subscription.'
            },
            type: 'SUBSCRIPTION_EXPIRED'
        },
      }
    },

    APPOINTMENT_TYPE: {
        HOME: {
            en: 'HOME',
            ar: 'الصفحة الرئيسية'
        },
        ONLINE: {
            en: 'ONLINE',
            ar: 'عبر الانترنت'
        },
        ONSITE: {
            en: 'ONSITE',
            ar: 'بالموقع'
        }
    }
  }
};
