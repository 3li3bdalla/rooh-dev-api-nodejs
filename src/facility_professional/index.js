/**
 * Makes all features of admin available to outer modules.
 */

module.exports = {
    routes : [
        require('./appointment').Routes,
    ],
    swagger: [
        require('./appointment').swagger
    ]
};