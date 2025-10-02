import React, { useState } from 'react';

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({ enabled, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-purple-500 ${
        enabled ? 'bg-purple-600' : 'bg-stone-700'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};