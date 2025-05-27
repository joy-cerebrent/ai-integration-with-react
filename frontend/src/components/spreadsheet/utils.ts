import jspreadsheet, {
  ToolbarItem,
  CellValue,
  JspreadsheetInstance,
  JspreadsheetInstanceElement
} from "jspreadsheet-ce";

import {
  type SpreadSheetProps,
  type TableColumnType
} from "./types";

export const generateToolbar = (
  spreadsheetInstance: jspreadsheet.JspreadsheetInstance | null,
  toolbarOptions: SpreadSheetProps['toolbarOptions']
): ToolbarItem[] | undefined => {
  return [
    ...(toolbarOptions?.undo ? [{
      id: "undo",
      type: "i" as const,
      content: 'undo',
      onclick: () => spreadsheetInstance?.undo(),
    }] : []),
    ...(toolbarOptions?.redo ? [{
      id: "redo",
      type: 'i' as const,
      content: 'redo',
      onclick: () => spreadsheetInstance?.redo(),
    }] : []),
    ...(toolbarOptions?.save ? [{
      id: "save",
      type: 'i' as const,
      content: 'save',
      onclick: () => spreadsheetInstance?.download(),
    }] : []),
    ...(toolbarOptions?.fontFamily ? [{
      type: 'select' as const,
      k: 'font-family',
      v: ['Arial', 'Verdana'],
    }] : []),
    ...(toolbarOptions?.fontSize ? [{
      type: 'select' as const,
      k: 'font-size',
      v: ['9px', '10px', '11px', '12px', '13px', '14px', '15px', '16px', '17px', '18px', '19px', '20px'],
    }] : []),
    ...(toolbarOptions?.textAlign ? [
      {
        id: "text-align-left",
        type: 'i' as const,
        content: 'format_align_left',
        k: 'text-align',
        v: 'left',
      },
      {
        id: "text-align-center",
        type: 'i' as const,
        content: 'format_align_center',
        k: 'text-align',
        v: 'center',
      },
      {
        id: "text-align-right",
        type: 'i' as const,
        content: 'format_align_right',
        k: 'text-align',
        v: 'right',
      }
    ] : []),
    ...(toolbarOptions?.fontBold ? [{
      id: "font-bold",
      type: 'i' as const,
      content: 'format_bold',
      k: 'font-weight',
      v: 'bold',
    }] : []),
    ...(toolbarOptions?.color ? [{
      type: 'color' as const,
      content: 'format_color_text',
      k: 'color',
    }] : []),
    ...(toolbarOptions?.backgroundColor ? [{
      type: 'color' as const,
      content: 'format_color_fill',
      k: 'background-color',
    }] : []),
  ];
};


export const validateAllCellsOnLoad = (
  tableColumns: TableColumnType[],
  instance: JspreadsheetInstance
) => {
  const data = instance.getData();
  data.forEach((row, rowIndex) => {
    row.forEach((cellValue, colIndex) => {
      const cell = instance.getCellFromCoords(colIndex, rowIndex);
      if (cell) {
        validateCell(tableColumns, instance, cell, colIndex, cellValue);
      }
    });
  });
};


export const validateCell = (
  tableColumns: TableColumnType[],
  _instance: JspreadsheetInstance | JspreadsheetInstanceElement,
  cell: HTMLTableCellElement,
  x: string | number,
  value: CellValue
) => {
  cell.style.backgroundColor = "";
  const column = tableColumns[x as number];

  if (column) {
    if (column.required && !value) {
      // alert(`Error: Value in column "${column.title}" is required`);
      cell.style.backgroundColor = "#FF000066";
      return false;
    }

    if (column.minlength && value.toString().length < column.minlength) {
      // alert(`Error: Value in column "${column.title}" is too short (minlength: ${column.minlength})`);
      cell.style.backgroundColor = "#FF000066";
      return false;
    }

    if (column.maxlength && value.toString().length > column.maxlength) {
      // alert(`Error: Value in column "${column.title}" exceeds maximum length (maxlength: ${column.maxlength})`);
      cell.style.backgroundColor = "#FF000066";
      return false;
    }

    if (column.regex && (column.regex instanceof RegExp) && value && !column.regex.test(value.toString())) {
      // alert(`Error: Invalid value in column "${column.title}"`);
      cell.style.backgroundColor = "#FF000066";
      return false;
    }

    if (x === 1 && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.toString())) {
        // alert("Invalid Email Error");
        cell.style.backgroundColor = "#FF000066";
        return false;
      }
    }

    return true;
  }
};