import React from "react";

interface JsonViewerProps {
  data: Record<string, any>;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const renderValue = (value: any): React.ReactNode => {
    if (value === null) return <span className="text-neutral-500">null</span>;
    if (typeof value === "boolean")
      return <span className="text-purple-500">{value.toString()}</span>;
    if (typeof value === "number")
      return <span className="text-blue-500">{value}</span>;
    if (typeof value === "string") {
      return <span className="text-green-500">"{value}"</span>;
    }
    if (Array.isArray(value)) {
      return (
        <div className="pl-4">
          [
          {value.map((item, index) => (
            <div key={index} className="pl-4">
              {renderValue(item)}
              {index < value.length - 1 && ","}
            </div>
          ))}
          ]
        </div>
      );
    }
    if (typeof value === "object") {
      return renderObject(value);
    }
    return String(value);
  };

  const renderObject = (obj: Record<string, any>): React.ReactNode => {
    return (
      <div className="pl-4">
        {Object.entries(obj).map(([key, value], index, array) => (
          <div key={key} className="text-sm">
            {!Array.isArray(obj) && (
              <>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {key}
                </span>
                <span className="text-neutral-500">: </span>
              </>
            )}

            {renderValue(value)}
            {index < array.length - 1 && ","}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="font-mono bg-neutral-50 dark:bg-neutral-900 p-4 rounded-md border border-neutral-200 dark:border-neutral-700 overflow-x-auto">
      {renderObject(data)}
    </div>
  );
};

export default JsonViewer;
