import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportUsersToPdf(journeys) {
  const doc = new jsPDF();
  doc.text("Relatório Geral de Usuários", 14, 15);

  const tableData = journeys.map((u) => [
    u.userName,
    u.totalScore,
    u.completedStages,
    u.journeyStartAt ? new Date(u.journeyStartAt).toLocaleDateString("pt-BR") : "—",
    u.completedAt ? new Date(u.completedAt).toLocaleDateString("pt-BR") : "—",
  ]);

  autoTable(doc, {
    head: [["Nome", "Pontuação", "Etapas", "Início", "Conclusão"]],
    body: tableData,
  });

  doc.save("relatorio_usuarios.pdf");
}
