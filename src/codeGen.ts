import type { Project, PageComponent, StateAttribute } from './types';

function renderComponent(comp: PageComponent): string {
  switch (comp.kind) {
    case 'Text':
      return `        Text(${JSON.stringify(comp.content)}),`;
    case 'TextBox':
      return `        TextBox("${comp.name}", state.${comp.name}),`;
    case 'TextArea':
      return `        TextArea("${comp.name}", state.${comp.name}),`;
    case 'CheckBox':
      return `        CheckBox("${comp.name}", state.${comp.name}),`;
    case 'SelectBox':
      return `        SelectBox("${comp.name}", [${comp.options.map((o) => JSON.stringify(o)).join(', ')}], state.${comp.name}),`;
    case 'Button':
      return `        Button("${comp.label}"),`;
    case 'Header':
      return `        Header(${comp.level}, ${JSON.stringify(comp.content)}),`;
  }
}

function renderAttribute(attr: StateAttribute): string {
  const comment = attr.description ? `  # ${attr.description}` : '';
  return `    ${attr.name}: ${attr.type}${comment}`;
}

function defaultValueFor(attr: StateAttribute): string {
  if (attr.defaultValue) return attr.defaultValue;
  switch (attr.type) {
    case 'int': return '0';
    case 'float': return '0.0';
    case 'bool': return 'False';
    case 'str': return '""';
    default: return '[]';
  }
}

export function generatePythonCode(project: Project): string {
  const lines: string[] = [];

  lines.push('from dataclasses import dataclass');
  lines.push('from drafter import *');
  lines.push('from bakery import assert_equal');
  lines.push('');

  for (const dc of project.secondaryDataclasses) {
    lines.push('@dataclass');
    lines.push(`class ${dc.name}:`);
    if (dc.attributes.length > 0) {
      for (const attr of dc.attributes) {
        lines.push(renderAttribute(attr));
      }
    } else {
      lines.push('    pass');
    }
    lines.push('');
  }

  lines.push('@dataclass');
  lines.push(`class ${project.state.name}:`);
  if (project.state.attributes.length > 0) {
    for (const attr of project.state.attributes) {
      lines.push(renderAttribute(attr));
    }
  } else {
    lines.push('    pass');
  }
  lines.push('');

  for (const page of project.pages) {
    lines.push('@route');
    lines.push(`def ${page.name}(state: ${project.state.name}) -> Page:`);
    if (page.stateAnnotation) {
      lines.push(`    # ${page.stateAnnotation}`);
    }
    lines.push(`    return Page(state, [`);
    for (const comp of page.components) {
      lines.push(renderComponent(comp));
    }
    lines.push('    ])');
    lines.push('');
  }

  const defaults = project.state.attributes.map(defaultValueFor).join(', ');
  lines.push(`start_server(${project.state.name}(${defaults}))`);

  return lines.join('\n');
}
