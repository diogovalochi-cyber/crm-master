export type UserRole = 'VENDEDOR' | 'TECNICO' | 'SUPERVISOR' | 'GERENTE' | 'ANALISTA';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  meta?: number;
  code?: string;
}

export interface RolePermissions {
  canViewFullRevenue: boolean;
  canViewAllLeads: boolean;
  canViewTeamPerformance: boolean;
  canViewOwnStats: boolean;
  canViewOwnMeta: boolean;
  canViewWeeklyAgenda: boolean;
  canViewKanban: boolean;
  canViewContatos: boolean;
  canViewProjetos: boolean;
  canViewRelatorios: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  GERENTE: {
    canViewFullRevenue: true, canViewAllLeads: true, canViewTeamPerformance: true,
    canViewOwnStats: true, canViewOwnMeta: false, canViewWeeklyAgenda: true,
    canViewKanban: true, canViewContatos: true, canViewProjetos: true, canViewRelatorios: true,
  },
  SUPERVISOR: {
    canViewFullRevenue: true, canViewAllLeads: true, canViewTeamPerformance: true,
    canViewOwnStats: true, canViewOwnMeta: false, canViewWeeklyAgenda: true,
    canViewKanban: true, canViewContatos: true, canViewProjetos: true, canViewRelatorios: true,
  },
  ANALISTA: {
    canViewFullRevenue: true, canViewAllLeads: true, canViewTeamPerformance: true,
    canViewOwnStats: true, canViewOwnMeta: false, canViewWeeklyAgenda: true,
    canViewKanban: true, canViewContatos: true, canViewProjetos: true, canViewRelatorios: true,
  },
  VENDEDOR: {
    canViewFullRevenue: false, canViewAllLeads: false, canViewTeamPerformance: false,
    canViewOwnStats: true, canViewOwnMeta: true, canViewWeeklyAgenda: true,
    canViewKanban: true, canViewContatos: true, canViewProjetos: false, canViewRelatorios: false,
  },
  TECNICO: {
    canViewFullRevenue: false, canViewAllLeads: false, canViewTeamPerformance: false,
    canViewOwnStats: false, canViewOwnMeta: false, canViewWeeklyAgenda: true,
    canViewKanban: false, canViewContatos: true, canViewProjetos: false, canViewRelatorios: false,
  },
};
