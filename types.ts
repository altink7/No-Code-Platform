

export type AppPlatform = 'web' | 'mobile';

export interface AppColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface AppFont {
  name: string;
  family: string;
}

export type ComponentType = 
  | 'Button' | 'Input' | 'Text' | 'Image' | 'Card' | 'Header' | 'List' 
  | 'Map' | 'Group' | 'Dropdown' | 'Checkbox' | 'Switch' | 'Slider' 
  | 'Avatar' | 'Badge' | 'Divider' | 'TextArea' | 'File';

export interface ComponentStyle {
  padding?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderTopWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  borderColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'light';
  color?: string;
  width?: string | number;
  height?: string | number;
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  flexDirection?: 'row' | 'column';
  flexWrap?: 'wrap' | 'nowrap';
  gap?: number;
  boxShadow?: string;
  flex?: number | string;
}

export interface ComponentValidation {
  required?: boolean;
  minLength?: number;
  pattern?: string;
  errorMessage?: string;
}

export interface Condition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_true' | 'is_false';
  value: string | number | boolean;
}

export interface ComponentAction {
  type: 'navigate' | 'link' | 'submit' | 'back' | 'none';
  targetId?: string; // Screen ID for navigate
  url?: string;      // URL for link
  conditions?: Condition[]; // Gateway Logic
}

export interface UIComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any> & {
      validation?: ComponentValidation;
      action?: ComponentAction; // Legacy single action
      actions?: ComponentAction[]; // Multiple actions for Gateways
      // Input Specific
      inputType?: 'text' | 'password' | 'email' | 'number' | 'date';
      // Button Specific
      loading?: boolean;
      disabled?: boolean;
      icon?: string;
      // Image Specific
      objectFit?: 'cover' | 'contain' | 'fill';
      assetId?: string; // Link to Resource Asset
      // File Specific
      fileId?: string; // Link to Resource File
      fileName?: string;
      // Text Specific
      translationKey?: string; // Link to Resource Translation
      // Card Specific
      elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
  style?: ComponentStyle;
  label: string;
  children?: UIComponent[];
}

export interface Screen {
  id: string;
  name: string;
  x: number;
  y: number;
  components: UIComponent[];
  connections: string[]; // IDs of screens this screen connects to
}

export interface Translation {
  key: string;
  values: Record<string, string>; // { "en": "Hello", "es": "Hola" }
}

export interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file';
}

export interface ProjectResources {
  languages: string[]; // ['en', 'es', 'fr']
  defaultLanguage: string;
  translations: Translation[];
  assets: Asset[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  platform: AppPlatform;
  template: string;
  colors: AppColors;
  font: AppFont;
  screens: Screen[];
  resources: ProjectResources;
  lastModified: number;
}

export interface SavedProject extends Project {}

export type Step = 'setup' | 'platform' | 'template' | 'builder';
export type BuilderView = 'flow' | 'editor';

export const COMPONENT_PALETTE: { type: ComponentType; label: string; icon: string }[] = [
  { type: 'Header', label: 'Header Bar', icon: 'M4 6h16M4 12h16M4 18h7' },
  { type: 'Group', label: 'Container', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { type: 'Text', label: 'Text Block', icon: 'M4 6h16M4 10h10' },
  { type: 'Button', label: 'Button', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { type: 'Input', label: 'Input Field', icon: 'M3 4h18v2H3V4zm0 14h18v-2H3v2zm0-7h18v-2H3v2z' },
  { type: 'TextArea', label: 'Text Area', icon: 'M4 4h16v12H4z' },
  { type: 'Dropdown', label: 'Dropdown', icon: 'M8 9l4-4 4 4m0 6l-4 4-4-4' },
  { type: 'Checkbox', label: 'Checkbox', icon: 'M5 13l4 4L19 7' },
  { type: 'Switch', label: 'Toggle', icon: 'M6 8h12c2.21 0 4 1.79 4 4s-1.79 4-4 4H6c-2.21 0-4-1.79-4-4s1.79-4 4-4z' },
  { type: 'Slider', label: 'Slider', icon: 'M4 12h16M12 8v8' },
  { type: 'Card', label: 'Card', icon: 'M4 4h16v16H4V4z' },
  { type: 'Avatar', label: 'Avatar', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
  { type: 'Badge', label: 'Badge', icon: 'M7 7h10v10H7z' },
  { type: 'Divider', label: 'Divider', icon: 'M4 12h16' },
  { type: 'Image', label: 'Image', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01' },
  { type: 'File', label: 'File Download', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];