import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateCertificatePDF = async (elementId, fileName) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Certificate element with ID "${elementId}" not found.`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
