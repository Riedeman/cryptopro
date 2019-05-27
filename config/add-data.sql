USE `cryptopro`;

INSERT INTO `Exchanges` (id, name, createdAt, updatedAt) VALUES 
(1, 'BitStamp',now(),now()),
(2, 'GDAX',now(),now()),
(3, 'Gemini',now(),now()),
(4, 'Kraken',now(),now());

INSERT INTO `Markets` (id, name, baseCurrency, marketCurrency, tradeActive, createdAt, updatedAt) VALUES 
(1,'BTC-USD','BTC','USD', 1, now(),now()),
(2,'ETH-USD','ETH','USD', 1, now(),now()),
(3,'LTC-USD','LTC','USD', 1, now(),now()),
(4,'BCH-USD','BCH','USD', 1, now(),now()),
(5,'XRP-USD','XRP','USD', 1, now(),now()),
(6,'BTC-LTC','BTC','LTC', 0, now(),now()),
(7,'BTC-XRP','BTC','XRP', 0, now(),now()),
(8,'BTC-ETH','BTC','ETH', 0, now(),now()),
(9,'BCH-BTC','BCH','BTC', 0, now(),now());

INSERT INTO `Products` (id, marketId, marketName, exchangeID, exchangeName, ticker, baseFee, createdAt, updatedAt) VALUES 
(1,1,'BTC-USD',1,'Bitstamp','btcusd',0.0025,now(),now()),
(2,1,'BTC-USD',2,'GDAX','BTC-USD',0.0025,now(),now()),
(3,1,'BTC-USD',3,'Gemini','btcusd',0.01,now(),now()),
(4,1,'BTC-USD',4,'Kraken','XXBTZUSD',0.0026,now(),now()),
(5,2,'ETH-USD',1,'Bitstamp','ethusd',0.0025,now(),now()),
(6,2,'ETH-USD',2,'GDAX','ETH-USD',0.0025,now(),now()),
(7,2,'ETH-USD',3,'Gemini','ethusd',0.01,now(),now()),
(8,2,'ETH-USD',4,'Kraken','XETHZUSD',0.0026,now(),now()),
(9,3,'LTC-USD',1,'Bitstamp','ltcusd',0.0025,now(),now()),
(10,3,'LTC-USD',2,'GDAX','LTC-USD',0.0025,now(),now()),
(11,3,'LTC-USD',4,'Kraken','XLTCZUSD',0.0026,now(),now()),
(12,4,'BCH-USD',1,'Bitstamp','bchusd',0.0025,now(),now()),
(13,4,'BCH-USD',2,'GDAX','BCH-USD',0.0025,now(),now()),
(14,4,'BCH-USD',4,'Kraken','BCHUSD',0.0026,now(),now()),
(15,5,'XRP-USD',1,'Bitstamp','xrpusd',0.0025,now(),now()),
(16,5,'XRP-USD',4,'Kraken','XXRPZUSD',0.0026,now(),now()),
(17,5,'XRP-USD',2,'GDAX','XRP-USD',0.0025,now(),now());

INSERT INTO `Balances` (id, exchangeID, exchangeName, currency, available, reserve, exposureRatio, liquidityRatio, createdAt, updatedAt) VALUES 
(1,1,'Bitstamp','BCH',0,0.0075,1,1,now(),now()),
(2,1,'Bitstamp','BTC',0,0.005,1,1,now(),now()),
(3,1,'Bitstamp','ETH',0,0.01,1,1,now(),now()),
(4,1,'Bitstamp','LTC',0,0.01,1,1,now(),now()),
(5,1,'Bitstamp','USD',0,15,1,1,now(),now()),
(6,1,'Bitstamp','XRP',0,10,1,1,now(),now()),
(7,2,'GDAX','BCH',0,0.0075,1,1,now(),now()),
(8,2,'GDAX','BTC',0,0.005,1,1,now(),now()),
(9,2,'GDAX','ETH',0,0.01,1,1,now(),now()),
(10,2,'GDAX','LTC',0,0.01,1,1,now(),now()),
(11,2,'GDAX','USD',0,15,1,1,now(),now()),
(12,3,'Gemini','BTC',0,0.005,1,1,now(),now()),
(13,3,'Gemini','ETH',0,0.01,1,1,now(),now()),
(14,3,'Gemini','USD',0,15,1,1,now(),now()),
(15,4,'Kraken','BCH',0,0.0075,1,1,now(),now()),
(16,4,'Kraken','BTC',0,0.005,1,1,now(),now()),
(17,4,'Kraken','ETH',0,0.01,1,1,now(),now()),
(18,4,'Kraken','LTC',0,0.01,1,1,now(),now()),
(19,4,'Kraken','USD',0,15,1,1,now(),now()),
(20,4,'Kraken','XRP',0,10,1,1,now(),now()),
(21,2,'GDAX','XRP',0,10,1,1,now(),now());

