'use strict';
module.exports = (sequelize, DataTypes) => {
	var Potential = sequelize.define('Potential', {
		marketID: DataTypes.INTEGER,
		marketName: DataTypes.STRING,
		sellExchangeID: DataTypes.INTEGER,
		sellExchangeName: DataTypes.STRING,
		sellTicker: DataTypes.STRING,
		sellPrice: DataTypes.FLOAT,
		sellExchangeTotalQty: DataTypes.FLOAT,
		sellExchangeQty: DataTypes.FLOAT,
		sellCurrency: DataTypes.STRING,
		sellBalanceTotalAvailable: DataTypes.FLOAT,
		sellBalanceAvailable: DataTypes.FLOAT,
		sellMaxTradeableQty: DataTypes.FLOAT,
		sellTradeableQty: DataTypes.FLOAT,
		sellTradeableCost: DataTypes.FLOAT,

		buyExchangeID: DataTypes.INTEGER,
		buyExchangeName: DataTypes.STRING,
		buyTicker: DataTypes.STRING,
		buyPrice: DataTypes.FLOAT,
		buyExchangeTotalQty: DataTypes.FLOAT,
		buyExchangeQty: DataTypes.FLOAT,
		buyCurrency: DataTypes.STRING,
		buyBalanceTotalAvailable: DataTypes.FLOAT,
		buyBalanceAvailable: DataTypes.FLOAT,
		buyMaxTradeableQty: DataTypes.FLOAT,
		buyTradeableQty: DataTypes.FLOAT,
		buyTradeableCost: DataTypes.FLOAT,

		potentialTradeableQty: DataTypes.FLOAT,
		potentialSellCost: DataTypes.FLOAT,
		potentialBuyCost: DataTypes.FLOAT,
		potentialFeelessProfit: DataTypes.FLOAT,
		potentialSellFee: DataTypes.FLOAT,
		potentialBuyFee: DataTypes.FLOAT,
		potentialProfit: DataTypes.FLOAT,
		
	});
	return Potential;
};