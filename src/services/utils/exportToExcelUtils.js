import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Exporta un arreglo de objetos JSON a un archivo Excel (.xlsx) con diseños enriquecidos
 * @param {Array} data - El arreglo de objetos a exportar
 * @param {String} fileName - El nombre que tendrá el archivo descargado (sin extensión)
 * @param {String} sheetName - El nombre de la hoja dentro del archivo Excel
 */
export const exportToExcel = async (data, fileName = 'Reporte', sheetName = 'Datos') => {
  if (!data || data.length === 0) {
    console.warn("No hay datos para exportar.");
    return;
  }

  // 1. Crear un nuevo libro de trabajo (workbook)
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // 2. Extraer las llaves para formar las columnas dinámicamente
  const keys = Object.keys(data[0]);
  worksheet.columns = keys.map(key => ({
    header: key,
    key: key.replace(/ /g, "_"), // Clave simple
    width: 25 // Ancho base temporal
  }));

  // Llenar header row (Fila 1) - Estilo Corporativo
  const headerRow = worksheet.getRow(1);
  headerRow.height = 30; // Más alta
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12, name: 'Calibri' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1565C0' } // Azul primario MUI
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF0D47A1' } },
      left: { style: 'thin', color: { argb: 'FF0D47A1' } },
      bottom: { style: 'medium', color: { argb: 'FF0D47A1' } },
      right: { style: 'thin', color: { argb: 'FF0D47A1' } }
    };
  });

  // 4. Llenar los datos
  data.forEach((rowObj, index) => {
    const rowValues = keys.map(k => rowObj[k]);
    const row = worksheet.addRow(rowValues);
    
    row.eachCell((cell) => {
      // Estilo de celdas de datos
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      
      // Bordes grises sutiles
      cell.border = {
        top: { style: 'hair', color: { argb: 'FFBDBDBD' } },
        left: { style: 'hair', color: { argb: 'FFBDBDBD' } },
        bottom: { style: 'hair', color: { argb: 'FFBDBDBD' } },
        right: { style: 'hair', color: { argb: 'FFBDBDBD' } }
      };
      
      // Filas alternas (Cebra gris claro) para mejor lectura visual
      if (index % 2 !== 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' } // Gris super tenue
        };
      }
    });
  });

  // 5. Auto-ajustar el ancho de las columnas basado en el contenido más largo
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      let cellLength = cell.value ? cell.value.toString().length : 10;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    // Añadimos un pequeño margen derecho e izquierdo
    column.width = maxLength < 15 ? 15 : maxLength + 4; 
  });

  // 6. Generar el archivo en Buffer y forzar descarga desde el navegador
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `${fileName}.xlsx`);
};
