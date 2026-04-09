import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../src/components/Dashboard';
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

function renderDashboard() {
    return render(
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<Dashboard />} />
            </Routes>
        </MemoryRouter>
    );
}

test('Dashboard renders heading', () => {
    renderDashboard();
    expect(screen.getByText(/Drafter Drafter/i)).toBeInTheDocument();
});

test('Dashboard renders New Project button', () => {
    renderDashboard();
    expect(screen.getByText(/New Project/i)).toBeInTheDocument();
});

test('Dashboard renders Load Demo Projects button', () => {
    renderDashboard();
    expect(screen.getByText(/Load Demo Projects/i)).toBeInTheDocument();
});

test('Dashboard shows empty state message when no projects', () => {
    renderDashboard();
    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
});

test('Dashboard shows existing projects', () => {
    const project = makeProject({ name: 'My App', description: 'test desc' });
    seedLocalStorage([project]);
    renderDashboard();
    expect(screen.getByText('My App')).toBeInTheDocument();
});

test('Dashboard creates new project on button click', () => {
    renderDashboard();
    const btn = screen.getByText(/New Project/i);
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalled();
});

test('Dashboard deletes project on delete button click', () => {
    const project = makeProject({ name: 'To Delete' });
    seedLocalStorage([project]);
    renderDashboard();
    expect(screen.getByText('To Delete')).toBeInTheDocument();
    const deleteBtn = screen.getByText('Delete');
    fireEvent.click(deleteBtn);
    expect(screen.queryByText('To Delete')).not.toBeInTheDocument();
});

test('Dashboard loads demo projects', () => {
    renderDashboard();
    const demoBtn = screen.getByText(/Load Demo Projects/i);
    fireEvent.click(demoBtn);
    expect(screen.getByText('Calculator App')).toBeInTheDocument();
    expect(screen.getByText('Todo List App')).toBeInTheDocument();
});

test('Dashboard opens project on Open button click', () => {
    const project = makeProject({ name: 'My App' });
    seedLocalStorage([project]);
    renderDashboard();
    const openBtn = screen.getByText('Open');
    fireEvent.click(openBtn);
    expect(mockNavigate).toHaveBeenCalledWith(`/project/${project.id}`);
});

test('Dashboard shows project description', () => {
    const project = makeProject({ description: 'My description' });
    seedLocalStorage([project]);
    renderDashboard();
    expect(screen.getByText(/My description/)).toBeInTheDocument();
});
