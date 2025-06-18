import React from 'react';
import Currency from '../PageComponents/Currency/Currency'; // Corrected relative path
import '../PageComponents/Currency/Currency.css'; // Scoped styles specific to Currency
import FormHeader from './FormStyles/FormHeader';

const CurrencyPage = () => {
  return (
    <div className="currency-page"> {/* Scoped wrapper to prevent global CSS leak */}
      <FormHeader />
      <div className="currency-content">
        <h1 className="currency-title">Currency Converter</h1>
        <Currency />
      </div>
    </div>
  );
};

export default CurrencyPage;