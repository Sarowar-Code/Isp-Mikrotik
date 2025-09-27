import * as XLSX from "xlsx";

/**
 * Convert Excel file into JSON array
 * @param {string} filePath - path to the Excel file
 * @returns {Array<Object>} - array of client objects
 */
export const excelToJson = (filePath) => {
  try {
    // 1️⃣ Read workbook
    const workbook = XLSX.readFile(filePath);

    // 2️⃣ Pick first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // 3️⃣ Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // 4️⃣ Map into expected structure
    const formattedData = jsonData.map((row) => ({
      name: row.name,
      email: row.email,
      password: row.password,
      contact: row.contact,
      whatsapp: row.whatsapp,
      nid: row.nid,
      address: {
        houseName: row.houseName,
        street: row.street,
        thana: row.thana,
        district: row.district,
        division: row.division,
      },
      clientType: row.clientType,
      connectionType: row.connectionType,
      packageName: row.packageName,
      routerId: row.routerId,
      paymentDeadline: row.paymentDeadline
        ? new Date(row.paymentDeadline)
        : null,
    }));

    return formattedData;
  } catch (error) {
    console.error("❌ Failed to convert Excel:", error);
    throw error;
  }
};
