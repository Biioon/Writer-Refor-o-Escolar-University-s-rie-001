import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  label: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id }) => {
  const checkboxId = id || `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex items-center">
      <div className="relative flex items-center">
        <input
          id={checkboxId}
          type="checkbox"
          className="peer appearance-none h-4 w-4 border border-stone-600 rounded-sm bg-stone-800 checked:bg-purple-600 checked:border-purple-600 focus:outline-none transition-colors"
        />
        <div className="absolute left-0 top-0 w-4 h-4 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
          <Check size={12} />
        </div>
      </div>
      <label htmlFor={checkboxId} className="ml-2 text-sm text-gray-300 select-none">
        {label}
      </label>
    </div>
  );
};
