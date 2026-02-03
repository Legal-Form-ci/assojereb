import { useState, useEffect } from 'react';
import { Member } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import logoAssojereb from '@/assets/logo-assojereb.png';

interface MemberCardProps {
  member: Member;
  baseUrl?: string;
}

export function MemberCard({ member, baseUrl = window.location.origin }: MemberCardProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // URL de vérification du membre
        const verificationUrl = `${baseUrl}/verification/${member.id}`;
        const dataUrl = await QRCode.toDataURL(verificationUrl, {
          width: 150,
          margin: 2,
          color: {
            dark: '#1E90B8',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [member.id, baseUrl]);

  const getStatusBadge = () => {
    switch (member.status) {
      case 'actif':
        return <Badge className="bg-success text-white">Actif</Badge>;
      case 'inactif':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'sympathisant':
        return <Badge className="bg-secondary text-secondary-foreground">Sympathisant</Badge>;
      default:
        return null;
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = generateCardHTML(member, qrCodeDataUrl);
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <Card className="card-elevated max-w-sm">
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg">
        <CardTitle className="text-center text-lg">Carte de Membre</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Header avec logo */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <img 
            src={logoAssojereb} 
            alt="Logo ASSOJEREB" 
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="text-center">
            <h3 className="font-serif font-bold text-primary">ASSOJEREB</h3>
            <p className="text-xs text-muted-foreground">Brongonzué</p>
          </div>
        </div>

        {/* Photo et infos */}
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {member.photo_url ? (
              <img 
                src={member.photo_url} 
                alt={`${member.first_name} ${member.last_name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {member.first_name.charAt(0)}{member.last_name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg">{member.last_name}</h4>
            <p className="text-primary font-medium">{member.first_name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              N° {member.member_number}
            </p>
            <div className="mt-2">{getStatusBadge()}</div>
          </div>
        </div>

        {/* Informations */}
        <div className="space-y-2 text-sm border-t pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Famille:</span>
            <span className="font-medium">{member.family?.name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Zone:</span>
            <span className="font-medium capitalize">{member.geographic_zone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Genre:</span>
            <span className="font-medium">{member.gender === 'homme' ? 'Homme' : 'Femme'}</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center mt-4 pt-4 border-t">
          {qrCodeDataUrl ? (
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code de vérification" 
              className="w-24 h-24"
            />
          ) : (
            <div className="w-24 h-24 bg-muted rounded flex items-center justify-center">
              <QrCode className="w-8 h-8 text-muted-foreground animate-pulse" />
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Scanner pour vérifier
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button 
            size="sm" 
            className="flex-1 btn-primary-gradient"
            onClick={handlePrint}
          >
            <Download className="mr-2 h-4 w-4" />
            Format PVC
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function generateCardHTML(member: Member, qrCodeDataUrl: string): string {
  // Dimensions carte PVC standard: 85.6mm x 53.98mm (ratio ~1.586)
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Carte Membre - ${member.last_name} ${member.first_name}</title>
  <style>
    @page {
      size: 86mm 54mm;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 8pt;
    }
    .card {
      width: 86mm;
      height: 54mm;
      background: linear-gradient(135deg, #ffffff 0%, #f0f7fa 100%);
      border-radius: 3mm;
      overflow: hidden;
      position: relative;
    }
    .header {
      background: linear-gradient(135deg, #1E90B8 0%, #3AA8D0 100%);
      color: white;
      padding: 3mm;
      display: flex;
      align-items: center;
      gap: 2mm;
    }
    .logo {
      width: 8mm;
      height: 8mm;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid rgba(255,255,255,0.5);
    }
    .org-name {
      font-size: 10pt;
      font-weight: bold;
    }
    .org-sub {
      font-size: 6pt;
      opacity: 0.9;
    }
    .content {
      display: flex;
      padding: 3mm;
      gap: 3mm;
    }
    .photo {
      width: 18mm;
      height: 22mm;
      background: #e0e0e0;
      border-radius: 2mm;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12pt;
      font-weight: bold;
      color: #888;
      overflow: hidden;
    }
    .photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .info {
      flex: 1;
    }
    .name {
      font-size: 10pt;
      font-weight: bold;
      color: #1a1a1a;
    }
    .firstname {
      font-size: 9pt;
      color: #1E90B8;
      font-weight: 600;
    }
    .member-number {
      font-size: 8pt;
      color: #666;
      margin-top: 1mm;
    }
    .details {
      margin-top: 2mm;
      font-size: 7pt;
      color: #555;
    }
    .details-row {
      display: flex;
      gap: 2mm;
    }
    .qr-section {
      position: absolute;
      bottom: 2mm;
      right: 2mm;
      text-align: center;
    }
    .qr-code {
      width: 15mm;
      height: 15mm;
    }
    .qr-label {
      font-size: 5pt;
      color: #888;
      margin-top: 1mm;
    }
    .status {
      display: inline-block;
      padding: 0.5mm 2mm;
      border-radius: 2mm;
      font-size: 6pt;
      font-weight: bold;
      margin-top: 1mm;
    }
    .status-actif {
      background: #27AE60;
      color: white;
    }
    .status-inactif {
      background: #666;
      color: white;
    }
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 25mm;
      background: #1E90B8;
      color: white;
      padding: 1.5mm 3mm;
      font-size: 5pt;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <img src="/logo-assojereb.png" alt="Logo" class="logo" />
      <div>
        <div class="org-name">ASSOJEREB</div>
        <div class="org-sub">Association des Jeunes Ressortissants de Brongonzué</div>
      </div>
    </div>
    
    <div class="content">
      <div class="photo">
        ${member.photo_url 
          ? `<img src="${member.photo_url}" alt="Photo" />`
          : `${member.first_name.charAt(0)}${member.last_name.charAt(0)}`
        }
      </div>
      <div class="info">
        <div class="name">${member.last_name}</div>
        <div class="firstname">${member.first_name}</div>
        <div class="member-number">N° ${member.member_number}</div>
        <span class="status status-${member.status}">${member.status.toUpperCase()}</span>
        <div class="details">
          <div class="details-row">
            <span>Famille: ${member.family?.name || '-'}</span>
          </div>
          <div class="details-row">
            <span>Zone: ${member.geographic_zone}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="qr-section">
      <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code" />
      <div class="qr-label">Vérification</div>
    </div>
    
    <div class="footer">
      Carte d'adhérent valide • contact@assojereb.ci
    </div>
  </div>
</body>
</html>
`;
}

export default MemberCard;
