var _ = require('lodash');
var moment = require('moment');
var axios = require("axios");

exports.updatePrice = ((product) => {
	return axios.get(`https://bleutrade.com/api/v2/public/getorderbook?market=${product.ticker}&type=all&depth=2`).then((res) => {
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