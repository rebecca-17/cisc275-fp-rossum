import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import StateEditor from '../src/components/StateEditor';
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

function renderStateEditor(projectId: string) {
    return render(
        <MemoryRouter initialEntries={[`/project/${projectId}/state`]}>
            <Routes>
                <Route path="/project/:projectId/state" element={<StateEditor />} />
            </Routes>
        </MemoryRouter>
    );
}

test('StateEditor shows invalid project id for missing project', () => {
    renderStateEditor('nonexistent');
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
});

test('StateEditor renders heading with project name', () => {
    const project = makeProject({ name: 'My App' });
    seedLocalStorage([project]);
    renderStateEditor(project.id);
    expect(screen.getByText(/State Editor: My App/)).toBeInTheDocument();
});

test('StateEditor shows state dataclass name', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderStateEditor(project.id);
    expect(screen.getByText(/State Dataclass: State/)).toBeInTheDocument();
});

test('StateEditor shows existing attributes', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderStateEditor(project.id);
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('count')).toBeInTheDocument();
});

test('StateEditor shows Add Attribute button', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderStateEditor(project.id);
    expect(screen.getByText(/\+ Add Attribute/)).toBeInTheDocument();
});

test('StateEditor adds a new attribute on button click', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderStateEditor(project.id);
    const initialRows = screen.getAllByText('Edit').length;
    fireEvent.click(screen.getByText(/\+ Add Attribute/));
    expect(screen.getAllByText('Edit').length).toBe(initialRows + 1);
});

test('StateEditor shows secondary dataclasses section', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderStateEditor(project.id);
    expect(screen.getByText(/Secondary Dataclasses/)).toBeInTheDocument();
});

test('StateEditor shows existing secondary dataclass', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderStateEditor(project.id);
    expect(screen.getByText('Item')).toBeInTheDocument();
});

test('StateEditor adds new secondary dataclass', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderStateEditor(project.id);
    const countBefore = screen.getAllByText(/\d+ attribute\(s\)/).length;
    fireEvent.click(screen.getByText(/\+ Add Dataclass/));
    expect(screen.getAllByText(/\d+ attribute\(s\)/).length).toBe(countBefore + 1);
});

test('StateEditor deletes a secondary dataclass', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderStateEditor(project.id);
    expect(screen.getByText('Item')).toBeInTheDocument();
    // Find the Delete button for the secondary dataclass
    const deleteButtons = screen.getAllByText('Delete');
    // Last delete button belongs to the dataclass
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    expect(screen.queryByText('Item')).not.toBeInTheDocument();
});

test('StateEditor delete attribute removes from list', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderStateEditor(project.id);
    expect(screen.getByText('username')).toBeInTheDocument();
    // Click Delete for 'username' attribute (first row)
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(screen.queryByText('username')).not.toBeInTheDocument();
});

test('StateEditor edit attribute shows input fields', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderStateEditor(project.id);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    // After clicking edit, should show Done button
    expect(screen.getByText('Done')).toBeInTheDocument();
});
