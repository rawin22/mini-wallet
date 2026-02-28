import React from 'react';

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick }) => {
  return (
    <button className="action-button" onClick={onClick}>
      <div className="action-button-icon">{icon}</div>
      <div className="action-button-label">{label}</div>
    </button>
  );
};
