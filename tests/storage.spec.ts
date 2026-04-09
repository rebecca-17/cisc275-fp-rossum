import { saveProjects, loadProjects } from '../src/storage';
import type { Project } from '../src/types';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => { store[key] = value; },
    clear: (): void => { store = {}; },
    removeItem: (key: string): void => { delete store[key]; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

function makeProject(id: string, name: string): Project {
  return {
    id,
    name,
    description: '',
    lastModified: new Date().toISOString(),
    pages: [],
    routes: [],
    state: { id: 'state', name: 'State', attributes: [], description: '' },
    secondaryDataclasses: [],
  };
}

beforeEach(() => {
  localStorageMock.clear();
});

test('loadProjects returns empty array when nothing stored', () => {
  const projects = loadProjects();
  expect(projects).toEqual([]);
});

test('saveProjects and loadProjects roundtrip', () => {
  const projects = [makeProject('1', 'Test Project')];
  saveProjects(projects);
  const loaded = loadProjects();
  expect(loaded).toHaveLength(1);
  expect(loaded[0].name).toBe('Test Project');
});
