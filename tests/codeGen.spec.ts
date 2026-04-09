import { generatePythonCode } from '../src/codeGen';
import type { Project } from '../src/types';

function makeProject(): Project {
  return {
    id: '1',
    name: 'Test App',
    description: 'A test',
    lastModified: new Date().toISOString(),
    pages: [
      {
        id: 'p1',
        name: 'index',
        components: [],
        componentStyles: {},
        pageStyle: {
          backgroundColor: '#fff',
          color: '#000',
          fontFamily: 'sans-serif',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '16px',
        },
        ifAnnotations: [],
        forAnnotations: [],
        stateAnnotation: '',
        position: { x: 0, y: 0 },
      },
    ],
    routes: [],
    state: {
      id: 'state',
      name: 'State',
      description: '',
      attributes: [
        { id: 'a1', name: 'count', type: 'int', description: 'The count', defaultValue: '0' },
        { id: 'a2', name: 'name', type: 'str', description: 'The name', defaultValue: '"hello"' },
        { id: 'a3', name: 'active', type: 'bool', description: 'Active flag', defaultValue: 'False' },
        { id: 'a4', name: 'items', type: 'list[str]', description: 'Items list', defaultValue: '[]' },
      ],
    },
    secondaryDataclasses: [],
  };
}

test('generatePythonCode includes imports', () => {
  const code = generatePythonCode(makeProject());
  expect(code).toContain('from drafter import *');
  expect(code).toContain('from dataclasses import dataclass');
});

test('generatePythonCode includes State dataclass', () => {
  const code = generatePythonCode(makeProject());
  expect(code).toContain('@dataclass');
  expect(code).toContain('class State:');
  expect(code).toContain('count: int');
  expect(code).toContain('name: str');
});

test('generatePythonCode includes page routes', () => {
  const code = generatePythonCode(makeProject());
  expect(code).toContain('@route');
  expect(code).toContain('def index(state: State) -> Page:');
});

test('generatePythonCode includes start_server', () => {
  const code = generatePythonCode(makeProject());
  expect(code).toContain('start_server(');
});
