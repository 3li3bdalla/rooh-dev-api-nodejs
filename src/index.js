/**
 * Makes all features available to outer modules.
 */

let routes = [], swagger = [];

if(process.env.ADD_ADMIN_ROUTES === 'True'){
    routes = [...require('./admin').routes]
}

if(process.env.ADD_USER_ROUTES === 'True'){
    console.log("add user route----");
    routes = [...routes,...require('./user').routes];
    swagger = [...swagger, ...require('./user').swagger]
}
if(process.env.ADD_PROFESSIONAL_FACILITY_ROUTES === 'True'){
    console.log("add facility_professional----");
    routes = [...routes,...require('./facility_professional').routes];
    swagger = [...swagger, ...require('./facility_professional').swagger]
}

if(process.env.ADD_COMMON_ROUTES === 'True') {
    routes = [...routes, ...require('./common').routes]
    swagger = [...swagger, ...require('./common').swagger]
}

if(process.env.ADMIN_ROUTES === 'True') {
    routes = [...routes, ...require('./admin').routes]
    swagger = [...swagger, ...require('./admin').swagger]
}

if(process.env.TEAM_ROUTES === 'True') {
    routes = [...routes, ...require('./team').routes]
    swagger = [...swagger, ...require('./team').swagger]
}
if(process.env.COURSE_ROUTES === 'True') {
    routes = [...routes, ...require('./course').routes]
    swagger = [...swagger, ...require('./course').swagger]
}
if(process.env.PHARMACY_ROUTES === 'True') {
    routes = [...routes, ...require('./pharmacy').routes]
    swagger = [...swagger, ...require('./pharmacy').swagger]
}



//console.log(("src routessss---", JSON.stringify(swagger)));

module.exports = {
    routes: routes,
    swagger: swagger
};
