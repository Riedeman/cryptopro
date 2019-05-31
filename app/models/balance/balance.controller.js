var Balance = require('../sequelize.js').Balance;
var _ = require('lodash');
var moment = require('moment');

//Balances
exports.getAll = (req, res) => {
	var query = `select * from Balances where available > 0 order by exchangeName, currency`;
	Balance.sequelize.query(query).spread((results) => {
		res.json(results);
	});
}

// Liquidation value by currency
exports.byCurrency = (req, res) => {
	var query = `SELECT b.currency,
			SUM(b.available + coalesce(sellOpen.actualTradeableQty, 0)) as totalAvailable,
			SUM(((b.available + coalesce(sellOpen.actualTradeableQty, 0)) * p.bid) + coalesce(buyOpen.expectedBuyCost, 0)) as liquidationValue
			FROM Balances b 
			JOIN Products p on b.exchangeID = p.exchangeID 
				AND b.currency = LEFT(p.marketName,3) 
				AND RIGHT(p.marketName,3) = 'USD'
			LEFT JOIN Recommendations sellOpen on b.currency = LEFT(sellOpen.marketName,3)
				AND b.exchangeID = sellOpen.sellExchangeID AND sellOpen.sellResultStatus is null AND sellOpen.sellTransactionID is not null
			LEFT JOIN Recommendations buyOpen on b.currency = LEFT(buyOpen.marketName,3)
				AND b.exchangeID = buyOpen.buyExchangeID AND buyOpen.buyResultStatus is null AND buyOpen.buyTransactionID is not null
			WHERE ((b.available + coalesce(sellOpen.actualTradeableQty, 0)) * p.bid) + coalesce(buyOpen.expectedBuyCost, 0) > 0
		GROUP BY b.currency
		UNION
		SELECT b.currency, SUM(b.available), SUM(b.available)
		FROM Balances b where currency = 'USD' AND available > 0
				GROUP BY b.currency
		ORDER BY 1,2`;
	Balance.sequelize.query(query).spread((results) => {
		res.json(results);
	});
}

exports.byExchange = (req, res) => {
	var query = `SELECT b.exchangeName,
		SUM(((b.available + coalesce(sellOpen.actualTradeableQty, 0)) * p.bid) + coalesce(buyOpen.expectedBuyCost, 0)) +
		(SELECT usd.available from Balances usd where currency = 'USD' AND usd.exchangeName = b.exchangeName) as liquidationValue
		FROM Balances b 
		JOIN Products p on b.exchangeID = p.exchangeID 
			AND b.currency = LEFT(p.marketName,3) 
			AND RIGHT(p.marketName,3) = 'USD'
		LEFT JOIN Recommendations sellOpen on b.currency = LEFT(sellOpen.marketName,3)
			AND b.exchangeID = sellOpen.sellExchangeID AND sellOpen.sellResultStatus is null AND sellOpen.sellTransactionID is not null
		LEFT JOIN Recommendations buyOpen on b.currency = LEFT(buyOpen.marketName,3)
			AND b.exchangeID = buyOpen.buyExchangeID AND buyOpen.buyResultStatus is null AND buyOpen.buyTransactionID is not null
		WHERE ((b.available + coalesce(sellOpen.actualTradeableQty, 0)) * p.bid) + coalesce(buyOpen.expectedBuyCost, 0) > 0
		GROUP BY b.exchangeName`
	Balance.sequelize.query(query).spread((results) => {
		res.json(results);
	});
}

exports.kpis = (req, res) => {
	//TODO: Fix this and create_database sql with one from server.
	var query = `select 'Trades' as KPI, count(*) as Amount from Recommendations
		UNION select 'Unresolved Trades', count(*) from Recommendations where buyResultStatus != 'filled' or sellResultStatus != 'filled' or buyResultStatus IS NULL or sellResultStatus IS NULL
		UNION select '30-day Profit', sum(actualProfit) from Recommendations where buyResultStatus = 'filled' and sellResultStatus = 'filled' and createdAt >  DATE_SUB(now(), INTERVAL 30 DAY)
		UNION select '30-day Volume', sum(expectedBuyCost)+sum(expectedSellCost) from Recommendations where createdAt >  DATE_SUB(now(), INTERVAL 30 DAY)
		UNION select 'Avg. Trade', sum(expectedBuyCost)/count(*) from Recommendations
		UNION select 'Avg. Profit', sum(actualProfit)/count(*) from Recommendations
		UNION select 'Total Volume', sum(expectedBuyCost)+sum(expectedSellCost) from Recommendations
		UNION select 'Trades Missed', max(id) from Potentials
		UNION select 'Expected Fees', sum(expectedBuyFee + expectedSellFee) from Recommendations
		UNION select 'Expected Profit', sum(expectedProfit) from Recommendations
		UNION select 'Actual Fees', sum(buyResultFee + sellResultFee) from Recommendations
		UNION select 'Actual Profit', sum(actualProfit) from Recommendations
		UNION select 'Fees bps', sum(buyResultFee + sellResultFee)/sum(expectedBuyCost + expectedSellCost) * 10000 from Recommendations 
		UNION select 'Profit bps', sum(actualProfit)/sum(expectedBuyCost + expectedSellCost) * 10000 from Recommendations
		UNION select 'USD Available', sum(available) from Balances where currency = 'USD'
		UNION select 'Liquidation Value', (select 
		sum((b.available + coalesce(sellOpen.actualTradeableQty, 0)) * p.bid) 
		+(select sum(available) from Balances where currency = 'USD')
		+(coalesce(sum(buyOpen.expectedBuyCost), 0))
		as value 
		from Balances b 
		join Products p on b.exchangeID = p.exchangeID 
			AND b.currency = LEFT(p.marketName,3) 
			AND RIGHT(p.marketName,3) = 'USD'
		left join Recommendations sellOpen on b.currency = LEFT(sellOpen.marketName,3)
			AND b.exchangeID = sellOpen.sellExchangeID AND sellOpen.sellResultStatus is null AND sellOpen.sellTransactionID is not null
		left join Recommendations buyOpen on b.currency = LEFT(buyOpen.marketName,3)
			AND b.exchangeID = buyOpen.buyExchangeID AND buyOpen.buyResultStatus is null AND buyOpen.buyTransactionID is not null);`;
	// console.log("------------query is: ", query);
	Balance.sequelize.query(query).spread((results) => {
		res.json(results);
	});
}