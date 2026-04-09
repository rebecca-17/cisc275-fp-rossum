import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DocxExporter from '../src/components/DocxExporter';
import { setupLocalStorageMock, makeProject, seedLocalStorage } from './helpers';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<object>('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock the docx Packer to avoid binary file generation in tests
jest.mock('docx', () => {
    const mockBlob = new Blob(['mock docx content'], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    return {
        Document: jest.fn().mockImplementation(() => ({})),
        Paragraph: jest.fn().mockImplementation((opts: Record<string, string>) => ({ opts })),
        TextRun: jest.fn().mockImplementation((text: string) => ({ text })),
        HeadingLevel: { HEADING_1: 'HEADING_1', HEADING_2: 'HEADING_2', HEADING_3: 'HEADING_3' },
        Packer: {
            toBlob: jest.fn().mockResolvedValue(mockBlob),
        },
    };
});

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = jest.fn();
Object.defineProperty(window, 'URL', {
    value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
    },
    writable: true,
});

const lsMock = setupLocalStorageMock();

beforeEach(() => {
    lsMock.clear();
    mockNavigate.mockClear();
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
});

function renderDocxExporter(projectId: string) {
    return render(
        <MemoryRouter initialEntries={[`/project/${projectId}/export`]}>
            <Routes>
                <Route path="/project/:projectId/export" element={<DocxExporter />} />
            </Routes>
        </MemoryRouter>
    );
}

test('DocxExporter shows invalid project for missing project', () => {
    renderDocxExporter('nonexistent');
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
});

test('DocxExporter renders heading with project name', () => {
    const project = makeProject({ name: 'My App' });
    seedLocalStorage([project]);
    renderDocxExporter(project.id);
    expect(screen.getByText(/Export DOCX: My App/)).toBeInTheDocument();
});

test('DocxExporter shows Download DOCX button', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderDocxExporter(project.id);
    expect(screen.getByText(/Download DOCX/)).toBeInTheDocument();
});

test('DocxExporter shows description text', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderDocxExporter(project.id);
    expect(screen.getByText(/Export your project design as a Word document/)).toBeInTheDocument();
});

test('DocxExporter triggers download when button clicked', async () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderDocxExporter(project.id);

    const downloadBtn = screen.getByText(/Download DOCX/);
    fireEvent.click(downloadBtn);

    // Should show 'Generating...' immediately
    expect(screen.getByText('Generating...')).toBeInTheDocument();

    // After the promise resolves, should show 'Downloaded!'
    await waitFor(() => {
        expect(screen.getByText('Downloaded!')).toBeInTheDocument();
    });
});

test('DocxExporter back button calls navigate', () => {
    const project = makeProject();
    seedLocalStorage([project]);
    renderDocxExporter(project.id);
    fireEvent.click(screen.getByText(/← Back/));
    expect(mockNavigate).toHaveBeenCalled();
});
