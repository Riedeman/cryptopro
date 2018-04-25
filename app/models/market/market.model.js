'use strict';
module.exports = (sequelize, DataTypes) => {
	var Market = sequelize.define('Market', {
		name: DataTypes.STRING,
		baseCurrency: DataTypes.STRING,
		marketCurrency: DataTypes.STRING,
		decimals: DataTypes.INTEGER,
		tradeActive: DataTypes.BOOLEAN
	});
	return Market;
};