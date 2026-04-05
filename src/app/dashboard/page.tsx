'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  DEFAULT_FIELDS, FieldDef, FONT_FAMILIES,
  FieldType, TextAlign, FontWeight, FontStyle, TextDecoration, BorderStyle
} from '@/lib/fieldDefs';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(v: number, min: number, max: number) { return Math.min(Math.max(v, min), max); }

function uid() { return `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

function hexToRgba(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity / 100})`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Section titles and Row labels are in English for the dashboard UI
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="db-section-head">{children}</div>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="db-row">
      <span className="db-row-label">{label}</span>
      <div className="db-row-control">{children}</div>
    </div>
  );
}

function NumSlider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="db-num-slider">
      <div className="db-num-slider-header">
        <span>{label}</span>
        <span className="db-val-badge">{value.toFixed(step < 1 ? 1 : 0)}</span>
      </div>
      <div className="db-num-slider-row">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))} className="db-range" />
        <input type="number" min={min} max={max} step={step} value={value.toFixed(step < 1 ? 1 : 0)}
          onChange={e => onChange(parseFloat(e.target.value) || min)} className="db-num-input" />
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="db-color-row">
      <span>{label}</span>
      <div className="db-color-wrap">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="db-color-input" />
        <span className="db-color-hex">{value}</span>
      </div>
    </div>
  );
}

function ToggleGroup<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string; title?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="db-toggle-group">
      {options.map(o => (
        <button key={o.value} title={o.title}
          className={`db-toggle-btn ${value === o.value ? 'active' : ''}`}
          onClick={() => onChange(o.value)}
        >{o.label}</button>
      ))}
    </div>
  );
}

