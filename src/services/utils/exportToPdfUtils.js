import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPdf = (data, title = "Reporte_Institucional.pdf") => {
  if (!data || data.length === 0) {
    console.warn("No hay datos para exportar a PDF");
    return;
  }

  // Define orientación horizontal (landscape) si hay muchas columnas
  const doc = new jsPDF("landscape", "pt", "a4");

  // Configurar metadatos del PDF
  doc.setProperties({
    title: title,
    author: "Sistema de Control de Vacaciones",
    creator: "VACAS - CNA"
  });

  // Título del documento
  doc.setFontSize(16);
  doc.setTextColor(26, 35, 126); // Azul institucional
  doc.text("Sistema de Control de Vacaciones (CNA)", 40, 40);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Documento: ${title}`, 40, 60);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 40, 80);

  // Extraer las cabeceras (keys) del primer objeto (formatear separando por mayúsculas si es necesario)
  const sourceKeys = Object.keys(data[0]);
  const tableHeaders = sourceKeys.map(k => k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1').trim());
  
  // Extraer las filas
  const tableRows = data.map(row => {
    return sourceKeys.map(key => {
      // Si el valor es una fecha o similar, se puede mapear aquí.
      const val = row[key];
      if (val === null || val === undefined) return "N/A";
      return String(val);
    });
  });

  doc.autoTable({
    head: [tableHeaders],
    body: tableRows,
    startY: 100,
    theme: "striped",
    headStyles: {
      fillColor: [26, 35, 126], // Azul primario
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: 'linebreak'
    },
    margin: { top: 100 },
  });

  doc.save(title.endsWith('.pdf') ? title : `${title}.pdf`);
};
