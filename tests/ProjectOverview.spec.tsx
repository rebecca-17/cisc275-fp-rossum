import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProjectOverview from '../src/components/ProjectOverview';
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

function renderProjectOverview(projectId: string) {
    return render(
        <MemoryRouter initialEntries={[`/project/${projectId}`]}>
            <Routes>
                <Route path="/project/:projectId" element={<ProjectOverview />} />
            </Routes>
        </MemoryRouter>
    );
}

test('ProjectOverview shows project not found when project missing', () => {
    renderProjectOverview('nonexistent');
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
});

test('ProjectOverview renders project name', () => {
    const project = makeProject({ name: 'My Cool App' });
    seedLocalStorage([project]);
    renderProjectOverview(project.id);
    expect(screen.getByText('My Cool App')).toBeInTheDocument();
});

test('ProjectOverview shows page count', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderProjectOverview(project.id);
    expect(screen.getByText(/Pages: 1/)).toBeInTheDocument();
});

test('ProjectOverview shows route count', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderProjectOverview(project.id);
    expect(screen.getByText(/Routes: 1/)).toBeInTheDocument();
});

test('ProjectOverview shows Page Graph button', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderProjectOverview(project.id);
    expect(screen.getByText(/Page Graph/)).toBeInTheDocument();
});

test('ProjectOverview shows State Editor button', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderProjectOverview(project.id);
    expect(screen.getByText(/State Editor/)).toBeInTheDocument();
});

test('ProjectOverview shows page list', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderProjectOverview(project.id);
    expect(screen.getByText('index')).toBeInTheDocument();
});

test('ProjectOverview shows description', () => {
    const project = makeProject({ description: 'Project description here' });
    seedLocalStorage([project]);
    renderProjectOverview(project.id);
    expect(screen.getByText('Project description here')).toBeInTheDocument();
});

test('ProjectOverview shows Code Generator button', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderProjectOverview(project.id);
    expect(screen.getByText(/Code Generator/)).toBeInTheDocument();
});

test('ProjectOverview shows Export DOCX button', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderProjectOverview(project.id);
    expect(screen.getByText(/Export DOCX/)).toBeInTheDocument();
});
