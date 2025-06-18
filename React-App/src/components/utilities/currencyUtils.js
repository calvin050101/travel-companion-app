export const currencyToCountryCode = {
  MYR: "MY",
  USD: "US",
  EUR: "DE",
  GBP: "GB",
  AUD: "AU",
  CAD: "CA",
  NZD: "NZ",
  JPY: "JP",
  CNY: "CN",
  INR: "IN",
  XOF: "SN",
  XAF: "CM",
  XCD: "AG",
  XPF: "PF",
  FOK: "FO",
  GGP: "GG",
  IMP: "IM",
  JEP: "JE",
  SHP: "SH",
  SLE: "SL",
  SSP: "SS",
  STN: "ST",
  TVD: "TV",
  XAU: "UN",
  XAG: "UN",
  XPT: "UN",
  XPD: "UN",
};

export const currencyCodes = [
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL",
  "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY",
  "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP",
  "ERN", "ETB", "EUR", "FJD", "FKP", "FOK", "GBP", "GEL", "GGP", "GHS",
  "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF",
  "IDR", "ILS", "IMP", "INR", "IQD", "IRR", "ISK", "JEP", "JMD", "JOD",
  "JPY", "KES", "KGS", "KHR", "KID", "KMF", "KRW", "KWD", "KYD", "KZT",
  "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD",
  "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN",
  "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK",
  "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR",
  "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLE", "SLL", "SOS", "SRD",
  "SSP", "STN", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY",
  "TTD", "TVD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VES",
  "VND", "VUV", "WST", "XAF", "XCD", "XOF", "XPF", "YER", "ZAR", "ZMW",
  "ZWL"
];


export const getExchangeRate = async (fromCurrency, toCurrency, amount = 1) => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/currency/exchange-rate?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Something went wrong",
    };
  }
};

export const getFlagURL = (currencyCode) => {
  const countryCode = currencyToCountryCode[currencyCode] || currencyCode.substring(0, 2).toUpperCase();
  return `https://flagsapi.com/${countryCode}/flat/64.png`;
};