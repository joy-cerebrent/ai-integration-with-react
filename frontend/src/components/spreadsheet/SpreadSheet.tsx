import { useRef, useEffect, useState } from "react";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import { SpreadSheetProps, TableColumnType } from "./types";
import { generateToolbar, validateAllCellsOnLoad, validateCell } from "./utils";

export const Spreadsheet = ({
  tableColumns,
  tableData,
  onSave,
  enableSearch = false,
  enablePagination = false,
  pageSize = 10,
  toolbarOptions = {},
  enableLazyLoading = false,
  enableTableOverflow = false,
  enableColumnResize = false,
}: SpreadSheetProps) => {
  const spreadsheetRef = useRef<HTMLDivElement | null>(null);
  const [spreadsheetInstance, setSpreadsheetInstance] = useState<jspreadsheet.JspreadsheetInstance | null>(null);

  const [columns, _setColumn] = useState<TableColumnType[]>(tableColumns.map((column) => ({
    ...column,
    width: column.width ?? 150,
    required: column.required ?? false,
  })));

  const [data, _setData] = useState(tableData);

  useEffect(() => {
    if (spreadsheetRef.current) {
      spreadsheetRef.current.innerHTML = "";

      const table = jspreadsheet(spreadsheetRef.current, {
        data: data,
        columns: columns,
        search: enableSearch,
        tableOverflow: enableLazyLoading,
        lazyLoading: enableLazyLoading && enableTableOverflow,
        toolbar: generateToolbar(spreadsheetInstance, toolbarOptions),
        pagination: enablePagination ? pageSize : undefined,
        minDimensions: [data[0].length, 1],
        columnResize: enableColumnResize,
        onchange: (instance, cell, x, _y, value) =>
          validateCell(tableColumns, instance, cell, x, value),
        onload: (_element, instance) =>
          validateAllCellsOnLoad(tableColumns, instance),
      });

      setSpreadsheetInstance(table);
    }
  }, [
    columns,
    data,
    toolbarOptions
  ]);

  const handleSave = async () => {
    if (!spreadsheetInstance) return;

    const updatedData = spreadsheetInstance.getData();
    console.log("Updated Data", updatedData);

    let isValid = true;

    updatedData.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const cell = spreadsheetInstance.getCell([colIndex, rowIndex]);

        const validationResult = validateCell(tableColumns, spreadsheetInstance, cell, colIndex, value);

        if (!validationResult) {
          isValid = false;
        }
      });
    });

    if (!isValid) {
      alert("Validation failed! Some cells have invalid data.");
      return;
    }

    // const jsonData = JSON.stringify(
    //   updatedData.map((row) => ({
    //     name: row[0],
    //     email: row[1],
    //     contactNo: row[2],
    //     address1: row[3],
    //     address2: row[4],
    //     city: row[5],
    //     state: row[6],
    //     country: row[7],
    //     registeredOn: row[8],
    //     active: row[9],
    //   }))
    // );

    onSave(updatedData)
  };


  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      overflowX: "auto"
    }}>
      <div
        ref={spreadsheetRef}
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "1560px",
          backgroundColor: "white",
          borderRadius: "1rem",
          padding: "0.5rem",
          color: "black"
        }}
      />

      <div style={{
        marginTop: "1rem",
        marginLeft: "auto",
        marginRight: "auto",
        display: "flex",
        gap: "0.5rem",
      }}>
        <button
          type="button"
          onClick={handleSave}
          style={{
            backgroundColor: "rgb(0.623, 0.214, 259.815)",
            padding: "0.5rem 1rem",
            color: "white",
            cursor: "pointer",
            borderRadius: "0.5rem",
            marginBottom: "1rem"
          }}
        >
          Save Data
        </button>
      </div>
    </div>
  );
};