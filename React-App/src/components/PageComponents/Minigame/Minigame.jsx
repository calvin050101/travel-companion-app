// src/PageComponents/Minigame/Minigame.jsx
import React from 'react';
import './Minigame.css';
import ConverterForm from './ConverterForm'; // Import the dynamic logic component

const Minigame = () => {
  return (
    <div className='currency-converter'>
      <h2 className='converter-title'>Currency Converter</h2>
      <ConverterForm /> {/* Plug in the dynamic form here */}
    </div>
  );
};

export default Minigame;