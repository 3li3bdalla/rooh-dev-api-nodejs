'use strict';

let saveData = function(model,data){
    return new model(data).save();
};

let getData = function (model, query, projection, options) {
    return model.find(query, projection, options);
};

let findOne = function (model, query, projection, options) {
    return model.findOne(query, projection, options);
};

let findAndUpdate = function (model, conditions, update, options) {
    return  model.findOneAndUpdate(conditions, update, options);
};

let findAndRemove = function (model, conditions, update, options) {
    return  model.findOneAndRemove(conditions, update, options);
};

let update = function (model, conditions, update, options) {
    return model.update(conditions, update, options);
};
let updateMany = function (model, conditions, update, options) {
    return model.updateMany(conditions, update, options);
};
let updateOne = function (model, conditions, update, options) {
    return model.updateOne(conditions, update, options);
};

let remove = function (model, condition) {
    return model.remove(condition);
};

let deleteMany = function (model, condition) {
    return model.deleteMany(condition);
};
/*------------------------------------------------------------------------
 * FIND WITH REFERENCE
 * -----------------------------------------------------------------------*/
let populateData = function (model, query, projection, options, collectionOptions) {
    return model.find(query, projection, options).populate(collectionOptions).exec();
};

let count = function (model, condition) {
    return model.countDocuments(condition);
};

let estimatedDocumentCount = function (model, options) {
    return model.estimatedDocumentCount(options);
};

let countDocuments = function (model, condition) {
    return model.countDocuments(condition);
};
/*
 ----------------------------------------
 AGGREGATE DATA
 ----------------------------------------
 */
let aggregateData = function (model, aggregateArray,options) {

    let aggregation = model.aggregate(aggregateArray);

    if(options) {
      aggregation.options = options;
    }

    return aggregation.exec();
};

let insert = function(model, data, options){
    return model.collection.insert(data,options);
};

let insertMany = function(model, data, options){
    return model.collection.insertMany(data,options);
};

let aggregateDataWithPopulate = function (model, aggregateArray, populateOptions) {
    // let aggregation = model.aggregate(aggregateArray);
    // let data=aggregation.exec();
    // return model.populate(data,populateOptions)
    return new Promise((resolve, reject)=>{
        model.aggregate(aggregateArray, (err, data) => {

            if (err) {
                //logger.error("Aggregate Data", err);
                reject(err);
            }
            model.populate(data, populateOptions,
                function (err, populatedDocs) {

                    if (err) reject(err);
                    resolve(populatedDocs);// This object should now be populated accordingly.
                });

        });
    })
    // return aggregation.exec()
};

let bulkFindAndUpdate= function(bulk,query,update,options) {
    bulk.find(query).upsert().update(update,options);
};

let bulkFindAndUpdateOne= function(bulk,query,update,options) {
    bulk.find(query).upsert().updateOne(update,options);
};


// =============== getting distinct records in array =======

let gettingDistinctValues= function(model,field,criteria) {
    return model.distinct(field,criteria);
};


module.exports = {
    saveData : saveData,
    getData: getData,
    update : update,
    updateMany:updateMany,
    updateOne:updateOne,
    remove : remove,
    deleteMany : deleteMany,
    insert : insert,
    insertMany:insertMany,
    count  : count,
    findOne: findOne,
    findAndUpdate : findAndUpdate,
    findAndRemove : findAndRemove,
    populateData : populateData,
    countDocuments:countDocuments,
    estimatedDocumentCount:estimatedDocumentCount,
    aggregateData : aggregateData,
    aggregateDataWithPopulate: aggregateDataWithPopulate,
    bulkFindAndUpdate : bulkFindAndUpdate,
    bulkFindAndUpdateOne : bulkFindAndUpdateOne,
    gettingDistinctValues : gettingDistinctValues
};