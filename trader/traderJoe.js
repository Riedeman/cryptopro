var moment = require('moment');
var Sequelize = require('../app/models/sequelize.js');
var Balance = require('../app/models/sequelize.js').Balance;
var Market = require('../app/models/sequelize.js').Market;
var Product = require('../app/models/sequelize.js').Product;
var Recommendation = require('../app/models/sequelize.js').Recommendation;

var Bitstamp = require('./exchanges/bitstamp.js');
var Coinbase = require('./exchanges/coinbase.js');
var Kraken = require('./exchanges/kraken.js');

const config = require('../config/config.json');

exports.updateAll = () => {
	Market.findAll().then((markets) => {
		markets.map((market) => {
			if (market.tradeActive) { //1 = On, 0 = Off
				Product.findAll({
					where: {
						marketID: market.id
					}
				}).then((products) => {
					if (products.length >= 2) {
						var allPriceChecks = products.map((product) => {
							var ex = getExchange(product.exchangeName);
							if (ex) {
								return ex.updatePrice(product);
							} else {
								return null;
							}
						});
						Promise.all(allPriceChecks).then((res) => { //All prices for this market have now been updated
							makeRecommendation(market);
						});
					}
				});
			}
		});
	});
	return "Rock on";
}

function makeRecommendation(market) {
	Sequelize.sequelize.query(`CALL make_recommendation(${market.id});`).spread((data) => {
		if (data) {
			if (config.makeRealTrades) {
				buy(data);
				sell(data);
				console.log("-----");
				console.log(`----- Profitable Arbitrage Opportunity Detected - Making actual trades on ${data.buyExchangeName} and ${data.sellExchangeName}`);
				console.log("-----");
			} else {
				console.log("-----Fake trade, updading presumed balances -----");
				updateAssumedBalances(data); // Fake the trade balance changes, including fees
			}
			console.log(`${moment().format("H:mm:ss.SS")} Recommendation Made: ${data.marketName} : Qty: ${data.actualTradeableQty}  Cost:  ${data.expectedBuyCost}, Fees: ${data.expectedBuyFee + data.expectedSellFee}, Expected Profit: ${data.expectedProfit}`);
			console.log(`Buy for: ${data.buyPrice} on ${data.buyExchangeName}`);
			console.log(`Sell at: ${data.sellPrice} on ${data.sellExchangeName}`);
			console.log("-----");
			return data;
		} else {
			// No profitable trade available. Capture any missed opportunity for data mining.
			if (config.capturePotential) {
				Sequelize.sequelize.query(`CALL capture_potential(${market.id});`).spread((data) => {
					if (data) {
						console.log(`Missed potential captured: ${data.buyExchangeName} / ${data.sellExchangeName}: ${data.marketName}`);
						console.log(`Cost:  ${data.potentialBuyCost}, Expected Profit: ${data.potentialProfit}`);
						console.log("-----");
					}
				}).error((err) => {
					console.log(err);
				});
			}
		}
	}).error((err) => {
		console.log(err);
	});
}

exports.buy = (rec) => {
	buy(rec);
}

function buy(rec) {
	var ex = getExchange(rec.buyExchangeName);
	ex.buy(rec.id, rec.buyTicker, rec.actualTradeableQty, rec.buyPrice);
}

exports.sell = (rec) => {
	sell(rec);
}

function sell(rec) {
	var ex = getExchange(rec.sellExchangeName);
	ex.sell(rec.id, rec.sellTicker, rec.actualTradeableQty, rec.sellPrice);
}

function getExchange(name) {
	switch (name) {
		case 'GDAX':
			return Coinbase;
		case 'Kraken':
			return Kraken;
		case 'Bitstamp':
			return Bitstamp;
	}
}

function updateAssumedBalances(recommendation) {
	//Adjust sell exchange base currency
	var query = `update Balances set available = available - ${recommendation.actualTradeableQty} 
		where exchangeID = ${recommendation.sellExchangeID} and currency = '${recommendation.sellCurrency}'`;
	Balance.sequelize.query(query);

	//Adjust sell exchange market currency & fees
	query = `update Balances set available = available + ${recommendation.expectedSellCost}  - ${recommendation.expectedSellFee}
		where exchangeID = ${recommendation.sellExchangeID} and currency = '${recommendation.buyCurrency}'`;
	Balance.sequelize.query(query);

	//Adjust buy exchange base currency
	query = `update Balances set available = available + ${recommendation.actualTradeableQty}
		where exchangeID = ${recommendation.buyExchangeID} and currency = '${recommendation.sellCurrency}'`;
	Balance.sequelize.query(query);

	//Adjust buy exchange market currency & fees
	query = `update Balances set available = available - ${recommendation.expectedBuyCost} - ${recommendation.expectedBuyFee}
		where exchangeID = ${recommendation.buyExchangeID} and currency = '${recommendation.buyCurrency}'`;
	Balance.sequelize.query(query);
}