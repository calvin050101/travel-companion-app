import React from 'react';
import './Currency.css';
import ConverterForm from './ConverterForm'; // Import the dynamic logic component

const Currency = () => {
  return (
    <div className='currency-converter'>
      <h2 className='converter-title'>Currency Converter</h2>
      <ConverterForm /> {/* Plug in the dynamic form */}
    </div>
  );
};

export default Currency;