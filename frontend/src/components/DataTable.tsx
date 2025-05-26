import React from 'react';
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  data: Record<string, unknown>[] | unknown[];
}

const tryParseJSON = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed;
  } catch {
    return value;
  }
};

const unwrapNestedArrays = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    if (value.length === 1 && Array.isArray(value[0])) {
      return unwrapNestedArrays(value[0]);
    }
    return value;
  }
  return [value];
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return `[${value.length} items]`;
    }
    const stringified = JSON.stringify(value);
    return stringified === '{}' ? '-' : stringified;
  }
  return String(value);
};

const getColumnStructure = (items: unknown[]): Column[] => {
  // Get all keys from all objects in the array
  const allKeys = new Set<string>();
  
  items.forEach(item => {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      Object.keys(item).forEach(key => allKeys.add(key));
    }
  });
  
  if (allKeys.size === 0) {
    return [{ key: 'value', label: 'Value' }];
  }

  return Array.from(allKeys).map(key => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()
  }));
};

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  // Parse any JSON strings in the data and unwrap nested arrays
  const parsedData = unwrapNestedArrays(data.map(item => tryParseJSON(item)));
  
  // Get columns from the data structure
  const columns = getColumnStructure(parsedData);
  
  // Format the data for display
  const formattedData = Array.isArray(parsedData) ? parsedData : [parsedData];
  return (
    <div className="w-full overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                  "text-neutral-600 dark:text-neutral-400",
                  "border-b border-neutral-200 dark:border-neutral-700",
                  index === 0 && "pl-6"
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-800">
          {formattedData.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
            >
              {columns.map((column, colIndex) => (                <td
                  key={`${rowIndex}-${column.key}`}
                  className={cn(
                    "px-4 py-3 text-neutral-800 dark:text-neutral-200",
                    "whitespace-pre-wrap break-words",
                    colIndex === 0 && "pl-6"
                  )}
                >
                  {typeof row === 'object' && row !== null ? 
                    formatValue((row as Record<string, unknown>)[column.key]) : 
                    formatValue(row)
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
