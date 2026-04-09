import { generatePythonCode } from '../src/codeGen';
import type { Project, PageComponent } from '../src/types';

function makeBaseProject(): Project {
    return {
        id: '1',
        name: 'Test App',
        description: 'A test app',
        lastModified: new Date().toISOString(),
        pages: [],
        routes: [],
        state: {
            id: 'state',
            name: 'State',
            description: '',
            attributes: [],
        },
        secondaryDataclasses: [],
    };
}

test('generatePythonCode with empty project has imports', () => {
    const code = generatePythonCode(makeBaseProject());
    expect(code).toContain('from drafter import *');
    expect(code).toContain('from dataclasses import dataclass');
    expect(code).toContain('from bakery import assert_equal');
});

test('generatePythonCode with empty state uses pass', () => {
    const code = generatePythonCode(makeBaseProject());
    expect(code).toContain('pass');
});

test('generatePythonCode includes secondary dataclass', () => {
    const project: Project = {
        ...makeBaseProject(),
        secondaryDataclasses: [
            {
                id: 'dc1',
                name: 'Item',
                description: '',
                attributes: [
                    { id: 'a1', name: 'title', type: 'str', description: '', defaultValue: '""' },
                ],
            },
        ],
    };
    const code = generatePythonCode(project);
    expect(code).toContain('class Item:');
    expect(code).toContain('title: str');
});

test('generatePythonCode with empty secondary dataclass uses pass', () => {
    const project: Project = {
        ...makeBaseProject(),
        secondaryDataclasses: [{ id: 'dc1', name: 'Empty', description: '', attributes: [] }],
    };
    const code = generatePythonCode(project);
    expect(code).toContain('class Empty:');
    expect(code).toContain('pass');
});

test('generatePythonCode renders all component kinds', () => {
    const components: PageComponent[] = [
        { id: '1', kind: 'Text', content: 'Hello' },
        { id: '2', kind: 'TextBox', name: 'field', defaultValue: '' },
        { id: '3', kind: 'TextArea', name: 'area', defaultValue: '' },
        { id: '4', kind: 'CheckBox', name: 'check', defaultValue: false },
        { id: '5', kind: 'SelectBox', name: 'sel', options: ['a', 'b'], defaultValue: 'a' },
        { id: '6', kind: 'Button', label: 'Go', routeId: 'r1' },
        { id: '7', kind: 'Header', content: 'Title', level: 2 },
    ];
    const project: Project = {
        ...makeBaseProject(),
        pages: [
            {
                id: 'p1',
                name: 'index',
                components,
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
                stateAnnotation: 'Main page',
                position: { x: 0, y: 0 },
            },
        ],
    };
    const code = generatePythonCode(project);
    expect(code).toContain('Text("Hello")');
    expect(code).toContain('TextBox("field"');
    expect(code).toContain('TextArea("area"');
    expect(code).toContain('CheckBox("check"');
    expect(code).toContain('SelectBox("sel"');
    expect(code).toContain('Button("Go")');
    expect(code).toContain('Header(2');
    // State annotation becomes a comment
    expect(code).toContain('# Main page');
});

test('generatePythonCode renders default values correctly', () => {
    const project: Project = {
        ...makeBaseProject(),
        state: {
            id: 's',
            name: 'State',
            description: '',
            attributes: [
                { id: 'a1', name: 'num', type: 'int', description: '', defaultValue: '' },
                { id: 'a2', name: 'fl', type: 'float', description: '', defaultValue: '' },
                { id: 'a3', name: 'flag', type: 'bool', description: '', defaultValue: '' },
                { id: 'a4', name: 'text', type: 'str', description: '', defaultValue: '' },
                { id: 'a5', name: 'lst', type: 'list[str]', description: '', defaultValue: '' },
            ],
        },
    };
    const code = generatePythonCode(project);
    expect(code).toContain('start_server(State(0, 0.0, False, "", []))');
});

test('generatePythonCode includes attribute descriptions as comments', () => {
    const project: Project = {
        ...makeBaseProject(),
        state: {
            id: 's',
            name: 'State',
            description: '',
            attributes: [
                { id: 'a1', name: 'count', type: 'int', description: 'The count value', defaultValue: '0' },
            ],
        },
    };
    const code = generatePythonCode(project);
    expect(code).toContain('# The count value');
});

test('generatePythonCode handles attribute without description', () => {
    const project: Project = {
        ...makeBaseProject(),
        state: {
            id: 's',
            name: 'State',
            description: '',
            attributes: [
                { id: 'a1', name: 'count', type: 'int', description: '', defaultValue: '0' },
            ],
        },
    };
    const code = generatePythonCode(project);
    expect(code).toContain('count: int');
    expect(code).not.toContain('#');
});
