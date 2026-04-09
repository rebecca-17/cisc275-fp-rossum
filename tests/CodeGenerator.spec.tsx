import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CodeGenerator from '../src/components/CodeGenerator';
import { setupLocalStorageMock, makeProject, seedLocalStorage } from './helpers';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<object>('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const lsMock = setupLocalStorageMock();

beforeEach(() => {
    lsMock.clear();
    mockNavigate.mockClear();
});

function renderCodeGenerator(projectId: string) {
    return render(
        <MemoryRouter initialEntries={[`/project/${projectId}/code`]}>
            <Routes>
                <Route path="/project/:projectId/code" element={<CodeGenerator />} />
            </Routes>
        </MemoryRouter>
    );
}

test('CodeGenerator shows invalid project for missing project', () => {
    renderCodeGenerator('nonexistent');
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
});

test('CodeGenerator renders heading with project name', () => {
    const project = makeProject({ name: 'My App' });
    seedLocalStorage([project]);
    renderCodeGenerator(project.id);
    expect(screen.getByText(/Code Generator: My App/)).toBeInTheDocument();
});

test('CodeGenerator shows generated Python imports', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderCodeGenerator(project.id);
    expect(screen.getByText(/from drafter import \*/)).toBeInTheDocument();
});

test('CodeGenerator shows state dataclass in code', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderCodeGenerator(project.id);
    expect(screen.getByText(/class State:/)).toBeInTheDocument();
});

test('CodeGenerator shows route definition in code', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderCodeGenerator(project.id);
    expect(screen.getByText(/@route/)).toBeInTheDocument();
});

test('CodeGenerator shows Copy to Clipboard button', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderCodeGenerator(project.id);
    expect(screen.getByText(/Copy to Clipboard/)).toBeInTheDocument();
});

test('CodeGenerator shows start_server call', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderCodeGenerator(project.id);
    expect(screen.getByText(/start_server\(/)).toBeInTheDocument();
});
