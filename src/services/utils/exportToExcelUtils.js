import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Exporta un arreglo de objetos JSON a un archivo Excel (.xlsx) con diseños enriquecidos
 * @param {Array} data - El arreglo de objetos a exportar
 * @param {String} fileName - El nombre que tendrá el archivo descargado (sin extensión)
 * @param {String} sheetName - El nombre de la hoja dentro del archivo Excel
 */
export const exportToExcel = async (data, fileName = 'Reporte', sheetName = 'Datos', displayTitle = null) => {
  if (!data || data.length === 0) {
    console.warn("No hay datos para exportar.");
    return;
  }

  // 1. Crear un nuevo libro de trabajo (workbook)
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Vacaciones CNA';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ state: 'frozen', ySplit: 4 }]
  });

  // 2. Título institucional CNA (Igualando el diseño backend)
  // Calculamos la última letra de columna (A=1, B=2...) de forma sencilla
  const keys = Object.keys(data[0] || {});
  const lastColIndex = keys.length > 0 ? keys.length : 1;
  const getLastColumnLetter = (colIndex) => {
    let temp, letter = '';
    while (colIndex > 0) {
      temp = (colIndex - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      colIndex = (colIndex - temp - 1) / 26;
    }
    return letter || 'A';
  };
  const lastColLetter = getLastColumnLetter(lastColIndex);

  worksheet.mergeCells(`A1:${lastColLetter}2`);
  const titleCell = worksheet.getCell('A1');
  const finalTitle = displayTitle ? displayTitle : `Reporte: ${fileName.replace(/_/g, ' ')}`;
  titleCell.value = `CONSEJO NACIONAL DE ADOPCIONES - CNA \n${finalTitle}`;
  titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF003366' } // Azul corporativo '#003366'
  };

  // Timestamp de creación
  worksheet.mergeCells(`A3:${lastColLetter}3`);
  const dateCell = worksheet.getCell('A3');
  const d = new Date();
  const dateStr = d.toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  dateCell.value = `Generado el: ${dateStr} ${timeStr}`;
  dateCell.alignment = { horizontal: 'right' };
  dateCell.font = { italic: true };

  // 3. Extraer las llaves para formar las columnas dinámicamente y mapearlas en fila 4
  const finalColumns = keys.map(key => ({
    header: key.toUpperCase(),
    key: key, 
    width: 20 
  }));
  
  // Agregar Fila 4 con las llaves (Header de la tabla de datos)
  const headerRow = worksheet.getRow(4);
  headerRow.values = finalColumns.map(col => col.header);
  
  // Asociamos las llaves al worksheet para addRow funcione bien despues
  // IMPORTANTE: NO pasar 'header' aquí, de lo contrario exceljs sobreescribirá la Fila 1 (borrando el título principal)
  worksheet.columns = keys.map(key => ({ key: key, width: 20 }));

  // Llenar header row (Fila 4) - Estilo Corporativo Backend
  headerRow.height = 30; // Más alta
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12, name: 'Calibri' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' } // Verde Institucional para sincronizar con backend
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
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
