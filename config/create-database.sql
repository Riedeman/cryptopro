CREATE DATABASE IF NOT EXISTS `cryptopro` ;
USE `cryptopro`;

CREATE USER 'cryptotrader'@'localhost' IDENTIFIED BY 'changeTHISpassword';
GRANT ALL PRIVILEGES ON cryptopro.* To 'cryptotrader'@'localhost';

-- ------------------------------------------------------
DROP TABLE IF EXISTS `Balances`;
CREATE TABLE `Balances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exchangeID` int(11) DEFAULT NULL,
  `exchangeName` varchar(255) DEFAULT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `available` float DEFAULT NULL,
  `reserve` float DEFAULT NULL,
  `exposureRatio` float DEFAULT NULL,
  `liquidityRatio` float DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `Exchanges`;
CREATE TABLE `Exchanges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `Markets`;
CREATE TABLE `Markets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `baseCurrency` varchar(255) DEFAULT NULL,
  `marketCurrency` varchar(255) DEFAULT NULL,
  `decimals` int(11) DEFAULT NULL,
  `tradeActive` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `Products`;
CREATE TABLE `Products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `marketID` int(11) DEFAULT NULL,
  `marketName` varchar(255) DEFAULT NULL,
  `exchangeID` int(11) DEFAULT NULL,
  `exchangeName` varchar(255) DEFAULT NULL,
  `ticker` varchar(255) DEFAULT NULL,
  `baseFee` float DEFAULT NULL,
  `timestamp` BIGINT DEFAULT NULL,
  `bid` float DEFAULT NULL,
  `bidQty` float DEFAULT NULL,
  `ask` float DEFAULT NULL,
  `askQty` float DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `Recommendations`;
CREATE TABLE `Recommendations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `marketID` int(11) DEFAULT NULL,
  `marketName` varchar(255) DEFAULT NULL,
  `sellExchangeID` int(11) DEFAULT NULL,
  `sellExchangeName` varchar(255) DEFAULT NULL,
  `sellTicker` varchar(255) DEFAULT NULL,
  `sellPrice` float DEFAULT NULL,
  `sellExchangeTotalQty` float DEFAULT NULL,
  `sellExchangeQty` float DEFAULT NULL,
  `sellCurrency` varchar(255) DEFAULT NULL,
  `sellBalanceTotalAvailable` float DEFAULT NULL,
  `sellBalanceAvailable` float DEFAULT NULL,
  `sellTradeableQty` float DEFAULT NULL,
  `sellTradeableCost` float DEFAULT NULL,
  `buyExchangeID` int(11) DEFAULT NULL,
  `buyExchangeName` varchar(255) DEFAULT NULL,
  `buyTicker` varchar(255) DEFAULT NULL,
  `buyPrice` float DEFAULT NULL,
  `buyExchangeTotalQty` float DEFAULT NULL,
  `buyExchangeQty` float DEFAULT NULL,
  `buyCurrency` varchar(255) DEFAULT NULL,
  `buyBalanceTotalAvailable` float DEFAULT NULL,
  `buyBalanceAvailable` float DEFAULT NULL,
  `buyTradeableQty` float DEFAULT NULL,
  `buyTradeableCost` float DEFAULT NULL,
  `actualTradeableQty` float DEFAULT NULL,
  `expectedSellCost` float DEFAULT NULL,
  `expectedBuyCost` float DEFAULT NULL,
  `expectedFeelessProfit` float DEFAULT NULL,
  `expectedSellFee` float DEFAULT NULL,
  `expectedBuyFee` float DEFAULT NULL,
  `expectedProfit` float DEFAULT NULL,
  `sellTransactionID` varchar(255) DEFAULT NULL,
  `buyTransactionID` varchar(255) DEFAULT NULL,
  `buyResultStatus` varchar(45) DEFAULT NULL,
  `buyResultFee` float DEFAULT '0',
  `buyResultCost` float DEFAULT '0',
  `sellResultStatus` varchar(45) DEFAULT NULL,
  `sellResultFee` float DEFAULT '0',
  `sellResultCost` float DEFAULT '0',
  `endResult` varchar(45) DEFAULT NULL,
  `actualProfit` float DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `Potentials`;
