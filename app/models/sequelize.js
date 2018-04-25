const Sequelize = require('sequelize');
const config = require('../../config/config.json')["database"];
const db = {};

let sequelize = new Sequelize(config.database, config.username, config.password, config);

// load models
var models = [
	'Balance',
	'Exchange',
	'Market',
	'Potential',
	'Product',
	'Recommendation',
	'Reorder',
	'User'
];
models.forEach((model) => {
	db[model] = sequelize.import(model.toLowerCase() + "/" + model.toLowerCase() + ".model.js");
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;