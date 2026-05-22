import {
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, Popconfirm, Select, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { CompanyConfig, FarmConfig } from '../../Contexts/ConfigurationContext';
import { useDraftConfig } from '../../Contexts/ConfigurationContext';
import {
  useGetFarmsQuery,
  useCreateFarmMutation,
  useUpdateFarmMutation,
  useDeleteFarmMutation,
} from '../../api/endpoints/farmApi';
import type { Farm } from '../../api/types.ts/farm.types';
import './Configuration.css';

// ─── Modal Form ───────────────────────────────────────────────────────────────
function FarmFormModal({
  open,
  title,
  initial,
  companies,
  onOk,
  onCancel,
}: {
  open: boolean;
  title: string;
  initial: FarmConfig;
  companies: CompanyConfig[];
  onOk: (row: FarmConfig) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FarmConfig>({ ...initial });
  const [messageApi, contextHolder] = message.useMessage();

  useMemo(() => setForm({ ...initial }), [initial]);

  const hasNoCompanies = companies.length === 0;

  function handleOk() {
    if (hasNoCompanies) {
      messageApi.error('Cannot create farm: You must create a Company first.');
      return;
    }
    if (!form.name.trim()) {
      messageApi.warning('Farm Name is required.');
      return;
    }
    if (!form.companyId) {
      messageApi.warning('Associated Company selection is required.');
      return;
    }
    onOk(form);
  }

  return (
    <>
      {contextHolder}
      <Modal
        title={title}
        open={open}
        onOk={handleOk}
        onCancel={onCancel}
        okText={title.startsWith('Edit') ? 'Save Changes' : 'Create Farm'}
        cancelText="Cancel"
        className="cfg-modal"
        width={520}
        destroyOnClose
        okButtonProps={{ disabled: hasNoCompanies }}
      >
        <div className="cfg-modal__form">
          {hasNoCompanies && (
            <div className="cfg-note" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', margin: '0 0 var(--space-2)' }}>
              <strong>Notice:</strong> Please add at least one company in the Company tab before creating a farm, as all farms must belong to a parent company.
            </div>
          )}

          <label className="cfg-field">
            <span>Farm Name *</span>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Green Valley Farm"
              disabled={hasNoCompanies}
            />
          </label>

          <label className="cfg-field">
            <span>Associated Company *</span>
            <Select
              value={form.companyId || undefined}
              onChange={(val) => setForm((f) => ({ ...f, companyId: val }))}
              placeholder="Select associated company"
              options={companies.map((c) => ({ value: c.id, label: `${c.name}` }))}
              style={{ width: '100%' }}
              disabled={hasNoCompanies}
            />
          </label>

          <label className="cfg-field">
            <span>Description</span>
            <Input.TextArea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Organic farming plots focused on table grapes and onions."
              disabled={hasNoCompanies}
              rows={4}
            />
          </label>
        </div>
      </Modal>
    </>
  );
}

// ─── Single Farm Card ─────────────────────────────────────────────────────────
function FarmCard({
  farm,
  onEdit,
  onDelete,
}: {
  farm: Farm;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const companyName = farm.company?.companyName || 'Unknown Company';

  return (
    <div className="fm-card">
      {/* Top Identity & Actions */}
      <div className="fm-card__top">
        <div className="fm-card__icon-wrap">
          <EnvironmentOutlined />
        </div>
        <div className="fm-card__identity">
          <span className="fm-card__name" title={farm.farmName}>
            {farm.farmName}
          </span>
        </div>
        <div className="fm-card__menu">
          <Button
            className="cfg-icon-btn"
            icon={<EditOutlined />}
            title="Edit Farm"
            onClick={onEdit}
          />
          <Popconfirm
            title="Delete this farm?"
            description="Are you sure you want to delete this farm profile?"
            onConfirm={onDelete}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              className="cfg-icon-btn cfg-icon-btn--danger"
              icon={<DeleteOutlined />}
              title="Delete Farm"
            />
          </Popconfirm>
        </div>
      </div>

      {/* Body Details */}
      <div className="fm-card__body">
        <div className="fm-card__field">
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Company: {companyName}
          </span>
        </div>
        <div className="fm-card__field" style={{ minHeight: '60px', alignItems: 'flex-start' }}>
          <span style={{ whiteSpace: 'normal', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
            {farm.farmDescription || <em style={{ color: 'var(--text-muted)' }}>No description</em>}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab Component ───────────────────────────────────────────────────────
export default function FarmTab() {
  const { draft, updateDraft } = useDraftConfig();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Farm | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // RTK Query hooks
  const { data: farmsData, isLoading } = useGetFarmsQuery();
  const [createFarm] = useCreateFarmMutation();
  const [updateFarm] = useUpdateFarmMutation();
  const [deleteFarm] = useDeleteFarmMutation();

  // Sync loaded database farms with local draft state for backwards compatibility
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = farmsData || [];
    return list.filter(
      (f) =>
        !q ||
        f.farmName.toLowerCase().includes(q) ||
        f.farmId.toLowerCase().includes(q) ||
        (f.farmDescription && f.farmDescription.toLowerCase().includes(q))
    );
  }, [farmsData, search]);

  const EMPTY_FARM: FarmConfig = {
    id: '',
    name: '',
    description: '',
    companyId: '',
  };

  const editInitial = useMemo<FarmConfig>(() => {
    if (!editTarget) return EMPTY_FARM;
    return {
      id: editTarget.farmId,
      name: editTarget.farmName,
      description: editTarget.farmDescription || '',
      companyId: editTarget.company?.companyId || '',
    };
  }, [editTarget]);

  async function handleCreate(row: FarmConfig) {
    try {
      await createFarm({
        farmName: row.name.trim(),
        farmDescription: row.description.trim(),
        companyId: row.companyId,
      }).unwrap();
      setCreateOpen(false);
      messageApi.success(`Farm "${row.name}" successfully created.`);
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to create farm.');
    }
  }

  async function handleEdit(row: FarmConfig) {
    if (!editTarget) return;
    try {
      await updateFarm({
        id: editTarget.farmId,
        body: {
          farmName: row.name.trim(),
          farmDescription: row.description.trim(),
          companyId: row.companyId,
        },
      }).unwrap();
      setEditTarget(null);
      messageApi.success(`Farm "${row.name}" updated.`);
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to update farm.');
    }
  }

  async function handleDelete(id: string) {
    const target = (farmsData || []).find((f) => f.farmId === id);
    try {
      await deleteFarm(id).unwrap();
      messageApi.success(`Farm "${target?.farmName || id}" deleted.`);
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to delete farm.');
    }
  }

  if (isLoading) {
    return (
      <div className="cfg-panel cfg-panel--farm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Loading farm directories...</span>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="cfg-panel cfg-panel--farm">
        {/* Header */}
        <div className="cfg-panel__header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <div className="cfg-panel__header-icon--farm">
              <EnvironmentOutlined />
            </div>
            <div>
              <span className="cfg-panel__kicker">Farm Profile</span>
              <h3>Farm Directory</h3>
              <p>
                Manage primary crop farms, locations, cultivated areas, and active license profiles across your agricultural organization.
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="cfg-toolbar" style={{ gridTemplateColumns: 'minmax(240px, 1fr) auto' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search farms by name, ID or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cfg-search-input"
            style={{
              '--search-border': '#06b6d4',
              '--search-dim': 'rgba(6, 182, 212, 0.25)',
            } as React.CSSProperties}
          />
          <Button
            className="fg-add-btn"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0e7490)',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.45)',
            }}
          >
            Add Farm
          </Button>
        </div>

        {/* Cards Grid */}
        {filtered.length === 0 ? (
          <div className="cfg-table__empty" style={{ padding: 'var(--space-10) var(--space-5)' }}>
            {search ? 'No farms match your search.' : 'No farm profiles yet — click Add Farm to create one.'}
          </div>
        ) : (
          <div className="fm-grid">
            {filtered.map((farm) => (
              <FarmCard
                key={farm.farmId}
                farm={farm}
                onEdit={() => setEditTarget(farm)}
                onDelete={() => handleDelete(farm.farmId)}
              />
            ))}
          </div>
        )}

        <div className="cfg-note">
          Ensure company information is saved first before associating areas, function groups, and personnel roles.
        </div>
      </div>

      {/* Create Modal */}
      <FarmFormModal
        open={createOpen}
        title="Add Farm Profile"
        initial={{ ...EMPTY_FARM }}
        companies={draft.companies || []}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
      />

      {/* Edit Modal */}
      {editTarget && (
        <FarmFormModal
          open={!!editTarget}
          title={`Edit Farm: ${editTarget.farmName}`}
          initial={editInitial}
          companies={draft.companies || []}
          onOk={handleEdit}
          onCancel={() => setEditTarget(null)}
        />
      )}
    </>
  );
}

