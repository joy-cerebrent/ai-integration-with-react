import React from 'react';

interface SummaryCardProps {
  data: Record<string, any>;
  className?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ data, className }) => {
  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 border border-neutral-200 dark:border-neutral-700 ${className}`}>
      <div className="grid gap-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 capitalize">
              {key.replace(/_/g, ' ')}
            </span>
            <span className="text-neutral-900 dark:text-neutral-100">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCard;
