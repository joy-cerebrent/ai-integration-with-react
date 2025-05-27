export type TableColumnType = {
  type: "text" | "numeric" | "dropdown" | "calendar" | "checkbox" | "image" | "color";
  title: string;
  width?: number;
  required?: boolean;
  minlength?: number;
  maxlength?: number;
  source?: string[];
  autocomplete?: boolean;
  multiple?: boolean;
  regex?: RegExp;
};

export type SpreadSheetProps = {
  tableColumns: TableColumnType[];
  tableData: (string | boolean)[][];
  onSave: (jsonData: any[][]) => Promise<void>;
  enableSearch?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  toolbarOptions?: {
    undo?: boolean;
    redo?: boolean;
    save?: boolean;
    fontFamily?: true;
    fontSize?: true;
    textAlign?: true;
    fontBold?: true;
    color?: true;
    backgroundColor?: true;
  };
  enableLazyLoading?: boolean;
  enableTableOverflow?: boolean;
  enableColumnResize?: boolean;
};