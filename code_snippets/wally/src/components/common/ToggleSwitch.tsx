import React from 'react';

interface ToggleSwitchProps {
  label: string;
  active?: boolean;
  onChange?: (active: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  active = false,
  onChange,
}) => {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="toggle-slider"></span>
      <span className="toggle-label">{label}</span>
    </label>
  );
};
