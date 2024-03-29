var Balance = require('../app/models/sequelize.js').Balance;
var Recommendation = require('../app/models/sequelize.js').Recommendation;
var Reorder = require('../app/models/sequelize.js').Reorder;
var TraderJoe = require('./traderJoe.js');
var AccountInfo = require('./accountInfo.js');

exports.reorder = () => {
	console.log(`Checking for reorders`);
	rebuy();
	resell();
}

function rebuy() {
	Recommendation.findAll({
		where: {
			buyResultStatus: 'rebuy'
		}
	}).then((recommendations) => {
		recommendations.forEach((rec) => {
			AccountInfo.sleep(100);
			Balance.findOne({
				where: {
					currency: rec.buyCurrency,
					exchangeID: rec.buyExchangeID
				}
			}).then((balance) => {
				if (((balance.available - balance.reserve) - (rec.expectedBuyCost + rec.expectedBuyFee)) > 0.00001) { // Deal with JavaScript floating point math
					console.log(`Reopening ${rec.expectedBuyCost} ${rec.buyCurrency} buy order (${rec.id}) for ${rec.actualTradeableQty} ${rec.sellCurrency} @ ${rec.buyPrice} on ${rec.buyExchangeName}`);
					Reorder.create({
						recommendationID: rec.id,
						side: 'buy',
						originalTxID: rec.buyTransactionID
					}).then((newOrder) => {
						rec.buyTransactionID = `Reordering: ${newOrder.id}`;
						rec.buyResultStatus = null;
						rec.endResult = null;
						rec.save();
						TraderJoe.buy(rec);
					});
				} else {
					console.log(`Not enough ${rec.buyCurrency} on ${rec.buyExchangeName} to reopen ${rec.id} `);
					console.log(`Available ${balance.available - balance.reserve} needs ${rec.expectedBuyCost + rec.expectedBuyFee}`);
				}
			});
		});
	});
}

function resell() {
	Recommendation.findAll({
		where: {
			sellResultStatus: 'resell'
		}
	}).then((recommendations) => {
		recommendations.forEach((rec) => {
			AccountInfo.sleep(100);
			Balance.findOne({
				where: {
					currency: rec.sellCurrency,
					exchangeID: rec.sellExchangeID
				}
			}).then((balance) => {
				if (balance.available - balance.reserve >= rec.actualTradeableQty) {
					console.log(`Reopening ${rec.expectedSellCost} ${rec.buyCurrency} sell order (${rec.id}) for ${rec.actualTradeableQty} ${rec.sellCurrency} @ ${rec.sellPrice} on ${rec.sellExchangeName}`);
					Reorder.create({
						recommendationID: rec.id,
						side: 'sell',
						originalTxID: rec.sellTransactionID
					}).then((newOrder) => {
						rec.sellTransactionID = `Reordering: ${newOrder.id}`;
						rec.sellResultStatus = null;
						rec.endResult = null;
						rec.save();
						TraderJoe.sell(rec);
					});
				} else {
					console.log(`Not enough ${rec.sellCurrency} on ${rec.sellExchangeName} to reopen ${rec.id} `);
					console.log(`Available: ${balance.available} reserve: ${balance.reserve} = ${ balance.available - balance.reserve } needs: ${rec.actualTradeableQty}`);
				}
			});
		});
	});
}