// ─── Full Properties Panel ────────────────────────────────────────────────────
function PropertiesPanel({ field, onChange }: { field: FieldDef; onChange: (f: FieldDef) => void }) {
  const set = <K extends keyof FieldDef>(key: K, val: FieldDef[K]) => onChange({ ...field, [key]: val });

  return (
    <div className="db-props-panel">
      <Row label="Field Name">
        <input className="db-text-input" value={field.label}
          onChange={e => set('label', e.target.value)} />
      </Row>
      <Row label="Placeholder">
        <input className="db-text-input" value={field.placeholder || ''}
          onChange={e => set('placeholder', e.target.value)} />
      </Row>
      <Row label="Field Type">
        <select className="db-select" value={field.type}
          onChange={e => set('type', e.target.value as FieldType)}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="tel">Phone (tel)</option>
          <option value="date">Date</option>
          <option value="email">Email</option>
          <option value="textarea">Text Area</option>
        </select>
      </Row>

      <SectionTitle>📐 Position &amp; Size</SectionTitle>
      <NumSlider label="Top (%)" value={field.top} min={0} max={97} step={0.1} onChange={v => set('top', v)} />
      <NumSlider label="Left (%)" value={field.left} min={0} max={97} step={0.1} onChange={v => set('left', v)} />
      <NumSlider label="Width (%)" value={field.width} min={3} max={100} step={0.5} onChange={v => set('width', v)} />
      <NumSlider label="Height (%)" value={field.height} min={1.5} max={40} step={0.1} onChange={v => set('height', v)} />

      <SectionTitle>✏️ Font &amp; Text</SectionTitle>
      <Row label="Font">
        <select className="db-select" value={field.fontFamily}
          onChange={e => set('fontFamily', e.target.value)}>
          {FONT_FAMILIES.map(f => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
          ))}
        </select>
      </Row>
      <NumSlider label="Font Size (px)" value={field.fontSize} min={8} max={48} step={1} onChange={v => set('fontSize', v)} />
      <Row label="Align">
        <ToggleGroup<TextAlign>
          value={field.textAlign}
          onChange={v => set('textAlign', v)}
          options={[
            { value: 'right',  label: '⇤', title: 'Right' },
            { value: 'center', label: '⇔', title: 'Center' },
            { value: 'left',   label: '⇥', title: 'Left' },
          ]}
        />
      </Row>
      <Row label="Direction">
        <ToggleGroup<'rtl'|'ltr'>
          value={field.dir}
          onChange={v => set('dir', v)}
          options={[
            { value: 'rtl', label: 'RTL ←' },
            { value: 'ltr', label: '→ LTR' },
          ]}
        />
      </Row>
      <Row label="Weight">
        <ToggleGroup<FontWeight>
          value={field.fontWeight}
          onChange={v => set('fontWeight', v)}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'bold',   label: 'Bold' },
          ]}
        />
      </Row>
      <Row label="Style">
        <ToggleGroup<FontStyle>
          value={field.fontStyle}
          onChange={v => set('fontStyle', v)}
          options={[
            { value: 'normal', label: 'N' },
            { value: 'italic', label: 'I' },
          ]}
        />
      </Row>
      <Row label="Decoration">
        <ToggleGroup<TextDecoration>
          value={field.textDecoration}
          onChange={v => set('textDecoration', v)}
          options={[
            { value: 'none',         label: '—',  title: 'None' },
            { value: 'underline',    label: 'U_', title: 'Underline' },
            { value: 'line-through', label: 'S̶',  title: 'Strikethrough' },
          ]}
        />
      </Row>
      <ColorPicker label="Text Color" value={field.color} onChange={v => set('color', v)} />

      <SectionTitle>🎨 Background &amp; Border</SectionTitle>
      <ColorPicker label="Background" value={field.bgColor} onChange={v => set('bgColor', v)} />
      <NumSlider label="BG Opacity (%)" value={field.bgOpacity} min={0} max={100} step={1} onChange={v => set('bgOpacity', v)} />
      <ColorPicker label="Border Color" value={field.borderColor} onChange={v => set('borderColor', v)} />
      <NumSlider label="Border Width (px)" value={field.borderWidth} min={0} max={10} step={0.5} onChange={v => set('borderWidth', v)} />
      <Row label="Border Style">
        <select className="db-select" value={field.borderStyle}
          onChange={e => set('borderStyle', e.target.value as BorderStyle)}>
          <option value="none">None</option>
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
        </select>
      </Row>
      <NumSlider label="Border Radius (px)" value={field.borderRadius} min={0} max={30} step={1} onChange={v => set('borderRadius', v)} />
    </div>
  );
}

