// Types basés sur le schéma de la base de données

export type AppRole = 'admin' | 'president' | 'president_adjoint' | 'tresorier' | 'tresorier_adjoint' | 'commissaire_comptes' | 'chef_famille' | 'responsable' | 'membre';
export type MemberStatus = 'actif' | 'inactif' | 'sympathisant';
export type ContributionStatus = 'payee' | 'en_attente' | 'en_retard' | 'annulee';
export type ContributionType = 'mensuelle' | 'exceptionnelle' | 'adhesion';
export type GeographicZone = 'abidjan' | 'village' | 'ville_interieur' | 'exterieur' | 'diaspora';
export type Gender = 'homme' | 'femme';

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Super Administrateur',
  president: 'Président',
  president_adjoint: 'Président Adjoint',
  tresorier: 'Trésorier',
  tresorier_adjoint: 'Trésorier Adjoint',
  commissaire_comptes: 'Commissaire aux Comptes',
  chef_famille: 'Chef de Famille',
  responsable: 'Responsable',
  membre: 'Membre',
};

export const ZONE_LABELS: Record<GeographicZone, string> = {
  abidjan: 'Abidjan',
  village: 'Village',
  ville_interieur: "Ville de l'intérieur",
  exterieur: "Ville de l'intérieur", // Legacy mapping
  diaspora: 'Diaspora',
};

export interface Family {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface House {
  id: string;
  name: string;
  house_number: number;
  family_id: string | null;
  description: string | null;
  created_at: string;
}

export interface ContributionCategory {
  id: string;
  name: string;
  description: string | null;
  monthly_amount: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  family_id: string | null;
  created_at: string;
}

export interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  date_of_birth: string | null;
  family_id: string;
  house_id: string | null;
  profession: string | null;
  contribution_category_id: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  geographic_zone: GeographicZone;
  address: string | null;
  status: MemberStatus;
  photo_url: string | null;
  notes: string | null;
  registered_by: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  family?: Family;
  house?: House;
  contribution_category?: ContributionCategory;
}

export interface ExceptionalContribution {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  due_date: string | null;
  is_mandatory: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Contribution {
  id: string;
  member_id: string;
  contribution_type: ContributionType;
  amount: number;
  period_month: number | null;
  period_year: number | null;
  exceptional_contribution_id: string | null;
  status: ContributionStatus;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  member?: Member;
  exceptional_contribution?: ExceptionalContribution;
}

export interface News {
  id: string;
  title: string;
  slug: string | null;
  content: string;
  category: string;
  image_url: string | null;
  media_urls: string[] | null;
  is_published: boolean;
  published_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  member_id: string | null;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

// Stats types
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalContributions: number;
  pendingContributions: number;
  monthlyRevenue: number;
  membersByFamily: { name: string; count: number }[];
  membersByZone: { zone: string; count: number }[];
  contributionsByMonth: { month: string; amount: number }[];
}

// Permissions type
export interface UserPermissions {
  can_manage_members: boolean;
  can_manage_contributions: boolean;
  can_manage_news: boolean;
  can_view_reports: boolean;
  can_manage_roles: boolean;
  can_audit: boolean;
  family_id: string | null;
}
