const path = require('path');
const rsaWrapper = {};
const fs = require('fs');
const crypto = require('crypto');

// load keys from file
rsaWrapper.initLoadKeys = (basePath) => {
    rsaWrapper.serverPrivate = fs.readFileSync(path.resolve(basePath, 'keys', 'server.private.pem'));
    rsaWrapper.clientPub = fs.readFileSync(path.resolve(basePath, 'keys', 'client.public.pem'));
};

rsaWrapper.initDBLoadKeys = (basePath) => {
    rsaWrapper.serverDBPrivate = fs.readFileSync(path.resolve(basePath, 'dbKeys', 'server.private.pem'));
    rsaWrapper.serverDBPub = fs.readFileSync(path.resolve(basePath, 'dbKeys', 'server.public.pem'));
};

rsaWrapper.encrypt = (publicKey, message) => {
    let enc = crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(message));

    return enc.toString('base64');
};

rsaWrapper.decrypt = (privateKey, message) => {
    let enc = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(message, 'base64'));

    return enc.toString();
};

module.exports = rsaWrapper;