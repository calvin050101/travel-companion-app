import React from "react";
import { getFlagURL, currencyCodes } from "../../utilities/currencyUtils";

const CurrencySelect = ({ selectedCurrency, handleCurrency }) => {
  return (
    <div className="currency-select">
      {/* Flag image */}
      <img
        key={selectedCurrency}
        src={getFlagURL(selectedCurrency)}
        alt={`Flag for ${selectedCurrency}`}
        className="currency-flag"
        onError={(e) => {
          e.target.onerror = null; // prevent infinite loop
          e.target.src = "https://flagsapi.com/UN/flat/64.png"; // fallback flag
        }}
      />

      {/* Currency dropdown */}
      <select
        onChange={handleCurrency}
        className="currency-dropdown"
        value={selectedCurrency}
        aria-label="Select currency"
      >
        {currencyCodes.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelect;