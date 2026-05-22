import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Input, Modal, Popconfirm, Select, message } from 'antd';
import { useMemo, useState } from 'react';
import type { NewRoleRow, RoleRecord, StructureRecord, CompanyConfig } from '../../Contexts/ConfigurationContext';
import { EMPTY_ROLE_ROW } from '../../Contexts/ConfigurationContext';
import { useGetFarmsByCompanyIdQuery } from '../../api/endpoints/farmApi';
import { useGetAreasByFarmIdQuery } from '../../api/endpoints/areaApi';
import { useGetFunctionGroupsByFarmIdQuery } from '../../api/endpoints/functionGroupApi';
import './Configuration.css';

// ─── Theme map ────────────────────────────────────────────────────────────────
// Colors exactly mirror the dashboard personnel stat cards / summary card variants.
export type RoleTheme = 'pink' | 'violet' | 'cyan' | 'green';

/** Gradient for the Add button — matches dashboard card gradients */
const THEME_GRADIENT: Record<RoleTheme, string> = {
  pink: 'linear-gradient(135deg, #ec4899, #9333ea)',   // Farm Masters  — dashboard: #ec4899
  violet: 'linear-gradient(135deg, #7c3aed, #4338ca)',   // Farm Admins   — dashboard: #7c3aed
  cyan: 'linear-gradient(135deg, #06b6d4, #0e7490)',   // Farm Workers  — dashboard: #06b6d4
  green: 'linear-gradient(135deg, #22c55e, #16a34a)',   // Support Workers — dashboard: #22c55e
};

/** Button box-shadow color */
const THEME_SHADOW: Record<RoleTheme, string> = {
  pink: 'rgba(236, 72, 153, 0.42)',
  violet: 'rgba(124, 58, 237, 0.42)',
  cyan: 'rgba(6,  182, 212, 0.42)',
  green: 'rgba(34, 197,  94, 0.42)',
};

/** Search input border colour — a dimmed version of the theme accent */
const THEME_BORDER: Record<RoleTheme, string> = {
  pink: 'rgba(236, 72, 153, 0.45)',
  violet: 'rgba(124, 58, 237, 0.45)',
  cyan: 'rgba(6,  182, 212, 0.45)',
  green: 'rgba(34, 197,  94, 0.45)',
};

/** Glow for the focused search input */
const THEME_DIM: Record<RoleTheme, string> = {
  pink: 'rgba(236, 72, 153, 0.12)',
  violet: 'rgba(124, 58, 237, 0.12)',
  cyan: 'rgba(6,  182, 212, 0.12)',
  green: 'rgba(34, 197,  94, 0.12)',
};

// ─── Avatar helpers ───────────────────────────────────────────────────────────

const GRADIENTS = [
  'linear-gradient(135deg, #ec4899, #9333ea)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #22c55e, #06b6d4)',
  'linear-gradient(135deg, #f97316, #ec4899)',
  'linear-gradient(135deg, #a855f7, #6366f1)',
  'linear-gradient(135deg, #14b8a6, #06b6d4)',
];

function avatarGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── Avatar component ─────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  return (
    <span className="role-avatar" style={{ background: avatarGradient(name) }}>
      {initials(name)}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`role-status role-status--${status.toLowerCase()}`}>
      {status.toLowerCase()}
    </span>
  );
}