// ─── Add Field Modal ───────────────────────────────────────────────────────────
function AddFieldModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (f: FieldDef) => void;
}) {
  const [label, setLabel] = useState('New Field');
  const [type, setType]   = useState<FieldType>('text');
  const [dir, setDir]     = useState<'rtl'|'ltr'>('rtl');

  const handleAdd = () => {
    const newField: FieldDef = {
      id: uid(),
      label,
      type,
      dir,
      top: 10,
      left: 5,
      width: 50,
      height: 3,
      fontSize: 16,
      fontFamily: "'Majalla', serif",
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: dir === 'rtl' ? 'right' : 'left',
      color: '#000000',
      bgColor: '#ffffff',
      bgOpacity: 0,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: '#f7931e',
      borderRadius: 0,
    };
    onAdd(newField);
    onClose();
  };

  return (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal" onClick={e => e.stopPropagation()}>
        <h2 className="db-modal-title">➕ Add New Field</h2>
        <div className="db-modal-field">
          <label>Field Name</label>
          <input className="db-text-input" value={label} onChange={e => setLabel(e.target.value)} autoFocus />
        </div>
        <div className="db-modal-field">
          <label>Field Type</label>
          <select className="db-select" value={type} onChange={e => setType(e.target.value as FieldType)}>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="tel">Phone (tel)</option>
            <option value="date">Date</option>
            <option value="email">Email</option>
            <option value="textarea">Text Area</option>
          </select>
        </div>
        <div className="db-modal-field">
          <label>Direction</label>
          <ToggleGroup<'rtl'|'ltr'>
            value={dir} onChange={setDir}
            options={[{ value: 'rtl', label: 'RTL ←' }, { value: 'ltr', label: '→ LTR' }]}
          />
        </div>
        <div className="db-modal-actions">
          <button className="db-btn db-btn-save" onClick={handleAdd}>Add Field</button>
          <button className="db-btn db-btn-reset" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [fields, setFields]       = useState<FieldDef[]>([...DEFAULT_FIELDS]);
  const [selected, setSelected]   = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [showAddModal, setShowAddModal] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  // Load from server on mount
  useEffect(() => {
    fetch('/api/field-config')
      .then(r => r.json())
      .then(data => {
        if (data.fields && Array.isArray(data.fields) && data.fields.length > 0) {
          // Migrate old fields that may lack new properties
          setFields(data.fields.map((f: Partial<FieldDef>) => ({
            ...DEFAULT_FIELDS[0],
            ...f,
          })));
        }
      })
      .catch(() => {});
  }, []);

  // ── Drag ──────────────────────────────────────────────────────────────────
  const dragState = useRef<{ id: string; sx: number; sy: number; sl: number; st: number } | null>(null);
  const resizeState = useRef<{ id: string; sx: number; sy: number; sw: number; sh: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).classList.contains('db-resize-handle')) return;
    e.preventDefault();
    const field = fields.find(f => f.id === id);
    if (!field) return;
    setSelected(id);
    dragState.current = { id, sx: e.clientX, sy: e.clientY, sl: field.left, st: field.top };
  }, [fields]);

  const onResizeDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const field = fields.find(f => f.id === id);
    if (!field) return;
    resizeState.current = { id, sx: e.clientX, sy: e.clientY, sw: field.width, sh: field.height };
  }, [fields]);

  useEffect(() => {
    const paper = paperRef.current;
    const onMove = (e: MouseEvent) => {
      const rect = paper?.getBoundingClientRect();
      if (!rect) return;

      if (dragState.current) {
        const { id, sx, sy, sl, st } = dragState.current;
        const dx = ((e.clientX - sx) / rect.width) * 100;
        const dy = ((e.clientY - sy) / rect.height) * 100;
        setFields(prev => prev.map(f =>
          f.id === id ? { ...f, left: clamp(sl + dx, 0, 95), top: clamp(st + dy, 0, 95) } : f
        ));
      }

      if (resizeState.current) {
        const { id, sx, sy, sw, sh } = resizeState.current;
        const dx = ((e.clientX - sx) / rect.width) * 100;
        const dy = ((e.clientY - sy) / rect.height) * 100;
        setFields(prev => prev.map(f =>
          f.id === id ? { ...f, width: clamp(sw + dx, 5, 100), height: clamp(sh + dy, 1.5, 40) } : f
        ));
      }
    };
    const onUp = () => { dragState.current = null; resizeState.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addField = (f: FieldDef) => {
    setFields(prev => [...prev, f]);
    setSelected(f.id);
  };

  const deleteField = () => {
    if (!selected) return;
    if (!confirm('Delete this field?')) return;
    setFields(prev => prev.filter(f => f.id !== selected));
    setSelected(null);
  };

  const duplicateField = () => {
    if (!selected) return;
    const src = fields.find(f => f.id === selected);
    if (!src) return;
    const copy: FieldDef = { ...src, id: uid(), top: src.top + 4, left: src.left + 2 };
    setFields(prev => [...prev, copy]);
    setSelected(copy.id);
  };

  const updateField = (updated: FieldDef) =>
    setFields(prev => prev.map(f => (f.id === updated.id ? updated : f)));

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/field-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });
      setSaveStatus(res.ok ? 'saved' : 'error');
      if (res.ok) setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    }
  };

  const selectedField = fields.find(f => f.id === selected) ?? null;

  // Build inline style for a field overlay on the canvas
  const overlayStyle = (field: FieldDef): React.CSSProperties => ({
    top: `${field.top}%`,
    left: `${field.left}%`,
    width: `${field.width}%`,
    height: `${field.height}%`,
    fontSize: field.fontSize,
    fontFamily: field.fontFamily,
    fontWeight: field.fontWeight,
    fontStyle: field.fontStyle,
    textDecoration: field.textDecoration,
    textAlign: field.textAlign,
    color: field.color,
    backgroundColor: hexToRgba(field.bgColor, field.bgOpacity),
    border: field.borderStyle === 'none' ? 'none'
      : `${field.borderWidth}px ${field.borderStyle} ${field.borderColor}`,
    borderRadius: field.borderRadius,
    direction: field.dir,
    cursor: 'move',
  });

  return (
    <div className="db-root">
      {showAddModal && <AddFieldModal onClose={() => setShowAddModal(false)} onAdd={addField} />}

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-header">
          <div className="db-logo">📋</div>
          <h1 className="db-title">Form Builder</h1>
          <Link href="/" className="db-nav-link">🏠 Back to Form</Link>
        </div>

        {/* Toolbar */}
        <div className="db-toolbar">
          <button className="db-tool-btn db-tool-add" onClick={() => setShowAddModal(true)} title="Add Field">
            <span>➕</span> Add
          </button>
          <button className="db-tool-btn db-tool-dup" onClick={duplicateField} title="Duplicate Field" disabled={!selected}>
            <span>⧉</span> Duplicate
          </button>
          <button className="db-tool-btn db-tool-del" onClick={deleteField} title="Delete Field" disabled={!selected}>
            <span>🗑</span> Delete
          </button>
        </div>

        {/* Field List */}
        <div className="db-field-list">
          <div className="db-section-label">Fields ({fields.length})</div>
          {fields.map((f, i) => (
            <button key={f.id}
              className={`db-field-item ${selected === f.id ? 'active' : ''}`}
              onClick={() => setSelected(f.id)}>
              <span className="db-field-index">{i + 1}</span>
              <span className="db-field-type-badge">{f.type}</span>
              <span className="db-field-label-text">{f.label}</span>
            </button>
          ))}
        </div>

        {/* Properties Panel */}
        {selectedField && (
          <PropertiesPanel field={selectedField} onChange={updateField} />
        )}

        {/* Save / Reset */}
        <div className="db-actions">
          <button className={`db-btn db-btn-save ${saveStatus}`} onClick={handleSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? '⏳ Saving...'  :
             saveStatus === 'saved'  ? '✅ Saved!'      :
             saveStatus === 'error'  ? '❌ Error!'      : '💾 Save Layout'}
          </button>
          <button className="db-btn db-btn-reset" onClick={() => { setFields([...DEFAULT_FIELDS]); setSelected(null); }}>
            🔄 Reset to Default
          </button>
        </div>
      </aside>

      {/* ── CANVAS ────────────────────────────────────────────────── */}
      <main className="db-canvas">
        <div className="db-canvas-toolbar">
          <span className="db-toolbar-hint">
            💡 Drag a field to move it · Drag ◢ to resize · Click to select
          </span>
          {selected && (
            <span className="db-selected-tag">
              ✦ {fields.find(f => f.id === selected)?.label}
            </span>
          )}
        </div>

        <div className="db-paper-wrapper">
          <div className="db-paper" ref={paperRef}>
            {fields.map(field => (
              <div
                key={field.id}
                className={`db-field-overlay ${selected === field.id ? 'db-field-active' : ''}`}
                style={overlayStyle(field)}
                onMouseDown={e => onMouseDown(e, field.id)}
                onClick={() => setSelected(field.id)}
              >
                {/* Label badge */}
                <span className="db-field-badge">{field.label}</span>

                {/* Resize handle */}
                <div className="db-resize-handle" onMouseDown={e => onResizeDown(e, field.id)}>◢</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
