import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  PushpinOutlined,
  SearchOutlined,
  TeamOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, Popconfirm, Select, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { StructureRecord, FarmConfig } from '../../Contexts/ConfigurationContext';
import { useDraftConfig } from '../../Contexts/ConfigurationContext';
import {
  useGetAreasQuery,
  useCreateAreaMutation,
  useUpdateAreaMutation,
  useDeleteAreaMutation,
} from '../../api/endpoints/areaApi';
import { useGetFarmsQuery } from '../../api/endpoints/farmApi';
import type { Area } from '../../api/types.ts/area.types';
import './Configuration.css';

// ─── Count workers assigned to a given area ───────────────────────────────────
function useWorkerCount(areaName: string) {
  const { draft } = useDraftConfig();
  return useMemo(
    () =>
      [
        ...draft.farmMasters,
        ...draft.farmAdmins,
        ...draft.farmWorkers,
        ...draft.supportWorkers,
      ].filter((r) => r.area === areaName).length,
    [draft.farmMasters, draft.farmAdmins, draft.farmWorkers, draft.supportWorkers, areaName],
  );
}

// ─── Modal Form (Create / Edit) ───────────────────────────────────────────────
function AreaFormModal({
  open,
  title,
  initial,
  farms,
  existingCodes,
  onOk,
  onCancel,
}: {
  open: boolean;
  title: string;
  initial: StructureRecord;
  farms: FarmConfig[];
  existingCodes: string[];
  onOk: (rec: StructureRecord) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<StructureRecord>({ ...initial });
  const [messageApi, contextHolder] = message.useMessage();

  useMemo(() => setForm({ ...initial }), [initial]);

  const hasNoFarms = farms.length === 0;
  const isEdit = title.startsWith('Edit');

  function handleOk() {
    if (hasNoFarms) {
      messageApi.error('Cannot create area: You must create a Farm first.');
      return;
    }
    if (!form.name.trim()) {
      messageApi.warning('Area Name is required.');
      return;
    }
    if (!form.code.trim()) {
      messageApi.warning('Area ID / Code is required.');
      return;
    }
    if (!isEdit && existingCodes.includes(form.code.trim().toLowerCase())) {
      messageApi.warning(`Code "${form.code}" already exists.`);
      return;
    }
    if (!form.farmId) {
      messageApi.warning('Associated Farm selection is required.');
      return;
    }
    onOk({ ...form, name: form.name.trim(), code: form.code.trim() });
  }

  return (
    <>
      {contextHolder}
      <Modal
        title={title}
        open={open}
        onOk={handleOk}
        onCancel={onCancel}
        okText={isEdit ? 'Save Changes' : 'Create Area'}
        cancelText="Cancel"
        className="cfg-modal"
        width={520}
        destroyOnClose
        okButtonProps={{ disabled: hasNoFarms }}
      >
        <div className="cfg-modal__form">
          {hasNoFarms && (
            <div
              className="cfg-note"
              style={{
                borderColor: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                margin: '0 0 var(--space-2)',
              }}
            >
              <strong>Notice:</strong> Please add at least one farm in the Farm tab before creating an area, as all areas must belong to a parent farm.
            </div>
          )}

          <label className="cfg-field">
            <span>Area Name *</span>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. North Orchard"
              disabled={hasNoFarms}
              prefix={<PushpinOutlined style={{ color: 'var(--text-muted)' }} />}
            />
          </label>

          <label className="cfg-field">
            <span>Area ID / Code *</span>
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="e.g. AR-001"
              disabled={hasNoFarms || isEdit}
            />
          </label>

          <label className="cfg-field">
            <span>Associated Farm *</span>
            <Select
              value={form.farmId || undefined}
              onChange={(val) => setForm((f) => ({ ...f, farmId: val }))}
              placeholder="Select associated farm"
              options={farms.map((f) => ({ value: f.id, label: `${f.name}` }))}
              style={{ width: '100%' }}
              disabled={hasNoFarms}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </label>

          <label className="cfg-field">
            <span>Description</span>
            <Input.TextArea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief geographic description or crop cultivation parameters (optional)"
              disabled={hasNoFarms}
              rows={4}
            />
          </label>

          <label className="cfg-field">
            <span>Status</span>
            <Select
              value={form.status}
              onChange={(val) => setForm((f) => ({ ...f, status: val as any }))}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              style={{ width: '100%' }}
              disabled={hasNoFarms}
            />
          </label>
        </div>
      </Modal>
    </>
  );
}

// ─── Single Area Card ─────────────────────────────────────────────────────────
function AreaCard({
  area,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  area: Area;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const workerCount = useWorkerCount(area.areaName);
  const farmName = area.farm?.farmName || 'Unknown Farm';

  return (
    <div className="ar-card">
      {/* Top Identity & Actions */}
      <div className="ar-card__top">
        <div className="ar-card__icon-wrap">
          <PushpinOutlined />
        </div>
        <div className="ar-card__identity">
          <span className="ar-card__name" title={area.areaName}>
            {area.areaName}
          </span>
          <span className="ar-card__kicker">{area.areaCode}</span>
        </div>
        <div className="ar-card__menu">
          <Button
            className="cfg-icon-btn"
            icon={<EditOutlined />}
            title="Edit Area"
            onClick={onEdit}
          />
          <Popconfirm
            title="Delete this area?"
            description="Role entries assigned to this area will lose their area mapping."
            onConfirm={onDelete}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              className="cfg-icon-btn cfg-icon-btn--danger"
              icon={<DeleteOutlined />}
              title="Delete Area"
            />
          </Popconfirm>
        </div>
      </div>

      {/* Body Details */}
      <div className="ar-card__body">
        <div className="ar-card__field">
          <EnvironmentOutlined />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Farm: {farmName}
          </span>
        </div>

        <div className="ar-card__field">
          <TeamOutlined />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Active Workers: {workerCount}
          </span>
        </div>

        <div className="ar-card__field" style={{ minHeight: '40px', alignItems: 'flex-start', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)' }}>
          <span style={{ whiteSpace: 'normal', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
            {area.areaDescription || <em style={{ color: 'var(--text-muted)' }}>No description</em>}
          </span>
        </div>

        <div className="ar-card__field" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)', marginTop: 'auto' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
          <button
            className={`fg-card__status-badge fg-card__status-badge--${area.isActive ? 'active' : 'inactive'}`}
            onClick={onToggleStatus}
            title="Click to toggle status"
            style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
          >
            {area.isActive ? 'active' : 'inactive'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab Component ───────────────────────────────────────────────────────
export default function AreasTab() {
  const { draft, updateDraft } = useDraftConfig();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Area | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // RTK Query hooks
  const { data: areasData, isLoading } = useGetAreasQuery();
  const { data: farmsData } = useGetFarmsQuery();

  const [createArea] = useCreateAreaMutation();
  const [updateArea] = useUpdateAreaMutation();
  const [deleteArea] = useDeleteAreaMutation();

  // Sync loaded database areas with local draft state for backwards compatibility
  useEffect(() => {
    if (areasData) {
      const mapped: StructureRecord[] = areasData.map((a) => ({
        id: a.areaId,
        code: a.areaCode,
        name: a.areaName,
        description: a.areaDescription || '',
        status: a.isActive ? 'Active' : 'Inactive',
        farmId: a.farm?.farmId || '',
      }));
      if (JSON.stringify(draft.areas) !== JSON.stringify(mapped)) {
        updateDraft('areas', mapped);
      }
    }
  }, [areasData, draft.areas, updateDraft]);

  // Sync loaded farms into draft state in case user visited AreasTab first
  useEffect(() => {
    if (farmsData) {
      const mapped: FarmConfig[] = farmsData.map((f) => ({
        id: f.farmId,
        name: f.farmName,
        description: f.farmDescription || '',
        companyId: f.company?.companyId || '',
      }));
      if (JSON.stringify(draft.farms) !== JSON.stringify(mapped)) {
        updateDraft('farms', mapped);
      }
    }
  }, [farmsData, draft.farms, updateDraft]);

  const farmsList = useMemo(() => {
    if (farmsData) {
      return farmsData.map((f) => ({
        id: f.farmId,
        name: f.farmName,
        description: f.farmDescription || '',
        companyId: f.company?.companyId || '',
      }));
    }
    return draft.farms || [];
  }, [farmsData, draft.farms]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = areasData || [];
    return list.filter((a) => {
      if (!q) return true;
      const fName = a.farm?.farmName || '';
      return (
        a.areaName.toLowerCase().includes(q) ||
        a.areaCode.toLowerCase().includes(q) ||
        (a.areaDescription && a.areaDescription.toLowerCase().includes(q)) ||
        fName.toLowerCase().includes(q)
      );
    });
  }, [areasData, search]);

  const EMPTY_AREA: StructureRecord = {
    id: '',
    code: '',
    name: '',
    description: '',
    status: 'Active',
    farmId: '',
  };

  const editInitial = useMemo<StructureRecord>(() => {
    if (!editTarget) return EMPTY_AREA;
    return {
      id: editTarget.areaId,
      code: editTarget.areaCode,
      name: editTarget.areaName,
      description: editTarget.areaDescription || '',
      status: editTarget.isActive ? 'Active' : 'Inactive',
      farmId: editTarget.farm?.farmId || '',
    };
  }, [editTarget]);

  async function handleCreate(rec: StructureRecord) {
    try {
      await createArea({
        areaName: rec.name.trim(),
        areaCode: rec.code.trim(),
        areaDescription: rec.description.trim(),
        farmId: rec.farmId || '',
      }).unwrap();
      setCreateOpen(false);
      messageApi.success(`Area "${rec.name}" successfully created.`);
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to create area.');
    }
  }

  async function handleEdit(rec: StructureRecord) {
    if (!editTarget) return;
    try {
      if (rec.status === 'Inactive' && editTarget.isActive) {
        await deleteArea(editTarget.areaId).unwrap();
        messageApi.success(`Area "${rec.name}" status updated to Inactive.`);
      } else {
        await updateArea({
          id: editTarget.areaId,
          body: {
            areaName: rec.name.trim(),
            areaDescription: rec.description.trim(),
            farmId: rec.farmId || '',
          },
        }).unwrap();
        messageApi.success(`Area "${rec.name}" updated.`);
      }
      setEditTarget(null);
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to update area.');
    }
  }

  async function handleDelete(id: string) {
    const target = (areasData || []).find((a) => a.areaId === id);
    try {
      await deleteArea(id).unwrap();
      messageApi.success(`Area "${target?.areaName || id}" deleted.`);
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to delete area.');
    }
  }

  async function handleStatusToggle(id: string, currentIsActive: boolean) {
    const target = (areasData || []).find((a) => a.areaId === id);
    try {
      if (currentIsActive) {
        await deleteArea(id).unwrap();
        messageApi.success(`Area "${target?.areaName || id}" status updated to Inactive.`);
      } else {
        // Fallback or warning if toggle to active is selected
        messageApi.info('To reactivate this area, please edit it and set its status to Active.');
      }
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to toggle status.');
    }
  }

  function getExistingCodes(excludeCode?: string) {
    return (areasData || [])
      .filter((a) => a.areaCode !== excludeCode)
      .map((a) => a.areaCode.toLowerCase());
  }

  if (isLoading) {
    return (
      <div className="cfg-panel cfg-panel--area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Loading area directories...</span>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="cfg-panel cfg-panel--area">
        {/* Header */}
        <div className="cfg-panel__header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <div className="cfg-panel__header-icon--area">
              <PushpinOutlined />
            </div>
            <div>
              <span className="cfg-panel__kicker">Geographic Areas</span>
              <h3>Area Directory</h3>
              <p>
                Configure regional blocks, crop cultivation zones, irrigation grids, and infrastructure fields mapped under your farm profiles.
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="cfg-toolbar" style={{ gridTemplateColumns: 'minmax(240px, 1fr) auto' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search areas by name, code, description, or parent farm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cfg-search-input"
            style={{
              '--search-border': '#f97316',
              '--search-dim': 'rgba(249, 115, 22, 0.25)',
            } as React.CSSProperties}
          />
          <Button
            className="fg-add-btn"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #f97316, #dc2626)',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.45)',
            }}
          >
            Add Area
          </Button>
        </div>

        {/* Cards Grid */}
        {filtered.length === 0 ? (
          <div className="cfg-table__empty" style={{ padding: 'var(--space-10) var(--space-5)' }}>
            {search ? 'No areas match your search.' : 'No areas yet — click Add Area to create one.'}
          </div>
        ) : (
          <div className="ar-grid">
            {filtered.map((area) => (
              <AreaCard
                key={area.areaId}
                area={area}
                onEdit={() => setEditTarget(area)}
                onDelete={() => handleDelete(area.areaId)}
                onToggleStatus={() => handleStatusToggle(area.areaId, area.isActive)}
              />
            ))}
          </div>
        )}

        <div className="cfg-note">
          Ensure farm directories are populated before defining geographic boundaries and allocating workforce groups.
        </div>
      </div>

      {/* Create Modal */}
      <AreaFormModal
        open={createOpen}
        title="Add Area"
        initial={{ ...EMPTY_AREA }}
        farms={farmsList}
        existingCodes={getExistingCodes()}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
      />

      {/* Edit Modal */}
      {editTarget && (
        <AreaFormModal
          open={!!editTarget}
          title={`Edit Area: ${editTarget.areaName}`}
          initial={editInitial}
          farms={farmsList}
          existingCodes={getExistingCodes(editTarget.areaCode)}
          onOk={handleEdit}
          onCancel={() => setEditTarget(null)}
        />
      )}
    </>
  );
}
