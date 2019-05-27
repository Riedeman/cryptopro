var Balance = require('../app/models/sequelize.js').Balance;
var Recommendation = require('../app/models/sequelize.js').Recommendation;
var Bitstamp = require('./exchanges/bitstamp.js');
var Coinbase = require('./exchanges/coinbase.js');
var Kraken = require('./exchanges/kraken.js');

exports.updateAllBalances = () => {
	console.log("Clearing and getting balances");
	Balance.sequelize.query(`update Balances set available = 0`).then(() => {
		Bitstamp.updateBalancesAndFees();
		Kraken.updateBalances();
		Coinbase.updateBalances();
	});
}

exports.reconcile = (type) => {
	console.log(`Reconciling open ${type} orders`);
	Bitstamp.reconcile(type);
	Kraken.reconcile(type);
	Coinbase.reconcile(type);
}

exports.resolve = () => {
	console.log("Resolving any incomplete orders");
	Recommendation.findAll({
		where: {
			endResult: null,
			buyResultStatus: 'filled',
			sellResultStatus: 'filled'
		},
	}).then((recommendations) => {
		recommendations.map((rec) => {
			var endResult = 'A1';
			var buyMaker = rec.buyResultFee / rec.expectedBuyFee < .66 ? true : false;
			var sellMaker = rec.sellResultFee / rec.expectedSellFee < .66 ? true : false;
			endResult = !buyMaker && sellMaker ? 'A2' : endResult;
			endResult = buyMaker && !sellMaker ? 'A3' : endResult;
			endResult = buyMaker && sellMaker ? 'A4' : endResult;
			rec.endResult = endResult;
			rec.actualProfit = rec.sellResultCost - rec.buyResultCost - rec.sellResultFee - rec.buyResultFee;
			rec.save();
			console.log(`FULLY RECONCILED ${rec.id}: Cost ${rec.buyResultCost}, Result: ${endResult}, Profit: ${rec.actualProfit}`);
		});
	});
}