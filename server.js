require('./env-validation');
var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const server = require('http').Server(app);
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocumentUser = require('./config/swaggerUser.json');
var Constants = require('./config/appConstants');
var SocketManager = require('./Lib/SocketManager');
var Scheduler = require('./Lib/Scheduler');
const localization = require('./middleware/localization')
var redis = require("async-redis");
var redisClient = redis.createClient({
    port: 6379, // replace with your port
    host: 'localhost', // replace with your hostanme or IP address
    // password: 'password',
    // password: '$xpNYF+4j54uh&K8',
});
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
require('dotenv').config();
global.APP_PATH = path.resolve(__dirname);
global.ObjectId = mongoose.Types.ObjectId;
global.nodeEnv = process.env.FILE_UPLOAD_ON_SERVER;
var mongoURI = require('./config/dbConfig').mongo;
var api = require('./routes/api');
var auth_api = require('./routes/auth_api');
let commonController = require('./utils/commonController');


process.on('UnhandledPromiseRejectionWarning',function(){
    console.log('erer');
})
// require all routes and de structure the array
const [user_api, professional_facility_api, common_api, admin_api, team_api, course_api, pharmacy_api] = require('./src').routes;

//var admin_api              = require('./routes/admin_api');
//var port                  = Constants.SERVER.PORT || process.env.PORT;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.set('port', process.env.PORT);
app.set(Constants.SERVER.JWT_SECRET_KEY, Constants.SERVER.JWT_SECRET_VAL);

app.use(cors());
app.use(logger('dev'));
app.use(express.json({
    limit: '200mb'
})); // support parsing of application/json type post data
app.use(express.urlencoded({
    limit: '200mb',
    extended: true
})); //support parsing of application/x-www-form-urlencoded post data
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(__dirname + '/node_modules/')); //as requested by  Sandeep on 3rd Jan
// app.use('/uploads', express.static(__dirname + '/uploads'));

if (process.env.NODE_ENV === 'dev') swaggerDocumentUser.host = process.env.swagger_dev_host;
if (process.env.NODE_ENV === 'test') swaggerDocumentUser.host = process.env.swagger_test_host;

// requires all swagger paths
// console.log("userSwagger+_api", common_api);

// assign path in swagger file
//swaggerDocumentUser.paths = {...swaggerDocumentUser.paths, ...userSwagger, ...commonSwagger};
let [userSwagger, professional_facility_swagger, commonSwagger, adminSwagger, teamSwagger, courseSwagger, pharmacySwagger] = require('./src').swagger;

// assign path in swagger file
swaggerDocumentUser.paths = {
    ...swaggerDocumentUser.paths,
    ...userSwagger,
    ...professional_facility_swagger,
    ...commonSwagger,
    ...adminSwagger,
    ...teamSwagger,
    ...courseSwagger,
    ...pharmacySwagger
};

mongoose.Promise = global.Promise;
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
});
mongoose.connection.on('error', function (err) {
    // console.log(err);
    // console.log('error in connecting, process is exiting ...');
    process.exit();
});

// set global variable ObjectId
ObjectId = mongoose.Types.ObjectId;

mongoose.connection.once('open', function () {
    // console.log('Successfully connected to database');
});
//SWAGGER
app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocumentUser));
//SWAGGER

app.use('/common/uploadFile', multipartMiddleware);
app.post('/common/uploadFile', commonController.uploadFile);

app.get('/scheduler/renewAgreement', Scheduler.renewAgreement)
// console.log(process.env.NODE_APP_INSTANCE, "***once only process.pid ---- ", process.pid)
if (process.env.NODE_APP_INSTANCE == 0 || process.env.NODE_APP_INSTANCE === 0 || process.env.NODE_APP_INSTANCE == undefined) {
    console.log("once only process.pid ---- ", process.pid)
    Scheduler.scheduleAppointmentNotifications();
}

// helper midlleware
app.use(localization);

app.get('/version', (req, res, next) => {
    res.send({
        version: 1,
        "description": "ali version"
    }).end();
})

app.use('/api', api);
app.use('/user', user_api);
app.use('/admin', admin_api);
app.use('/team', team_api);
app.use('/course', course_api);
app.use('/pharmacy', pharmacy_api);
app.use('/common', common_api);
app.use('/auth-api', auth_api);
app.use('/professional', professional_facility_api);
//app.use('/admin-api', admin_api);
//app.use('/users', usersRouter);

app.get('/', function (req, res) {
    if (process.env.NODE_ENV === "test") res.redirect("https://test.rooh.live");
    else res.redirect("https://dev.rooh.live")
});


// app.use(function (req, res, next) {
//     next(createError(404));
// });

app.use(function (err, req, res, next) {
    // console.log("errr----");
    let status = 500,
        json = {
            status: 0,
            message: err.message.en || err.message
        };
    if (err.isBoom) {
        //json = err.output.payload;
        json = {
            status: 0,
            message: err.data[0].message
        }
        status = err.output.statusCode;
    }
    return res.status(status).json(json);
});

app.options('/*', cors()) // enable pre-flight request for DELETE request

// error handler
// app.use(function (err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
// });

/*console.log("process.pid ---- ",process.pid)
console.log("process.env.NODE_APP_INSTANCE ---- ",process.env.NODE_APP_INSTANCE)*/

SocketManager.connectSocket(server, redisClient);
server.listen(process.env.PORT, function () {
    //console.log('Node app is running on port', app.get('port'));
    console.log('Node app is running on port', process.env.PORT);
    if (process.env.NODE_APP_INSTANCE == 0 || process.env.NODE_APP_INSTANCE === 0 || process.env.NODE_APP_INSTANCE == undefined) {
        Scheduler.rescheduleTodayAppointmentPushNotificationsFromDb();
    }
});
//
// var paymentGateway = require('./src/paymentGateway');
//
// paymentGateway.createCheckoutId({});

//app.listen(port)
module.exports = app;