// ─── Edit / Create modal ──────────────────────────────────────────────────────
function RoleModal({
  open,
  title,
  initial,
  idLabel,
  areaOptions,
  groupOptions,
  onOk,
  onCancel,
  isBackendIntegrated = false,
  companies = [],
  isMultiSelect = true,
}: {
  open: boolean;
  title: string;
  initial: RoleRecord;
  idLabel: string;
  areaOptions: { value: string; label: string }[];
  groupOptions: { value: string; label: string }[];
  onOk: (record: RoleRecord) => void;
  onCancel: () => void;
  isBackendIntegrated?: boolean;
  companies?: CompanyConfig[];
  isMultiSelect?: boolean;
}) {
  const [form, setForm] = useState<RoleRecord>({ ...initial });
  const [messageApi, ctx] = message.useMessage();

  useMemo(() => setForm({ ...initial }), [initial]);

  // Dynamic cascading queries
  const { data: farms, isLoading: isLoadingFarms } = useGetFarmsByCompanyIdQuery(form.companyId || '', {
    skip: !form.companyId || !isBackendIntegrated,
  });

  const joinedFarmIds = useMemo(() => (form.farmIds || []).join(','), [form.farmIds]);

  const { data: areas, isLoading: isLoadingAreas } = useGetAreasByFarmIdQuery(joinedFarmIds, {
    skip: !joinedFarmIds || !isBackendIntegrated,
  });

  const { data: functionGroups, isLoading: isLoadingGroups } = useGetFunctionGroupsByFarmIdQuery(joinedFarmIds, {
    skip: !joinedFarmIds || !isBackendIntegrated,
  });

  // Map to select options
  const modalFarmOptions = useMemo(() => {
    if (!farms) return [];
    return farms.map((f) => ({ value: f.farmId, label: f.farmName }));
  }, [farms]);

  const modalAreaOptions = useMemo(() => {
    if (!areas) return [];
    return areas.map((a) => ({ value: a.areaId, label: a.areaName }));
  }, [areas]);

  const modalGroupOptions = useMemo(() => {
    if (!functionGroups) return [];
    return functionGroups.map((fg) => ({ value: fg.id, label: fg.name }));
  }, [functionGroups]);

  function handleOk() {
    if (isBackendIntegrated) {
      if (!form.firstName?.trim() || !form.employeeCode?.trim() || !form.companyId || !form.farmIds || form.farmIds.length === 0) {
        messageApi.warning('First Name, Employee Code, Company, and Farm selection are required.');
        return;
      }
      onOk({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName?.trim() || '',
        employeeCode: form.employeeCode.trim(),
        email: form.email?.trim() || '',
        mobileNumber: form.mobileNumber?.trim() || '',
        name: `${form.firstName.trim()} ${form.lastName?.trim() || ''}`.trim(),
        id: form.id || '',
      });
    } else {
      if (!form.name.trim() || !form.id.trim()) {
        messageApi.warning('ID and name are required.');
        return;
      }
      onOk(form);
    }
  }

  const set = (key: keyof RoleRecord) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <>
      {ctx}
      <Modal
        title={title}
        open={open}
        onOk={handleOk}
        onCancel={onCancel}
        okText={title.startsWith('Edit') ? 'Save Changes' : 'Add'}
        cancelText="Cancel"
        className="cfg-modal"
        width={isBackendIntegrated ? 600 : 520}
        destroyOnClose
      >
        <div className="cfg-modal__form">
          {isBackendIntegrated ? (
            <div className="cfg-form-grid cfg-form-grid--2">
              <label className="cfg-field">
                <span>First Name *</span>
                <Input value={form.firstName || ''} onChange={(e) => set('firstName')(e.target.value)} placeholder="e.g. John" />
              </label>
              <label className="cfg-field">
                <span>Last Name</span>
                <Input value={form.lastName || ''} onChange={(e) => set('lastName')(e.target.value)} placeholder="e.g. Doe" />
              </label>
              <label className="cfg-field">
                <span>Employee Code *</span>
                <Input value={form.employeeCode || ''} onChange={(e) => set('employeeCode')(e.target.value)} placeholder="e.g. EMP-001" />
              </label>
              <label className="cfg-field">
                <span>Email</span>
                <Input value={form.email || ''} onChange={(e) => set('email')(e.target.value)} placeholder="e.g. john@gmail.com" />
              </label>
              <label className="cfg-field">
                <span>Mobile Number</span>
                <Input value={form.mobileNumber || ''} onChange={(e) => set('mobileNumber')(e.target.value)} placeholder="e.g. 9876543210" />
              </label>
              <label className="cfg-field">
                <span>Associated Company *</span>
                <Select
                  value={form.companyId || undefined}
                  onChange={(val) => {
                    const cName = companies.find((c) => c.id === val)?.name || '';
                    setForm((f) => ({
                      ...f,
                      companyId: val,
                      companyName: cName,
                      farmIds: [],
                      farmName: '',
                      areaIds: [],
                      area: '',
                      functionGroupIds: [],
                      group: '',
                    }));
                  }}
                  options={companies.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="Select company"
                  style={{ width: '100%' }}
                />
              </label>
              <label className="cfg-field" style={{ gridColumn: 'span 2' }}>
                <span>Associated Farm *</span>
                <Select
                  mode={isMultiSelect ? "multiple" : undefined}
                  value={isMultiSelect ? (form.farmIds || []) : (form.farmIds && form.farmIds.length > 0 ? form.farmIds[0] : undefined)}
                  disabled={!form.companyId}
                  onChange={(val: any) => {
                    const vals = isMultiSelect ? (val as string[]) : (val ? [val as string] : []);
                    const selectedFarms = farms?.filter((f) => vals.includes(f.farmId)) || [];
                    const fNames = selectedFarms.map((f) => f.farmName).join(', ');
                    setForm((f) => ({
                      ...f,
                      farmIds: vals,
                      farmName: fNames,
                      areaIds: [],
                      area: '',
                      functionGroupIds: [],
                      group: '',
                    }));
                  }}
                  options={modalFarmOptions}
                  loading={isLoadingFarms}
                  placeholder={form.companyId ? (isMultiSelect ? "Select farms" : "Select farm") : "Select company first"}
                  style={{ width: '100%' }}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </label>
              <label className="cfg-field" style={{ gridColumn: 'span 2' }}>
                <span>{isMultiSelect ? "Assigned Areas (Multi-Select)" : "Assigned Area"}</span>
                <Select
                  mode={isMultiSelect ? "multiple" : undefined}
                  disabled={!form.farmIds || form.farmIds.length === 0}
                  value={isMultiSelect ? (form.areaIds || []) : (form.areaIds && form.areaIds.length > 0 ? form.areaIds[0] : undefined)}
                  onChange={(val: any) => {
                    const vals = isMultiSelect ? (val as string[]) : (val ? [val as string] : []);
                    const selectedNames = modalAreaOptions
                      .filter((o) => vals.includes(o.value))
                      .map((o) => o.label)
                      .join(', ');
                    setForm((f) => ({ ...f, areaIds: vals, area: selectedNames }));
                  }}
                  options={modalAreaOptions}
                  loading={isLoadingAreas}
                  placeholder={(form.farmIds && form.farmIds.length > 0) ? (isMultiSelect ? "Select assigned areas" : "Select assigned area") : "Select farm first"}
                  style={{ width: '100%' }}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </label>
              <label className="cfg-field" style={{ gridColumn: 'span 2' }}>
                <span>{isMultiSelect ? "Function Groups (Multi-Select)" : "Function Group"}</span>
                <Select
                  mode={isMultiSelect ? "multiple" : undefined}
                  disabled={!form.farmIds || form.farmIds.length === 0}
                  value={isMultiSelect ? (form.functionGroupIds || []) : (form.functionGroupIds && form.functionGroupIds.length > 0 ? form.functionGroupIds[0] : undefined)}
                  onChange={(val: any) => {
                    const vals = isMultiSelect ? (val as string[]) : (val ? [val as string] : []);
                    const selectedNames = modalGroupOptions
                      .filter((o) => vals.includes(o.value))
                      .map((o) => o.label)
                      .join(', ');
                    setForm((f) => ({ ...f, functionGroupIds: vals, group: selectedNames }));
                  }}
                  options={modalGroupOptions}
                  loading={isLoadingGroups}
                  placeholder={(form.farmIds && form.farmIds.length > 0) ? (isMultiSelect ? "Select function groups" : "Select function group") : "Select farm first"}
                  style={{ width: '100%' }}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </label>
              {!title.toLowerCase().includes('edit') && (
                <label className="cfg-field" style={{ gridColumn: 'span 2' }}>
                  <span>Status</span>
                  <Select
                    value={form.status}
                    onChange={(val) => setForm((f) => ({ ...f, status: val }))}
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Inactive', label: 'Inactive' },
                    ]}
                    style={{ width: '100%' }}
                  />
                </label>
              )}
            </div>
          ) : (
            <div className="cfg-form-grid cfg-form-grid--2">
              <label className="cfg-field">
                <span>{idLabel} *</span>
                <Input value={form.id} onChange={(e) => set('id')(e.target.value)} placeholder={idLabel} />
              </label>
              <label className="cfg-field">
                <span>Full Name *</span>
                <Input value={form.name} onChange={(e) => set('name')(e.target.value)} placeholder="Full name" />
              </label>
              <label className="cfg-field">
                <span>Contact</span>
                <Input value={form.contact} onChange={(e) => set('contact')(e.target.value)} placeholder="Email or phone" />
              </label>
              <label className="cfg-field">
                <span>Assigned Area</span>
                <Select
                  value={form.area || undefined}
                  onChange={(val) => setForm((f) => ({ ...f, area: val }))}
                  options={areaOptions}
                  placeholder="Select area"
                  style={{ width: '100%' }}
                />
              </label>
              <label className="cfg-field">
                <span>Function Group</span>
                <Select
                  value={form.group || undefined}
                  onChange={(val) => setForm((f) => ({ ...f, group: val }))}
                  options={groupOptions}
                  placeholder="Select group"
                  style={{ width: '100%' }}
                />
              </label>
              <label className="cfg-field">
                <span>Status</span>
                <Select
                  value={form.status}
                  onChange={(val) => setForm((f) => ({ ...f, status: val }))}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  style={{ width: '100%' }}
                />
              </label>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface RolePanelProps {
  title: string;
  addLabel: string;
  idLabel: string;
  records: RoleRecord[];
  newRow: NewRoleRow;
  onNewRowChange: (row: NewRoleRow) => void;
  onRecordsChange: (records: RoleRecord[]) => void;
  onSave: () => void;
  onCancel?: () => void;
  areas: StructureRecord[];
  functionGroups: StructureRecord[];
  theme?: RoleTheme;

  // Integrated API options
  isBackendIntegrated?: boolean;
  companies?: CompanyConfig[];
  onLiveCreate?: (record: RoleRecord) => Promise<void>;
  onLiveEdit?: (record: RoleRecord) => Promise<void>;
  onLiveDelete?: (id: string) => Promise<void>;
  isMultiSelect?: boolean;
}

// ─── Panel ────────────────────────────────────────────────────────────────────
export default function RolePanel({
  title,
  addLabel,
  idLabel,
  records,
  onRecordsChange,
  onSave,
  areas,
  functionGroups,
  theme = 'pink',
  isBackendIntegrated = false,
  companies = [],
  onLiveCreate,
  onLiveEdit,
  onLiveDelete,
  isMultiSelect = true,
}: RolePanelProps) {
  const gradient = THEME_GRADIENT[theme];
  const shadow = THEME_SHADOW[theme];
  const border = THEME_BORDER[theme];
  const dim = THEME_DIM[theme];
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RoleRecord | null>(null);
  const [messageApi, ctx] = message.useMessage();

  const areaOptions = useMemo(() => {
    return areas.map((a) => ({
      value: isBackendIntegrated ? (a.id || a.name) : a.name,
      label: a.name,
    }));
  }, [areas, isBackendIntegrated]);

  const groupOptions = useMemo(() => {
    return functionGroups.map((fg) => ({
      value: isBackendIntegrated ? (fg.id || fg.name) : fg.name,
      label: fg.name,
    }));
  }, [functionGroups, isBackendIntegrated]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter(
      (r) =>
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.contact.toLowerCase().includes(q),
    );
  }, [records, search]);

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  function toggleAll(checked: boolean) {
    if (checked) setSelected(new Set(filtered.map((r) => r.id)));
    else setSelected(new Set());
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleCreate(record: RoleRecord) {
    if (isBackendIntegrated && onLiveCreate) {
      try {
        await onLiveCreate(record);
        setCreateOpen(false);
      } catch (err) {
        // Handled in parent
      }
      return;
    }
    if (records.some((r) => r.id.toLowerCase() === record.id.toLowerCase())) {
      messageApi.error(`ID "${record.id}" already exists.`);
      return;
    }
    onRecordsChange([...records, record]);
    onSave();
    setCreateOpen(false);
    messageApi.success(`${record.name} added.`);
  }

  async function handleEdit(updated: RoleRecord) {
    if (!editTarget) return;
    if (isBackendIntegrated && onLiveEdit) {
      try {
        await onLiveEdit(updated);
        setEditTarget(null);
      } catch (err) {
        // Handled in parent
      }
      return;
    }
    const conflict = records.some(
      (r) => r.id.toLowerCase() === updated.id.toLowerCase() && r.id !== editTarget.id,
    );
    if (conflict) {
      messageApi.error(`ID "${updated.id}" already exists.`);
      return;
    }
    onRecordsChange(records.map((r) => (r.id === editTarget.id ? updated : r)));
    onSave();
    setEditTarget(null);
    messageApi.success('Record updated.');
  }

  async function handleDelete(id: string) {
    if (isBackendIntegrated && onLiveDelete) {
      try {
        await onLiveDelete(id);
      } catch (err) {
        // Handled in parent
      }
      return;
    }
    onRecordsChange(records.filter((r) => r.id !== id));
    onSave();
    messageApi.success('Record deleted.');
  }

  const BLANK_RECORD: RoleRecord = { ...EMPTY_ROLE_ROW, status: 'Active' };

  return (
    <>
      {ctx}
      <div className="cfg-panel">
        {/* Toolbar */}
        <div className="role-toolbar">
          <Input
            prefix={<SearchOutlined />}
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cfg-search-input"
            style={{
              // @ts-ignore – CSS custom properties via inline style
              '--search-border': border,
              '--search-dim': dim,
            } as React.CSSProperties}
          />
          <Button
            className="role-add-btn"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{
              background: gradient,
              boxShadow: `0 4px 14px ${shadow}`,
            }}
          >
            {addLabel}
          </Button>
        </div>

        {/* Table */}
        <div className="role-table-wrap">
          <table className="role-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={selected.size > 0 && !allSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th>Name</th>
                <th>Email / Contact</th>
                <th>Area</th>
                <th>Group</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="role-table__empty">
                    {search ? 'No records match your search.' : `No ${title.toLowerCase()} yet — click ${addLabel} to add one.`}
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record.id} className={selected.has(record.id) ? 'role-table__row--selected' : ''}>
                    <td>
                      <Checkbox
                        checked={selected.has(record.id)}
                        onChange={() => toggleOne(record.id)}
                      />
                    </td>
                    <td>
                      <div className="role-name-cell">
                        <Avatar name={record.name} />
                        <div>
                          <div className="role-name-cell__name">{record.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="role-contact">{record.contact || <em style={{ color: 'var(--text-muted)' }}>—</em>}</td>
                    <td>
                      {isBackendIntegrated ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {record.area ? (
                            record.area.split(', ').map((a, i) => (
                              <span key={i} className="cfg-pill cfg-pill--area" style={{
                                background: 'rgba(236, 72, 153, 0.08)',
                                color: '#ec4899',
                                border: '1px solid rgba(236, 72, 153, 0.2)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 500
                              }}>
                                {a}
                              </span>
                            ))
                          ) : (
                            <em style={{ color: 'var(--text-muted)' }}>—</em>
                          )}
                        </div>
                      ) : (
                        record.area || <em style={{ color: 'var(--text-muted)' }}>—</em>
                      )}
                    </td>
                    <td>
                      {isBackendIntegrated ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {record.group ? (
                            record.group.split(', ').map((g, i) => (
                              <span key={i} className="cfg-pill cfg-pill--group" style={{
                                background: 'rgba(124, 58, 237, 0.08)',
                                color: '#7c3aed',
                                border: '1px solid rgba(124, 58, 237, 0.2)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 500
                              }}>
                                {g}
                              </span>
                            ))
                          ) : (
                            <em style={{ color: 'var(--text-muted)' }}>—</em>
                          )}
                        </div>
                      ) : (
                        record.group || <em style={{ color: 'var(--text-muted)' }}>—</em>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={record.status} />
                    </td>
                    <td>
                      <span className="cfg-row-actions">
                        <Button
                          className="cfg-icon-btn"
                          icon={<EditOutlined />}
                          title="Edit"
                          onClick={() => setEditTarget(record)}
                        />
                        <Popconfirm
                          title="Delete this record?"
                          onConfirm={() => handleDelete(record.id)}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            className="cfg-icon-btn cfg-icon-btn--danger"
                            icon={<DeleteOutlined />}
                            title="Delete"
                          />
                        </Popconfirm>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selected.size > 0 && (
          <div className="role-bulk-bar">
            <span>{selected.size} selected</span>
            <Popconfirm
              title={`Delete ${selected.size} records?`}
              onConfirm={async () => {
                if (isBackendIntegrated && onLiveDelete) {
                  try {
                    for (const id of selected) {
                      await onLiveDelete(id);
                    }
                    setSelected(new Set());
                  } catch (err) {
                    // Handled in parent
                  }
                  return;
                }
                onRecordsChange(records.filter((r) => !selected.has(r.id)));
                onSave();
                setSelected(new Set());
                messageApi.success(`${selected.size} records deleted.`);
              }}
              okText="Delete All"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button danger size="small" icon={<CloseOutlined />}>
                Delete Selected
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>

      {/* Create modal */}
      <RoleModal
        open={createOpen}
        title={`Add ${title}`}
        initial={BLANK_RECORD}
        idLabel={idLabel}
        areaOptions={areaOptions}
        groupOptions={groupOptions}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
        isBackendIntegrated={isBackendIntegrated}
        companies={companies}
        isMultiSelect={isMultiSelect}
      />

      {/* Edit modal */}
      {editTarget && (
        <RoleModal
          open={!!editTarget}
          title={`Edit: ${editTarget.name}`}
          initial={{ ...editTarget }}
          idLabel={idLabel}
          areaOptions={areaOptions}
          groupOptions={groupOptions}
          onOk={handleEdit}
          onCancel={() => setEditTarget(null)}
          isBackendIntegrated={isBackendIntegrated}
          companies={companies}
          isMultiSelect={isMultiSelect}
        />
      )}
    </>
  );
}
