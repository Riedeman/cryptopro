var _ = require('lodash');
var moment = require('moment');
var axios = require("axios");

exports.updatePrice = ((product) => {
	return axios.get(`https://api.bitfinex.com/v1/book/${product.ticker}`).then((res) => {
		var data = res.data;
		product.bid = +data.bids[0].price;
		product.bidQty = +data.bids[0].amount;
		product.ask = +data.asks[0].price;
		product.askQty = +data.asks[0].amount;
		product.timestamp = data.bids[0].timestamp;
		// console.log(`Saved ${product.ticker} on ${product.exchangeName} for ${product.ask} / ${product.bid}`);
		return product.save();
	}).catch((err) => {
		//They have a tight rate limit for API calls. Websocket is their preferred method
		// console.log(`Error getting ${product.ticker} on ${product.exchangeName}: ${err.toString()}`);
	});
});