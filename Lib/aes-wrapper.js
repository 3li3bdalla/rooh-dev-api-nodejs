const crypto = require('crypto');

const aesWrapper = {};

// get list of supportable encryption algorithms
aesWrapper.getAlgorithmList = () => {
    console.log(crypto.getCiphers());
};

aesWrapper.generateKey = () => {
    return crypto.randomBytes(32);
};

aesWrapper.generateIv = () => {
    return crypto.randomBytes(16);
};

// separate initialization vector from message
aesWrapper.separateVectorFromData = (data) =>  {
    console.log(data);
    console.log('data');
    var iv = data.slice(-24);
    var message = data.substring(0, data.length - 24)

    return{
        iv: iv,
        message: message
    };
}

aesWrapper.encrypt = async (key, iv, text) => {
    let encrypted = '';
    let cipher = await crypto.createCipheriv('aes-256-cbc', key, iv);
    encrypted += cipher.update(Buffer.from(text), 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
};

//function webEncrypt(password, text) {
/*aesWrapper.webEncrypt = async (password, text) => {
    if (process.versions.openssl <= '1.0.1f') {
        throw new Error('OpenSSL Version too old, vulnerability to Heartbleed')
    }
    let iv = await aesWrapper.generateIv();
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(password, 'base64'), iv);
    let encrypted = cipher.update(Buffer.from(text), 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    encrypted += iv.toString('hex');
    return encrypted
    //return encrypted.toString('hex') + ':' + iv.toString('hex');
}*/

aesWrapper.decrypt = async (key, text) => {
    let dec = '';
    let data = await aesWrapper.separateVectorFromData(text);
    let cipher = crypto.createDecipheriv('aes-256-cbc', key,  Buffer.from(data.iv, 'base64'));
    dec += cipher.update(Buffer.from(data.message, 'base64'), 'base64', 'utf8');
    dec += cipher.final('utf8');

    return dec;
};

/*aesWrapper.webDecrypt = async(key, text) => {
    let dec = '';
    let data = await aesWrapper.separateVectorFromData(text);
    let cipher = crypto.createDecipheriv('aes-256-cbc', key,  Buffer.from(data.iv, 'base64'));
    //dec += cipher.update(Buffer.from(data.message, 'base64'), 'base64', 'utf8');
    cipher.setAutoPadding(false);
    dec += cipher.update(data.message, 'hex', 'utf8');
    dec += cipher.final('utf8');

    return dec
}*/

// add initialization vector to message
aesWrapper.addIvToBody = (iv, encryptedBase64) => {
    encryptedBase64 += iv.toString('base64');
    console.log(iv.toString('base64'));

    return encryptedBase64;
};

aesWrapper.encryptData = async (aesKey, message) => {
    let aesIv = await aesWrapper.generateIv();
    let encryptedMessage = await aesWrapper.encrypt(aesKey, aesIv, message);
    encryptedMessage = await aesWrapper.addIvToBody(aesIv, encryptedMessage);

    return encryptedMessage;
};


//FOR WEB
    aesWrapper.webEncrypt = async (key, text) => {
        let iv = await aesWrapper.generateIv();
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'base64'), iv);
        let encrypted = cipher.update(Buffer.from(text), 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString('hex') + ':' + iv.toString('hex');
    };

    aesWrapper.webDecrypt = async (key, text) => {
        var Serialize = require('php-serialize');
        let data = await aesWrapper.separateVectorFromData(text);
        var decipher=crypto.createDecipheriv('aes-256-cbc',key,Buffer.from(data.iv, 'base64'));
        decipher.setAutoPadding(false);
        var dec = decipher.update(data.message,'hex','utf8');
        dec += decipher.final('utf8');
        dec = dec.toString('utf-8');
        //return PHPUnserialize.unserialize(dec);
        return Serialize.unserialize(dec,{},{ encoding: 'utf8'})
    };
//FOR WEB


module.exports = aesWrapper;