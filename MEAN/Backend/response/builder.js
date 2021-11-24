class BuySellHistory {
    constructor(Type, Date, Amount, Shares, Price) {
        this.Type = Type;
        this.Date = Date;
        this.Amount = Amount;
        this.Shares = Shares;
        this.Price = Price;
    }
    toString() {
        return console.log(JSON.stringify(this));
    }
}

class Transactions {
    constructor(SecurityId, Type, Shares, Amount, BuySellHistory) {
        this.SecurityId = SecurityId;
        this.Type = Type;
        this.Shares = Shares;
        this.Amount = Amount;
        this.BuySellHistory = BuySellHistory;
    }

    build() {
        return new BuySellHistory(this.SecurityId, this.Type, this.Shares, this.Amount, this.BuySellHistory);
    }
}

class Portfolio { // builder factory pattern as per transactions.json format

    constructor(_Id, Name, TotalPortfolioValue, Transactions) {
        this._Id = _Id;
        this.Name = Name;
        this.TotalPortfolioValue = TotalPortfolioValue;
        this.Transactions = Transactions
    }

    build() {
        return new Transactions(this._Id, this.Name, this.TotalPortfolioValue, this.Transactions);
    }
}

module.exports = Portfolio;