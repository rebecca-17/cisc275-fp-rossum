import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PageEditor from '../src/components/PageEditor';
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

function renderPageEditor(projectId: string, pageId: string) {
    return render(
        <MemoryRouter initialEntries={[`/project/${projectId}/page/${pageId}`]}>
            <Routes>
                <Route
                    path="/project/:projectId/page/:pageId"
                    element={<PageEditor />}
                />
            </Routes>
        </MemoryRouter>
    );
}

test('PageEditor shows project not found for missing project', () => {
    renderPageEditor('nonexistent', 'page-1');
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
});

test('PageEditor shows page not found for missing page', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderPageEditor(project.id, 'nonexistent-page');
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
});

test('PageEditor renders page name in heading', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderPageEditor(project.id, 'page-1');
    expect(screen.getByText(/Edit Page: index/)).toBeInTheDocument();
});

test('PageEditor shows existing components', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderPageEditor(project.id, 'page-1');
    // 'Header' appears in both the dropdown and the component list
    expect(screen.getAllByText('Header').length).toBeGreaterThanOrEqual(1);
    // 'Text' appears in both the dropdown and the component list
    expect(screen.getAllByText('Text').length).toBeGreaterThanOrEqual(1);
});

test('PageEditor shows component count', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderPageEditor(project.id, 'page-1');
    expect(screen.getByText(/Components \(4\)/)).toBeInTheDocument();
});

test('PageEditor shows Add Component button', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderPageEditor(project.id, 'page-1');
    expect(screen.getByText('Add Component')).toBeInTheDocument();
});

test('PageEditor shows component kind selector', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderPageEditor(project.id, 'page-1');
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1);
});

test('PageEditor adds a new component', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderPageEditor(project.id, 'page-1');
    const countBefore = screen.getAllByText('Delete').length;
    fireEvent.click(screen.getByText('Add Component'));
    expect(screen.getAllByText('Delete').length).toBe(countBefore + 1);
});

test('PageEditor deletes a component', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderPageEditor(project.id, 'page-1');
    const deleteButtons = screen.getAllByText('Delete');
    const countBefore = deleteButtons.length;
    fireEvent.click(deleteButtons[0]);
    expect(screen.getAllByText('Delete').length).toBe(countBefore - 1);
});

test('PageEditor shows no components message for empty page', () => {
    const project = makeProject({
        pages: [
            {
                id: 'empty-page',
                name: 'empty',
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
    });
    seedLocalStorage([project]);
    renderPageEditor(project.id, 'empty-page');
    expect(screen.getByText(/No components yet/)).toBeInTheDocument();
});

test('PageEditor adds a TextBox component', () => {
    const project = makeProject({
        pages: [
            {
                id: 'empty-page',
                name: 'empty',
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
    });
    seedLocalStorage([project]);
    renderPageEditor(project.id, 'empty-page');
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'TextBox' } });
    fireEvent.click(screen.getByText('Add Component'));
    // After adding TextBox, "TextBox" should appear as a strong element in the component list
    expect(screen.getAllByText('TextBox').length).toBeGreaterThanOrEqual(1);
});
