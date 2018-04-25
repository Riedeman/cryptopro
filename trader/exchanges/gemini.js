var _ = require('lodash');
var moment = require('moment');
var axios = require("axios");
var AccountInfo = require('../accountInfo.js');
var Product = require('../../app/models/sequelize.js').Product;
var GeminiAPI = require('gemini-api').default;
var Recommendation = require('../../app/models/sequelize.js').Recommendation;

const config = require('../../config/config.json')["Gemini"];
const key = config.key;
const secret = config.secret;
const orderBookDepth = config.orderBookDepth || 0;

exports.updatePrice = (product) => {
	return axios.get(`https://api.gemini.com/v1/book/${product.ticker}`).then((res) => {
		var data = res.data;
		product.bid = +data.bids[orderBookDepth].price;
		product.bidQty = +data.bids[orderBookDepth].amount;
		product.ask = +data.asks[orderBookDepth].price;
		product.askQty = +data.asks[orderBookDepth].amount;
		product.timestamp = data.bids[orderBookDepth].timestamp;
		// console.log(`Saved ${product.ticker} on ${product.exchangeName} for ${product.ask} / ${product.bid}`);
		return product.save();
	}).catch((err) => {
		console.log(`Error getting ${product.ticker} on ${product.exchangeName}: ${err.toString()}`);
	});
};

exports.updateBalances = () => {
	var restClient = new GeminiAPI({
		key: key,
		secret: secret,
		sandbox: false
	});
	restClient.getMyAvailableBalances().then((res) => {
			res.map((balance) => {
				AccountInfo.saveBalance('Gemini', balance.currency, balance.available);
			})
		})
		.catch((err) => {
			console.log("UH OH", err);
		})
};

exports.buy = (recID, ticker, qty, price) => {
	makeTrade(recID, ticker, qty, price, 'buy')
}

exports.sell = (recID, ticker, qty, price) => {
	makeTrade(recID, ticker, qty, price, 'sell')
};

function makeTrade(recID, ticker, qty, price, type) {
	var restClient = new GeminiAPI({
		key: key,
		secret: secret,
		sandbox: false
	});
	restClient.newOrder({
		client_order_id: recID.toString(),
		symbol: ticker,
		amount: qty,
		price: price,
		type: 'exchange limit',
		side: type
	}).then((res) => {
		// console.log("Got back from Gemini:", res);
		AccountInfo.saveResultTransaction(recID, type, res.order_id);
	}).catch((err) => {
		console.log("ERROR back from Gemini:", err);
		AccountInfo.saveResultTransaction(recID, type, `ERROR: ${err}`);
		AccountInfo.zeroBalances("Gemini");
	});
}

exports.reconcile = (type) => {
	console.log(`Reconciling Gemini ${type}`);
	if (type == "buy") {
		reconcileBuys();
	} else {
		reconcileSells();
	}
}

function reconcileBuys() {
	var exchangeName = 'Gemini';
	Recommendation.findAll({
		where: {
			endResult: null,
			buyExchangeName: exchangeName,
		},
	}).then((recommendations) => {
		if (recommendations && recommendations.length > 0) {
			Product.findAll({
				where: {
					exchangeName: 'Gemini'
				}
			}).then((products) => {
				products.forEach((product) => {
					//Gemini uses additive fills, so we have to wipe data first and then add as we go.  Annoying. 
					var query = `update Recommendations set buyResultCost = 0, buyResultFee = 0, buyResultStatus = null 
						where endResult IS NULL AND buyExchangeName='${exchangeName}' AND buyTicker = '${product.ticker}'`;
					Recommendation.sequelize.query(query);
					AccountInfo.sleep(100); //Delay to avoid invalid nonce error
					var restClient = new GeminiAPI({
						key: key,
						secret: secret,
						sandbox: false
					});
					restClient.getMyPastTrades({
							symbol: product.ticker
						}).then((orders) => {
							orders.map((order) => {
								if (order.order_id && order.order_id != 'undefined') {
									console.log(`Reconciling order ${exchangeName} ${order.order_id} cost ${(parseFloat(order.price) * parseFloat(order.amount))}, fee ${order.fee_amount}`);
									query = `update Recommendations set buyResultStatus = 'filled', 
									buyResultCost=buyResultCost + ${(parseFloat(order.price) * parseFloat(order.amount))}, 
									buyResultFee = buyResultFee + ${order.fee_amount} 
									where endResult IS NULL AND buyExchangeName = '${exchangeName}' and buyTransactionID = '${order.order_id}'`;
									Recommendation.sequelize.query(query);
								}
							})
						})
						.catch((err) => {
							console.log("ERR reconciling Gemini", err);
						})
				});
			});
		} else {
			console.log("No Gemini buy orders waiting for reconcile.");
		}
	});
}

function reconcileSells() {
	var exchangeName = 'Gemini';
	Recommendation.findAll({
		where: {
			endResult: null,
				sellExchangeName: exchangeName
		},
	}).then((recommendations) => {
		if (recommendations && recommendations.length > 0) {
			Product.findAll({
				where: {
					exchangeName: 'Gemini'
				}
			}).then((products) => {
				products.forEach((product) => {
					//Gemini uses additive fills, so we have to wipe data first and then add as we go.  Annoying. 
					query = `update Recommendations set sellResultCost = 0, sellResultFee = 0, sellResultStatus = null 
						where endResult IS NULL AND sellExchangeName='${exchangeName}' AND sellTicker = '${product.ticker}'`;
					Recommendation.sequelize.query(query);
					console.log("Data cleared...updating...");
					AccountInfo.sleep(100); //Delay to avoid invalid nonce error
					var restClient = new GeminiAPI({
						key: key,
						secret: secret,
						sandbox: false
					});
					restClient.getMyPastTrades({
							symbol: product.ticker
						}).then((orders) => {
							orders.map((order) => {
								if (order.order_id && order.order_id != 'undefined') {
									console.log(`Reconciling order ${exchangeName} ${order.order_id} cost ${(parseFloat(order.price) * parseFloat(order.amount))}, fee ${order.fee_amount}`);
									query = `update Recommendations set sellResultStatus = 'filled', 
									sellResultCost=sellResultCost + ${(parseFloat(order.price) * parseFloat(order.amount))}, 
									sellResultFee = sellResultFee + ${order.fee_amount} 
									where endResult IS NULL AND sellExchangeName = '${exchangeName}' and sellTransactionID = '${order.order_id}'`;
									Recommendation.sequelize.query(query);
								}
							})
						})
						.catch((err) => {
							console.log("ERR reconciling Gemini", err);
						})
				});
			});
		} else {
			console.log("No Gemini sell orders waiting for reconcile.");
		}
	});
}