import { Spreadsheet } from "./SpreadSheet";
import { TableColumnType } from "./types";

const tableColumns: TableColumnType[] = [
  { type: "text", title: "Name", required: true, minlength: 3, maxlength: 100 },
  { type: "text", title: "Email", required: true, regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { type: "numeric", title: "Contact No", required: true, regex: /^\d{10}$/ },
  { type: "text", title: "Address 1", required: true },
  { type: "text", title: "Address 2" },
  { type: "text", title: "City", required: true },
  { type: "text", title: "State", required: true },
  { type: "dropdown", title: "Country", source: ["India", "United States", "United Kingdom", "Canada"], },
  { type: "calendar", title: "Registered On" },
  { type: "checkbox", title: "Active" },
];

const initialData = [
  ["Jo", "john@example", "1234567890", "123 Street", "", "New York", "New York", "United States", "30-01-2025 00:00:00", true],
  ["Jane Smith", "jane@example.com", "0987654321", "456 Avenue", "", "Los Angeles", "California", "United States", "", false],
  ["Robert Brown", "robert@example.com", "1112233445", "789 Boulevard", "", "Toronto", "Ontario", "Canada", "", true],
  ["Alice Johnson", "alice@example.com", "2223344556", "101 Main St", "", "Vancouver", "British Columbia", "Canada", "15-03-2024 14:00:00", true],
  ["Charlie White", "charlie@example.com", "3334455667", "202 Oak Drive", "", "Miami", "Florida", "United States", "01-01-2025 00:00:00", false],
  ["Megan Green", "megan@example.com", "4445566778", "303 Pine Road", "", "Toronto", "Ontario", "Canada", "20-12-2024 08:30:00", true],
  ["David Black", "david@example.com", "5556677889", "404 Maple Blvd", "", "Chicago", "Illinois", "United States", "", true],
  ["Sophia Blue", "sophia@example.com", "6667788990", "505 Elm Lane", "", "Boston", "Massachusetts", "United States", "25-11-2024 18:00:00", true],
  ["Olivia Gray", "olivia@example.com", "7778899001", "606 Birch St", "", "Los Angeles", "California", "United States", "10-02-2025 13:15:00", false],
  ["Ethan Lee", "ethan@example.com", "8889900112", "707 Cedar Ave", "", "San Francisco", "California", "United States", "05-07-2024 16:30:00", true],
  ["Amelia White", "amelia@example.com", "9991011223", "808 Willow Rd", "", "Dallas", "Texas", "United States", "21-09-2024 09:45:00", false],
  ["Lucas King", "lucas@example.com", "1011122334", "909 Pinewood St", "", "Montreal", "Quebec", "Canada", "14-04-2025 12:00:00", true],
  ["Mia Adams", "mia@example.com", "2022233445", "101 Redwood Dr", "", "Houston", "Texas", "United States", "30-06-2024 11:00:00", false],
  ["Jack Lewis", "jack@example.com", "3033344556", "202 Forest Ln", "", "Seattle", "Washington", "United States", "17-08-2024 15:00:00", true],
  ["Grace Young", "grace@example.com", "4044455667", "303 Park Ave", "", "New York", "New York", "United States", "03-11-2024 14:30:00", true],
  ["William Scott", "william@example.com", "5055566778", "404 Mountain Rd", "", "Austin", "Texas", "United States", "22-06-2025 17:30:00", true],
  ["Isabella Harris", "isabella@example.com", "6066677889", "505 Sunrise Blvd", "", "Las Vegas", "Nevada", "United States", "12-09-2024 10:00:00", false],
  ["Benjamin Clark", "benjamin@example.com", "7077788990", "606 Sunset St", "", "Miami", "Florida", "United States", "11-12-2024 19:00:00", true],
];


const SpreadSheetComponent = () => {
  const wait = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleSave = async (jsonData: any[][]) => {
    wait(2000);
    console.log("Sending JSON data:", jsonData);
  };

  return (
    <div className="bg-neutral-800 w-full overflow-auto" >
      <h1 className="text-2xl text-white py-8 font-bold text-center" >
        Customer Data Spreadsheet
      </h1>

      <Spreadsheet
        tableColumns={tableColumns}
        tableData={initialData}
        onSave={handleSave}
        enableSearch={true}
        enablePagination={true}
        pageSize={10}
        toolbarOptions={{
          undo: true,
          redo: true,
          save: true,
          fontFamily: true,
          fontSize: true,
          textAlign: true,
          fontBold: true,
          // color: true,
          // backgroundColor: true,
        }}
        enableTableOverflow={true}
        enableLazyLoading={false}
        enableColumnResize={true}
      />
    </div>
  );
};

export default SpreadSheetComponent;