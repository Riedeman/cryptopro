'use strict';
module.exports = (sequelize, DataTypes) => {
	var Balance = sequelize.define('Balance', {
		exchangeID: DataTypes.INTEGER,
		exchangeName: DataTypes.STRING,
		currency: DataTypes.STRING,
		available: DataTypes.FLOAT,
		reserve: DataTypes.FLOAT,
		exposureRatio: DataTypes.FLOAT,
		liquidityRatio: DataTypes.FLOAT
	});
	return Balance;
};