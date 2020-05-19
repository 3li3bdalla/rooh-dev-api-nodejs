/**
 * Makes all features of admin available to outer modules.
 */

//console.log("appointment routes", require('./appointment').Routes);
module.exports = {
    routes : [
        require('./team').Routes,
    ],
    swagger: [
        require('./team').swagger
    ]
};