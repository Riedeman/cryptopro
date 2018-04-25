var _ = require('lodash');
var moment = require('moment');
var axios = require("axios");

exports.updatePrice = ((product) => {
	return axios.get(`https://www.cryptopia.co.nz/api/GetMarketOrders/${product.ticker.replace('/','_')}`).then((res) => {
		var data = res.data.Data;
		product.bid = product.ticker == '$$$/BTC' ? 1 / +data.Buy[0].Price : +data.Buy[0].Price;
		product.bidQty = +data.Buy[0].Volume;
		product.bid = product.ticker == '$$$/BTC' ? 1 / +data.Sell[0].Price : +data.Sell[0].Price;
		product.askQty = +data.Sell[0].Volume;
		// console.log(`Saved ${product.ticker} on ${product.exchangeName} for ${product.ask} / ${product.bid}`);
		return product.save();
	}).catch((err) => {
		console.log(`Error getting ${product.ticker} on ${product.exchangeName}: ${err.toString()}`);
	});
});