
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

export type ComponentType = 'Button' | 'Input' | 'Text' | 'Image' | 'Card' | 'Header' | 'List' | 'Map' | 'Group' | 'Dropdown';

export interface ComponentStyle {
  padding?: number;
  margin?: number;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  fontSize?: number;
  color?: string;
  width?: string | number;
  height?: string | number;
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  alignItems?: 'flex-start' | 'center' | 'flex-end';
  flexDirection?: 'row' | 'column';
  flexWrap?: 'wrap' | 'nowrap';
  gap?: number;
}

export interface ComponentValidation {
  required?: boolean;
  minLength?: number;
  pattern?: string;
  errorMessage?: string;
}

export interface ComponentAction {
  type: 'navigate' | 'link' | 'submit' | 'none';
  targetId?: string; // Screen ID for navigate
  url?: string;      // URL for link
}

export interface UIComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any> & {
      validation?: ComponentValidation;
      action?: ComponentAction;
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

export interface Project {
  name: string;
  description: string;
  platform: AppPlatform;
  template: string;
  colors: AppColors;
  font: AppFont;
  screens: Screen[];
}

export type Step = 'setup' | 'platform' | 'template' | 'builder';
export type BuilderView = 'flow' | 'editor';

export const COMPONENT_PALETTE: { type: ComponentType; label: string; icon: string }[] = [
  { type: 'Header', label: 'Header Bar', icon: 'M4 6h16M4 12h16M4 18h7' },
  { type: 'Group', label: 'Container Group', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { type: 'Text', label: 'Text Block', icon: 'M4 6h16M4 10h10' },
  { type: 'Button', label: 'Action Button', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { type: 'Input', label: 'Input Field', icon: 'M3 4h18v2H3V4zm0 14h18v-2H3v2zm0-7h18v-2H3v2z' },
  { type: 'Dropdown', label: 'Dropdown', icon: 'M8 9l4-4 4 4m0 6l-4 4-4-4' },
  { type: 'Card', label: 'Content Card', icon: 'M4 4h16v16H4V4z' },
  { type: 'Image', label: 'Image Placeholder', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01' },
];
