var https = require('https');
var _ = require('lodash');
var moment = require('moment');
var axios = require("axios");
var crypto = require("crypto");
var querystring = require("querystring");
var AccountInfo = require('../accountInfo.js');
var Recommendation = require('../../app/models/sequelize.js').Recommendation;

const config = require('../../config/config.json')["Bitstamp"];
const key = config.key;
const secret = config.secret;
const custID = config.custID;
const orderBookDepth = config.orderBookDepth || 0;
const host = 'www.bitstamp.net';

exports.updatePrice = ((product) => {
	return axios.get(`https://www.bitstamp.net/api/v2/order_book/${product.ticker}/`).then((res) => {
		var data = res.data;
		product.bid = +data.bids[orderBookDepth][0];
		product.bidQty = +data.bids[orderBookDepth][1];
		product.ask = +data.asks[orderBookDepth][0];;
		product.askQty = +data.asks[orderBookDepth][1];
		product.timestamp = data.timestamp;
		return product.save().then((saved) => {
			AccountInfo.log(`Saved ${product.ticker} on ${product.exchangeName} for ${product.ask} / ${product.bid}`);
		});
	}).catch((err) => {
		AccountInfo.log(`Error getting ${product.ticker} on ${product.exchangeName}: ${err.toString()}`);
	});
});

exports.buy = ((recID, ticker, qty, price) => {
	makeTrade('buy', recID, ticker, qty, price);
});

exports.sell = ((recID, ticker, qty, price) => {
	makeTrade('sell', recID, ticker, qty, price);
});

function makeTrade(type, recID, ticker, qty, price) {
	var nonce = AccountInfo.generateNonce();
	var message = nonce + custID + key;
	var hash = crypto.createHmac('sha256', secret).update(message).digest('hex');
	var signature = hash.toUpperCase();
	var path = `/api/v2/${type}/${ticker}/`;
	var data = {
		key: key,
		signature: signature,
		nonce: nonce,
		amount: qty,
		price: price
	};
	makeRequest('post', host, path, querystring.stringify(data), saveResult, recID, type);
	AccountInfo.zeroBalances("Bitstamp");
}

function saveResult(data, recID, type) {
	console.log("Bistamp order:", data);
	AccountInfo.saveResultTransaction(recID, type, data.id);
	exports.updateBalancesAndFees();
}

exports.updateBalancesAndFees = (() => {
	if (!key || key == "<API Key>") {
		console.log('No Bitstamp API Key. Ignoring balances.');
	} else {
		var nonce = AccountInfo.generateNonce();
		var message = nonce + custID + key;
		var hash = crypto.createHmac('sha256', secret).update(message).digest('hex');
		var signature = hash.toUpperCase();
		var path = `/api/v2/balance/`;
		var data = {
			key: key,
			signature: signature,
			nonce: nonce
		};
		makeRequest('post', host, path, querystring.stringify(data), saveBalances, 0, '');
	}
});

function saveBalances(data, recID, type) {
	var exchangeName = "Bitstamp";
	// console.log("GOT BACK BITSTAMP:", data);
	AccountInfo.saveBalance(exchangeName, "BCH", data.bch_available);
	AccountInfo.saveBalance(exchangeName, "BTC", data.btc_available);
	AccountInfo.saveBalance(exchangeName, "ETH", data.eth_available);
	AccountInfo.saveBalance(exchangeName, "LTC", data.ltc_available);
	AccountInfo.saveBalance(exchangeName, "USD", data.usd_available);
	AccountInfo.saveBalance(exchangeName, "XRP", data.xrp_available);
	AccountInfo.saveFee(exchangeName, "BCH-USD", data.bchusd_fee / 100);
	AccountInfo.saveFee(exchangeName, "BCH-BTC", data.bchbtc_fee / 100);
	AccountInfo.saveFee(exchangeName, "BTC-USD", data.btcusd_fee / 100);
	AccountInfo.saveFee(exchangeName, "ETH-BTC", data.ethbtc_fee / 100);
	AccountInfo.saveFee(exchangeName, "ETH-USD", data.ethusd_fee / 100);
	AccountInfo.saveFee(exchangeName, "LTC-USD", data.ltcusd_fee / 100);
	AccountInfo.saveFee(exchangeName, "LTC-BTC", data.ltcbtc_fee / 100);
	AccountInfo.saveFee(exchangeName, "XRP-USD", data.xrpusd_fee / 100);
	AccountInfo.saveFee(exchangeName, "BTC-XRP", data.xrpbtc_fee / 100);
	return;
}

exports.reconcile = (type) => {
	console.log(`Reconciling Bitstamp ${type}`);
	if (type == "buy") {
		reconcileBuys();
	} else {
		reconcileSells();
	}
}

function reconcileBuys() {
	Recommendation.findAll({
		where: {
			buyResultStatus: null,
			buyExchangeName: "Bitstamp",
		},
	}).then((recommendations) => {
		for (var i = 0; i < recommendations.length; i++) {
			reconcileTrade(recommendations[i], 'buy');
			AccountInfo.sleep(200);
		}
	});
}

function reconcileSells() {
	Recommendation.findAll({
		where: {
			sellResultStatus: null,
			sellExchangeName: "Bitstamp"
		},
	}).then((recommendations) => {
		for (var i = 0; i < recommendations.length; i++) {
			reconcileTrade(recommendations[i], 'sell');
			AccountInfo.sleep(200);
		}
	});
}

function reconcileTrade(trade, type) {
	var nonce = AccountInfo.generateNonce();
	var message = nonce + custID + key;
	var hash = crypto.createHmac('sha256', secret).update(message).digest('hex');
	var signature = hash.toUpperCase();
	var path = `/api/v2/order_status/`;
	var data = {
		key: key,
		signature: signature,
		nonce: nonce,
		id: type == 'buy' ? trade.buyTransactionID : trade.sellTransactionID
	};
	makeRequest('post', host, path, querystring.stringify(data), doReconcile, trade.id, type);
}

function doReconcile(data, recID, type) {
	console.log("Reconciling order", recID);
	if (data.status == 'Finished') {
		var cost = 0;
		var fee = 0;
		let query = '';
		for (var i = 0; i < data.transactions.length; i++) {
			cost += +data.transactions[i].usd;
			fee += +data.transactions[i].fee;
		}
		if (type == 'buy') {			
			query = `update Recommendations set buyResultStatus = 'filled', buyResultCost= ${cost}, buyResultFee = ${fee} where endResult is NULL AND id = ${recID}`;
		} else {
			query = `update Recommendations set sellResultStatus = 'filled', sellResultCost= ${cost}, sellResultFee = ${fee} where endResult is NULL AND id = ${recID}`;
		}
		Recommendation.sequelize.query(query);
	}
}

function makeRequest(method, host, path, data, callback, recID, type) {
	var options = {
		host: host,
		path: path,
		method: method,
		data: data,
		headers: {
			'content-type': 'application/x-www-form-urlencoded'
		}
	};
	var req = https.request(options, (res) => {
		res.setEncoding('utf8');
		var buffer = '';
		res.on('data', (data) => {
			buffer += data;
		});
		res.on('err', (err) => {
			console.log(`No Response for ${path}`, err);
		});
		res.on('end', () => {
			if (res.statusCode == 200) {
				callback(JSON.parse(buffer), recID, type);
			}
		});
	});
	req.end(data);
}