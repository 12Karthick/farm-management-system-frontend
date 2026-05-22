import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, Popconfirm, Select, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { StructureRecord, FarmConfig } from '../../Contexts/ConfigurationContext';
import { useDraftConfig } from '../../Contexts/ConfigurationContext';
import {
  useGetFunctionGroupsQuery,
  useCreateFunctionGroupMutation,
  useUpdateFunctionGroupMutation,
  useDeleteFunctionGroupMutation,
} from '../../api/endpoints/functionGroupApi';
import { useGetFarmsQuery } from '../../api/endpoints/farmApi';
import type { FunctionGroup } from '../../api/types.ts/functionGroup.types';
import './Configuration.css';

// ─── Count workers assigned to a given group ───────────────────────────────────
function useMemberCount(groupName: string) {
  const { draft } = useDraftConfig();
  return useMemo(
    () =>
      [
        ...draft.farmMasters,
        ...draft.farmAdmins,
        ...draft.farmWorkers,
        ...draft.supportWorkers,
      ].filter((r) => r.group === groupName).length,
    [draft.farmMasters, draft.farmAdmins, draft.farmWorkers, draft.supportWorkers, groupName],
  );
}

// ─── Modal Form (Create / Edit) ───────────────────────────────────────────────
function GroupFormModal({
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
  onOk: (row: StructureRecord) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<StructureRecord>({ ...initial });
  const [messageApi, contextHolder] = message.useMessage();

  useMemo(() => setForm({ ...initial }), [initial]);

  const hasNoFarms = farms.length === 0;
  const isEdit = title.startsWith('Edit');

  function handleOk() {
    if (hasNoFarms) {
      messageApi.error('Cannot create function group: You must create a Farm first.');
      return;
    }
    if (!form.name.trim()) {
      messageApi.warning('Function Group Name is required.');
      return;
    }
    if (!form.code.trim()) {
      messageApi.warning('Group ID / Code is required.');
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
        okText={isEdit ? 'Save Changes' : 'Create Group'}
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
              <strong>Notice:</strong> Please add at least one farm in the Farm tab before creating a function group, as all function groups must belong to a parent farm.
            </div>
          )}

          <label className="cfg-field">
            <span>Function Group Name *</span>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Irrigation"
              disabled={hasNoFarms}
              prefix={<AppstoreOutlined style={{ color: 'var(--text-muted)' }} />}
            />
          </label>

          <label className="cfg-field">
            <span>Group ID / Code *</span>
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="e.g. FG-IRR"
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
              placeholder="Brief description of responsibilities or workflow scope (optional)"
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

// ─── Single Group Card ────────────────────────────────────────────────────────
function GroupCard({
  group,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  group: FunctionGroup;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const memberCount = useMemberCount(group.name);
  const farmName = group.farm?.farmName || 'Unknown Farm';

  return (
    <div className="fg-card">
      {/* Top Identity & Actions */}
      <div className="fg-card__top">
        <div className="fg-card__icon-wrap">
          <AppstoreOutlined />
        </div>
        <div className="fg-card__identity">
          <span className="fg-card__name" title={group.name}>
            {group.name}
          </span>
          <span className="ar-card__kicker">
            {group.code}
          </span>
        </div>
        <div className="fg-card__menu">
          <Button
            className="cfg-icon-btn"
            icon={<EditOutlined />}
            title="Edit Group"
            onClick={onEdit}
          />
          <Popconfirm
            title="Delete this function group?"
            description="Role entries linked to this group will lose their group mapping."
            onConfirm={onDelete}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              className="cfg-icon-btn cfg-icon-btn--danger"
              icon={<DeleteOutlined />}
              title="Delete Group"
            />
          </Popconfirm>
        </div>
      </div>

      {/* Body Details */}
      <div className="fg-card__body" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-1)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div className="ar-card__field">
          <EnvironmentOutlined />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Farm: {farmName}
          </span>
        </div>

        <div className="fg-card__members" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          <TeamOutlined style={{ marginRight: '5px' }} />
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </div>

        <div style={{ minHeight: '40px', display: 'flex', alignItems: 'flex-start', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)' }}>
          <span style={{ whiteSpace: 'normal', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
            {group.description || <em style={{ color: 'var(--text-muted)' }}>No description</em>}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="fg-card__footer" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
        <button
          className={`fg-card__status-badge fg-card__status-badge--${group.status ? 'active' : 'inactive'}`}
          onClick={onToggleStatus}
          title="Click to toggle status"
          style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
        >
          {group.status ? 'active' : 'inactive'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Tab Component ───────────────────────────────────────────────────────
export default function FunctionGroupsTab() {
  const { draft, updateDraft } = useDraftConfig();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FunctionGroup | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // RTK Query hooks
  const { data: groupsData, isLoading } = useGetFunctionGroupsQuery();
  const { data: farmsData } = useGetFarmsQuery();

  const [createFunctionGroup] = useCreateFunctionGroupMutation();
  const [updateFunctionGroup] = useUpdateFunctionGroupMutation();
  const [deleteFunctionGroup] = useDeleteFunctionGroupMutation();

  // Sync loaded database groups with local draft state for backwards compatibility
  useEffect(() => {
    if (groupsData) {
      const mapped: StructureRecord[] = groupsData.map((g) => ({
        id: g.id,
        code: g.code,
        name: g.name,
        description: g.description || '',
        status: g.status ? 'Active' : 'Inactive',
        farmId: g.farm?.farmId || '',
      }));
      if (JSON.stringify(draft.functionGroups) !== JSON.stringify(mapped)) {
        updateDraft('functionGroups', mapped);
      }
    }
  }, [groupsData, draft.functionGroups, updateDraft]);

  // Sync loaded farms into draft state in case user visited FunctionGroupsTab first
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
    const list = groupsData || [];
    return list.filter((g) => {
      if (!q) return true;
      const fName = g.farm?.farmName || '';
      return (
        g.name.toLowerCase().includes(q) ||
        g.code.toLowerCase().includes(q) ||
        (g.description && g.description.toLowerCase().includes(q)) ||
        fName.toLowerCase().includes(q)
      );
    });
  }, [groupsData, search]);

  const EMPTY_GROUP: StructureRecord = {
    id: '',
    code: '',
    name: '',
    description: '',
    status: 'Active',
    farmId: '',
  };

  const editInitial = useMemo<StructureRecord>(() => {
    if (!editTarget) return EMPTY_GROUP;
    return {
      id: editTarget.id,
      code: editTarget.code,
      name: editTarget.name,
      description: editTarget.description || '',
      status: editTarget.status ? 'Active' : 'Inactive',
      farmId: editTarget.farm?.farmId || '',
    };
  }, [editTarget]);

  async function handleCreate(row: StructureRecord) {
    try {
      await createFunctionGroup({
        name: row.name.trim(),
        code: row.code.trim(),
        description: row.description.trim(),
        farmId: row.farmId || '',
      }).unwrap();
      setCreateOpen(false);
      messageApi.success(`Function Group "${row.name}" successfully created.`);
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to create function group.');
    }
  }

  async function handleEdit(row: StructureRecord) {
    if (!editTarget) return;
    try {
      if (row.status === 'Inactive' && editTarget.status) {
        await deleteFunctionGroup(editTarget.id).unwrap();
        messageApi.success(`Function Group "${row.name}" status updated to Inactive.`);
      } else {
        await updateFunctionGroup({
          id: editTarget.id,
          body: {
            name: row.name.trim(),
            description: row.description.trim(),
            farmId: row.farmId || '',
          },
        }).unwrap();
        messageApi.success(`Function Group "${row.name}" updated.`);
      }
      setEditTarget(null);
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to update function group.');
    }
  }

  async function handleDelete(id: string) {
    const target = (groupsData || []).find((g) => g.id === id);
    try {
      await deleteFunctionGroup(id).unwrap();
      messageApi.success(`Function Group "${target?.name || id}" deleted.`);
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to delete function group.');
    }
  }

  async function handleStatusToggle(id: string, currentIsActive: boolean) {
    const target = (groupsData || []).find((g) => g.id === id);
    try {
      if (currentIsActive) {
        await deleteFunctionGroup(id).unwrap();
        messageApi.success(`Function Group "${target?.name || id}" status updated to Inactive.`);
      } else {
        messageApi.info('To reactivate this function group, please edit it and set its status to Active.');
      }
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to toggle status.');
    }
  }

  function getExistingCodes(excludeCode?: string) {
    return (groupsData || [])
      .filter((g) => g.code !== excludeCode)
      .map((g) => g.code.toLowerCase());
  }

  if (isLoading) {
    return (
      <div className="cfg-panel cfg-panel--group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Loading function groups...</span>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="cfg-panel cfg-panel--group">
        {/* Header */}
        <div className="cfg-panel__header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <div className="cfg-panel__header-icon--group">
              <AppstoreOutlined />
            </div>
            <div>
              <span className="cfg-panel__kicker">Operational Units</span>
              <h3>Function Groups</h3>
              <p>
                Manage business units, operational roles, action scopes, and department workflows across your farm workforce organization.
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="cfg-toolbar" style={{ gridTemplateColumns: 'minmax(240px, 1fr) auto' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search function groups by name, code, description, or parent farm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cfg-search-input"
            style={{
              '--search-border': '#7c3aed',
              '--search-dim': 'rgba(124, 58, 237, 0.25)',
            } as React.CSSProperties}
          />
          <Button
            className="fg-add-btn"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4338ca)',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.45)',
            }}
          >
            Add Group
          </Button>
        </div>

        {/* Cards Grid */}
        {filtered.length === 0 ? (
          <div className="cfg-table__empty" style={{ padding: 'var(--space-10) var(--space-5)' }}>
            {search ? 'No groups match your search.' : 'No function groups yet — click Add Group to create one.'}
          </div>
        ) : (
          <div className="ar-grid">
            {filtered.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onEdit={() => setEditTarget(group)}
                onDelete={() => handleDelete(group.id)}
                onToggleStatus={() => handleStatusToggle(group.id, group.status)}
              />
            ))}
          </div>
        )}

        <div className="cfg-note">
          Define core organizational boundaries for job categories and responsibilities prior to mapping individual employee profiles.
        </div>
      </div>

      {/* Create Modal */}
      <GroupFormModal
        open={createOpen}
        title="Add Function Group"
        initial={{ ...EMPTY_GROUP }}
        farms={farmsList}
        existingCodes={getExistingCodes()}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
      />

      {/* Edit Modal */}
      {editTarget && (
        <GroupFormModal
          open={!!editTarget}
          title={`Edit Function Group: ${editTarget.name}`}
          initial={editInitial}
          farms={farmsList}
          existingCodes={getExistingCodes(editTarget.code)}
          onOk={handleEdit}
          onCancel={() => setEditTarget(null)}
        />
      )}
    </>
  );
}
