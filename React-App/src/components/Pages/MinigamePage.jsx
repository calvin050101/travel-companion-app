import React from 'react';
import Minigame from '../PageComponents/Minigame/Minigame'; // Corrected relative path
import '../PageComponents/Minigame/Minigame.css'; // Scoped styles specific to Minigame
import FormHeader from './FormStyles/FormHeader';

const MinigamePage = () => {
  return (
    <div className="minigame-page"> {/* Scoped wrapper to prevent global CSS leak */}
      <FormHeader />
      <div className="minigame-content">
        <h1 className="minigame-title">Currency Converter</h1>
        <Minigame />
      </div>
    </div>
  );
};

export default MinigamePage;