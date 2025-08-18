import React, { createContext, useContext, useState } from 'react';

// This file provides a very lightweight set of UI components so that
// the Puzzle Post‑Discharge Tracker can run without relying on the
// shadcn/ui library. Each component attempts to mirror the basic API
// surface of its shadcn counterpart but is simplified for brevity. If
// you need more styling or functionality, extend these components.

// Card primitives
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`border-b border-gray-200 px-4 py-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`px-4 py-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`font-semibold text-lg ${className}`} {...props}>
      {children}
    </h3>
  );
}

// Table primitives
export function Table({ children, className = '', ...props }) {
  return (
    <table className={`w-full text-sm text-left ${className}`} {...props}>
      {children}
    </table>
  );
}

export function TableHeader({ children, className = '', ...props }) {
  return (
    <thead className={className} {...props}>{children}</thead>
  );
}

export function TableRow({ children, className = '', ...props }) {
  return (
    <tr className={className} {...props}>{children}</tr>
  );
}

export function TableHead({ children, className = '', ...props }) {
  return (
    <th className={`px-3 py-2 border-b font-medium ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableBody({ children, className = '', ...props }) {
  return (
    <tbody className={className} {...props}>{children}</tbody>
  );
}

export function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-3 py-2 border-b ${className}`} {...props}>
      {children}
    </td>
  );
}

// Input control
export function Input({ className = '', ...props }) {
  return (
    <input
      className={`border border-gray-300 rounded px-3 py-1 outline-none ${className}`}
      {...props}
    />
  );
}

// Select primitives
export function Select({ children, value, onValueChange, className = '', ...props }) {
  // Map onValueChange to the native onChange event
  const handleChange = (e) => {
    if (onValueChange) onValueChange(e.target.value);
    if (props.onChange) props.onChange(e);
  };
  return (
    <select
      value={value}
      onChange={handleChange}
      className={`border border-gray-300 rounded px-2 py-1 outline-none ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function SelectContent({ children }) {
  return <>{children}</>;
}

export function SelectTrigger({ children, className = '', ...props }) {
  // This component acts as a wrapper; the click is handled by the select itself.
  return (
    <div className={className} {...props}>{children}</div>
  );
}

export function SelectItem({ children, value, ...props }) {
  return (
    <option value={value} {...props}>{children}</option>
  );
}

export function SelectValue({ children }) {
  return <>{children}</>;
}

// Dialog primitives for modals
export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  // When open, render a simple overlay and the content
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        // Close modal if the overlay itself is clicked
        if (e.target === e.currentTarget && onOpenChange) onOpenChange(false);
      }}
    >
      {children}
    </div>
  );
}

export function DialogContent({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = '', ...props }) {
  return (
    <div className={`border-b border-gray-200 px-4 py-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = '', ...props }) {
  return (
    <h2 className={`font-semibold text-lg ${className}`} {...props}>
      {children}
    </h2>
  );
}

// Switch component (checkbox)
export function Switch({ defaultChecked, onCheckedChange, className = '', ...props }) {
  const [checked, setChecked] = useState(!!defaultChecked);
  const handleChange = (e) => {
    setChecked(e.target.checked);
    if (onCheckedChange) onCheckedChange(e.target.checked);
  };
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      className={`form-checkbox h-4 w-4 text-blue-600 ${className}`}
      {...props}
    />
  );
}

// Badge component for small status labels
export function Badge({ children, variant = 'default', className = '', ...props }) {
  let base = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium';
  let styles;
  switch (variant) {
    case 'destructive':
      styles = 'bg-red-100 text-red-800';
      break;
    case 'secondary':
      styles = 'bg-gray-100 text-gray-700';
      break;
    case 'outline':
      styles = 'border border-gray-300 text-gray-700';
      break;
    default:
      styles = 'bg-blue-100 text-blue-800';
  }
  return (
    <span className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </span>
  );
}

// Progress bar component
export function Progress({ value = 0, className = '', ...props }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full h-2 bg-gray-200 rounded ${className}`} {...props}>
      <div
        style={{ width: `${pct}%` }}
        className="h-full rounded bg-blue-500"
      />
    </div>
  );
}

// Tooltip primitives. These are minimal; they simply wrap the trigger
// and content without actual hover interactions. For real tooltips,
// integrate a library like @radix-ui/react-tooltip. Here we always
// show the content adjacent to the trigger.
export function TooltipProvider({ children }) {
  return <>{children}</>;
}

export function Tooltip({ children }) {
  return <>{children}</>;
}

export function TooltipTrigger({ children, className = '', ...props }) {
  return (
    <span className={className} {...props}>{children}</span>
  );
}

export function TooltipContent({ children, className = '', ...props }) {
  return (
    <span className={`ml-1 text-xs text-gray-500 ${className}`} {...props}>
      {children}
    </span>
  );
}

// Simple Button component
export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  let color;
  switch (variant) {
    case 'secondary':
      color = 'bg-gray-200 text-gray-800 hover:bg-gray-300';
      break;
    case 'destructive':
      color = 'bg-red-500 text-white hover:bg-red-600';
      break;
    default:
      color = 'bg-blue-500 text-white hover:bg-blue-600';
  }
  let padding;
  switch (size) {
    case 'sm':
      padding = 'px-2 py-1 text-sm';
      break;
    case 'lg':
      padding = 'px-4 py-2 text-lg';
      break;
    default:
      padding = 'px-3 py-2 text-base';
  }
  return (
    <button
      className={`rounded ${color} ${padding} focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Tabs primitives for simple tabbed interfaces
const TabsContext = createContext({ value: undefined, onValueChange: () => {} });

export function Tabs({ value, defaultValue, onValueChange, children, className = '', ...props }) {
  // If value is controlled, use it; else use defaultValue in state
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value !== undefined ? value : internalValue;
  const handleChange = (val) => {
    if (onValueChange) onValueChange(val);
    else setInternalValue(val);
  };
  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div className={className} {...props}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '', ...props }) {
  return (
    <div className={`flex gap-2 mb-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '', ...props }) {
  const { value: active, onValueChange } = useContext(TabsContext);
  const isActive = active === value;
  return (
    <button
      onClick={() => onValueChange(value)}
      className={`px-3 py-1 rounded border border-gray-300 ${isActive ? 'bg-gray-200' : 'bg-white'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '', ...props }) {
  const { value: active } = useContext(TabsContext);
  if (active !== value) return null;
  return (
    <div className={className} {...props}>{children}</div>
  );
}