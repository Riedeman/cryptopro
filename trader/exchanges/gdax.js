var _ = require('lodash');
var Gdax = require('gdax');
var axios = require("axios");
var Exchanges = require('crypto-exchange');
var AccountInfo = require('../accountInfo.js');
var Recommendation = require('../../app/models/sequelize.js').Recommendation;
const config = require('../../config/config.json')["GDAX"];
const key = config.key;
const secret = config.secret;
const passphrase = config.passphrase;
const orderBookDepth = config.orderBookDepth || 0; //NOT SUPPORTED FOR GDAX

const apiURI = 'https://api.gdax.com';
var exchange = new Exchanges.gdax({
	key: key,
	secret: secret,
	passphrase: passphrase
});

exports.updatePrice = ((product) => {
	return axios.get(`https://api.gdax.com/products/${product.ticker}/book`).then((res) => {
		var data = res.data;
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
	exchange.buy(ticker, qty, price).then((res) => {
			AccountInfo.saveResultTransaction(recID, 'buy', res.txid);
		})
		.catch((err) => {
			console.log("ERR buying: ", err);
			AccountInfo.saveResultTransaction(recID, 'buy', `ERROR: ${err}`);
			AccountInfo.zeroBalances("GDAX");
		});
});

exports.sell = ((recID, ticker, qty, price) => {
	exchange.sell(ticker, qty, price).then((res) => {
			AccountInfo.saveResultTransaction(recID, 'sell', res.txid);
		})
		.catch((err) => {
			console.log("ERR selling: ", err);
			AccountInfo.saveResultTransaction(recID, 'sell', `ERROR: ${err}`);
			AccountInfo.zeroBalances("GDAX");
		});
});

exports.updateBalances = (() => {
	if (!key || key == "<API Key>") {
		console.log('No GDAX API Key. Ignoring balances.');
	} else {
		var authedClient = new Gdax.AuthenticatedClient(
			key,
			secret,
			passphrase,
			apiURI
		);
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
				var authedClient = new Gdax.AuthenticatedClient(
					key,
					secret,
					passphrase,
					apiURI
				);
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
				var authedClient = new Gdax.AuthenticatedClient(
					key,
					secret,
					passphrase,
					apiURI
				);
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