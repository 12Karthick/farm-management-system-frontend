import { useEffect, useMemo } from 'react';
import { message } from 'antd';
import { useDraftConfig } from '../../Contexts/ConfigurationContext';
import RolePanel from './RolePanel';
import {
  useGetFarmPersonsQuery,
  useCreateFarmPersonMutation,
  useUpdateFarmPersonMutation,
  useDeleteFarmPersonMutation,
} from '../../api/endpoints/farmPersonApi';
import { useGetCompaniesQuery } from '../../api/endpoints/companyApi';
import { useGetAreasQuery } from '../../api/endpoints/areaApi';
import { useGetFunctionGroupsQuery } from '../../api/endpoints/functionGroupApi';
import type { RoleRecord } from '../../Contexts/ConfigurationContext';

export default function FarmWorkersTab() {
  const { draft, updateDraft } = useDraftConfig();

  // Queries
  const { data: farmPersonsData, isLoading } = useGetFarmPersonsQuery();
  const { data: companiesData } = useGetCompaniesQuery();
  const { data: areasData } = useGetAreasQuery();
  const { data: fgData } = useGetFunctionGroupsQuery();

  // Mutations
  const [createFarmPerson] = useCreateFarmPersonMutation();
  const [updateFarmPerson] = useUpdateFarmPersonMutation();
  const [deleteFarmPerson] = useDeleteFarmPersonMutation();

  // Map backend entities to compatible frontend RoleRecords for Farm Workers
  const farmWorkersList = useMemo(() => {
    if (!farmPersonsData) return [];
    return farmPersonsData
      .filter((fp) => fp.farmRole === 'Farm Worker')
      .map((fp) => {
        const farmIdSet = new Set<string>();
        const farmNameSet = new Set<string>();
        if (fp.farm?.farmId) {
          farmIdSet.add(fp.farm.farmId);
          farmNameSet.add(fp.farm.farmName);
        }
        fp.areaMappings?.filter(m => m.isActive).forEach(m => {
          if (m.area?.farm?.farmId) {
            farmIdSet.add(m.area.farm.farmId);
            farmNameSet.add(m.area.farm.farmName);
          }
        });
        fp.functionGroupMappings?.filter(m => m.isActive).forEach(m => {
          if (m.functionGroup?.farm?.farmId) {
            farmIdSet.add(m.functionGroup.farm.farmId);
            farmNameSet.add(m.functionGroup.farm.farmName);
          }
        });
        const farmIds = Array.from(farmIdSet);
        const farmName = Array.from(farmNameSet).join(', ');

        return {
          id: fp.id,
          firstName: fp.firstName,
          lastName: fp.lastName || '',
          name: `${fp.firstName} ${fp.lastName || ''}`.trim(),
          employeeCode: fp.employeeCode || '',
          email: fp.email || '',
          mobileNumber: fp.mobileNumber || '',
          contact: fp.email || fp.mobileNumber || '',
          status: fp.status ? ('Active' as const) : ('Inactive' as const),
          companyId: fp.company?.companyId || '',
          companyName: fp.company?.companyName || '',
          farmIds,
          farmName,
          areaIds: fp.areaMappings?.filter(m => m.isActive).map(m => m.area.areaId) || [],
          area: fp.areaMappings?.filter(m => m.isActive).map(m => m.area.areaName).join(', ') || '',
          functionGroupIds: fp.functionGroupMappings?.filter(m => m.isActive).map(m => m.functionGroup.id) || [],
          group: fp.functionGroupMappings?.filter(m => m.isActive).map(m => m.functionGroup.name).join(', ') || '',
        };
      });
  }, [farmPersonsData]);

  // Sync loaded database farm workers with local draft state
  useEffect(() => {
    if (farmPersonsData) {
      if (JSON.stringify(draft.farmWorkers) !== JSON.stringify(farmWorkersList)) {
        updateDraft('farmWorkers', farmWorkersList);
      }
    }
  }, [farmPersonsData, farmWorkersList, draft.farmWorkers, updateDraft]);

  // Sync areas
  useEffect(() => {
    if (areasData) {
      const mapped = areasData.map(a => ({
        id: a.areaId,
        code: a.areaCode,
        name: a.areaName,
        description: a.areaDescription || '',
        status: a.isActive ? ('Active' as const) : ('Inactive' as const),
        farmId: a.farm?.farmId || '',
      }));
      if (JSON.stringify(draft.areas) !== JSON.stringify(mapped)) {
        updateDraft('areas', mapped);
      }
    }
  }, [areasData, draft.areas, updateDraft]);

  // Sync function groups
  useEffect(() => {
    if (fgData) {
      const mapped = fgData.map(fg => ({
        id: fg.id,
        code: fg.code,
        name: fg.name,
        description: fg.description || '',
        status: fg.status ? ('Active' as const) : ('Inactive' as const),
        farmId: fg.farm?.farmId || '',
      }));
      if (JSON.stringify(draft.functionGroups) !== JSON.stringify(mapped)) {
        updateDraft('functionGroups', mapped);
      }
    }
  }, [fgData, draft.functionGroups, updateDraft]);

  // Sync companies to draft state
  const mappedCompanies = useMemo(() => {
    if (!companiesData) return [];
    return companiesData.map((c) => ({
      id: c.companyId,
      name: c.companyName,
      registrationNumber: c.registrationNumber,
      email: c.companyMail,
      phone: '',
      address: c.address,
      website: c.website,
    }));
  }, [companiesData]);

  useEffect(() => {
    if (companiesData) {
      if (JSON.stringify(draft.companies) !== JSON.stringify(mappedCompanies)) {
        updateDraft('companies', mappedCompanies);
      }
    }
  }, [companiesData, mappedCompanies, draft.companies, updateDraft]);

  async function handleLiveCreate(rec: RoleRecord) {
    try {
      await createFarmPerson({
        firstName: rec.firstName || '',
        lastName: rec.lastName || '',
        employeeCode: rec.employeeCode || '',
        email: rec.email || '',
        mobileNumber: rec.mobileNumber || '',
        farmRole: 'Farm Worker',
        farmRoleNumber: '3',
        companyId: rec.companyId || '',
        farmId: rec.farmIds && rec.farmIds.length > 0 ? rec.farmIds[0] : '',
        areaIds: rec.areaIds || [],
        functionGroupIds: rec.functionGroupIds || [],
        status: rec.status === 'Active',
      }).unwrap();
      message.success(`Farm Worker "${rec.name}" successfully created.`);
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to create Farm Worker.');
      throw err;
    }
  }

  async function handleLiveEdit(rec: RoleRecord) {
    try {
      await updateFarmPerson({
        id: rec.id,
        body: {
          firstName: rec.firstName || '',
          lastName: rec.lastName || '',
          employeeCode: rec.employeeCode || '',
          email: rec.email || '',
          mobileNumber: rec.mobileNumber || '',
          farmRole: 'Farm Worker',
          farmRoleNumber: '3',
          companyId: rec.companyId || '',
          farmId: rec.farmIds && rec.farmIds.length > 0 ? rec.farmIds[0] : '',
          areaIds: rec.areaIds || [],
          functionGroupIds: rec.functionGroupIds || [],
          status: rec.status === 'Active',
        },
      }).unwrap();
      message.success(`Farm Worker "${rec.name}" successfully updated.`);
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update Farm Worker.');
      throw err;
    }
  }

  async function handleLiveDelete(id: string) {
    try {
      await deleteFarmPerson(id).unwrap();
      message.success('Farm Worker deleted.');
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete Farm Worker.');
      throw err;
    }
  }

  if (isLoading) {
    return (
      <div className="cfg-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Loading Farm Workers directory...</span>
      </div>
    );
  }

  return (
    <RolePanel
      title="Farm Workers"
      addLabel="Add Worker"
      idLabel="Employee Code"
      records={draft.farmWorkers}
      newRow={draft.newFarmWorker}
      onNewRowChange={(row) => updateDraft('newFarmWorker', row)}
      onRecordsChange={(records) => updateDraft('farmWorkers', records)}
      onSave={() => {}}
      areas={draft.areas}
      functionGroups={draft.functionGroups}
      theme="cyan"
      isBackendIntegrated={true}
      companies={draft.companies}
      onLiveCreate={handleLiveCreate}
      onLiveEdit={handleLiveEdit}
      onLiveDelete={handleLiveDelete}
      isMultiSelect={false}
    />
  );
}
