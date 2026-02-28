import React from 'react';
import '../styles/ConvertHistory.css';

export const ConvertHistory: React.FC = () => {
  return (
    <div className="history-page">
      <h1>Exchange History</h1>
      <p className="no-data">
        Exchange history will be available once the FX deal search endpoint is connected.
        Completed deals can be verified in the account statement.
      </p>
    </div>
  );
};