CREATE TABLE `Potentials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `marketID` int(11) DEFAULT NULL,
  `marketName` varchar(255) DEFAULT NULL,
  `sellExchangeID` int(11) DEFAULT NULL,
  `sellExchangeName` varchar(255) DEFAULT NULL,
  `sellTicker` varchar(255) DEFAULT NULL,
  `sellPrice` float DEFAULT NULL,
  `sellExchangeTotalQty` float DEFAULT NULL,
  `sellExchangeQty` float DEFAULT NULL,
  `sellCurrency` varchar(255) DEFAULT NULL,
  `sellBalanceTotalAvailable` float DEFAULT NULL,
  `sellBalanceAvailable` float DEFAULT NULL,
  `sellMaxTradeableQty` float DEFAULT NULL,
  `sellTradeableQty` float DEFAULT NULL,
  `sellTradeableCost` float DEFAULT NULL,
  `buyExchangeID` int(11) DEFAULT NULL,
  `buyExchangeName` varchar(255) DEFAULT NULL,
  `buyTicker` varchar(255) DEFAULT NULL,
  `buyPrice` float DEFAULT NULL,
  `buyExchangeTotalQty` float DEFAULT NULL,
  `buyExchangeQty` float DEFAULT NULL,
  `buyCurrency` varchar(255) DEFAULT NULL,
  `buyBalanceTotalAvailable` float DEFAULT NULL,
  `buyBalanceAvailable` float DEFAULT NULL,
  `buyMaxTradeableQty` float DEFAULT NULL,
  `buyTradeableQty` float DEFAULT NULL,
  `buyTradeableCost` float DEFAULT NULL,
  `potentialTradeableQty` float DEFAULT NULL,
  `potentialSellCost` float DEFAULT NULL,
  `potentialBuyCost` float DEFAULT NULL,
  `potentialFeelessProfit` float DEFAULT NULL,
  `potentialSellFee` float DEFAULT NULL,
  `potentialBuyFee` float DEFAULT NULL,
  `potentialProfit` float DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `Reorders`;
CREATE TABLE `Reorders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recommendationID` int(11) DEFAULT NULL,
  `side` varchar(255) DEFAULT NULL,
  `originalTxID` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `apiKey` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `lastLogin` datetime DEFAULT NULL,
  `status` enum('newbie','active','inactive') DEFAULT 'newbie',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/* Deny outdated prices */ ;
DELIMITER ;;
CREATE TRIGGER denyOldPrices BEFORE UPDATE ON Products
FOR EACH ROW
BEGIN
DECLARE msg varchar(255);
IF NEW.timestamp < OLD.timestamp THEN
  SET msg = CONCAT("Ignoring outdated price for ",NEW.marketName,". Existing: ",OLD.bid, " @ ", OLD.timestamp,", Attempt: ", NEW.bid, " @ ",NEW.timestamp);
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
END IF;
END;
;;
DELIMITER ;

/* Capture Potential Procedure */ ;
DELIMITER ;;
CREATE PROCEDURE `capture_potential`(in p_market_id int)
begin
declare v_rec_id int unsigned default 0;

INSERT INTO `Potentials`
(`marketID`,
`marketName`,
`sellExchangeID`,
`sellExchangeName`,
`sellTicker`,
`sellPrice`,
`sellExchangeTotalQty`,
`sellExchangeQty`,
`sellCurrency`,
`sellBalanceTotalAvailable`,
`sellBalanceAvailable`,
`sellTradeableQty`,
`sellTradeableCost`,
`buyExchangeID`,
`buyExchangeName`,
`buyTicker`,
`buyPrice`,
`buyExchangeTotalQty`,
`buyExchangeQty`,
`buyCurrency`,
`buyBalanceTotalAvailable`,
`buyBalanceAvailable`,
`buyTradeableQty`,
`buyTradeableCost`,
`potentialTradeableQty`,
`potentialSellCost`,
`potentialBuyCost`,
`potentialFeelessProfit`,
`potentialSellFee`,
`potentialBuyFee`,
`potentialProfit`,
`createdAt`,
`updatedAt`)
  (
  select 
	m.id as marketID,
	m.name as marketName,
	sellProduct.exchangeID as sellExchangeID,
	sellProduct.exchangeName as sellExchangeName,
	sellProduct.ticker as sellTicker,
	sellProduct.bid as sellPrice,
	sellProduct.bidQty as sellExchangeTotalQty,
	(sellProduct.bidQty * sellBalance.liquidityRatio) as sellExchangeQty,
    sellBalance.currency as sellCurrency,
    sellBalance.available as sellBalanceTotalAvailable,
    ((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio) as sellBalanceAvailable,
	LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio)) as sellTradeableQty,
	LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio)) * sellProduct.bid as sellTradeableCost,
	buyProduct.exchangeID as buyExchangeID,
	buyProduct.exchangeName as buyExchangeName,
	buyProduct.ticker as buyTicker,
	buyProduct.ask as buyPrice,
	buyProduct.askQty as buyExchangeTotalQty,
	(buyProduct.askQty * buyBalance.liquidityRatio) as buyExchangeQty,
    buyBalance.currency as buyCurrency,
    buyBalance.available as buyBalanceTotalAvailable,
    ((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio) as buyBalanceAvailable,
	LEAST(((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) 
    as buyTradeableQty,
	LEAST(((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * buyProduct.ask 
    as buyTradeableCost,
	LEAST(sellProduct.bidQty, buyProduct.askQty) as potentialTradeableQty,
    LEAST(sellProduct.bidQty, buyProduct.askQty) * sellProduct.bid  as potentialSellCost,
    LEAST(sellProduct.bidQty, buyProduct.askQty) * buyProduct.ask  as potentialBuyCost,
	LEAST(sellProduct.bidQty, buyProduct.askQty) * (sellProduct.bid - buyProduct.ask) as potentialFeelessProfit,
	LEAST(sellProduct.bidQty, buyProduct.askQty) * sellProduct.bid * sellProduct.baseFee as potentialSellFee,
    LEAST(sellProduct.bidQty, buyProduct.askQty) * buyProduct.ask * buyProduct.baseFee  as potentialBuyFee,
    
	LEAST(sellProduct.bidQty, buyProduct.askQty)*sellProduct.bid -
	LEAST(sellProduct.bidQty, buyProduct.askQty)*buyProduct.ask -
    LEAST(sellProduct.bidQty, buyProduct.askQty)*sellProduct.bid * sellProduct.baseFee -
    LEAST(sellProduct.bidQty, buyProduct.askQty)*buyProduct.ask * buyProduct.baseFee
    as potentialProfit,
    now(),now()
    
from  Markets m
JOIN Products sellProduct on m.id = sellProduct.marketID and sellProduct.updatedAt > ADDDATE(NOW(), INTERVAL -2 SECOND)
JOIN Balances sellBalance on sellBalance.exchangeID = sellProduct.exchangeID and sellBalance.currency = m.baseCurrency
JOIN Products buyProduct on m.id = buyProduct.marketID and buyProduct.updatedAt > ADDDATE(NOW(), INTERVAL -2 SECOND)
JOIN Balances buyBalance on buyBalance.exchangeID = buyProduct.exchangeID and buyBalance.currency = m.marketCurrency
where m.id = p_market_id
and sellProduct.exchangeID != buyProduct.exchangeID
and 
	LEAST(sellProduct.bidQty, buyProduct.askQty)*sellProduct.bid -
	LEAST(sellProduct.bidQty, buyProduct.askQty)*buyProduct.ask -
    LEAST(sellProduct.bidQty, buyProduct.askQty)*sellProduct.bid * sellProduct.baseFee -
    LEAST(sellProduct.bidQty, buyProduct.askQty)*buyProduct.ask * buyProduct.baseFee
    > 0.10 -- Must be reasonably profitable.
    
    ORDER BY
	LEAST(sellProduct.bidQty, buyProduct.askQty)*sellProduct.bid -
	LEAST(sellProduct.bidQty, buyProduct.askQty)*buyProduct.ask -
    LEAST(sellProduct.bidQty, buyProduct.askQty)*sellProduct.bid * sellProduct.baseFee -
    LEAST(sellProduct.bidQty, buyProduct.askQty)*buyProduct.ask * buyProduct.baseFee

DESC

limit 1
    );

IF(ROW_COUNT() >  0) THEN
	set v_rec_id = last_insert_id();
	select * from Potentials where id = v_rec_id;
ELSE
	select * from Potentials where id = -1;
END IF;
end ;;
DELIMITER ;

/* Trade Recommendation Maker */ ;
DELIMITER ;;
CREATE PROCEDURE `make_recommendation`(in p_market_id int)
begin
declare v_rec_id int unsigned default 0;

INSERT INTO `Recommendations`
(`marketID`,
`marketName`,
`sellExchangeID`,
`sellExchangeName`,
`sellTicker`,
`sellPrice`,
`sellExchangeTotalQty`,
`sellExchangeQty`,
`sellCurrency`,
`sellBalanceTotalAvailable`,
`sellBalanceAvailable`,
`sellTradeableQty`,
`sellTradeableCost`,
`buyExchangeID`,
`buyExchangeName`,
`buyTicker`,
`buyPrice`,
`buyExchangeTotalQty`,
`buyExchangeQty`,
`buyCurrency`,
`buyBalanceTotalAvailable`,
`buyBalanceAvailable`,
`buyTradeableQty`,
`buyTradeableCost`,
`actualTradeableQty`,
`expectedSellCost`,
`expectedBuyCost`,
`expectedFeelessProfit`,
`expectedSellFee`,
`expectedBuyFee`,
`expectedProfit`,
`createdAt`,
`updatedAt`)
  (select 
	m.id as marketID,
	m.name as marketName,
	sellProduct.exchangeID as sellExchangeID,
	sellProduct.exchangeName as sellExchangeName,
	sellProduct.ticker as sellTicker,
	sellProduct.bid as sellPrice,
	sellProduct.bidQty as sellExchangeTotalQty,
	(sellProduct.bidQty * sellBalance.liquidityRatio) as sellExchangeQty,
    sellBalance.currency as sellCurrency,
    sellBalance.available as sellBalanceTotalAvailable,
    ((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio) as sellBalanceAvailable,
	LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio)) as sellTradeableQty,
	LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio)) * sellProduct.bid as sellTradeableCost,
	buyProduct.exchangeID as buyExchangeID,
	buyProduct.exchangeName as buyExchangeName,
	buyProduct.ticker as buyTicker,
	buyProduct.ask as buyPrice,
	buyProduct.askQty as buyExchangeTotalQty,
	(buyProduct.askQty * buyBalance.liquidityRatio) as buyExchangeQty,
    buyBalance.currency as buyCurrency,
    buyBalance.available as buyBalanceTotalAvailable,
    ((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio) as buyBalanceAvailable,
	LEAST(((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) 
    as buyTradeableQty,
	LEAST(((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * buyProduct.ask 
    as buyTradeableCost,
    LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio),
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
        ((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
        (buyProduct.askQty * buyBalance.liquidityRatio)) 
	as actualTradeableQty,
    LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio),
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * sellProduct.bid 
    as expectedSellCost,
    LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * buyProduct.ask 
    as expectedBuyCost,

    (LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * sellProduct.bid) -
	(LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * buyProduct.ask) 
    as expectedFeelessProfit,

	LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * sellProduct.bid * sellProduct.baseFee 
    as expectedSellFee,
    LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * buyProduct.ask * buyProduct.baseFee 
    as expectedBuyFee,
    
	((LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * sellProduct.bid) - -- actualSellCost minus actualBuyCost
    (LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * buyProduct.ask)) -  -- Feeless profit
    (LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * sellProduct.bid * sellProduct.baseFee) - -- sell fees
    (LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * buyProduct.ask * buyProduct.baseFee) -- buy fees
    as expectedProfit,
    now(),now()
    
from  Markets m
JOIN Products sellProduct on m.id = sellProduct.marketID and sellProduct.updatedAt > ADDDATE(NOW(), INTERVAL -2 SECOND)
JOIN Balances sellBalance on sellBalance.exchangeID = sellProduct.exchangeID and sellBalance.currency = m.baseCurrency
JOIN Products buyProduct on m.id = buyProduct.marketID and buyProduct.updatedAt > ADDDATE(NOW(), INTERVAL -2 SECOND)
JOIN Balances buyBalance on buyBalance.exchangeID = buyProduct.exchangeID and buyBalance.currency = m.marketCurrency
where m.id = p_market_id
and sellProduct.exchangeID != buyProduct.exchangeID
and LEAST(((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
	(buyProduct.askQty * buyBalance.liquidityRatio)) > 0 -- buyTradeableQty
and LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
	(sellProduct.bidQty * sellBalance.liquidityRatio)) > 0 -- sellTradeableQty

and LEAST(
		(LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio),
			(sellProduct.bidQty * sellBalance.liquidityRatio), 
			((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
			(buyProduct.askQty * buyBalance.liquidityRatio)) * sellProduct.bid),
		(LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
			(sellProduct.bidQty * sellBalance.liquidityRatio), 
			((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
			(buyProduct.askQty * buyBalance.liquidityRatio)) * buyProduct.ask)
		) > 25 -- Sell/Buy total must be > $25
        
and ((LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * sellProduct.bid) - -- expectedSellCost minus expectedBuyCost
    (LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * buyProduct.ask)) -  -- Feeless profit
    (LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * sellProduct.bid * sellProduct.baseFee) - -- sell fees
    (LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * buyProduct.ask * buyProduct.baseFee) -- buy fees
    > 0.10 -- Must be reasonably profitable.
    
    ORDER BY

	((LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * sellProduct.bid) - -- expectedSellCost minus expectedBuyCost
    (LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * buyProduct.ask)) -  -- Feeless profit
    (LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * sellProduct.bid * sellProduct.baseFee) - -- sell fees
    (LEAST(((sellBalance.available - sellBalance.reserve) * sellBalance.exposureRatio), 
		(sellProduct.bidQty * sellBalance.liquidityRatio), 
		((buyBalance.available - buyBalance.reserve) * buyBalance.exposureRatio)/buyProduct.ask, 
		(buyProduct.askQty * buyBalance.liquidityRatio)) * buyProduct.ask * buyProduct.baseFee) -- buy fees

DESC

limit 1

    );

IF(ROW_COUNT() >  0) THEN
	set v_rec_id = last_insert_id();
	select * from Recommendations where id = v_rec_id;
ELSE
	select * from Recommendations where id = -1;
END IF;
end ;;
DELIMITER ;

/* Metrics Reporting Procedure */ ;
DELIMITER ;;
CREATE PROCEDURE `report_metrics`()
begin

select * from Balances
where available >0
order by currency!='USD', currency DESC, available desc;

select p.exchangeName,
sum(b.available * p.bid) Crypto,
bUSD.available as USD,
sum(b.available * p.bid) + max(bUSD.available) as Total
from Balances b 
join Products p on b.exchangeID = p.exchangeID 
	AND b.currency = LEFT(p.marketName,3) 
	AND RIGHT(p.marketName,3) = 'USD'
join Balances bUSD on b.exchangeID = bUSD.exchangeID and bUSD.currency = 'USD'
group by p.exchangeName,
bUSD.available;

SELECT 'USD' as currency, sum(available) as quantity, sum(available) as value from Balances where currency = 'USD'
UNION select 
b.currency, sum(b.available), sum(b.available * p.bid) from Balances b 
join Products p on b.exchangeID = p.exchangeID AND b.currency = LEFT(p.marketName,3) 
	AND RIGHT(p.marketName,3) = 'USD'
group by b.currency;

select r.buyExchangeName, r.sellExchangeName, r.buyPrice, r.sellPrice, 
r.actualTradeableQty qty, 
actualProfit,
r.expectedProfit, r.expectedBuyCost cost, r.* 
from Recommendations r 
order by id desc;

select 'Trades' as KPI, count(*) as Amount from Recommendations
UNION select 'Unresolved Trades', count(*) from Recommendations where buyResultStatus != 'filled' or sellResultStatus != 'filled' or buyResultStatus IS NULL or sellResultStatus IS NULL
UNION select '30-day Profit', sum(actualProfit) from Recommendations where buyResultStatus = 'filled' and sellResultStatus = 'filled' and createdAt >  DATE_SUB(now(), INTERVAL 30 DAY)
UNION select '30-day Volume', sum(expectedBuyCost)+sum(expectedSellCost) from Recommendations where createdAt >  DATE_SUB(now(), INTERVAL 30 DAY)
UNION select 'Avg. Trade', sum(expectedBuyCost)/count(*) from Recommendations
UNION select 'Avg. Profit', sum(actualProfit)/count(*) from Recommendations
UNION select 'Total Volume', sum(expectedBuyCost)+sum(expectedSellCost) from Recommendations
UNION select 'Trades Missed', count(*) from Potentials
UNION select 'Expected Fees', sum(expectedBuyFee + expectedSellFee) from Recommendations
UNION select 'Expected Profit', sum(expectedProfit) from Recommendations
UNION select 'Actual Fees', sum(buyResultFee + sellResultFee) from Recommendations where buyResultStatus = 'filled' and sellResultStatus = 'filled'
UNION select 'Actual Profit', sum(actualProfit) from Recommendations where buyResultStatus = 'filled' and sellResultStatus = 'filled'
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
    AND b.exchangeID = sellOpen.sellExchangeID AND sellOpen.sellResultStatus is null 
  left join Recommendations buyOpen on b.currency = LEFT(buyOpen.marketName,3)
    AND b.exchangeID = buyOpen.buyExchangeID AND buyOpen.buyResultStatus is null);

end ;;
DELIMITER ;
