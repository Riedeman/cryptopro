var moment = require('moment');
var Balances = require('./trader/balances.js');
var TraderJoe = require('./trader/traderJoe.js');
var Reorder = require('./trader/reorder.js');
const config = require('./config/config.json');

if (config.makeRealTrades) {
	for (i = 0; i < 5; i++) {
		console.log("-----");
		console.log("WARNING : ACTUAL TRADING ENABLED - USE AT YOUR OWN RISK")
		console.log("-----");
	}
} else {
	console.log("-----");
	console.log("DEMO MODE - No actual trades will be made")
	console.log("-----");
}

if (config.capturePotential) {
	console.log("-----");
	console.log("MISSING POTENTIAL WILL BE CAPTURED")
	console.log("-----");
}

console.log(`${moment().format("H:mm:ss.SS")} Let's go!`)
Balances.updateAllBalances();

var loop = 0;
var ticker = setInterval(runTicker, 3000);

function runTicker() {
	loop++;
	console.log("-----");
	console.log(`${moment().format("H:mm:ss.SS")} =>  Price check ${loop.toString().padEnd(loop.toString().length + loop % 10, '.')}`);
	const resetEvery = 100;
	if (config.makeRealTrades) {
		if (loop % resetEvery == 0) { // Update balances regularly to catch any activity
			Balances.updateAllBalances();
		}
		if (config.enableReorders && loop % resetEvery == 2) { // Reopen any flagged orders
			Reorder.reorder();
		}
		if (loop % resetEvery == 3) { // Reconcile buys occasionally
			Balances.reconcile("buy");
		}
		if (loop % resetEvery == 4) { // Reconcile sells after that to avoid nonce errors
			Balances.reconcile("sell");
		}
		if (loop % resetEvery == 6) { // Resolve the overall trades some time after that.
			Balances.resolve();
		}
		if (loop % resetEvery >= 5) { // Check for profitable trades
			var foundTrade = TraderJoe.updateAll();
			console.log(".....");
		}
	}
}