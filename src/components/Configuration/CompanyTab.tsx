import {
  BankOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  HomeOutlined,
  MailOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, Popconfirm, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { CompanyConfig } from '../../Contexts/ConfigurationContext';
import { useDraftConfig } from '../../Contexts/ConfigurationContext';
import {
  useGetCompaniesQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} from '../../api/endpoints/companyApi';
import type { Company } from '../../api/types.ts/company.types';
import './Configuration.css';

// ─── Modal Form ───────────────────────────────────────────────────────────────
function CompanyFormModal({
  open,
  title,
  initial,
  onOk,
  onCancel,
}: {
  open: boolean;
  title: string;
  initial: CompanyConfig;
  onOk: (row: CompanyConfig) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CompanyConfig>({ ...initial });
  const [messageApi, contextHolder] = message.useMessage();

  useMemo(() => setForm({ ...initial }), [initial]);

  function handleOk() {
    if (!form.name.trim()) {
      messageApi.warning('Company Name is required.');
      return;
    }
    if (!form.email.trim()) {
      messageApi.warning('Official Email is required.');
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
        okText={title.startsWith('Edit') ? 'Save Changes' : 'Create Company'}
        cancelText="Cancel"
        className="cfg-modal"
        width={520}
        destroyOnClose
      >
        <div className="cfg-modal__form">
          <label className="cfg-field">
            <span>Company Name *</span>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. AgriTech Solutions"
              prefix={<BankOutlined style={{ color: 'var(--text-muted)' }} />}
            />
          </label>
          <label className="cfg-field">
            <span>Registration Number</span>
            <Input
              value={form.registrationNumber}
              onChange={(e) => setForm((f) => ({ ...f, registrationNumber: e.target.value }))}
              placeholder="e.g. CIN-L01234MH2010PLC123456"
            />
          </label>
          <label className="cfg-field">
            <span>Official Email *</span>
            <Input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="contact@company.com"
              prefix={<MailOutlined style={{ color: 'var(--text-muted)' }} />}
            />
          </label>
          <label className="cfg-field">
            <span>Website</span>
            <Input
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              placeholder="www.company.com"
              prefix={<GlobalOutlined style={{ color: 'var(--text-muted)' }} />}
            />
          </label>
          <label className="cfg-field">
            <span>Registered Address</span>
            <Input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Street, City, State - PIN"
              prefix={<HomeOutlined style={{ color: 'var(--text-muted)' }} />}
            />
          </label>
        </div>
      </Modal>
    </>
  );
}

// ─── Single Company Card ──────────────────────────────────────────────────────
function CompanyCard({
  company,
  onEdit,
  onDelete,
}: {
  company: Company;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="co-card">
      {/* Top Identity & Actions */}
      <div className="co-card__top">
        <div className="co-card__icon-wrap">
          <BankOutlined />
        </div>
        <div className="co-card__identity">
          <span className="co-card__name" title={company.companyName}>
            {company.companyName}
          </span>
        </div>
        <div className="co-card__menu">
          <Button
            className="cfg-icon-btn"
            icon={<EditOutlined />}
            title="Edit Company"
            onClick={onEdit}
          />
          <Popconfirm
            title="Delete this company?"
            description="Are you sure you want to delete this company profile?"
            onConfirm={onDelete}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              className="cfg-icon-btn cfg-icon-btn--danger"
              icon={<DeleteOutlined />}
              title="Delete Company"
            />
          </Popconfirm>
        </div>
      </div>

      {/* Body Details */}
      <div className="co-card__body">
        <div className="co-card__field">
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginRight: 'auto' }}>
            REG NO: {company.registrationNumber || '—'}
          </span>
        </div>
        <div className="co-card__field">
          <MailOutlined />
          <span title={company.companyMail || 'No email'}>
            {company.companyMail || <em style={{ color: 'var(--text-muted)' }}>No email</em>}
          </span>
        </div>
        <div className="co-card__field">
          <GlobalOutlined />
          <span title={company.website || 'No website'}>
            {company.website || <em style={{ color: 'var(--text-muted)' }}>No website</em>}
          </span>
        </div>
        <div className="co-card__field">
          <HomeOutlined />
          <span title={company.address || 'No address'}>
            {company.address || <em style={{ color: 'var(--text-muted)' }}>No address</em>}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab Component ───────────────────────────────────────────────────────
export default function CompanyTab() {
  const { draft, updateDraft } = useDraftConfig();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // RTK Query hooks
  const { data: companiesData, isLoading } = useGetCompaniesQuery();
  const [createCompany] = useCreateCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();
  const [deleteCompany] = useDeleteCompanyMutation();

  // Sync loaded companies with local draft config for backwards compatibility (e.g. Farm tab Select option links)
  useEffect(() => {
    if (companiesData) {
      const mapped: CompanyConfig[] = companiesData.map((c) => ({
        id: c.companyId,
        name: c.companyName,
        registrationNumber: c.registrationNumber,
        email: c.companyMail,
        phone: '', // Not in backend schema
        address: c.address,
        website: c.website,
      }));
      if (JSON.stringify(draft.companies) !== JSON.stringify(mapped)) {
        updateDraft('companies', mapped);
      }
    }
  }, [companiesData, draft.companies, updateDraft]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = companiesData || [];
    return list.filter(
      (c) =>
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.companyId.toLowerCase().includes(q) ||
        (c.registrationNumber && c.registrationNumber.toLowerCase().includes(q))
    );
  }, [companiesData, search]);

  const EMPTY_COMPANY: CompanyConfig = {
    id: '',
    name: '',
    registrationNumber: '',
    email: '',
    phone: '',
    address: '',
    website: '',
  };

  const editInitial = useMemo<CompanyConfig>(() => {
    if (!editTarget) return EMPTY_COMPANY;
    return {
      id: editTarget.companyId,
      name: editTarget.companyName,
      registrationNumber: editTarget.registrationNumber,
      email: editTarget.companyMail,
      phone: '',
      address: editTarget.address,
      website: editTarget.website,
    };
  }, [editTarget]);

  async function handleCreate(row: CompanyConfig) {
    try {
      await createCompany({
        companyName: row.name.trim(),
        registrationNumber: row.registrationNumber.trim(),
        companyMail: row.email.trim(),
        website: row.website.trim(),
        address: row.address.trim(),
        isActive: true,
      }).unwrap();
      setCreateOpen(false);
      messageApi.success(`Company "${row.name}" successfully created.`);
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to create company.');
    }
  }

  async function handleEdit(row: CompanyConfig) {
    if (!editTarget) return;
    try {
      await updateCompany({
        id: editTarget.companyId,
        body: {
          companyName: row.name.trim(),
          registrationNumber: row.registrationNumber.trim(),
          companyMail: row.email.trim(),
          website: row.website.trim(),
          address: row.address.trim(),
        },
      }).unwrap();
      setEditTarget(null);
      messageApi.success(`Company "${row.name}" updated.`);
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to update company.');
    }
  }

  async function handleDelete(id: string) {
    const target = (companiesData || []).find((c) => c.companyId === id);
    try {
      await deleteCompany(id).unwrap();
      messageApi.success(`Company "${target?.companyName || id}" deleted.`);
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to delete company.');
    }
  }

  if (isLoading) {
    return (
      <div className="cfg-panel cfg-panel--company" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Loading company directories...</span>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="cfg-panel cfg-panel--company">
        {/* Header */}
        <div className="cfg-panel__header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <div className="cfg-panel__header-icon--company">
              <BankOutlined />
            </div>
            <div>
              <span className="cfg-panel__kicker">Organisation</span>
              <h3>Company Directory</h3>
              <p>
                Manage corporate identities, legal registration numbers, and official contact information used in farm structures.
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="cfg-toolbar" style={{ gridTemplateColumns: 'minmax(240px, 1fr) auto' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search companies by name, ID or registration number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cfg-search-input"
            style={{
              '--search-border': '#ec4899',
              '--search-dim': 'rgba(236, 72, 153, 0.25)',
            } as React.CSSProperties}
          />
          <Button
            className="fg-add-btn"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #ec4899, #9333ea)',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.45)',
            }}
          >
            Add Company
          </Button>
        </div>

        {/* Cards Grid */}
        {filtered.length === 0 ? (
          <div className="cfg-table__empty" style={{ padding: 'var(--space-10) var(--space-5)' }}>
            {search ? 'No companies match your search.' : 'No company profiles yet — click Add Company to create one.'}
          </div>
        ) : (
          <div className="co-grid">
            {filtered.map((company) => (
              <CompanyCard
                key={company.companyId}
                company={company}
                onEdit={() => setEditTarget(company)}
                onDelete={() => handleDelete(company.companyId)}
              />
            ))}
          </div>
        )}

        <div className="cfg-note">
          Farm Management stores structural and role-mapping data only. Authentication credentials stay with the User Management Service.
        </div>
      </div>

      {/* Create Modal */}
      <CompanyFormModal
        open={createOpen}
        title="Add Company Profile"
        initial={{ ...EMPTY_COMPANY }}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
      />

      {/* Edit Modal */}
      {editTarget && (
        <CompanyFormModal
          open={!!editTarget}
          title={`Edit Company: ${editTarget.companyName}`}
          initial={editInitial}
          onOk={handleEdit}
          onCancel={() => setEditTarget(null)}
        />
      )}
    </>
  );
}
