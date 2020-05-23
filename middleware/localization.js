const is = require('is_js');
module.exports = (req, res, next) => {
    let language = "en";
    if (!is.undefined(req.headers['language']) && req.headers['language'] != "") {
        language = req.headers['language'];
    }
    req.headers.language = language;

    next();
};