import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SUPPORT_WHATSAPP_DISPLAY, getVersionWhatsAppUrl } from "./app-utils";

export async function generateUpdatePDF(update: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246); // Primary Indigo color
  doc.text("Bible Habit", margin, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("biblehabit.lovable.app", pageWidth - margin - 40, 25);
  
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, 32, pageWidth - margin, 32);
  
  // Update Title and Version
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(update.title, margin, 45);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateStr = update.published_at 
    ? format(new Date(update.published_at), "dd 'de' MMMM, yyyy", { locale: ptBR })
    : "Não publicado";
  doc.text(`Versão: ${update.version}  |  Publicado em: ${dateStr}`, margin, 52);
  
  // Summary
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  const splitSummary = doc.splitTextToSize(update.summary, pageWidth - (margin * 2));
  doc.text(splitSummary, margin, 62);
  
  let currentY = 62 + (splitSummary.length * 7);
  
  // Sections
  const renderSection = (title: string, items: string[], color: [number, number, number]) => {
    if (!items || items.length === 0) return;
    
    currentY += 10;
    if (currentY > 260) {
      doc.addPage();
      currentY = 25;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(title.toUpperCase(), margin, currentY);
    
    currentY += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    items.forEach(item => {
      const splitItem = doc.splitTextToSize(`• ${item}`, pageWidth - (margin * 2) - 5);
      if (currentY + (splitItem.length * 5) > 270) {
        doc.addPage();
        currentY = 25;
      }
      doc.text(splitItem, margin + 2, currentY);
      currentY += (splitItem.length * 6);
    });
  };
  
  renderSection("Novidades", update.highlights, [34, 197, 94]);
  renderSection("Melhorias", update.improvements, [59, 130, 246]);
  renderSection("Correções", update.fixes, [249, 115, 22]);
  renderSection("Acessibilidade", update.accessibility_changes, [168, 85, 247]);
  
  // Footer / Support
  currentY += 15;
  if (currentY > 240) {
    doc.addPage();
    currentY = 25;
  }
  
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Suporte", margin, currentY);
  
  currentY += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`WhatsApp Oficial: ${SUPPORT_WHATSAPP_DISPLAY}`, margin, currentY);
  
  currentY += 5;
  const waUrl = getVersionWhatsAppUrl(update.version);
  doc.setTextColor(59, 130, 246);
  doc.text("Clique aqui para falar com o suporte", margin, currentY);
  // Add a link area
  doc.link(margin, currentY - 4, 60, 6, { url: waUrl });
  
  // Page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, 285, { align: "center" });
  }
  
  return doc;
}
