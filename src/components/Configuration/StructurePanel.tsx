import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, Popconfirm, Select, message } from 'antd';
import { useMemo, useState } from 'react';
import type { NewStructureRow, RecordStatus, StructureRecord } from '../../Contexts/ConfigurationContext';
import './Configuration.css';

interface StructurePanelProps {
  kicker: string;
  title: string;
  description: string;
  addLabel: string;
  codeLabel: string;
  nameLabel: string;
  searchPlaceholder: string;
  records: StructureRecord[];
  newRow: NewStructureRow;
  onNewRowChange: (row: NewStructureRow) => void;
  onRecordsChange: (records: StructureRecord[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EMPTY_ROW: NewStructureRow = { code: '', name: '', description: '', status: 'Active' };

export default function StructurePanel({
  kicker,
  title,
  description,
  addLabel,
  codeLabel,
  nameLabel,
  searchPlaceholder,
  records,
  newRow,
  onNewRowChange,
  onRecordsChange,
  onSave,
  onCancel,
}: StructurePanelProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RecordStatus>('all');

  // Edit modal state
  const [editTarget, setEditTarget] = useState<StructureRecord | null>(null);
  const [editForm, setEditForm] = useState<StructureRecord | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesSearch = !q || r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [records, search, statusFilter]);

  // ── CRUD handlers ────────────────────────────────────────

  function handleAddRow() {
    if (!newRow.code.trim() || !newRow.name.trim()) {
      messageApi.warning('Code and name are required.');
      return;
    }
    if (records.some((r) => r.code.toLowerCase() === newRow.code.trim().toLowerCase())) {
      messageApi.error(`Code "${newRow.code.trim()}" already exists.`);
      return;
    }
    onRecordsChange([...records, { ...newRow, code: newRow.code.trim(), name: newRow.name.trim() }]);
    onNewRowChange({ ...EMPTY_ROW });
    messageApi.success(`${newRow.name.trim()} added.`);
  }

  function openEdit(record: StructureRecord) {
    setEditTarget(record);
    setEditForm({ ...record });
  }

  function handleEditSave() {
    if (!editForm || !editTarget) return;
    if (!editForm.code.trim() || !editForm.name.trim()) {
      messageApi.warning('Code and name are required.');
      return;
    }
    const codeConflict = records.some(
      (r) => r.code.toLowerCase() === editForm.code.trim().toLowerCase() && r.code !== editTarget.code,
    );
    if (codeConflict) {
      messageApi.error(`Code "${editForm.code.trim()}" already exists.`);
      return;
    }
    onRecordsChange(
      records.map((r) => (r.code === editTarget.code ? { ...editForm } : r)),
    );
    setEditTarget(null);
    setEditForm(null);
    messageApi.success('Record updated.');
  }

  function handleDelete(code: string) {
    onRecordsChange(records.filter((r) => r.code !== code));
    messageApi.success('Record deleted.');
  }

  function handleStatusToggle(code: string, status: RecordStatus) {
    onRecordsChange(records.map((r) => (r.code === code ? { ...r, status } : r)));
  }

  return (
    <>
      {contextHolder}

      <div className="cfg-panel">
        {/* Header */}
        <div className="cfg-panel__header">
          <div>
            <span className="cfg-panel__kicker">{kicker}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <div className="cfg-panel__actions">
            <Button className="cfg-btn-secondary" icon={<CloseOutlined />} onClick={onCancel}>
              Cancel
            </Button>
            <Button type="primary" className="cfg-btn-primary" icon={<SaveOutlined />} onClick={onSave}>
              Save Changes
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="cfg-toolbar">
          <Input
            prefix={<SearchOutlined />}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            suffixIcon={<FilterOutlined />}
            options={[
              { value: 'all', label: 'All status' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
          <Button
            type="primary"
            className="cfg-btn-primary"
            icon={<PlusOutlined />}
            onClick={() => onNewRowChange({ ...EMPTY_ROW })}
          >
            {addLabel}
          </Button>
        </div>

        {/* Quick-add row */}
        <div className="cfg-quick-row-wrap">
          <div className="cfg-quick-row cfg-quick-row--structure">
            <Input
              placeholder={codeLabel}
              value={newRow.code}
              onChange={(e) => onNewRowChange({ ...newRow, code: e.target.value })}
            />
            <Input
              placeholder={nameLabel}
              value={newRow.name}
              onChange={(e) => onNewRowChange({ ...newRow, name: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newRow.description}
              onChange={(e) => onNewRowChange({ ...newRow, description: e.target.value })}
            />
            <Select
              value={newRow.status}
              onChange={(val) => onNewRowChange({ ...newRow, status: val })}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
            <Button
              type="primary"
              className="cfg-quick-row__add-btn"
              icon={<PlusOutlined />}
              title={`Add ${title}`}
              onClick={handleAddRow}
            />
          </div>
        </div>

        {/* Table */}
        <div className="cfg-table-wrap">
          <div className="cfg-table" role="table">
            <div className="cfg-table__head" role="row">
              <span>{codeLabel}</span>
              <span>{nameLabel}</span>
              <span>Description</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {filteredRecords.map((record) => (
              <div className="cfg-table__row" role="row" key={record.code}>
                <span className="cfg-table__code">{record.code}</span>
                <strong>{record.name}</strong>
                <span className="cfg-table__desc">{record.description || <em style={{ color: 'var(--text-muted)' }}>—</em>}</span>
                <span>
                  <Select
                    size="small"
                    value={record.status}
                    onChange={(val) => handleStatusToggle(record.code, val)}
                    className="cfg-status-select"
                    popupClassName="cfg-select-dropdown"
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Inactive', label: 'Inactive' },
                    ]}
                  />
                </span>
                <span className="cfg-row-actions">
                  <Button
                    className="cfg-icon-btn"
                    icon={<EditOutlined />}
                    aria-label="Edit"
                    title="Edit"
                    onClick={() => openEdit(record)}
                  />
                  <Popconfirm
                    title="Delete this record?"
                    description="This action cannot be undone."
                    onConfirm={() => handleDelete(record.code)}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      className="cfg-icon-btn cfg-icon-btn--danger"
                      icon={<DeleteOutlined />}
                      aria-label="Delete"
                      title="Delete"
                    />
                  </Popconfirm>
                </span>
              </div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="cfg-table__empty">
                No records match the current filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title={`Edit ${title}`}
        open={!!editTarget}
        onCancel={() => { setEditTarget(null); setEditForm(null); }}
        onOk={handleEditSave}
        okText="Save changes"
        cancelText="Cancel"
        className="cfg-modal"
        destroyOnClose
      >
        {editForm && (
          <div className="cfg-modal__form">
            <label className="cfg-field">
              <span>{codeLabel}</span>
              <Input
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                placeholder={codeLabel}
              />
            </label>
            <label className="cfg-field">
              <span>{nameLabel}</span>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder={nameLabel}
              />
            </label>
            <label className="cfg-field">
              <span>Description</span>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description (optional)"
              />
            </label>
            <label className="cfg-field">
              <span>Status</span>
              <Select
                value={editForm.status}
                onChange={(val) => setEditForm({ ...editForm, status: val })}
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
                style={{ width: '100%' }}
              />
            </label>
          </div>
        )}
      </Modal>
    </>
  );
}
