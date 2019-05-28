var _ = require('lodash');
var AccountInfo = require('../accountInfo.js');
var Recommendation = require('../../app/models/sequelize.js').Recommendation;
const config = require('../../config/config.json')["Coinbase"];
const orderBookDepth = config.orderBookDepth || 0;

const CoinbasePro = require('coinbase-pro');
const publicClient = new CoinbasePro.PublicClient();
const apiURI = 'https://api.pro.coinbase.com';
// const sandboxURI = 'https://api-public.sandbox.pro.coinbase.com';
const isConfigured = (config.key && config.key.length > 10);

var authedClient;
if (isConfigured) {
	authedClient = new CoinbasePro.AuthenticatedClient(
		config.key,
		config.secret,
		config.passphrase,
		apiURI
	);
}

exports.updatePrice = ((product) => {
	return publicClient.getProductOrderBook(product.ticker, {
		level: orderBookDepth > 0 ? 2 : 1
	}).then(data => {
		product.bid = +data.bids[orderBookDepth][0];
		product.bidQty = +data.bids[orderBookDepth][1];
		product.ask = +data.asks[orderBookDepth][0];;
		product.askQty = +data.asks[orderBookDepth][1];
		product.timestamp = data.sequence;
		return product.save().then((saved) => {
			AccountInfo.log(`Saved ${product.ticker} on ${product.exchangeName} for ${product.ask} / ${product.bid}`);
		});
	}).catch((err) => {
		AccountInfo.log(`Error getting ${product.ticker} on ${product.exchangeName}: ${err.toString()}`);
	});
});

exports.buy = ((recID, ticker, qty, price) => {
	authedClient.buy({
			price: price,
			size: qty,
			product_id: ticker,
		}).then((res) => {
			console.log("Coinbase buy ", res);
			AccountInfo.saveResultTransaction(recID, 'buy', res.id);
			exports.updateBalances();
		})
		.catch((err) => {
			console.log("ERR buying: ", err);
			AccountInfo.saveResultTransaction(recID, 'buy', `ERROR: ${err}`);
			AccountInfo.zeroBalances("GDAX");
		});
});

exports.sell = ((recID, ticker, qty, price) => {
	authedClient.sell({
			price: price,
			size: qty,
			product_id: ticker,
		}).then((res) => {
			console.log("Coinbase sell ", res);
			AccountInfo.saveResultTransaction(recID, 'sell', res.id);
			exports.updateBalances();
		})
		.catch((err) => {
			console.log("ERR selling: ", err);
			AccountInfo.saveResultTransaction(recID, 'sell', `ERROR: ${err}`);
			AccountInfo.zeroBalances("GDAX");
		});
});

exports.updateBalances = (() => {
	if (isConfigured) {
		authedClient.getAccounts((err, response, data) => {
			if (err) {
				console.log(`Error getting balance from GDAX`, err);
			} else {
				// console.log("Result data: ", data);
				let balances = _.reduce(data, (result, acct) => {
					result[acct.currency] = {
						balance: parseFloat(acct.balance),
						available: parseFloat(acct.available),
						pending: parseFloat(acct.hold)
					}
					return result
				}, {});
				var exchangeName = 'GDAX';
				AccountInfo.saveBalance(exchangeName, "BCH", balances.BCH ? balances.BCH.available : 0);
				AccountInfo.saveBalance(exchangeName, "BTC", balances.BTC ? balances.BTC.available : 0);
				AccountInfo.saveBalance(exchangeName, "ETH", balances.ETH ? balances.ETH.available : 0);
				AccountInfo.saveBalance(exchangeName, "LTC", balances.LTC ? balances.LTC.available : 0);
				AccountInfo.saveBalance(exchangeName, "USD", balances.USD ? balances.USD.available : 0);
				AccountInfo.saveBalance(exchangeName, "XRP", balances.XRP ? balances.XRP.available : 0);
			}
		});
	}
});

exports.reconcile = (type) => {
	console.log(`Reconciling GDAX ${type}`);
	if (type == "buy") {
		reconcileBuys();
	} else {
		reconcileSells();
	}
}

function reconcileSells() {
	Recommendation.findAll({
		where: {
			sellExchangeName: "GDAX",
			sellResultStatus: null
		}
	}).then((recommendations) => {
		recommendations.forEach((recommendation) => {
			if (recommendation.sellTransactionID && recommendation.sellTransactionID != 'undefined') {
				console.log("LOOKING UP:", recommendation.sellTransactionID);
				authedClient.getOrder(recommendation.sellTransactionID, (error, response, order) => {
					AccountInfo.log("GOT sell BACK:", order);
					if (order.status == "done") {
						AccountInfo.reconcileOrder("GDAX", order.id, Math.abs(parseFloat(order.executed_value)), parseFloat(order.fill_fees));
					}
				});
			}
		});
	});
}

function reconcileBuys() {
	Recommendation.findAll({
		where: {
			buyExchangeName: "GDAX",
			buyResultStatus: null
		}
	}).then((recommendations) => {
		recommendations.forEach((recommendation) => {
			if (recommendation.buyTransactionID && recommendation.buyTransactionID != 'undefined') {
				console.log("Reconcile GDAX order: ", recommendation.buyTransactionID)
				authedClient.getOrder(recommendation.buyTransactionID, (error, response, order) => {
					AccountInfo.log("GOT buy BACK:", order);
					if (order && order.status == "done") {
						AccountInfo.reconcileOrder("GDAX", order.id, Math.abs(parseFloat(order.executed_value)), parseFloat(order.fill_fees));
					}
				});
			}
		});
	});
}