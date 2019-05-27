var Balance = require('../app/models/sequelize.js').Balance;
var Product = require('../app/models/sequelize.js').Product;
var Recommendation = require('../app/models/sequelize.js').Recommendation;
var moment = require('moment');
var lastNonce = new Date().getTime();
var nonceIncrement = 0;
const config = require('../config/config.json');

exports.log = (txt) => {
	if (config.verbose) {
		console.log(txt);
	}
}

exports.reconcileOrder = (exchangeName, orderID, cost, fee) => {
	console.log(`Reconciling order ${exchangeName} ${orderID} cost ${cost}, fee ${fee}`);
	var buyQuery = `update Recommendations set buyResultStatus = 'filled', buyResultCost=${cost}, buyResultFee = ${fee} where buyExchangeName = '${exchangeName}' and buyTransactionID = '${orderID}'`;
	var sellQuery = `update Recommendations set sellResultStatus = 'filled', sellResultCost=${cost}, sellResultFee = ${fee} where sellExchangeName = '${exchangeName}' and sellTransactionID = '${orderID}'`;
	Balance.sequelize.query(buyQuery);
	Balance.sequelize.query(sellQuery);
}

exports.saveBalance = (exchangeName, currency, available) => {
	console.log(`Saving balance of ${available} ${currency} on ${exchangeName}`);
	var query = `update Balances set available = ${available} where exchangeName = '${exchangeName}' and currency = '${currency}'`;
	return Balance.sequelize.query(query);
}

exports.saveFee = (exchangeName, marketName, fee) => {
	console.log(`Saving fee of ${fee} ${marketName} on ${exchangeName}`);
	var query = `update Products set baseFee = ${fee} where exchangeName = '${exchangeName}' and marketName = '${marketName}'`;
	return Product.sequelize.query(query);
}

exports.saveResultTransaction = (recID, type, transactionID) => {
	var query = `update Recommendations set ${type == 'buy' ? 'buyTransactionID' : 'sellTransactionID'} = '${transactionID}'`;
	query += (transactionID.toString().substring(0, 5) == 'ERROR' && config.resubmitFailures) ? `, ${type == 'buy' ? "buyResultStatus='rebuy'" : "sellResultStatus='resell'"}` : '';
	query += ` where id = ${recID}`;
	console.log(`${moment().format("H:mm:ss.SS")}`, query);
	return Recommendation.sequelize.query(query);
}

exports.zeroBalances = (exchangeName) => {
	Balance.sequelize.query(`update Balances set available = 0 where exchangeName = '${exchangeName}'`);
	console.log(`CLEARED ALL ${exchangeName} BALANCES`);
}

exports.sleep = (miliseconds) => {
	var currentTime = new Date().getTime();
	while (currentTime + miliseconds >= new Date().getTime()) {}
}

exports.generateNonce = () => {
	var now = new Date().getTime();
	if (now !== lastNonce) {
		nonceIncrement = -1;
	}
	lastNonce = now;
	nonceIncrement++;
	var padding =
		nonceIncrement < 10 ? '000' :
		nonceIncrement < 100 ? '00' :
		nonceIncrement < 1000 ? '0' : '';
	var newNonce = now + padding + nonceIncrement;
	// console.log("New Nonce generated: ", newNonce);
	return newNonce;
}