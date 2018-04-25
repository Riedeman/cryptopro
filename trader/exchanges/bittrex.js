var _ = require('lodash');
var moment = require('moment');
var axios = require("axios");
var AccountInfo = require('../accountInfo.js');
var Exchanges = require('crypto-exchange')

const config = require('../../config/config.json')["Bittrex"];
const key = config.key;
const secret = config.secret;

let exchange = new Exchanges.bittrex({
	key: key,
	secret: secret
});

exports.updatePrice = ((product) => {
	return axios.get(`https://bittrex.com/api/v1.1/public/getorderbook?market=${product.ticker}&type=both`).then((res) => {
		var data = res.data;
		product.bid = +data.result.buy[0].Rate;
		product.bidQty = +data.result.buy[0].Quantity;
		product.ask = +data.result.sell[0].Rate;
		product.askQty = +data.result.sell[0].Quantity;
		product.timestamp = data.timestamp;
		// console.log(`Saved ${product.ticker} on ${product.exchangeName} for ${product.ask} / ${product.bid}`);
		return product.save(); 
	}).catch((err) => {
		console.log(`Error getting ${product.ticker} on ${product.exchangeName}: ${err.toString()}`);
	});
});

exports.buy = ((recID, ticker, qty, price) => {
	exchange.buy(ticker, qty, price).then((res) => {
			AccountInfo.saveResultTransaction(recID,'buy',res.txid);
		})
		.catch((err) => {
			console.log("ERR buying: ", err);
			AccountInfo.saveResultTransaction(recID,'buy',`ERROR: ${err}`);
		});
});

exports.sell = ((recID, ticker, qty, price) => {
	exchange.sell(ticker, qty, price).then((res) => {
			AccountInfo.saveResultTransaction(recID,'sell',res.txid);
		})
		.catch((err) => {
			console.log("ERR selling: ", err);
			AccountInfo.saveResultTransaction(recID,'sell',`ERROR: ${err}`);
		});
});

exports.updateBalances = (() => {
	exchange.balances().then((balances) => {
			var exchangeName = 'Bittrex';
			AccountInfo.saveBalance(exchangeName, "BCH", balances.BCH ? balances.BCH.available : 0);
			AccountInfo.saveBalance(exchangeName, "BTC", balances.BTC ? balances.BTC.available : 0);
			AccountInfo.saveBalance(exchangeName, "ETH", balances.ETH ? balances.ETH.available : 0);
			AccountInfo.saveBalance(exchangeName, "LTC", balances.LTC ? balances.LTC.available : 0);
			AccountInfo.saveBalance(exchangeName, "USD", balances.USD ? balances.USD.available : 0);
			AccountInfo.saveBalance(exchangeName, "XRP", balances.XRP ? balances.XRP.available : 0);
			return;
		})
		.catch((err) => {
			console.log(`Error getting balance from GDAX`, err);
		})
});