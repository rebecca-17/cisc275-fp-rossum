import type { Project } from '../src/types';

export const STORAGE_KEY = 'drafter-drafter-projects';

export function setupLocalStorageMock() {
    let store: Record<string, string> = {};
    const mock = {
        getItem: (key: string): string | null => store[key] ?? null,
        setItem: (key: string, value: string): void => {
            store[key] = value;
        },
        clear: (): void => {
            store = {};
        },
        removeItem: (key: string): void => {
            delete store[key];
        },
    };
    Object.defineProperty(window, 'localStorage', { value: mock, writable: true });
    return mock;
}

export function makeProject(overrides?: Partial<Project>): Project {
    return {
        id: 'test-project',
        name: 'Test Project',
        description: 'A test project',
        lastModified: new Date().toISOString(),
        pages: [
            {
                id: 'page-1',
                name: 'index',
                components: [
                    { id: 'c1', kind: 'Header', content: 'Welcome', level: 1 },
                    { id: 'c2', kind: 'Text', content: 'Hello world' },
                    { id: 'c3', kind: 'TextBox', name: 'username', defaultValue: '' },
                    { id: 'c4', kind: 'Button', label: 'Submit', routeId: 'r1' },
                ],
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
                ifAnnotations: [{ id: 'if1', description: 'Show error if empty' }],
                forAnnotations: [
                    { id: 'for1', description: 'Render each item', stateAttribute: 'items' },
                ],
                stateAnnotation: 'Main page',
                position: { x: 100, y: 100 },
            },
        ],
        routes: [
            {
                id: 'r1',
                sourcePageId: 'page-1',
                targetPageId: 'page-2',
                name: 'go_to_result',
                stateAnnotation: 'Navigate to result',
                ifAnnotations: [],
            },
        ],
        state: {
            id: 'state-1',
            name: 'State',
            description: 'Application state',
            attributes: [
                {
                    id: 'a1',
                    name: 'username',
                    type: 'str',
                    description: 'User name',
                    defaultValue: '""',
                },
                {
                    id: 'a2',
                    name: 'count',
                    type: 'int',
                    description: 'Count',
                    defaultValue: '0',
                },
                {
                    id: 'a3',
                    name: 'active',
                    type: 'bool',
                    description: 'Active',
                    defaultValue: 'False',
                },
                {
                    id: 'a4',
                    name: 'items',
                    type: 'list[str]',
                    description: 'Items',
                    defaultValue: '[]',
                },
            ],
        },
        secondaryDataclasses: [
            {
                id: 'dc1',
                name: 'Item',
                description: 'An item',
                attributes: [
                    { id: 'da1', name: 'title', type: 'str', description: 'Title', defaultValue: '""' },
                ],
            },
        ],
        ...overrides,
    };
}

export function seedLocalStorage(projects: Project[]) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
