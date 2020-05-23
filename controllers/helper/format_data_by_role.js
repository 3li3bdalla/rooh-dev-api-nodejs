//formatDataByRole
module.exports = function (data, callback) {
    //if (data.role.indexOf("USER") == -1 && data.role.indexOf("User") == -1) {
    if (data.defaultLoginRole != "USER" && data.defaultLoginRole != "User") {
        data.user = {};
    }
    //if (data.role.indexOf("PROFESSIONAL") == -1 && data.role.indexOf("Professional") == -1) {
    if (
        data.defaultLoginRole != "PROFESSIONAL" &&
        data.defaultLoginRole != "Professional"
    ) {
        data.professional = {};
    }
    if (
        data.role.indexOf("FACILITY") == -1 &&
        data.role.indexOf("Facility") == -1
    ) {
        data.facility = {};
    }
    callback(data);
}