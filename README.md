# Cryptopro

### Introduction

Cryptopro by Arbos is a multi-currency, multi-exchange, multi-level arbitrage trading system.

### How it works

Cryptopro works by continuously checking prices for real and digital currencies across exchanges and when it detects an orderbook bid/ask difference across exchanges large enough to cover the required fees necessary to make the trades, it submits the appropriate buy and sell limit orders, records all relevant details and attempts to reconcile the final trading result to determine the actual profitability of the trade.

## Disclaimer

USE THIS SOFTWARE AT YOUR OWN RISK. YOU ARE RESPONSIBLE FOR YOUR OWN MONEY. PAST PERFORMANCE IS NOT NECESSARILY INDICATIVE OF FUTURE RESULTS.

THE AUTHORS AND ALL AFFILIATES ASSUME NO RESPONSIBILITY FOR YOUR TRADES OR TRADING RESULTS.

IF YOU ARE NOT COMFORTABLE WORKING WITH BOTH MYSQL AND NODE.JS YOU SHOULD NOT USE THIS SOFTWARE.

### Getting Started

There are multiple levels of arbitraging available from **Level 1: Spectator Mode** to **Level 4: OCD**. No account information is required to get started. The steps to get up and running are:

-   Install dependencies (Node and MySQL)
-   Create the database and data
-   Configure settings
-   **Level 1: Spectator Mode** - Capture arbitrage potential data only
-   **Level 2: Pseudo Mode** - Capture recommendations, make fake trades
-   **Level 3: Trading Mode** - Capture recommendations and make real trades
-   **Level 4: OCD Mode** (experts only) - Capture recommendations, make real trades, and follow along in the app

