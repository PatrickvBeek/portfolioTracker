# Project Goal

This project contains a web app, written in react. It should help it's users to archive, visualize and analyze their stock investments. It does not allow to place orders or interact with their bank in any way. Instead, the user will enter their historic transactions manually. The application will keep a record of all transactions and derive data from it.

# Key Features

## First In First Out

The application adheres to the first in first out principle. This means if the user bought pieces of an asset in serval batches, then on an attempt to sell, they will first sell the pieces that they bought first (the oldest pieces in stock). This is a very important feature of the app, since this ensures the correct calculation of profit.

### Example

If a user buys 10 pieces of asset a1 for price p1 and later buys again 15 pieces of a1 for price p2 and finally sells 11 pieces of a1 for price p3, then all 10 pieces that were bought for price p1 will be sold. Additionally, 1 piece of the second batch will be sold, leaving 14 pieces in the second batch.

## Asset Registration

The user can use the sub page 'Assets' to manage, which assets the application knows of. All known assets will be shown in a table. Each asset can be registered with a ticker symbol, which will allow the application to retrieve only prices for that asset. Currently, the application supports Yahoo finance and AlphaVantage as data providers for online prices. To use Yahoo finance, the user must provide an API key to the application. The modal for entering the API key can be displayed by clicking an icon in the applications menu bar.

## Portfolio View

The sub page 'Portfolios' shows detailed derived information about a given portfolio. It has multiple features.

### Order / Dividend input Form

The user can add new transaction data through forms. Those transactions can be dividend payouts or regular orders (buy or sell). The order input form will validate if the input makes sense, e.g. the user should be prevented to enter an order which would sell more pieces of an asset then they have (at each point in time).

### Portfolio Summary

A small summary section, which presents glance-able key facts of the portfolio (like total value, and key performance metrics).

### Open / Closed Position Table

There are tables for open and closed positions of the user. Each table shows detailed information about the value, profit, etc. of each position. Each row corresponds to a single asset. Rows are expandable. In the expanded state, they show information about individual batches (see `First In First Out`).

### Activity List

A table of all transactions is shown to the user. Each transaction has a delete button, allowing the user to removing individual transactions that they entered earlier (e.g. because the realize that they made a mistake)

### Balances History Plot

The portfolio view offers a plot that renders the total value as well as the cash flow (meaning the amount that the user invested) as a function of time. A switch allows to change the display of this plot to 'Profit / Loss'. This mode does not show the absolute balances, but rather profit (which is current value - cash flow).

### Time Weighted Return Plot

The time weighted return of the portfolio is plotted as a function of time. This allows to easily compare the portfolio's performance to other portfolios, removing the influence of cash flows. The user can select a benchmark from a dropdown to compare the this portfolios's to any registered asset's performance, which has a ticker symbol defined.

### Multi-Portfolio support

The user can add multiple portfolios to this application and switch between them in the 'Portfolios' sub page.

## Dashboard

The Dashboard view summarizes the information about all the users portfolios by default, making it easy to see the total value and performance of all the user's investments. The user can exclude portfolios from this summary by clicking toggles on this sub page.
It shows the same Portfolio Summary, Balance History Plot and Time Weighted Return Plot as the individual portfolio view. The only difference is, that these instances contain information from potentially all portfolios (depending on the users selection of course).

## Import / Export

The application does not send any user data anywhere. All data that the user enters is saved temporarily in the browsers local storage. For long-term archiving the entered data, the user is offered an export button, which will generate a JSON file, containing all user data. This file will be offered as a download. Similarly, an import button will prompt the user to provide a previously exported file and re-import all relevant information

# Overall architecture

## Domain Model and Webapp

The webapp is strictly separated from the domain logic. The former is located under /frontend and the latter under /domain. This ensures that the domain logic files can focus on algorithmic and financial concerns and not be concerned with any rendering logic / UI state and so on. It can be tested independently and should never have a dependency to the web app.
The web app on the other hand depends on the domain module. It offloads involved derivation to this module and focuses more on react specific logic.

# Technologies

- Typescript for all implementation
- react for the UI components
  - MUI as component library
  - MUI components are styled via a global theme file theme.ts
  - Other styling via CSS modules (using LESS)
- Recharts for plotting
- Tanstack query for request state management / request caching
- Vitest as a test runner, never use Jest
- React Testing Library
  - UserEvent for simulating user interaction
- Radash for utils
- yarn as a package manager
