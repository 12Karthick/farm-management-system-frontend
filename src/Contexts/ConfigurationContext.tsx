import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RecordStatus = 'Active' | 'Inactive';

export interface StructureRecord {
  id?: string;
  code: string;
  name: string;
  description: string;
  status: RecordStatus;
  farmId?: string;
}

export interface RoleRecord {
  id: string;
  name: string;
  contact: string;
  area: string;
  group: string;
  status: RecordStatus;

  // Integrated API details
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  employeeCode?: string;
  areaIds?: string[];
  functionGroupIds?: string[];
  companyId?: string;
  farmIds?: string[];
  farmName?: string;
  companyName?: string;
}

export interface NewStructureRow {
  code: string;
  name: string;
  description: string;
  status: RecordStatus;
  farmId?: string;
}

export interface NewRoleRow {
  id: string;
  name: string;
  contact: string;
  area: string;
  group: string;

  // Integrated API details
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  employeeCode?: string;
  areaIds?: string[];
  functionGroupIds?: string[];
  companyId?: string;
  farmIds?: string[];
  farmName?: string;
  companyName?: string;
}

export interface CompanyConfig {
  id: string;
  name: string;
  registrationNumber: string;
  email: string;
  phone: string;
  address: string;
  website: string;
}

export interface FarmConfig {
  id: string;
  name: string;
  description: string;
  companyId: string;
}

export interface ConfigState {
  companies: CompanyConfig[];
  farms: FarmConfig[];

  areas: StructureRecord[];
  newArea: NewStructureRow;

  functionGroups: StructureRecord[];
  newFunctionGroup: NewStructureRow;

  farmMasters: RoleRecord[];
  newFarmMaster: NewRoleRow;

  farmAdmins: RoleRecord[];
  newFarmAdmin: NewRoleRow;

  farmWorkers: RoleRecord[];
  newFarmWorker: NewRoleRow;

  supportWorkers: RoleRecord[];
  newSupportWorker: NewRoleRow;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

export const EMPTY_STRUCTURE_ROW: NewStructureRow = {
  code: '',
  name: '',
  description: '',
  status: 'Active',
  farmId: '',
};

export const EMPTY_ROLE_ROW: NewRoleRow = {
  id: '',
  name: '',
  contact: '',
  area: '',
  group: '',
};

const INITIAL_STATE: ConfigState = {
  companies: [
    {
      id: 'CO-001',
      name: 'AgriTech Solutions',
      registrationNumber: 'CIN-L01234MH2010PLC123456',
      email: 'contact@agritech.in',
      phone: '+91 98765 00000',
      address: '12, Tech Park, Pune, Maharashtra - 411001',
      website: 'www.agritech.in',
    },
    {
      id: 'CO-002',
      name: 'BioGrow Organics',
      registrationNumber: 'CIN-L98765MH2015PLC654321',
      email: 'info@biogrow.org',
      phone: '+91 98765 11111',
      address: '45, Industrial Estate, Nashik, Maharashtra - 422007',
      website: 'www.biogrow.org',
    }
  ],
  farms: [
    {
      id: 'FM-001',
      name: 'Green Valley Farm',
      description: 'Primary crop farm specializing in export-grade organic table grapes and onions.',
      companyId: 'CO-001',
    },
    {
      id: 'FM-002',
      name: 'Sunny Acres Ranch',
      description: 'Secondary farm block focusing on sugarcane and cotton rotation.',
      companyId: 'CO-001',
    }
  ],

  areas: [
    { code: 'AR-001', name: 'North Orchard', description: 'Fruit crop block with drip irrigation.', status: 'Active', farmId: 'FM-001' },
    { code: 'AR-002', name: 'Greenhouse A', description: 'Protected vegetable cultivation area.', status: 'Active', farmId: 'FM-001' },
    { code: 'AR-003', name: 'Storage Yard', description: 'Input storage and dispatch staging.', status: 'Inactive', farmId: 'FM-002' },
  ],
  newArea: { ...EMPTY_STRUCTURE_ROW },

  functionGroups: [
    { code: 'FG-IRR', name: 'Irrigation', description: 'Water scheduling and pump operations.', status: 'Active' },
    { code: 'FG-HRV', name: 'Harvesting', description: 'Crop collection, grading, and movement.', status: 'Active' },
    { code: 'FG-MNT', name: 'Maintenance', description: 'Equipment, repair, and field readiness.', status: 'Active' },
  ],
  newFunctionGroup: { ...EMPTY_STRUCTURE_ROW },

  farmMasters: [
    { id: 'FM-001', name: 'Arun Kumar', contact: 'arun.kumar@farm.local', area: 'North Orchard', group: 'Irrigation', status: 'Active' },
    { id: 'FM-002', name: 'Meera Shah', contact: 'meera.shah@farm.local', area: 'Greenhouse A', group: 'Irrigation', status: 'Active' },
  ],
  newFarmMaster: { ...EMPTY_ROLE_ROW },

  farmAdmins: [
    { id: 'FA-001', name: 'Priya Nair', contact: 'priya.nair@farm.local', area: 'North Orchard', group: 'Harvesting', status: 'Active' },
    { id: 'FA-002', name: 'Rohit Menon', contact: 'rohit.menon@farm.local', area: 'Greenhouse A', group: 'Maintenance', status: 'Inactive' },
  ],
  newFarmAdmin: { ...EMPTY_ROLE_ROW },

  farmWorkers: [
    { id: 'FW-104', name: 'Anil Das', contact: '+91 98765 41041', area: 'North Orchard', group: 'Harvesting', status: 'Active' },
    { id: 'FW-118', name: 'Leela Mathew', contact: '+91 98765 41055', area: 'Greenhouse A', group: 'Irrigation', status: 'Active' },
    { id: 'FW-127', name: 'Naveen Rao', contact: '+91 98765 41064', area: 'Greenhouse A', group: 'Maintenance', status: 'Inactive' },
  ],
  newFarmWorker: { ...EMPTY_ROLE_ROW },

  supportWorkers: [
    { id: 'FS-031', name: 'Sara Khan', contact: '+91 98765 42031', area: 'Greenhouse A', group: 'Maintenance', status: 'Active' },
    { id: 'FS-044', name: 'Vikram Joshi', contact: '+91 98765 42044', area: 'Greenhouse A', group: 'Irrigation', status: 'Active' },
  ],
  newSupportWorker: { ...EMPTY_ROLE_ROW },
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface ConfigurationContextValue {
  draft: ConfigState;
  saved: ConfigState;
  updateDraft: <K extends keyof ConfigState>(key: K, value: ConfigState[K]) => void;
  commitSave: () => void;
  resetDraft: () => void;
}

const ConfigurationContext = createContext<ConfigurationContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ConfigurationProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<ConfigState>(INITIAL_STATE);
  const [draft, setDraft] = useState<ConfigState>(INITIAL_STATE);

  const updateDraft = useCallback(<K extends keyof ConfigState>(key: K, value: ConfigState[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const commitSave = useCallback(() => {
    setSaved(draft);
  }, [draft]);

  const resetDraft = useCallback(() => {
    setDraft(saved);
  }, [saved]);

  return (
    <ConfigurationContext.Provider value={{ draft, saved, updateDraft, commitSave, resetDraft }}>
      {children}
    </ConfigurationContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDraftConfig() {
  const ctx = useContext(ConfigurationContext);
  if (!ctx) throw new Error('useDraftConfig must be used within ConfigurationProvider');
  return ctx;
}
