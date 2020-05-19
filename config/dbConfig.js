'use strict';
//18.184.113.27
let mongoURI = "mongodb://localhost:27017/csfHealthcare"; //localhost

if (process.env.NODE_ENV === "test") { // 18.184.113.27 ip
    mongoURI = `mongodb://${process.env.mongo_test_user}:${process.env.mongo_test_password}@$localhost:27017/${process.env.mongo_test_db}`;
} else if (process.env.NODE_ENV === "dev") {
    mongoURI = `mongodb://${process.env.mongo_dev_user}:${process.env.mongo_dev_password}@localhost:27017/${process.env.mongo_dev_db}`;
}
// console.log('dev', process.env.NODE_ENV);
// mongoURI = "mongodb://localhost:27017/csfHealthcare"; //localhost

// console.log('mongoURI', mongoURI)

// var mongo = {
// 	URI: 'mongodb://localhost:27017/csfHealthcare',
// 	//URI: 'mongodb://:@localhost:27017/'
// 	//URI: 'mongodb://csf-user:U0e432375!aywkXC!eE@localhost:27017/csfHealthcare',
// devURI: 'mongodb://roohlivedbtestuser:adUkxsdevaprabhuFGF6jda@18.184.113.27:27017/roohlive-test-DB'
// };

module.exports = {
    mongo: mongoURI
};