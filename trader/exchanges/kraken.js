var request = require('request');
var crypto = require('crypto');
var querystring = require('querystring');
var axios = require("axios");
var AccountInfo = require('../accountInfo.js');
var Recommendation = require('../../app/models/sequelize.js').Recommendation;
var Balance = require('../../app/models/sequelize.js').Balance;

const config = require('../../config/config.json')["Kraken"];
const key = config.key;
const secret = config.secret;
const orderBookDepth = config.orderBookDepth || 0;

exports.updatePrice = ((product) => {
	return axios.get(`https://api.kraken.com/0/public/Depth?count=2&pair=${product.ticker}`).then((res) => {
		var data = res.data.result[product.ticker];
		product.bid = +data.bids[orderBookDepth][0];
		product.bidQty = +data.bids[orderBookDepth][1];
		product.ask = +data.asks[orderBookDepth][0];;
		product.askQty = +data.asks[orderBookDepth][1];
		product.timestamp = data.timestamp;
		// console.log(`Saved ${product.ticker} on ${product.exchangeName} for ${product.ask} / ${product.bid}`);
		return product.save();
	}).catch((err) => {
		console.log(`Error getting ${product.ticker} on ${product.exchangeName}: ${err.toString()}`);
	});
});

exports.buy = ((recID, ticker, qty, price) => {
	var kraken = new KrakenAPI(key, secret);
	kraken.api('AddOrder', {
		pair: ticker,
		type: 'buy',
		ordertype: 'limit',
		price: price,
		volume: qty
	}, (err, res) => {
		if (err) {
			console.log("ERR buying: ", err);
			AccountInfo.saveResultTransaction(recID, 'buy', `ERROR: ${err}`);
			AccountInfo.zeroBalances('Kraken');
		} else {
			console.log("RESULT from Kraken:", res);
			AccountInfo.saveResultTransaction(recID, 'buy', res.result.txid);
		}
	});
});

exports.sell = ((recID, ticker, qty, price) => {
	var kraken = new KrakenAPI(key, secret);
	kraken.api('AddOrder', {
		pair: ticker,
		type: 'sell',
		ordertype: 'limit',
		price: price,
		volume: qty
	}, (err, res) => {
		if (err) {
			console.log("ERR selling: ", err);
			AccountInfo.saveResultTransaction(recID, 'sell', `ERROR: ${err}`);
			AccountInfo.zeroBalances('Kraken');
		} else {
			console.log("RESULT from Kraken:", res);
			AccountInfo.saveResultTransaction(recID, 'sell', res.result.txid);
		}
	});
});

exports.reconcile = (type) => {
	console.log("Reconciling Kraken");
	if (type == "buy") {
		reconcileBuys();
	} else {
		reconcileSells();
	}
}

exports.updateBalances = (() => {
	var kraken = new KrakenAPI(key, secret);
	var exchangeName = 'Kraken';
	var currencyAdjustments = {
		'BCH': 0,
		'XBT': 0,
		'ETH': 0,
		'LTC': 0,
		'USD': 0,
		'XRP': 0
	}
	kraken.api('OpenOrders', null, (err, orders) => {
		if (err) {
			console.log("UH OH", err);
		} else {
			//Kraken does not subtract open orders from available balances...Not sure what they think "available" means
			var openOrders = orders.result.open;
			// console.log('open order is', openOrders);
			for (var property in openOrders) { // Kraken uses Values as Keys. Also irritating.
				if (openOrders.hasOwnProperty(property)) {
					var currency = openOrders[property].descr.pair.substr(0, 3);
					var type = openOrders[property].descr.type;
					var vol = openOrders[property].vol;
					var price = openOrders[property].descr.price;
					if (type == 'sell') {
						currencyAdjustments[currency] -= vol;
					}
					if (type == 'buy') {
						currencyAdjustments['USD'] -= (price * vol);
					}
				}
			}
			console.log("Kraken Balance adjustments are: ", currencyAdjustments);
		}
		kraken = new KrakenAPI(key, secret);
		kraken.api('Balance', null, (err, balances) => {
			if (err || !balances) {
				console.log("DID NOT GET KRAKEN BALANCES", err);
			} else {
				console.log("Kraken Balance result:", balances);
				AccountInfo.saveBalance(exchangeName, "USD", balances.result.ZUSD ? +balances.result.ZUSD + currencyAdjustments["USD"] : 0);
				AccountInfo.saveBalance(exchangeName, "BCH", balances.result.BCH ? +balances.result.BCH + currencyAdjustments["BCH"] : 0);
				AccountInfo.saveBalance(exchangeName, "BTC", balances.result.XXBT ? +balances.result.XXBT + currencyAdjustments["XBT"] : 0);
				AccountInfo.saveBalance(exchangeName, "ETH", balances.result.XETH ? +balances.result.XETH + currencyAdjustments["ETH"] : 0);
				AccountInfo.saveBalance(exchangeName, "LTC", balances.result.XLTC ? +balances.result.XLTC + currencyAdjustments["LTC"] : 0);
				AccountInfo.saveBalance(exchangeName, "XRP", balances.result.XXRP ? +balances.result.XXRP + currencyAdjustments["XRP"] : 0);
			}
			return;
		});
	});
});

