var moment = require('moment');
var Balances = require('./balances.js');
var TraderJoe = require('./traderJoe.js');
var Reorder = require('./reorder.js');
const config = require('../config/config.json');

if (config.makeRealTrades) {
	for (i = 0; i < 3; i++) {
		console.log("-----");
		console.log("WARNING : ACTUAL TRADING ENABLED - USE AT YOUR OWN RISK")
		console.log("-----");
	}
} else {
	console.log("-----");
	console.log("DEMO MODE - No actual trades will be made")
	console.log("-----");
}

console.log(`${moment().format("H:mm:ss.SS")} Let's go!`)
Balances.updateAllBalances();

var loop = 0;
var ticker = setInterval(runTicker, 3000);

function runTicker() {
	loop++;
	console.log(`${moment().format("H:mm:ss.SS")} =>  ${loop.toString().padEnd(loop.toString().length + loop%10, '.')}`);
	if (config.makeRealTrades) {
		if (loop % 100 == 0) { // Update balances regularly to catch any activity
			Balances.updateAllBalances();
		}
		if (config.enableReorders && loop % 300 == 3) {  // Reopen any flagged orders
			Reorder.reorder();
		}
		if (loop % 300 == 5) { // Reconcile buys occasionally
			Balances.reconcile("buy");
		}
		if (loop % 300 == 7) { // Reconcile sells after that to avoid nonce errors
			Balances.reconcile("sell");
		}
		if (loop % 300 == 10) { // Resolve the overall trades some time after that.
			Balances.resolve();
		}
	}
	console.log("-----");
	var foundTrade = TraderJoe.updateAll();
}