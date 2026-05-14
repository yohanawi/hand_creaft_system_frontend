export type CurrencyType = {
  country: string;
  code: string;
  symbol: string;
  flag: string;
  rate: number;
  locale: string;
};

export const currencies: CurrencyType[] = [
  {
    country: "Sri Lanka",
    code: "LKR",
    symbol: "Rs",
    flag: "🇱🇰",
    rate: 1,
    locale: "en-LK",
  },
  {
    country: "United States",
    code: "USD",
    symbol: "$",
    flag: "🇺🇸",
    rate: 0.0033,
    locale: "en-US",
  },
  {
    country: "United Kingdom",
    code: "GBP",
    symbol: "£",
    flag: "🇬🇧",
    rate: 0.0026,
    locale: "en-GB",
  },
  {
    country: "India",
    code: "INR",
    symbol: "₹",
    flag: "🇮🇳",
    rate: 0.28,
    locale: "en-IN",
  },
  {
    country: "Australia",
    code: "AUD",
    symbol: "AUD",
    flag: "🇦🇺",
    rate: 0.0051,
    locale: "en-AU",
  },
];

export const DEFAULT_CURRENCY = currencies[0];

const formatterCache = new Map<string, Intl.NumberFormat>();

const getNumberFormatter = (locale: string) => {
  const cacheKey = locale || "en-US";

  if (!formatterCache.has(cacheKey)) {
    formatterCache.set(
      cacheKey,
      new Intl.NumberFormat(cacheKey, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
  }

  return formatterCache.get(cacheKey)!;
};

export const convertPrice = (price: number, rate: number) =>
  Number((Number(price || 0) * rate).toFixed(2));

export const formatPrice = (
  price: number,
  currencyOrSymbol: CurrencyType | string,
) => {
  const currency =
    typeof currencyOrSymbol === "string"
      ? { symbol: currencyOrSymbol, locale: DEFAULT_CURRENCY.locale }
      : currencyOrSymbol;

  const formattedAmount = getNumberFormatter(currency.locale).format(
    Number(price || 0),
  );

  return `${currency.symbol} ${formattedAmount}`;
};

export const formatConvertedPrice = (price: number, currency: CurrencyType) =>
  formatPrice(convertPrice(price, currency.rate), currency);
