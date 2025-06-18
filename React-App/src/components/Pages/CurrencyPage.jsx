import React from 'react';
import Currency from '../PageComponents/Currency/Currency'; // Corrected relative path
import '../PageComponents/Currency/Currency.css'; // Scoped styles specific to Minigame
import FormHeader from './FormStyles/FormHeader';

const MinigamePage = () => {
  return (
    <div className="minigame-page"> {/* Scoped wrapper to prevent global CSS leak */}
      <FormHeader />
      <div className="minigame-content">
        <h1 className="minigame-title">Currency Converter</h1>
        <Currency />
      </div>
    </div>
  );
};

export default MinigamePage;