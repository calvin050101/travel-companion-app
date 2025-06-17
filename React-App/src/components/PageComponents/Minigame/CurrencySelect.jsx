import { getFlagURL, currencyCodes } from "../../utilities/currencyUtils";

const CurrencySelect = ({ selectedCurrency, handleCurrency }) => {
    return (
        <div className="currency-select">
            <img
                src={getFlagURL(selectedCurrency)}
                alt={`Flag for ${selectedCurrency}`}
                onError={(e) => { e.target.style.display = "none"; }}
            />
            <select
                onChange={handleCurrency}
                className="currency-dropdown"
                value={selectedCurrency}
            >
                {currencyCodes.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                ))}
            </select>
        </div>
    );
};

export default CurrencySelect;
