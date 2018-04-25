var _ = require('lodash');
var moment = require('moment');
var axios = require("axios");

exports.updatePrice = ((product) => {
	return axios.get(`https://www.okcoin.com/api/v1/depth.do?symbol=${product.ticker}`).then((res) => {
		var data = res.data;
		product.bid = +data.bids[0][0];
		product.bidQty = +data.bids[0][1];
		product.ask = +data.asks[data.asks.length-1][0];;
		product.askQty = +data.asks[data.asks.length-1][1];
		// console.log(`Saved ${product.ticker} on ${product.exchangeName} for ${product.ask} / ${product.bid}`);
		return product.save(); 
	}).catch((err) => {
		console.log(`Error getting ${product.ticker} on ${product.exchangeName}: ${err.toString()}`);
	});
});