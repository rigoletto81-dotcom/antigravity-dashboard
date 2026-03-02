/** Curated NASDAQ-100 universe for the stock scanner */

export interface StockInfo {
    ticker: string;
    name: string;
    sector: string;
}

export const STOCK_UNIVERSE: StockInfo[] = [
    { ticker: "AAPL", name: "Apple", sector: "Technology" },
    { ticker: "MSFT", name: "Microsoft", sector: "Technology" },
    { ticker: "NVDA", name: "NVIDIA", sector: "Semiconductors" },
    { ticker: "GOOGL", name: "Alphabet", sector: "Technology" },
    { ticker: "AMZN", name: "Amazon", sector: "Consumer" },
    { ticker: "META", name: "Meta Platforms", sector: "Technology" },
    { ticker: "TSLA", name: "Tesla", sector: "Automotive" },
    { ticker: "AVGO", name: "Broadcom", sector: "Semiconductors" },
    { ticker: "COST", name: "Costco", sector: "Consumer" },
    { ticker: "NFLX", name: "Netflix", sector: "Media" },
    { ticker: "AMD", name: "AMD", sector: "Semiconductors" },
    { ticker: "ADBE", name: "Adobe", sector: "Software" },
    { ticker: "CRM", name: "Salesforce", sector: "Software" },
    { ticker: "QCOM", name: "Qualcomm", sector: "Semiconductors" },
    { ticker: "INTC", name: "Intel", sector: "Semiconductors" },
    { ticker: "CSCO", name: "Cisco", sector: "Networking" },
    { ticker: "TXN", name: "Texas Instruments", sector: "Semiconductors" },
    { ticker: "ISRG", name: "Intuitive Surgical", sector: "Healthcare" },
    { ticker: "PANW", name: "Palo Alto Networks", sector: "Cybersecurity" },
    { ticker: "LRCX", name: "Lam Research", sector: "Semiconductors" },
    { ticker: "AMAT", name: "Applied Materials", sector: "Semiconductors" },
    { ticker: "ABNB", name: "Airbnb", sector: "Travel" },
    { ticker: "MELI", name: "MercadoLibre", sector: "E-Commerce" },
    { ticker: "CRWD", name: "CrowdStrike", sector: "Cybersecurity" },
    { ticker: "MRVL", name: "Marvell Technology", sector: "Semiconductors" },
    { ticker: "SNPS", name: "Synopsys", sector: "Software" },
    { ticker: "CDNS", name: "Cadence Design", sector: "Software" },
    { ticker: "FTNT", name: "Fortinet", sector: "Cybersecurity" },
    { ticker: "DDOG", name: "Datadog", sector: "Software" },
    { ticker: "COIN", name: "Coinbase", sector: "Fintech" },
];

