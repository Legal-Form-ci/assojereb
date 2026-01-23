import { Member, Contribution, Family } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function generateMembersCSV(members: Member[]): string {
  const headers = [
    'Numéro',
    'Nom',
    'Prénom',
    'Genre',
    'Date de naissance',
    'Famille',
    'Maison',
    'Profession',
    'Catégorie',
    'Téléphone',
    'WhatsApp',
    'Email',
    'Zone géographique',
    'Adresse',
    'Statut',
    'Date inscription'
  ];

  const rows = members.map(member => [
    escapeCSV(member.member_number),
    escapeCSV(member.last_name),
    escapeCSV(member.first_name),
    escapeCSV(member.gender === 'homme' ? 'Homme' : 'Femme'),
    escapeCSV(member.date_of_birth ? format(new Date(member.date_of_birth), 'dd/MM/yyyy') : ''),
    escapeCSV(member.family?.name),
    escapeCSV(member.house?.name),
    escapeCSV(member.profession),
    escapeCSV(member.contribution_category?.name),
    escapeCSV(member.phone),
    escapeCSV(member.whatsapp),
    escapeCSV(member.email),
    escapeCSV(member.geographic_zone),
    escapeCSV(member.address),
    escapeCSV(member.status),
    escapeCSV(member.created_at ? format(new Date(member.created_at), 'dd/MM/yyyy') : ''),
  ]);

  // Add BOM for Excel to recognize UTF-8
  const BOM = '\ufeff';
  return BOM + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function generateContributionsCSV(contributions: Contribution[]): string {
  const statusLabels: Record<string, string> = {
    payee: 'Payée',
    en_attente: 'En attente',
    en_retard: 'En retard',
    annulee: 'Annulée',
  };

  const typeLabels: Record<string, string> = {
    mensuelle: 'Mensuelle',
    exceptionnelle: 'Exceptionnelle',
    adhesion: 'Adhésion',
  };

  const headers = [
    'N° Membre',
    'Nom',
    'Prénom',
    'Type',
    'Mois',
    'Année',
    'Montant (FCFA)',
    'Statut',
    'Mode de paiement',
    'Référence',
    'Date de paiement',
    'Notes',
    'Date création'
  ];

  const rows = contributions.map(c => [
    escapeCSV(c.member?.member_number),
    escapeCSV(c.member?.last_name),
    escapeCSV(c.member?.first_name),
    escapeCSV(typeLabels[c.contribution_type] || c.contribution_type),
    escapeCSV(c.period_month),
    escapeCSV(c.period_year),
    escapeCSV(c.amount),
    escapeCSV(statusLabels[c.status] || c.status),
    escapeCSV(c.payment_method),
    escapeCSV(c.payment_reference),
    escapeCSV(c.paid_at ? format(new Date(c.paid_at), 'dd/MM/yyyy HH:mm') : ''),
    escapeCSV(c.notes),
    escapeCSV(format(new Date(c.created_at), 'dd/MM/yyyy')),
  ]);

  const BOM = '\ufeff';
  return BOM + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
