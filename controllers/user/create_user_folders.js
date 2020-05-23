var Models = require("../../models");
var Constants = require("../../config/appConstants");


module.exports = async (type, data, allowed) => {
    let result = await Models.Folder.findOne({
        userId: ObjectId(userData._id),
    }); /*, function (err, result) {*/

    if (
        result == null ||
        (result != null &&
            data.dependentId != undefined &&
            data.dependentId != "" &&
            data.dependentId != result.dependentId) ||
        allowed == "1"
    ) {
        let criteria = [];
        let folderAddCheck = [];
        let dependentId = null;
        if (data == "") {
            folderAddCheck = [
                "documents",
                "photos",
                "videos",
                "audios",
                "links",
                "medications",
                "requests",
                "reports",
                "radiology",
                "labs",
            ];
        } else {
            if (data && data.folders != undefined) {
                let includeFolders = data.folders;
                includeFolders = includeFolders.toLowerCase();
                folderAddCheck = includeFolders.split(",");
                dependentId = data.dependentId;
            }
        }

        if (folderAddCheck.indexOf("documents") != -1) {
            criteria.push({
                folderName: Constants.DATABASE.FOLDERS.DOCUMENTS["en"],
                folderNameByLang: {
                    en: Constants.DATABASE.FOLDERS.DOCUMENTS["en"],
                    ar: Constants.DATABASE.FOLDERS.DOCUMENTS["ar"],
                },
                folderIcon: "https://test.rooh.live/files/icons/ic_documents.png",
                folderType: "2",
                userId: ObjectId(userData._id),
                dependentId: dependentId,
            });
        }
        if (folderAddCheck.indexOf("photos") != -1) {
            criteria.push({
                folderName: Constants.DATABASE.FOLDERS.PHOTOS["en"],
                folderNameByLang: {
                    en: Constants.DATABASE.FOLDERS.PHOTOS["en"],
                    ar: Constants.DATABASE.FOLDERS.PHOTOS["ar"],
                },
                folderIcon: "https://test.rooh.live/files/icons/ic_photos.png",
                folderType: "2",
                userId: ObjectId(userData._id),
                dependentId: dependentId,
            });
        }
        if (folderAddCheck.indexOf("videos") != -1) {
            criteria.push({
                folderName: Constants.DATABASE.FOLDERS.VIDEOS["en"],
                folderNameByLang: {
                    en: Constants.DATABASE.FOLDERS.VIDEOS["en"],
                    ar: Constants.DATABASE.FOLDERS.VIDEOS["ar"],
                },
                folderIcon: "https://test.rooh.live/files/icons/ic_videos.png",
                folderType: "2",
                userId: ObjectId(userData._id),
                dependentId: dependentId,
            });
        }
        if (folderAddCheck.indexOf("audios") != -1) {
            criteria.push({
                folderName: Constants.DATABASE.FOLDERS.AUDIOS["en"],
                folderNameByLang: {
                    en: Constants.DATABASE.FOLDERS.AUDIOS["en"],
                    ar: Constants.DATABASE.FOLDERS.AUDIOS["ar"],
                },
                folderIcon: "https://test.rooh.live/files/icons/ic_audios.png",
                folderType: "2",
                userId: ObjectId(userData._id),
                dependentId: dependentId,
            });
        }
        if (folderAddCheck.indexOf("links") != -1) {
            criteria.push({
                folderName: Constants.DATABASE.FOLDERS.LINKS["en"],
                folderNameByLang: {
                    en: Constants.DATABASE.FOLDERS.LINKS["en"],
                    ar: Constants.DATABASE.FOLDERS.LINKS["ar"],
                },
                folderIcon: "https://test.rooh.live/files/icons/ic_links.png",
                folderType: "2",
                userId: ObjectId(userData._id),
                dependentId: dependentId,
            });
        }
        //]
        if (type == "1") {
            if (folderAddCheck.indexOf("medications") != -1) {
                criteria.push({
                    folderName: Constants.DATABASE.FOLDERS.MEDICATIONS["en"],
                    folderNameByLang: {
                        en: Constants.DATABASE.FOLDERS.MEDICATIONS["en"],
                        ar: Constants.DATABASE.FOLDERS.MEDICATIONS["ar"],
                    },
                    folderIcon: "https://test.rooh.live/files/icons/ic_medications.png",
                    folderType: "1",
                    userId: ObjectId(userData._id),
                    dependentId: dependentId,
                });
            }
            if (folderAddCheck.indexOf("requests") != -1) {
                criteria.push({
                    folderName: Constants.DATABASE.FOLDERS.REQUESTS["en"],
                    folderNameByLang: {
                        en: Constants.DATABASE.FOLDERS.REQUESTS["en"],
                        ar: Constants.DATABASE.FOLDERS.REQUESTS["ar"],
                    },
                    folderIcon: "https://test.rooh.live/files/icons/ic_requests.png",
                    folderType: "1",
                    userId: ObjectId(userData._id),
                    dependentId: dependentId,
                });
            }
            if (folderAddCheck.indexOf("reports") != -1) {
                criteria.push({
                    folderName: Constants.DATABASE.FOLDERS.REPORTS["en"],
                    folderNameByLang: {
                        en: Constants.DATABASE.FOLDERS.REPORTS["en"],
                        ar: Constants.DATABASE.FOLDERS.REPORTS["ar"],
                    },
                    folderIcon: "https://test.rooh.live/files/icons/ic_reports.png",
                    folderType: "1",
                    userId: ObjectId(userData._id),
                    dependentId: dependentId,
                });
            }
            if (folderAddCheck.indexOf("radiology") != -1) {
                criteria.push({
                    folderName: Constants.DATABASE.FOLDERS.RADIOLOGY["en"],
                    folderNameByLang: {
                        en: Constants.DATABASE.FOLDERS.RADIOLOGY["en"],
                        ar: Constants.DATABASE.FOLDERS.RADIOLOGY["ar"],
                    },
                    folderIcon: "https://test.rooh.live/files/icons/ic_radiology.png",
                    folderType: "1",
                    userId: ObjectId(userData._id),
                    dependentId: dependentId,
                });
            }
            if (folderAddCheck.indexOf("labs") != -1) {
                criteria.push({
                    folderName: Constants.DATABASE.FOLDERS.LABS["en"],
                    folderNameByLang: {
                        en: Constants.DATABASE.FOLDERS.LABS["en"],
                        ar: Constants.DATABASE.FOLDERS.LABS["ar"],
                    },
                    folderIcon: "https://test.rooh.live/files/icons/ic_labs.png",
                    folderType: "1",
                    userId: ObjectId(userData._id),
                    dependentId: dependentId,
                });
            }
        }
        Models.Folder.insertMany(criteria, function (terr, tresult) {
            console.log("tresult.................", tresult);
            return true;
        });
    } else {
        return true;
    }
    //});;
}