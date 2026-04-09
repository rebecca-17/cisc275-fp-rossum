import { useParams, useNavigate } from 'react-router-dom';
import { loadProjects } from '../storage';
import { generatePythonCode } from '../codeGen';

export default function CodeGenerator() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  if (!projectId) return <div>Invalid project ID</div>;

  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return <div>Project not found</div>;

  const code = generatePythonCode(project);

  function handleCopy() {
    void navigator.clipboard.writeText(code);
  }

  return (
    <div className="code-generator">
      <button onClick={() => void navigate(`/project/${projectId}`)}>← Back</button>
      <h1>Code Generator: {project.name}</h1>
      <p>Generated Python Drafter code based on your project design.</p>
      <button onClick={handleCopy} style={{ marginBottom: '12px' }}>
        📋 Copy to Clipboard
      </button>
      <pre
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '14px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
        }}
      >
        {code}
      </pre>
    </div>
  );
}
