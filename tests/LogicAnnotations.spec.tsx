import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LogicAnnotations from '../src/components/LogicAnnotations';
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

function renderLogicAnnotations(projectId: string) {
    return render(
        <MemoryRouter initialEntries={[`/project/${projectId}/logic`]}>
            <Routes>
                <Route path="/project/:projectId/logic" element={<LogicAnnotations />} />
            </Routes>
        </MemoryRouter>
    );
}

test('LogicAnnotations shows invalid project for missing project', () => {
    renderLogicAnnotations('nonexistent');
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
});

test('LogicAnnotations renders heading with project name', () => {
    const project = makeProject({ name: 'My App' });
    seedLocalStorage([project]);
    renderLogicAnnotations(project.id);
    expect(screen.getByText(/Logic Annotations: My App/)).toBeInTheDocument();
});

test('LogicAnnotations shows page selector', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderLogicAnnotations(project.id);
    expect(screen.getByText(/Select page/)).toBeInTheDocument();
});

test('LogicAnnotations shows existing if annotation', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderLogicAnnotations(project.id);
    expect(screen.getByText(/Show error if empty/)).toBeInTheDocument();
});

test('LogicAnnotations shows existing for annotation', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderLogicAnnotations(project.id);
    expect(screen.getByText(/Render each item/)).toBeInTheDocument();
});

test('LogicAnnotations shows Add If button', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderLogicAnnotations(project.id);
    expect(screen.getByText('Add If')).toBeInTheDocument();
});

test('LogicAnnotations shows Add For button', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderLogicAnnotations(project.id);
    expect(screen.getByText('Add For')).toBeInTheDocument();
});

test('LogicAnnotations adds a new if annotation', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderLogicAnnotations(project.id);

    const ifInputs = screen.getAllByPlaceholderText(/e.g. Show error/);
    fireEvent.change(ifInputs[0], { target: { value: 'Check if user logged in' } });
    fireEvent.click(screen.getByText('Add If'));
    expect(screen.getByText('Check if user logged in')).toBeInTheDocument();
});

test('LogicAnnotations adds a new for annotation', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderLogicAnnotations(project.id);

    const attrInput = screen.getByPlaceholderText(/State attribute/);
    const descInput = screen.getByPlaceholderText(/e.g. Render each todo/);
    fireEvent.change(attrInput, { target: { value: 'entries' } });
    fireEvent.change(descInput, { target: { value: 'Show each entry' } });
    fireEvent.click(screen.getByText('Add For'));
    expect(screen.getByText(/Show each entry/)).toBeInTheDocument();
});

test('LogicAnnotations deletes an if annotation', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderLogicAnnotations(project.id);
    expect(screen.getByText(/Show error if empty/)).toBeInTheDocument();
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(screen.queryByText(/Show error if empty/)).not.toBeInTheDocument();
});

test('LogicAnnotations shows no pages message when project has no pages', () => {
    const project = makeProject({ pages: [], routes: [] });
    seedLocalStorage([project]);
    renderLogicAnnotations(project.id);
    expect(screen.getByText(/No pages yet/)).toBeInTheDocument();
});
