import React from 'react';
export const Select = ({ value, onValueChange, children }) => (
  <select value={value} onChange={e => onValueChange(e.target.value)} className="border px-2 py-1 rounded w-full">
    {children}
  </select>
);
export const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);