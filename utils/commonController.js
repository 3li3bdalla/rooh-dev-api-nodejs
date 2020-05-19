const Models        =     require('../models/index'),
    fs              =     require('fs-extra'),
    util            =     require('util'),
    fileExtension   =     require('file-extension'),
    sharp           =     require('sharp'),
    AWS = require('aws-sdk'),
    path = require('path'),
    AppConstraints = require('../config/appConstants')
    sizeOf = require('image-size');
const Thumbler = require('thumbler');
const CryptoJS = require("crypto-js");

exports.uploadFile = async (req, res)=> {

    console.log("************* uploadFile ******************");
    console.log(req.body);

    let payload = req.body;
    try{
        if(req.files.image && req.files.image.name) {
            let url = await fileUpload(req.files.image, "FILE" , payload.type);
            url.type = payload.type;
            return res.status(200).json({
                status: 1,
                message: 'Successufully',
                data: url
            });
        }
        else {
            return res.status(400).json({status: 0, message: "Something went wrong\""});
        }
    }
    catch (err){
        return res.status(400).json({status: 0, message: "Something went wrong"});
    }


};

async function fileUpload(file, folder, type) {
    try {
        var filename = file.name; // actual filename of file
        var filePath = file.path; //will be put into a temp directory
        var mimeType = file.type;

        let fileObject = {
            "original": '',
            "thumbnail": '',
            "fileName": filename
        }

        let extension = fileExtension(filename);

        extension = extension ? extension : 'jpg';

        let buffer = await readFile(filePath);
        // console.log(extension);
        console.log("buffer", buffer);
        let newName = (new Date()).getTime()  +  "-" + "file." + extension;

        let newPath = path.join(__dirname, '../', '/public/uploads/', newName);

        // if(type === 'img') {
        //     let generateThumbBuffer ;
        //     generateThumbBuffer = await sharp(buffer)
        //         .toFormat('jpeg', {quality: AppConstraints.SERVER.THUMBNAIL_IMAGE_QUALITY})
        //         .toBuffer();
        //
        //     if(extension == "png"){
        //         generateThumbBuffer = await sharp(buffer)
        //             .toFormat('png', {quality: AppConstraints.SERVER.THUMBNAIL_IMAGE_QUALITY})
        //             .toBuffer();
        //     }
        //     await writeFile(newPath, generateThumbBuffer);
        //
        //     if (nodeEnv) {
        //         await uploadOriginalImage (buffer, 'thumbnail', fileThumbnailPath, mimeType);
        //         fileObject.thumbnail = "thumbnail" + "/" + fileThumbnailPath;
        //         fs.unlink(thumbnailPath, (err) => {
        //
        //         });
        //     }
        // }
        // else {
        //      await writeFile(newPath, buffer);
        // }

        await writeFile(newPath, buffer);

        fileObject.original =  "/uploads/" + newName;

        if (nodeEnv) {
            await uploadOriginalImage (buffer, 'original', newName, mimeType);
            fileObject.original = "original/" + newName;
            fs.unlink(newPath, (err) => {

            });
        }

        let generateThumbBuffer = "";

        if(type === 'img') {
            generateThumbBuffer = await sharp(buffer)
                .resize(AppConstraints.SERVER.THUMBNAIL_IMAGE_SIZE)
                .toFormat('jpeg', {quality: AppConstraints.SERVER.THUMBNAIL_IMAGE_QUALITY})
                .toBuffer();

            if(extension == "png"){
                generateThumbBuffer = await sharp(buffer)
                    .resize(AppConstraints.SERVER.THUMBNAIL_IMAGE_SIZE)
                    .toFormat('png', {quality: AppConstraints.SERVER.THUMBNAIL_IMAGE_QUALITY})
                    .toBuffer();
            }
            let fileThumbnailPath = (new Date()).getTime() + "-" + "thumbnail"  + "-"  + "file." + extension;
            let thumbnailPath = path.join(__dirname, '../', '/public/uploads/', fileThumbnailPath);
            fileObject.thumbnail = "/uploads/" + fileThumbnailPath;
            await writeFile(thumbnailPath, generateThumbBuffer);

            if (nodeEnv) {
                await uploadOriginalImage (buffer, 'thumbnail', fileThumbnailPath, mimeType);
                fileObject.thumbnail = "thumbnail" + "/" + fileThumbnailPath;
                fs.unlink(thumbnailPath, (err) => {

                });
            }
        }
        else if (type=="video") {
            let fileThumbnailPath = (new Date()).getTime() + "-" + "thumbnail"  + "-"  + "file.jpg";
            let thumbnailPath = path.join(__dirname, '../', '/public/private_uploads/', fileThumbnailPath);
            await createVideoThumb(newPath,thumbnailPath, fileThumbnailPath);
            fileObject.thumbnail = '/private_uploads/' + fileThumbnailPath;
        }
        return fileObject;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}

function createVideoThumb(fileData, thumbnailPath){
    console.log("fileDatafileDatafileData",fileData)
    console.log("thumbnailPaththumbnailPaththumbnailPath",thumbnailPath)
    return new Promise(async (resolve, reject) => {
        Thumbler({
            type: 'video',
            input: fileData,
            output: thumbnailPath,
            time: '00:00:02',
            size: '300x200' // this optional if null will use the desimention of the video
        }, function(err, path){
            console.log("pathpathpathpathpathpathpathpathpathpathpathpath",err)
            if (err) reject(err);
            resolve(path);
        });
    });

}

const readFile = async (path) => {
    console.log("  ************ readFile *******************")
    return new Promise((resolve, reject) => {
        const readFile = util.promisify(fs.readFile);
        readFile(path).then((buffer) => {
            //   console.log(" buffer  ", buffer);
            resolve(buffer);
        }).catch((error) => {
            reject(error);
        });
    });
}

const writeFile = async (path, buffer) => {
    console.log("  ************ write file *******************")
    console.log("newPath", path)
    return new Promise((resolve, reject) => {
        const writeFile1 = util.promisify(fs.writeFile);
        writeFile1(path, buffer).then((buffer) => {
            console.log(" buffer  ", buffer);
            resolve(buffer);
        }).catch((error) => {
            reject(error);
        });
    });
}


exports.privateFileFolderUpload = async (file, folder, type)  => {
    try {
        var filename = file.name; // actual filename of file
        var filePath = file.path; //will be put into a temp directory
        var mimeType = file.type;

        let fileObject = {
            "original": '',
            "thumbnail": '',
            "fileName": filename
        }

        let extension = fileExtension(filename);

        extension = extension ? extension : 'jpg';

        let buffer = await readFile(filePath);
        //  console.log(extension);
        console.log("buffer", buffer);
        let newName = (new Date()).getTime()  +  "-" + "file." + extension;

        let newPath = path.join(__dirname, '../', '/public/private_uploads', newName);

        // if(type === 'img') {
        //     let sizeOfImage = sizeOf(buffer);
        //     console.log(sizeOfImage);
        //
        //     let generateThumbBuffer ;
        //     let width = sizeOfImage.width;
        //     let height = sizeOfImage.height;
        //     if (sizeOfImage.height > 1920) {
        //         height = 1920;
        //     }
        //     if (sizeOfImage.width > 1080) {
        //         width = 1080;
        //     }
        //
        //     console.log(height, width);
        //
        //     generateThumbBuffer = await sharp(buffer)
        //         .resize(height, width)
        //         .toFormat('jpeg', {quality: 50})
        //         .toBuffer();
        //
        //     if(extension == "png"){
        //         generateThumbBuffer = await sharp(buffer)
        //             .resize(height, width)
        //             .toFormat('png', {quality: 50})
        //             .toBuffer();
        //     }
        //     await writeFile(newPath, generateThumbBuffer);
        // }
        // else {
        //      await writeFile(newPath, buffer);
        // }

        await writeFile(newPath, buffer);

        fileObject.original =  "/private_uploads/" + newName;

        if (nodeEnv) {
            await uploadOriginalImage (buffer, 'original', newName, mimeType);
            fileObject.original = "original/" + newName;
            fs.unlink(newPath, (err) => {

            });
        }

        let generateThumbBuffer = "";

        if(type === 'img') {
            generateThumbBuffer = await sharp(buffer, { failOnError: false })
                .resize(AppConstraints.SERVER.THUMBNAIL_IMAGE_SIZE)
                .toFormat('jpeg', {quality: AppConstraints.SERVER.THUMBNAIL_IMAGE_QUALITY})
                .toBuffer();

            if(extension == "png"){
                generateThumbBuffer = await sharp(buffer,  { failOnError: false })
                    .resize(AppConstraints.SERVER.THUMBNAIL_IMAGE_SIZE)
                    .toFormat('png', {quality: AppConstraints.SERVER.THUMBNAIL_IMAGE_QUALITY})
                    .toBuffer();
            }
            let fileThumbnailPath = (new Date()).getTime() + "-" + "thumbnail"  + "-"  + "file." + extension;
            let thumbnailPath = path.join(__dirname, '../', '/public/private_uploads', fileThumbnailPath);
            fileObject.thumbnail = "/private_uploads/" + fileThumbnailPath;
            await writeFile(thumbnailPath, generateThumbBuffer);

        }
        else if (type=="video") {
            let fileThumbnailPath = (new Date()).getTime() + "-" + "thumbnail"  + "-"  + "file.jpg";
            let thumbnailPath = path.join(__dirname, '../', '/public/private_uploads/', fileThumbnailPath);
            await createVideoThumb(newPath,thumbnailPath, fileThumbnailPath);
            fileObject.thumbnail = '/private_uploads/' + fileThumbnailPath;
        }
        return fileObject;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}

exports.escapeRegExp = (str) => {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


exports.cryptoJSData = (text, type) => {
    var key = process.env.CRYPTO_KEY;
    if (type.toString() === 'encrypt') {
        let encrypted = CryptoJS.AES.encrypt(text, key).toString();
        return encrypted;
    }
    else if (type.toString() === 'decrypt') {
        var bytes  = CryptoJS.AES.decrypt(text, key);
        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
        return plaintext;
    }

}