function reconcileBuys() {
	var kraken = new KrakenAPI(key, secret);
	Recommendation.findAll({
		where: {
			buyExchangeName: "Kraken",
			buyResultStatus: null
		}
	}).then((recommendations) => {
		var txids = [];
		var num = 0;
		recommendations.forEach((recommendation) => {
			if (++num < 20 && recommendation.buyTransactionID && recommendation.buyTransactionID.substr(0, 5) != 'ERROR') {
				txids.push(recommendation.buyTransactionID);
			}
		});
		if (txids.length > 0) {
			console.log("Reconciling Kraken buy transaction id's:", txids.toString());
			try {
				kraken.api('QueryOrders', {
					txid: txids.toString()
				}, (err, res) => {
					if (err) {
						console.log("DID NOT get order on Kraken", err);
					} else {
						var trades = res.result;
						recommendations.map((rec) => {
							if (trades[rec.buyTransactionID] && trades[rec.buyTransactionID].status == "closed") {
								AccountInfo.reconcileOrder("Kraken", rec.buyTransactionID, trades[rec.buyTransactionID].cost, trades[rec.buyTransactionID].fee);
							}
						});
					}
				});
			} catch (err) {
				console.log("UH OH.", err);
			}
		}
	});
}

function reconcileSells() {
	AccountInfo.sleep(1000); //Force a fresh nonce.
	var kraken = new KrakenAPI(key, secret);
	Recommendation.findAll({
		where: {
			sellExchangeName: "Kraken",
			sellResultStatus: null
		}
	}).then((recommendations) => {
		var txids = [];
		var num = 0;
		recommendations.forEach((recommendation) => {
			if (++num < 20 && recommendation.sellTransactionID && recommendation.sellTransactionID.substr(0, 5) != 'ERROR') {
				txids.push(recommendation.sellTransactionID);
			}
		});
		if (txids.length > 0) {
			console.log("Reconciling Kraken sell transaction id's:", txids.toString());
			try {
				kraken.api('QueryOrders', {
					txid: txids.toString()
				}, (err, res) => {
					if (err) {
						console.log("DID NOT get order on Kraken", err);
					} else {
						var trades = res.result;
						recommendations.map((rec) => {
							if (trades[rec.sellTransactionID] && trades[rec.sellTransactionID].status == "closed") {
								AccountInfo.reconcileOrder("Kraken", rec.sellTransactionID, trades[rec.sellTransactionID].cost, trades[rec.sellTransactionID].fee);
							}
						});
					}
				});
			} catch (err) {
				console.log("UH OH.", err);
			}
		}
	});
}

function KrakenAPI(key, secret, otp) {
	// Adapted from the official repo to change timeout and nonce generation
	var self = this;
	var config = {
		url: 'https://api.kraken.com',
		version: '0',
		key: key,
		secret: secret,
		otp: otp,
		timeoutMS: 20000
	};

	function api(method, params, callback) {
		var methods = {
			public: ['Time', 'Assets', 'AssetPairs', 'Ticker', 'Depth', 'Trades', 'Spread', 'OHLC'],
			private: ['Balance', 'TradeBalance', 'OpenOrders', 'ClosedOrders', 'QueryOrders', 'TradesHistory', 'QueryTrades', 'OpenPositions', 'Ledgers', 'QueryLedgers', 'TradeVolume', 'AddOrder', 'CancelOrder', 'DepositMethods', 'DepositAddresses', 'DepositStatus', 'WithdrawInfo', 'Withdraw', 'WithdrawStatus', 'WithdrawCancel']
		};
		if (methods.public.indexOf(method) !== -1) {
			return publicMethod(method, params, callback);
		} else if (methods.private.indexOf(method) !== -1) {
			return privateMethod(method, params, callback);
		} else {
			throw new Error(method + ' is not a valid API method.');
		}
	}

	function publicMethod(method, params, callback) {
		params = params || {};
		var path = '/' + config.version + '/public/' + method;
		var url = config.url + path;
		return rawRequest(url, {}, params, callback);
	}

	function privateMethod(method, params, callback) {
		params = params || {};
		var path = '/' + config.version + '/private/' + method;
		var url = config.url + path;
		params.nonce = AccountInfo.generateNonce();
		if (config.otp !== undefined) {
			params.otp = config.otp;
		}
		var signature = getMessageSignature(path, params, params.nonce);
		var headers = {
			'API-Key': config.key,
			'API-Sign': signature
		};
		return rawRequest(url, headers, params, callback);
	}

	function getMessageSignature(path, request, nonce) {
		var message = querystring.stringify(request);
		var secret = new Buffer(config.secret, 'base64');
		var hash = new crypto.createHash('sha256');
		var hmac = new crypto.createHmac('sha512', secret);
		var hash_digest = hash.update(nonce + message).digest('binary');
		var hmac_digest = hmac.update(path + hash_digest, 'binary').digest('base64');
		return hmac_digest;
	}

	function rawRequest(url, headers, params, callback) {
		// Set custom User-Agent string
		headers['User-Agent'] = 'Kraken Javascript API Client';
		var options = {
			url: url,
			method: 'POST',
			headers: headers,
			form: params,
			timeout: config.timeoutMS
		};
		var req = request.post(options, function (error, response, body) {
			if (typeof callback === 'function') {
				var data;
				if (error) {
					return callback.call(self, new Error('Error in server response: ' + JSON.stringify(error)), null);
				}
				try {
					data = JSON.parse(body);
				} catch (e) {
					return callback.call(self, new Error('Could not understand response from server: ' + body), null);
				}
				//If any errors occured, Kraken will give back an array with error strings under
				//the key "error". We should then propagate back the error message as a proper error.
				if (data.error && data.error.length) {
					var krakenError = null;
					data.error.forEach(function (element) {
						if (element.charAt(0) === "E") {
							krakenError = element.substr(1);
							return false;
						}
					});
					if (krakenError) {
						return callback.call(self, new Error('Kraken API returned error: ' + krakenError), null);
					}
				} else {
					return callback.call(self, null, data);
				}
			}
		});
		return req;
	}
	self.api = api;
	self.publicMethod = publicMethod;
	self.privateMethod = privateMethod;
}