import { Member, Contribution, Family } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Configuration du document A4
const A4_WIDTH = 210; // mm
const A4_HEIGHT = 297; // mm
const MARGIN = 15; // mm
const LINE_HEIGHT = 6; // mm

interface PDFDocumentOptions {
  title: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
}

// URL du logo pour les PDFs (utilise le chemin public)
const LOGO_URL = '/logo-assojereb.png';

export function generateMemberListPDF(
  members: Member[],
  options: PDFDocumentOptions & { filterInfo?: string }
): string {
  const { title, subtitle, filterInfo } = options;
  
  // Generate HTML content for PDF
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 9pt;
      line-height: 1.4;
      color: #1a1a1a;
    }
    .page {
      position: relative;
      width: 100%;
      min-height: 100vh;
      padding-bottom: 20mm;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 10px;
      border-bottom: 2px solid #1E90B8;
      margin-bottom: 15px;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }
    .org-name {
      font-size: 14pt;
      font-weight: bold;
      color: #1E90B8;
    }
    .org-full-name {
      font-size: 8pt;
      color: #666;
    }
    .doc-info {
      text-align: right;
    }
    .doc-date {
      font-size: 8pt;
      color: #666;
    }
    .title {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      color: #1E90B8;
      margin-bottom: 5px;
    }
    .subtitle {
      font-size: 10pt;
      text-align: center;
      color: #666;
      margin-bottom: 15px;
    }
    .filter-info {
      background: #f5f5f5;
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 8pt;
      color: #666;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: linear-gradient(135deg, #1E90B8, #3AA8D0);
      color: white;
      padding: 8px 6px;
      text-align: left;
      font-weight: 600;
      font-size: 8pt;
    }
    td {
      padding: 6px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 8pt;
    }
    tr:nth-child(even) {
      background: #fafafa;
    }
    tr:hover {
      background: #e8f4f8;
    }
    .status-actif {
      color: #1E90B8;
      font-weight: 600;
    }
    .status-inactif {
      color: #666;
    }
    .status-sympathisant {
      color: #E8942F;
    }
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 10px 15mm;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      font-size: 7pt;
      color: #666;
      background: white;
    }
    .summary {
      background: linear-gradient(135deg, #E8942F, #F5B04A);
      padding: 10px 15px;
      border-radius: 4px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-around;
    }
    .summary-item {
      text-align: center;
    }
    .summary-value {
      font-size: 16pt;
      font-weight: bold;
      color: #1a1a1a;
    }
    .summary-label {
      font-size: 8pt;
      color: #333;
    }
    @media print {
      .page {
        page-break-after: always;
      }
      .footer {
        position: fixed;
        bottom: 0;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo-section">
        <img src="${LOGO_URL}" alt="Logo ASSOJEREB" class="logo" />
        <div>
          <div class="org-name">ASSOJEREB</div>
          <div class="org-full-name">Association des Jeunes Ressortissants de Brongonzué</div>
        </div>
      </div>
      <div class="doc-info">
        <div class="doc-date">Généré le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}</div>
      </div>
    </div>
    
    <h1 class="title">${title}</h1>
    ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
    
    ${filterInfo ? `<div class="filter-info">${filterInfo}</div>` : ''}
    
    <div class="summary">
      <div class="summary-item">
        <div class="summary-value">${members.length}</div>
        <div class="summary-label">Total membres</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${members.filter(m => m.status === 'actif').length}</div>
        <div class="summary-label">Actifs</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${members.filter(m => m.gender === 'homme').length}</div>
        <div class="summary-label">Hommes</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${members.filter(m => m.gender === 'femme').length}</div>
        <div class="summary-label">Femmes</div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>N°</th>
          <th>Nom & Prénom</th>
          <th>Genre</th>
          <th>Famille</th>
          <th>Téléphone</th>
          <th>Zone</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        ${members.map((member, index) => `
          <tr>
            <td>${member.member_number}</td>
            <td><strong>${member.last_name}</strong> ${member.first_name}</td>
            <td>${member.gender === 'homme' ? 'H' : 'F'}</td>
            <td>${member.family?.name || '-'}</td>
            <td>${member.phone || '-'}</td>
            <td style="text-transform: capitalize">${member.geographic_zone}</td>
            <td class="status-${member.status}">${member.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="footer">
      <span>ASSOJEREB - Association des Jeunes Ressortissants de Brongonzué - Document confidentiel</span>
      <span>Page 1</span>
    </div>
  </div>
</body>
</html>
`;
  
  return html;
}

export function generateContributionsReportPDF(
  contributions: Contribution[],
  options: PDFDocumentOptions & { 
    period?: string;
    totalAmount?: number;
  }
): string {
  const { title, subtitle, period, totalAmount } = options;
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  
  const statusLabels: Record<string, string> = {
    payee: 'Payée',
    en_attente: 'En attente',
    en_retard: 'En retard',
    annulee: 'Annulée',
  };

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 9pt;
      line-height: 1.4;
      color: #1a1a1a;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 10px;
      border-bottom: 2px solid #1E90B8;
      margin-bottom: 15px;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }
    .org-name {
      font-size: 14pt;
      font-weight: bold;
      color: #1E90B8;
    }
    .title {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      color: #1E90B8;
      margin-bottom: 5px;
    }
    .subtitle {
      font-size: 10pt;
      text-align: center;
      color: #666;
      margin-bottom: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: linear-gradient(135deg, #1E90B8, #3AA8D0);
      color: white;
      padding: 8px 6px;
      text-align: left;
      font-weight: 600;
      font-size: 8pt;
    }
    td {
      padding: 6px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 8pt;
    }
    tr:nth-child(even) {
      background: #fafafa;
    }
    .amount {
      font-weight: 600;
      color: #1E90B8;
    }
    .status-payee { color: #27AE60; }
    .status-en_attente { color: #E8942F; }
    .status-en_retard { color: #D32F2F; }
    .status-annulee { color: #666; }
    .summary-box {
      background: linear-gradient(135deg, #1E90B8, #3AA8D0);
      color: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-around;
    }
    .summary-item {
      text-align: center;
    }
    .summary-value {
      font-size: 18pt;
      font-weight: bold;
    }
    .summary-label {
      font-size: 8pt;
      opacity: 0.9;
    }
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 10px 15mm;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      font-size: 7pt;
      color: #666;
      background: white;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <img src="${LOGO_URL}" alt="Logo ASSOJEREB" class="logo" />
      <div>
        <div class="org-name">ASSOJEREB</div>
        <div style="font-size: 8pt; color: #666">Brongonzué</div>
      </div>
    </div>
    <div>
      <div style="font-size: 8pt; color: #666">
        ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}
      </div>
    </div>
  </div>
  
  <h1 class="title">${title}</h1>
  ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
  ${period ? `<p class="subtitle">Période: ${period}</p>` : ''}
  
  <div class="summary-box">
    <div class="summary-item">
      <div class="summary-value">${contributions.length}</div>
      <div class="summary-label">Cotisations</div>
    </div>
    <div class="summary-item">
      <div class="summary-value">${formatCurrency(totalAmount || contributions.reduce((sum, c) => sum + c.amount, 0))}</div>
      <div class="summary-label">Montant total</div>
    </div>
    <div class="summary-item">
      <div class="summary-value">${contributions.filter(c => c.status === 'payee').length}</div>
      <div class="summary-label">Payées</div>
    </div>
    <div class="summary-item">
      <div class="summary-value">${contributions.filter(c => c.status === 'en_retard').length}</div>
      <div class="summary-label">En retard</div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Membre</th>
        <th>Type</th>
        <th>Période</th>
        <th>Montant</th>
        <th>Statut</th>
        <th>Date paiement</th>
      </tr>
    </thead>
    <tbody>
      ${contributions.map(c => `
        <tr>
          <td>${c.member ? `${c.member.last_name} ${c.member.first_name}` : '-'}</td>
          <td style="text-transform: capitalize">${c.contribution_type}</td>
          <td>${c.period_month && c.period_year ? `${c.period_month}/${c.period_year}` : '-'}</td>
          <td class="amount">${formatCurrency(c.amount)}</td>
          <td class="status-${c.status}">${statusLabels[c.status] || c.status}</td>
          <td>${c.paid_at ? format(new Date(c.paid_at), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <span>ASSOJEREB - Rapport financier confidentiel</span>
    <span>Page 1</span>
  </div>
</body>
</html>
`;
  
  return html;
}

export function openPrintWindow(htmlContent: string, filename: string) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Delay print to allow styles to load
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
