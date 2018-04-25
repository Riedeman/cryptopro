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

exports.reconcile = (type) => {
	console.log(`Reconciling Bitstamp ${type}`);
	if (type == "buy") {
		reconcileBuys();
	} else {
		reconcileSells();
	}
}

function getReconciledTrades(recommendations) {
	if (recommendations && recommendations.length > 0) {
		var nonce = AccountInfo.generateNonce();
		var message = nonce + custID + key;
		var hash = crypto.createHmac('sha256', secret).update(message).digest('hex');
		var signature = hash.toUpperCase();
		var path = `/api/v2/user_transactions/`;
		var data = {
			key: key,
			signature: signature,
			nonce: nonce,
			limit: 500
		};
		makeRequest('post', host, path, querystring.stringify(data), doReconcile, 0, '');
	} else {
		AccountInfo.log("No Bitstamp orders waiting for reconcile.");
	}
}

function reconcileBuys() {
	Recommendation.findAll({
		where: {
			endResult: null,
			buyExchangeName: "Bitstamp",
		},
	}).then((recommendations) => {
		getReconciledTrades(recommendations)
	});
}

function reconcileSells() {
	Recommendation.findAll({
		where: {
			endResult: null,
			sellExchangeName: "Bitstamp"
		},
	}).then((recommendations) => {
		getReconciledTrades(recommendations)
	});
}

function doReconcile(data, recID, type) {
	//Bitstamp uses additive fills, so we have to wipe data first and then add as we go.  Annoying. 
	var exchangeName = 'Bitstamp';
	var query = `update Recommendations set buyResultCost = 0, buyResultFee = 0, buyResultStatus = null where endResult is NULL AND buyExchangeName='${exchangeName}'`;
	Recommendation.sequelize.query(query);
	query = `update Recommendations set sellResultCost = 0, sellResultFee = 0, sellResultStatus = null where endResult is NULL AND sellExchangeName='${exchangeName}'`;
	Recommendation.sequelize.query(query);
	// console.log("Data cleared...updating with...", data);
	data.map((order) => {
		if (order.order_id && order.order_id != 'undefined') {
			console.log(`Reconciling order ${exchangeName} ${order.order_id} cost ${Math.abs(order.usd)}, fee ${order.fee}`);
			query = `update Recommendations set buyResultStatus = 'filled', buyResultCost= buyResultCost + ${Math.abs(order.usd)}, buyResultFee = buyResultFee + ${order.fee} where endResult is NULL AND buyExchangeName = '${exchangeName}' and buyTransactionID = '${order.order_id}'`;
			Recommendation.sequelize.query(query);
			query = `update Recommendations set sellResultStatus = 'filled', sellResultCost=sellResultCost + ${Math.abs(order.usd)}, sellResultFee = sellResultFee + ${order.fee} where endResult is NULL AND sellExchangeName = '${exchangeName}' and sellTransactionID = '${order.order_id}'`;
			Recommendation.sequelize.query(query);
		}
	});
}

function saveResult(data, recID, type) {
	AccountInfo.saveResultTransaction(recID, type, data.id);
}

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