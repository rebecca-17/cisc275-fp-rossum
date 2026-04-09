export type ComponentKind =
  | 'Text'
  | 'TextBox'
  | 'TextArea'
  | 'CheckBox'
  | 'SelectBox'
  | 'Button'
  | 'Header';

export interface BaseComponent {
  id: string;
  kind: ComponentKind;
}

export interface TextComponent extends BaseComponent {
  kind: 'Text';
  content: string;
}

export interface TextBoxComponent extends BaseComponent {
  kind: 'TextBox';
  name: string;
  defaultValue: string;
}

export interface TextAreaComponent extends BaseComponent {
  kind: 'TextArea';
  name: string;
  defaultValue: string;
}

export interface CheckBoxComponent extends BaseComponent {
  kind: 'CheckBox';
  name: string;
  defaultValue: boolean;
}

export interface SelectBoxComponent extends BaseComponent {
  kind: 'SelectBox';
  name: string;
  options: string[];
  defaultValue: string;
}

export interface ButtonComponent extends BaseComponent {
  kind: 'Button';
  label: string;
  routeId: string;
}

export interface HeaderComponent extends BaseComponent {
  kind: 'Header';
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export type PageComponent =
  | TextComponent
  | TextBoxComponent
  | TextAreaComponent
  | CheckBoxComponent
  | SelectBoxComponent
  | ButtonComponent
  | HeaderComponent;

export interface ComponentStyle {
  color: string;
  backgroundColor: string;
  fontSize: string;
  fontFamily: string;
  border: string;
  padding: string;
  margin: string;
}

export interface PageStyle {
  backgroundColor: string;
  color: string;
  fontFamily: string;
  display: string;
  flexDirection: string;
  gap: string;
  padding: string;
}

export interface IfAnnotation {
  id: string;
  description: string;
}

export interface ForAnnotation {
  id: string;
  description: string;
  stateAttribute: string;
}

export interface PageNode {
  id: string;
  name: string;
  components: PageComponent[];
  componentStyles: Record<string, ComponentStyle>;
  pageStyle: PageStyle;
  ifAnnotations: IfAnnotation[];
  forAnnotations: ForAnnotation[];
  stateAnnotation: string;
  position: { x: number; y: number };
}

export interface Route {
  id: string;
  sourcePageId: string;
  targetPageId: string;
  name: string;
  stateAnnotation: string;
  ifAnnotations: IfAnnotation[];
}

export interface StateAttribute {
  id: string;
  name: string;
  type: string;
  description: string;
  defaultValue: string;
}

export interface Dataclass {
  id: string;
  name: string;
  attributes: StateAttribute[];
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  pages: PageNode[];
  routes: Route[];
  state: Dataclass;
  secondaryDataclasses: Dataclass[];
}
