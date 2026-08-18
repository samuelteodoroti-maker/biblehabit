import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const generateUpdatePDF = async (update: any) => {
  const doc = new jsPDF();
  const primaryColor = [16, 185, 129]; // Emerald 500
  
  // Header
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Bible Habit", 20, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`NOTAS DE ATUALIZAÇÃO - V${update.version}`, 20, 32);
  
  const dateStr = update.published_at 
    ? format(new Date(update.published_at), "dd 'de' MMMM, yyyy", { locale: ptBR })
    : "Não publicada";
  doc.text(dateStr.toUpperCase(), 190, 32, { align: "right" });

  // Title
  let y = 55;
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(update.title, 170);
  doc.text(titleLines, 20, y);
  y += (titleLines.length * 8) + 5;

  // Summary
  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  const summaryLines = doc.splitTextToSize(update.summary || "", 170);
  doc.text(summaryLines, 20, y);
  y += (summaryLines.length * 6) + 15;

  // Sections
  const renderSection = (title: string, items: string[], color: number[]) => {
    if (!items || items.length === 0) return;
    
    // Check page break
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(title.toUpperCase(), 20, y);
    
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    
    items.forEach(item => {
      const lines = doc.splitTextToSize(`• ${item}`, 160);
      doc.text(lines, 25, y);
      y += (lines.length * 5) + 2;
      
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
    });
    
    y += 10;
  };

  renderSection("Novidades", update.highlights || [], [16, 185, 129]);
  renderSection("Melhorias", update.improvements || [], [59, 130, 246]);
  renderSection("Correções", update.fixes || [], [245, 158, 11]);
  renderSection("Acessibilidade", update.accessibility_changes || [], [139, 92, 246]);

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: "center" });
    doc.text("biblehabit.app", 190, 285, { align: "right" });
  }

  return doc;
};
