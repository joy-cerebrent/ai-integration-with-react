import React from "react";

export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

interface JsonViewerProps {
  data: JsonObject | string;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {  
  let parsedData: JsonObject;

  try {    
    if (typeof data === 'string') {
      try {
        // First try to parse as JSON
        parsedData = JSON.parse(data);
      } catch {
        // Just pass through the raw value without wrapping
        return (
          <div className="font-mono bg-neutral-50 dark:bg-neutral-900 p-4 rounded-md border border-neutral-200 dark:border-neutral-700 overflow-x-auto">
            <span className="text-green-500">"{data}"</span>
          </div>
        );
      }
    } else {
      parsedData = data;
    }    
  } catch (error) {
    console.error('Error handling data:', error);
    return (
      <div className="font-mono bg-neutral-50 dark:bg-neutral-900 p-4 rounded-md border border-neutral-200 dark:border-neutral-700 text-red-500">
        Error handling data
      </div>
    );
  }

  const renderValue = (value: JsonValue): React.ReactNode => {
    if (value === null) return <span className="text-neutral-500">null</span>;
    if (typeof value === "boolean")
      return <span className="text-purple-500">{value.toString()}</span>;
    if (typeof value === "number")
      return <span className="text-blue-500">{value}</span>;
    if (typeof value === "string") {
      // Try to parse string as JSON
      try {
        const parsedValue = JSON.parse(value);
        if (typeof parsedValue === "object" && parsedValue !== null) {
          return renderObject(parsedValue as JsonObject);
        }
      } catch {
        // If parsing fails, just render as string
        return <span className="text-green-500">"{value}"</span>;
      }
      return <span className="text-green-500">"{value}"</span>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span>[ ]</span>;
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

  const renderObject = (obj: JsonObject): React.ReactNode => {    
    if (!obj || typeof obj !== 'object') {
      console.error('Invalid object received:', obj);
      return <div className="text-red-500">Invalid data structure</div>;
    }

    const entries = Object.entries(obj);
    if (entries.length === 0) return <span>{ }</span>;

    return (
      <div className="pl-4">
        {"{"}
        {entries.map(([key, value], index) => (
          <div key={key} className="text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">
              "{key}"
            </span>
            <span className="text-neutral-500">: </span>
            {renderValue(value)}
            {index < entries.length - 1 && ","}
          </div>
        ))}
        {"}"}
      </div>
    );
  };

  return (
    <div className="font-mono bg-neutral-50 dark:bg-neutral-900 p-4 rounded-md border border-neutral-200 dark:border-neutral-700 overflow-x-auto">
      {renderValue(parsedData)}
    </div>
  );
};

export default JsonViewer;