### Install Dependencies and Setup DB 
Example uses a clean debian 9 vm

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
sudo apt-get install mysql-server
sudo apt-get install git
git clone https://github.com/Riedeman/cryptopro
cd cryptopro
sudo mysql < config/create-database.sql
sudo mysql < config/add-data.sql
npm install
```

### Tables and Javascript Objects

Once the database is configured you should familiarize yourself with the tables and make sure to set the configuration values to the appropriate settings for your level of trading (see below). The tables (and corresponding JavaScript objects) are:

- **Markets**: BTC-USD, ETH-USD, LTC-USD, XRP-USD, etc.
- **Exchanges**: Bitstamp, GDAX, Gemini, Kraken
- **Products**: What a market is called on an exchange (e.g., BTC-USD on Bitstamp is "btcusd", but on Kraken, it's "XXBTZUSD") and the fees associated with it. Current bid/ask prices are updated frequently in this table.
- **Balances**: Stores available balances and trade quantity adjustment settings
- **Potentials**: Potential arbitrage opportunities captured, not accounting for user's available balances
- **Recommendations**: (Level 2+) If a profitable trade is found the details are captured in the Recommendations table. (Level 3+) Transactions details for buy/sell orders and order reconciliation data are also captured.
- **Users**: (Level 4) User information to allow you to follow your own trading using the mobile app.

### Configure Settings

Settings required to determine the profitability of a trade are stored in the database so calculations can be done quickly and are exchange and currency specific, they are:

- **Products.baseFee**: Your fee level for each market/exchange. *(0.0025 = 25bps)*
- **Balances.reserve**: How much of that currency on that exchange you will set aside before calculating the amount available to trade. Your available quantity may go slightly below the reserve amount due to the differences in rounding between exchanges when trades are made (see below).
- **Balances.exposureRatio**: Once the reserve is subtracted from your available balance, the maximum amount you can trade is your available quantity multiplied by the exposureRatio. 1 = 100%, .5 = 50%, 0 = 0% (no trading).
- **Balances.liquidityRatio**: To calculate the trade quantity, the minimum available volume for the orderbook bid/ask results is determined and then multiplied by the liquidityRatio. 1 = 100%, .5 = 50%, 0 = 0% (no trading).
- **Markets.tradeActive**: 1 = yes, 0 = no. Set tradeActive = 0 to shut off price checks and trading for that market.

The actual tradable quantity is determined in the stored procedure by the lowest of (simplified):

-   (Buy exchange available - Buy exchange reserve) * exposureRatio
-   (Sell exchange available - Sell exchange reserve) * exposureRatio
-   Buy exchange ask volume * liquidityRatio
-   Sell exchange bid volume * liquidityRatio

### Default Stored Procedure Values

The make_recommendation stored procedure is what determines if there are any profitable trades to make and if so records and returns the most profitable recommendation. Some values are hardcoded in there for speed and because they probably don't need to change once set. Change them at your own risk and for your own needs. They are: minimum profitability set to $0.10, minimum trade size set to $25, and last updated price cut-off threshold set at 2 seconds.  The capture_potential procedure has the same defaults, but can be changed separately from the trading rules for what-if scenarios.

### Notes on Rounding and Decimals

Each exchange has their own rounding rules and decimal formats that will affect the actual profitability, prices, and fees of trades. Cryptopro uses floating point numbers to store actual and estimated balances and results. The difference between estimated profits/fees and actual profits/fees is usually a matter of a fraction of a cent, inevitably in the exchange's favor. Plan accordingly.

### Configuration File Settings

Configuration settings that do not affect the profitability of a trade are stored in the config/config.json file and are *(defaults in italic)*:

- **capturePotential**  *(true)*: When true, it will check for any potential arbitrage opportunity, regardless of available balances and insert the details into the Potentials table. Note: This can be several thousand records a month, so manage storage space and/or clear out the data regularly.
- **makeRealTrades** *(false)*: **WARNING**: When true, will attempt to place buy/sell orders when profitable recommendations are made.
- **enableReorders** *(false)*: **WARNING**: When true, will attempt to replace any order marked for rebuy/resell (Recommendations.endResult). Useful for re-opening failed or canceled sides of a trade.
- **verbose** *(true)*: Just a simple flag to toggle logging of price updates/errors. It can get a little chatty.
- **database**: MySQL connection settings *(values from create-database.sql script)*
- **API credentials**  *(blank)*: Each exchange has a credentials section for their specific authentication criteria with at least an API Key and a Secret that you can get from their respective API settings pages. API Keys should always have only the minimum permissions necessary.  For Pseudo mode, the API Key you create will only need access to account balances. For Trading Mode, the API Key will also need to submit Limit Buy/Sell orders and get order histories to try to reconcile past trades. API Keys used by Cryptopro do not need and should not be given any permissions to withdraw/deposit/liquidate, place market orders or perform any wallet functions. Obviously keep your keys secure, always with the most minimal permissions, and make new ones if you think they've ever been compromised.
- **orderBookDepth** *(0)*: In addition to the API settings, you can set the orderBookDepth for each exchange depending on how deep you want to go into the orderbook to determine what price to use for that exchange. A setting of 0 is the tip of the orderbook (i.e, the best bid/ask prices). Increasing the value will reduce the risk of the trade not filling (since it will be from deeper in the orderbook), but it will also correspondingly reduce the number of trades possible. It's useful for higher-volatility, lower-volume exchanges. Adjust accordingly.

### Level 1 - Spectator Mode

Spectator mode will let you get a sense of how Cryptopro works before you have to give it any credentials or risk anything. It is a node script that checks the published orderbook prices every 3 seconds and saves the latest prices to the Products table. Once all prices for a market are updated, a stored procedure is called to find any profitable trades, and if so, saves the most profitable trade available to the Potentials table.

Remember, arbitraging only works when markets are behaving inefficiently enough to cover your fee levels. Most of the time, that's not the case. Which means most of the time, nothing exciting happens. Life is like that.

Configuration settings: [default configuration values]
To run: `node makeMoney`

### Level 2 - Pseudo Mode

Pseudo mode allows you to see what would happen if you were making trades using the balances available in your real accounts. Like Spectator mode, it checks regularly for the latest prices. But by using the available balances retrieved using your Pseudo Mode API Keys, it determines the appropriate trade quantity you would be able to make.  It updates the Balances table with the appropriate assumed amounts, including subtracting the expected fees. Unlike real trades, pseudo-trades have a guaranteed 100% success rate (because they're not real trades).

Configuration settings: Authentication info added to config file, makeRealTrades = false
To run: `node makeMoney`

### Level 3 - Trading Mode ::: REAL TRADING - USE AT YOUR OWN RISK

Trading mode will enable real-money arbitraging across exchanges. Like Pseudo mode, it gets the latest prices every 3 seconds and then checks for profitable trades. If it finds one, it will attempt to submit the respective buy and sell orders to the exchanges using the configured authentication credentials and will record the resulting transaction ID (or error) in the buyTranscationID or sellTransactionID field in Recommendations.  In addition, it will occasionally check the order status on the exchanges to determine if the order has been filled, and if so, update the resulting actual costs and fees and if both sides are closed, the actual profitability.

Configuration settings: Authentication info added to config file, makeRealTrades = true
To run: `node makeMoney`

### Level 4 - OCD: Obsessive Cryptocurrency Disorder (expert level only) (also, not free: $19.99) 

Android: https://play.google.com/store/apps/details?id=com.cleversystems.arbos.cryptocd
iOS: https://itunes.apple.com/us/app/crypt-ocd/id1393754470

Since querying database tables and watching a script do nothing most of the time isn't very exciting, there's now a way you can play along at home. It makes your data available via an API that you can connect directly to using the Crypt-OCD app. Regardless of the Level (1-3) of arbitrage you're doing, you can follow along in the app so you'll never have to wonder what's going on.

The OCD level works by making the data in your Cryptopro database available via an API which the Crypt-OCD app can then connect to and display. **Do not do this** unless you understand and can manage the consequences of hosting an API which will show your available balances and trades. If you're still not dissuaded, here are the steps to connect your data to the Crypt-OCD app:

1.  Add a user record to the Users table and give it an API key (roll your own key generator)
2.  Run `node showMeTheMoney` to make your data available via a REST API
3.  Make your REST API available via HTTP/HTTPS so your device can access it
4.  Purchase ($19.99), install, and run the Crypt-OCD app
	- Android: https://play.google.com/store/apps/details?id=com.cleversystems.arbos.cryptocd
	- iOS: https://itunes.apple.com/us/app/crypt-ocd/id1393754470
5.  In the Settings screen under Connect to My Data, enter the URL for your API and the API key you created in the User record in Step 1
6.  Use the app to watch your balances, trades, and all the action whenever you want

### Testing the API:

The API is read-only (default port: 8080), but it is still your private data, so take all appropriate precautions to secure it accordingly.  Once launched (`node showMeTheMoney`), you should be able to test it out by doing: 
`curl -X GET <your server>/api/kpis -H "x-api-key: <userapikey>" -L` 
with your details. Firewall configurations and access controls vary among hosting providers, so make sure yours are set appropriately so that the API URL is accessible from the device on which the app is installed. The app should inform you if it is unable to connect with the URL and API key provided.

### Handling Failures

Cryptopro uses asynchronous processes and stored procedures together to react as quickly as possible to any arbitrage opportunities it discovers. Despite that, sometimes markets move quickly away from the last orderbook buy/sell price causing an order to stay open until the market returns to that price point, or possibly forever. In that case, one side of the trade may get filled, but the other will be unresolved.  If you chose to close the order on the exchange instead of leaving it open, one of the "legs" of the trade will be unresolved.

This can also happen if errors are received while placing orders. Errors do happen. Especially at peak times. Especially with less reliable exchanges (*ahem...Kraken*). This can also cause a trade to have one leg unresolved.

See the All Possible Outcomes.pdf file for an explanation of how balances are affected by unresolved trades.

To help rectify this situation, you can resubmit either the buy or sell side of a trade by changing the Recommendations.endResult to 'rebuy' or 'resell' and setting the configuration file setting of enableReorders to true. The order should be picked up and resubmitted to the exchange the next time makeMoney.js checks for reorders. A record of the original transactionID will be stored in the Reorders table for archival purposes.

How you handle failures and unfilled trades will significantly affect your overall profitability. Cryptopro assumes orders get placed successfully (or are reopened in the event of an error) and stay open indefinitely until they are filled. Lengthy open order times will reduce the available tradable quantity and lower the overall number of trades it can make while the order remains open. It's also a bummer. If the market never returns to the missed price point, you will need an alternate risk-management strategy or plan (insurance, futures, knocking on wood, etc.) to account for the effects to your overall profitability.

One strategy is to cancel, then reopen trades as the market moves away from then back toward unfilled price points in order to have more available quantity to work with in the interim. This can be done manually (balances will be updated every 5 minutes or on a restart to reflect any changes). Or, if you're feeling especially clever, you can fork this project and extend the reorder.js reorder function to match your trading strategy to the latest prices in the Products table. 

Again, all of this is at your own risk.

### TLDR;
If you would like to use Cryptopro but are not comfortable with the technical requirements and would prefer a hosted or turn-key solution, please contact Arbos for pricing.