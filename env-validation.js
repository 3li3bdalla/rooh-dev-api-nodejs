// npm modules
require('dotenv').config();
const joi = require('joi');

const envVarsSchema = joi.object({
    NODE_ENV: joi.string()
        .allow(['dev', 'prod', 'test'])
        .required(),
    PORT: joi.number()
        .required(),

    //  mongo
    MONGO_USER_NAME: joi.string()
        .required(),
    MONGO_USER_PASSWORD: joi.string()
        .required(),
    MONGO_HOST: joi.string()
        .required(),
    MONGO_DB_NAME: joi.string()
        .required()

}).unknown()
    .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);
// console.log('error',error,envVars)
if (error) {
    return new Error(`Enviorment validation error: ${error.message}`);
}
