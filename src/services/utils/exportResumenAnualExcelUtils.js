import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportResumenAnual = async (data) => {
  if (!data || data.length === 0) {
    console.warn("No hay datos para exportar.");
    return;
  }

  // Identificar todos los períodos únicos en los datos
  const allPeriods = new Set();
  data.forEach(emp => {
    Object.keys(emp.periodos || {}).forEach(p => allPeriods.add(p));
  });
  
  // Ordenar periodos ascendentemente
  const sortedPeriods = Array.from(allPeriods).sort();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Vacaciones CNA';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Resumen 011 y 022', {
    views: [{ state: 'frozen', ySplit: 3, xSplit: 3 }] // Congelar las primeras 3 filas y las primeras 3 columnas
  });

  // Determinar la última columna (A, B, C, D = 4 columnas fijas + periodos + 1 columna total)
  const totalColumns = 4 + sortedPeriods.length + 1;
  const getLastColumnLetter = (colIndex) => {
    let temp, letter = '';
    while (colIndex > 0) {
      temp = (colIndex - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      colIndex = (colIndex - temp - 1) / 26;
    }
    return letter || 'A';
  };
  const lastColLetter = getLastColumnLetter(totalColumns);

  // Fila 1 y 2: Título Principal
  worksheet.mergeCells(`A1:${lastColLetter}2`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'CONSEJO NACIONAL DE ADOPCIONES\nRESUMEN DE REGISTRO DE VACACIONES POR AÑO - RENGLÓN 011 Y 022';
  titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  titleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF000000' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF00FFFF' } // Cyan
  };

  // Fila 3: Encabezados de tabla
  const headers = ['No.', 'NOMBRE', 'PUESTO', 'FECHA DE INGRESO'];
  sortedPeriods.forEach(p => headers.push(`AÑO ${p}`));
  headers.push('TOTAL');

  const headerRow = worksheet.getRow(3);
  headerRow.values = headers;
  headerRow.height = 30;

  headerRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' } // Gris claro
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Configurar anchos de columna
  worksheet.getColumn(1).width = 5;  // No.
  worksheet.getColumn(2).width = 40; // Nombre
  worksheet.getColumn(3).width = 35; // Puesto
  worksheet.getColumn(4).width = 15; // Fecha Ingreso
  // Columnas de años
  for (let i = 0; i < sortedPeriods.length; i++) {
    worksheet.getColumn(5 + i).width = 12;
  }
  worksheet.getColumn(totalColumns).width = 10; // Total

  // Agrupar empleados por unidad
  const groupedData = {};
  data.forEach(emp => {
    const unidad = emp.unidad || 'SIN UNIDAD ASIGNADA';
    if (!groupedData[unidad]) {
      groupedData[unidad] = [];
    }
    groupedData[unidad].push(emp);
  });

  let currentRowNum = 4;
  let globalIndex = 1;

  Object.keys(groupedData).forEach(unidad => {
    // Fila de agrupación por unidad
    worksheet.mergeCells(`A${currentRowNum}:${lastColLetter}${currentRowNum}`);
    const unitCell = worksheet.getCell(`A${currentRowNum}`);
    unitCell.value = unidad.toUpperCase();
    unitCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    unitCell.alignment = { horizontal: 'center', vertical: 'middle' };
    unitCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF333F50' } // Azul grisáceo oscuro
    };
    unitCell.border = {
      top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    currentRowNum++;

    // Filas de empleados de la unidad
    const empleadosUnidad = groupedData[unidad];
    empleadosUnidad.forEach(emp => {
      const rowData = [
        globalIndex++,
        emp.nombre,
        emp.puesto,
        emp.fechaIngreso
      ];

      // Años
      sortedPeriods.forEach(p => {
        const dias = emp.periodos[p];
        rowData.push(dias !== undefined ? dias : '-');
      });

      // Total
      rowData.push(emp.total);

      const row = worksheet.getRow(currentRowNum);
      row.values = rowData;

      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 10 };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        // Centrar las columnas a partir de la 4 (fecha, años, total)
        if (colNumber === 1 || colNumber >= 4) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }
      });
      currentRowNum++;
    });
  });

  // Aplicar bordes al cuadro principal
  titleCell.border = {
    top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' }
  };

  // Generar y descargar el archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const d = new Date();
  const dateStr = d.toLocaleDateString('es-GT').replace(/\//g, '-');
  saveAs(blob, `Resumen_Vacaciones_011_022_${dateStr}.xlsx`);
};
