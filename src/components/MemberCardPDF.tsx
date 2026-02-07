import { Member } from '@/types/database';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import logoAssojereb from '@/assets/logo-assojereb.png';

interface MemberCardPDFProps {
  member: Member;
}

export function MemberCardPDF({ member }: MemberCardPDFProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate QR code with member verification URL
    const verificationUrl = `${window.location.origin}/verification/${member.id}`;
    QRCode.toDataURL(verificationUrl, {
      width: 80,
      margin: 1,
      color: { dark: '#1E90B8', light: '#FFFFFF' },
    }).then(setQrCodeUrl);
  }, [member.id]);

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      const html = generateCardHTML();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          setIsGenerating(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error generating card:', error);
      setIsGenerating(false);
    }
  };

  const generateCardHTML = () => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Carte de Membre - ${member.last_name} ${member.first_name}</title>
  <style>
    @page {
      size: 85.6mm 53.98mm;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
      padding: 20px;
    }
    .card-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .card {
      width: 85.6mm;
      height: 53.98mm;
      background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      position: relative;
    }
    .card-front {
      padding: 8px 10px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding-bottom: 6px;
      border-bottom: 2px solid #E8942F;
    }
    .logo {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }
    .org-info {
      flex: 1;
    }
    .org-name {
      font-size: 10pt;
      font-weight: bold;
      color: #1E90B8;
    }
    .org-subtitle {
      font-size: 5pt;
      color: #666;
    }
    .card-title {
      font-size: 6pt;
      color: #E8942F;
      font-weight: bold;
      text-align: center;
      background: #E8942F;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
    }
    .main-content {
      display: flex;
      gap: 10px;
      margin-top: 8px;
      flex: 1;
    }
    .photo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .photo {
      width: 55px;
      height: 65px;
      border: 2px solid #1E90B8;
      border-radius: 4px;
      background: linear-gradient(135deg, #1E90B8 0%, #3AA8D0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18pt;
      font-weight: bold;
    }
    .photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 2px;
    }
    .member-number {
      font-size: 6pt;
      font-weight: bold;
      color: #1E90B8;
      font-family: monospace;
    }
    .info-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .member-name {
      font-size: 11pt;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    .info-row {
      font-size: 6pt;
      color: #666;
      margin-bottom: 2px;
    }
    .info-label {
      font-weight: 600;
      color: #1E90B8;
    }
    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .qr-code {
      width: 45px;
      height: 45px;
    }
    .qr-label {
      font-size: 4pt;
      color: #999;
      text-align: center;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 4px;
      border-top: 1px solid #eee;
      margin-top: auto;
    }
    .validity {
      font-size: 5pt;
      color: #999;
    }
    .signature-section {
      text-align: right;
    }
    .signature-label {
      font-size: 4pt;
      color: #999;
    }
    .signature {
      font-family: 'Brush Script MT', cursive;
      font-size: 8pt;
      color: #1E90B8;
    }
    .watermark {
      position: absolute;
      bottom: 5px;
      right: 5px;
      font-size: 4pt;
      color: #ddd;
    }
    
    /* Card back */
    .card-back {
      background: linear-gradient(135deg, #1E90B8 0%, #145A75 100%);
      color: white;
      padding: 10px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .back-header {
      text-align: center;
      margin-bottom: 8px;
    }
    .back-title {
      font-size: 8pt;
      font-weight: bold;
    }
    .back-content {
      font-size: 5pt;
      line-height: 1.4;
      flex: 1;
    }
    .back-footer {
      text-align: center;
      font-size: 5pt;
      opacity: 0.8;
      margin-top: 8px;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .card {
        box-shadow: none;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="card-container">
    <!-- Front -->
    <div class="card">
      <div class="card-front">
        <div class="header">
          <img src="${logoAssojereb}" alt="Logo" class="logo" />
          <div class="org-info">
            <div class="org-name">ASSOJEREB</div>
            <div class="org-subtitle">Association des Jeunes Ressortissants de Brongonzué</div>
          </div>
          <div class="card-title">CARTE DE MEMBRE</div>
        </div>
        
        <div class="main-content">
          <div class="photo-section">
            <div class="photo">
              ${member.photo_url 
                ? `<img src="${member.photo_url}" alt="Photo" />` 
                : `${member.first_name.charAt(0)}${member.last_name.charAt(0)}`}
            </div>
            <div class="member-number">${member.member_number}</div>
          </div>
          
          <div class="info-section">
            <div class="member-name">${member.last_name} ${member.first_name}</div>
            <div class="info-row"><span class="info-label">Famille:</span> ${member.family?.name || '-'}</div>
            <div class="info-row"><span class="info-label">Statut:</span> ${member.status === 'actif' ? 'Actif' : member.status}</div>
            ${member.profession ? `<div class="info-row"><span class="info-label">Profession:</span> ${member.profession}</div>` : ''}
            ${member.phone ? `<div class="info-row"><span class="info-label">Tél:</span> ${member.phone}</div>` : ''}
          </div>
          
          <div class="qr-section">
            <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
            <div class="qr-label">Scanner pour<br/>vérifier</div>
          </div>
        </div>
        
        <div class="footer">
          <div class="validity">Valide jusqu'au 31/12/${new Date().getFullYear()}</div>
          <div class="signature-section">
            <div class="signature-label">Le Président</div>
            <div class="signature">Signature</div>
          </div>
        </div>
        
        <div class="watermark">ASSOJEREB</div>
      </div>
    </div>
    
    <!-- Back -->
    <div class="card">
      <div class="card-back">
        <div class="back-header">
          <div class="back-title">CONDITIONS D'UTILISATION</div>
        </div>
        <div class="back-content">
          <p>• Cette carte est personnelle et non transmissible.</p>
          <p>• Elle atteste de l'appartenance à l'ASSOJEREB.</p>
          <p>• En cas de perte, prévenir immédiatement l'association.</p>
          <p>• Le membre s'engage à respecter le règlement intérieur.</p>
          <p>• Scanner le QR code pour vérifier l'authenticité.</p>
        </div>
        <div class="back-footer">
          Contact: 07 07 16 79 21 | contact@assojereb.ci<br/>
          Brongonzué, Côte d'Ivoire
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div 
        ref={cardRef}
        className="w-full max-w-[340px] mx-auto aspect-[1.586/1] rounded-lg overflow-hidden shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        }}
      >
        <div className="p-3 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b-2 border-secondary">
            <img src={logoAssojereb} alt="Logo" className="w-7 h-7 rounded-full object-cover" />
            <div className="flex-1">
              <div className="text-xs font-bold text-primary">ASSOJEREB</div>
              <div className="text-[6px] text-muted-foreground">Association des Jeunes Ressortissants de Brongonzué</div>
            </div>
            <div className="text-[6px] font-bold text-white bg-secondary px-2 py-0.5 rounded">
              CARTE DE MEMBRE
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-3 mt-2 flex-1">
            {/* Photo */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-16 border-2 border-primary rounded bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-lg font-bold">
                {member.photo_url ? (
                  <img src={member.photo_url} alt="Photo" className="w-full h-full object-cover rounded" />
                ) : (
                  `${member.first_name.charAt(0)}${member.last_name.charAt(0)}`
                )}
              </div>
              <span className="text-[7px] font-mono font-bold text-primary">{member.member_number}</span>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-sm font-bold text-foreground mb-1">
                {member.last_name} {member.first_name}
              </div>
              <div className="text-[7px] text-muted-foreground space-y-0.5">
                <div><span className="font-semibold text-primary">Famille:</span> {member.family?.name || '-'}</div>
                <div><span className="font-semibold text-primary">Statut:</span> {member.status === 'actif' ? 'Actif' : member.status}</div>
                {member.profession && <div><span className="font-semibold text-primary">Profession:</span> {member.profession}</div>}
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR" className="w-11 h-11" />}
              <span className="text-[5px] text-muted-foreground text-center">Scanner pour<br/>vérifier</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-1 border-t mt-auto text-[6px]">
            <span className="text-muted-foreground">Valide jusqu'au 31/12/{new Date().getFullYear()}</span>
            <div className="text-right">
              <div className="text-muted-foreground">Le Président</div>
              <div className="font-serif italic text-primary">Signature</div>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleDownload} disabled={isGenerating} className="w-full btn-primary-gradient">
        {isGenerating ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération...</>
        ) : (
          <><Download className="mr-2 h-4 w-4" /> Télécharger la carte (PDF)</>
        )}
      </Button>
    </div>
  );
}
