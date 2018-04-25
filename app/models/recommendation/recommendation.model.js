'use strict';
module.exports = (sequelize, DataTypes) => {
	var Recommendation = sequelize.define('Recommendation', {
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
		buyTradeableQty: DataTypes.FLOAT,
		buyTradeableCost: DataTypes.FLOAT,

		actualTradeableQty: DataTypes.FLOAT,
		expectedSellCost: DataTypes.FLOAT,
		expectedBuyCost: DataTypes.FLOAT,
		expectedFeelessProfit: DataTypes.FLOAT,
		expectedSellFee: DataTypes.FLOAT,
		expectedBuyFee: DataTypes.FLOAT,
		expectedProfit: DataTypes.FLOAT,
		sellTransactionID: DataTypes.STRING,
		buyTransactionID: DataTypes.STRING,

		buyResultStatus: DataTypes.STRING,
		buyResultFee: DataTypes.FLOAT,
		buyResultCost: DataTypes.FLOAT,
		sellResultStatus: DataTypes.STRING,
		sellResultFee: DataTypes.FLOAT,
		sellResultCost: DataTypes.FLOAT,

		endResult: DataTypes.STRING,
		actualProfit: DataTypes.FLOAT
		
	});
	return Recommendation;
};