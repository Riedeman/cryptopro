'use strict';
module.exports = (sequelize, DataTypes) => {
	var Product = sequelize.define('Product', {
		marketID: DataTypes.INTEGER,
		marketName: DataTypes.STRING,
		exchangeID: DataTypes.INTEGER,
		exchangeName: DataTypes.STRING,
		ticker: DataTypes.STRING,
		baseFee: DataTypes.FLOAT,
		timestamp: DataTypes.INTEGER,
		bid: DataTypes.FLOAT,
		bidQty: DataTypes.FLOAT,
		ask: DataTypes.FLOAT,
		askQty: DataTypes.FLOAT
	});
	return Product;
};