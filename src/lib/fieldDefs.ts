export type FieldType = 'text' | 'tel' | 'date' | 'textarea' | 'number' | 'email';
export type TextAlign = 'right' | 'center' | 'left';
export type FontWeight = 'normal' | 'bold';
export type FontStyle = 'normal' | 'italic';
export type TextDecoration = 'none' | 'underline' | 'line-through';
export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted' | 'double';

export const FONT_FAMILIES = [
  { label: 'Majalla (عربي)', value: "'Majalla', serif" },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
];

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  dir: 'ltr' | 'rtl';
  placeholder?: string;
  // Position & Size (% of paper)
  top: number;
  left: number;
  width: number;
  height: number;
  // Typography
  fontSize: number;
  fontFamily: string;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  textDecoration: TextDecoration;
  textAlign: TextAlign;
  color: string;
  // Appearance
  bgColor: string;
  bgOpacity: number;           // 0–100
  borderWidth: number;
  borderStyle: BorderStyle;
  borderColor: string;
  borderRadius: number;
  // Textarea only
  rows?: number;
}

function def(overrides: Partial<FieldDef> & { id: string; label: string }): FieldDef {
  return {
    type: 'text',
    dir: 'rtl',
    top: 10,
    left: 5,
    width: 50,
    height: 3,
    fontSize: 16,
    fontFamily: "'Majalla', serif",
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'right',
    color: '#000000',
    bgColor: '#ffffff',
    bgOpacity: 0,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#f7931e',
    borderRadius: 0,
    ...overrides,
  };
}

export const DEFAULT_FIELDS: FieldDef[] = [
  def({ id: 'registrationNumber', label: 'رقم التسجيل',       type: 'text',     top: 22,  left: 44, width: 30, height: 3 }),
  def({ id: 'studentName',        label: 'اسم الطالب',         type: 'text',     top: 26,  left: 5,  width: 60, height: 3 }),
  def({ id: 'dob',                label: 'تاريخ الولادة',      type: 'date',     top: 30,  left: 44, width: 30, height: 3, dir: 'ltr' }),
  def({ id: 'address',            label: 'العنوان الكامل',     type: 'textarea', top: 34,  left: 5,  width: 60, height: 8, rows: 3 }),
  def({ id: 'fatherName',         label: 'اسم الوالد',         type: 'text',     top: 44,  left: 5,  width: 60, height: 3 }),
  def({ id: 'fatherPhone',        label: 'رقم الهاتف (والد)',  type: 'tel',      top: 48,  left: 5,  width: 40, height: 3, dir: 'ltr', textAlign: 'left' }),
  def({ id: 'guardianName',       label: 'اسم الولي',          type: 'text',     top: 52,  left: 5,  width: 60, height: 3 }),
  def({ id: 'guardianPhone',      label: 'رقم الهاتف (ولي)',  type: 'tel',      top: 56,  left: 5,  width: 40, height: 3, dir: 'ltr', textAlign: 'left' }),
  def({ id: 'guardianJob',        label: 'وظيفته',             type: 'text',     top: 60,  left: 5,  width: 60, height: 3 }),
  def({ id: 'institutes',         label: 'أ - المعاهد',        type: 'text',     top: 65,  left: 5,  width: 60, height: 3 }),
  def({ id: 'teachers',           label: 'ب - الأساتذة',       type: 'text',     top: 69,  left: 5,  width: 60, height: 3 }),
  def({ id: 'booksLearned',       label: 'ج - الكتب',          type: 'text',     top: 73,  left: 5,  width: 60, height: 3 }),
  def({ id: 'secularEducation',   label: 'الدراسة المادية',    type: 'text',     top: 78,  left: 5,  width: 60, height: 3 }),
  def({ id: 'date',               label: 'التاريخ',            type: 'date',     top: 85,  left: 15, width: 22, height: 3, dir: 'ltr', textAlign: 'left' }),
  def({ id: 'place',              label: 'المحل',              type: 'text',     top: 89,  left: 15, width: 22, height: 3 }),
];
