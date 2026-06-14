# Portfolio Tracker

A personal investment portfolio tracker. Users manage a library of assets and portfolios, record buy/sell orders and dividend payouts, and view performance metrics (realized/unrealized gains, time-weighted return, Monte Carlo forecasts).

## Language

**Portfolio**:
A named collection of orders and dividend payouts for one or more assets.
_Avoid_: account, position group

**Order**:
A buy or sell transaction for an asset at a given price, with fees and taxes.
_Avoid_: trade, transaction, purchase

**Dividend Payout**:
A dividend payment received for a holding, with per-share amount and taxes.
_Avoid_: dividend, dividend payment

**Activity**:
A polymorphic union of Order or DividendPayout — anything that affects a portfolio over time.
_Avoid_: event, entry

**Batch**:
An open or closed FIFO lot resulting from matching buy and sell orders. Open batches represent current holdings; closed batches represent realized positions.
_Avoid_: lot, position, holding

**Asset**:
A tradable security identified by ISIN, with an optional ticker symbol for price lookups.
_Avoid_: security, instrument, stock

**Asset Library**:
The user's collection of known assets, keyed by ISIN.
_Avoid_: asset list, instrument list

**Portfolio Library**:
The user's collection of portfolios, keyed by name.
_Avoid_: portfolio list

**UserData**:
The full persisted state: portfolio library, asset library, API keys, and metadata (including export version for migration).
_Avoid_: user state, app state

**Price Provider**:
An adapter that fetches price history for a ticker symbol (e.g. Yahoo Finance, AlphaVantage).
_Avoid_: price service, price API

**Price Baseline**:
The price at the start of a selected time range, used as the reference point for color-splitting an asset price chart (green above baseline, red below) and for computing return.
_Avoid_: base price, reference price

**Annualized Return**:
The mean of log returns over a period, annualized (×12). Derived from price history for a single asset, or from TWR history for a portfolio.
_Avoid_: total return, simple return

**Annualized Volatility**:
The standard deviation of log returns over a period, annualized (×√12). Derived from price history for a single asset, or from TWR history for a portfolio.
_Avoid_: sigma, risk

**Return/Volatility Ratio**:
Annualized return divided by annualized volatility. A dimensionless measure of risk-adjusted performance for a single asset, based on market price data alone.
_Avoid_: Sharpe ratio, risk-adjusted return

**Time-Weighted Return (TWR)**:
A portfolio return metric that neutralizes the effect of cash flows, computed from market value and cash flow history.

**GBM Forecast**:
A Monte Carlo simulation using Geometric Brownian Motion to project future portfolio values with confidence bands.

**Inflation Index**:
A time series of consumer price levels (e.g. German CPI), used to deflate nominal values into real values.
_Avoid_: CPI series, inflation data, inflation rate

**Real Return**:
A return metric that has been deflated by an inflation index, expressing purchasing-power gain rather than nominal gain.
_Avoid_: inflation-adjusted return, inflation-corrected return

## Workspace Structure

- **`domain/`** (`pt-domain`): Pure functional domain logic — no I/O, no React, no side effects. Types, operations (CRUD), and derivers (computed values).
- **`frontend/`**: React app. Consumes `pt-domain` via the `"pt-domain"` workspace alias. Owns state management, UI, and I/O (localStorage, price APIs).
