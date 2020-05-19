/**
 * Makes all features of admin available to outer modules.
 */

//console.log("appointment routes", require('./appointment').Routes);
module.exports = {
    routes : [
        require('./course').Routes,
    ],
    swagger: [
        require('./course').swagger
    ]
};