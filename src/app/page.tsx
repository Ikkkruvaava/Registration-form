'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, Printer, Save, Settings } from 'lucide-react';
import { DEFAULT_FIELDS, FieldDef } from '@/lib/fieldDefs';

function hexToRgba(hex: string, opacity: number) {
  if (!hex || hex.length < 7) return 'transparent';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity / 100})`;
}

export default function Home() {
  const formRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [fields, setFields] = useState<FieldDef[]>([...DEFAULT_FIELDS]);

  useEffect(() => {
    fetch('/api/field-config')
      .then(r => r.json())
      .then(data => {
        if (data.fields && Array.isArray(data.fields) && data.fields.length > 0) {
          setFields(data.fields.map((f: Partial<FieldDef>) => ({ ...DEFAULT_FIELDS[0], ...f })));
        }
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (typeof window === 'undefined') return;
    const html2pdf = (await import('html2pdf.js')).default;
    const element = formRef.current;
    if (!element) return;
    const opt = {
      margin: 0,
      filename: `Registration_${formData['studentName'] || 'Form'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) setSuccess('تم حفظ البيانات بنجاح!');
      else alert(data.message || 'حدث خطأ أثناء الحفظ');
    } catch {
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field: FieldDef): React.CSSProperties => ({
    position: 'absolute',
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
    backgroundColor: field.bgOpacity > 0 ? hexToRgba(field.bgColor, field.bgOpacity) : 'transparent',
    border: field.borderStyle === 'none' ? 'none'
      : `${field.borderWidth}px ${field.borderStyle} ${field.borderColor}`,
    borderRadius: field.borderRadius,
    direction: field.dir,
    outline: 'none',
    padding: '2px 6px',
    resize: 'none',
    background: field.bgOpacity > 0 ? hexToRgba(field.bgColor, field.bgOpacity) : 'transparent',
  });

  return (
    <div className="app-container">
      {success && (
        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '14px', borderRadius: '6px', marginBottom: '16px', textAlign: 'center', fontWeight: 'bold' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="paper" ref={formRef}>
          {fields.map(field => {
            const style = inputStyle(field);
            if (field.type === 'textarea') {
              return (
                <textarea
                  key={field.id}
                  name={field.id}
                  value={formData[field.id] ?? ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  style={style}
                />
              );
            }
            return (
              <input
                key={field.id}
                type={field.type}
                name={field.id}
                value={formData[field.id] ?? ''}
                onChange={handleChange}
                placeholder={field.placeholder}
                dir={field.dir}
                style={style}
              />
            );
          })}
        </div>

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <Save size={18} />
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ البيانات'}
          </button>

          <Link href="/dashboard" className="btn btn-primary" style={{ backgroundColor: '#6366f1', textDecoration: 'none' }}>
            <Settings size={18} />
            لوحة التحكم
          </Link>

          <button type="button" onClick={handlePrint} className="btn btn-secondary">
            <Printer size={18} />
            طباعة
          </button>

          <button type="button" onClick={handleDownloadPDF} className="btn btn-primary" style={{ backgroundColor: '#E3342F' }}>
            <Download size={18} />
            تحميل PDF
          </button>
        </div>
      </form>
    </div>
  );
}
