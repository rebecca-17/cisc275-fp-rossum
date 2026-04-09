import { useParams, useNavigate } from 'react-router-dom';
import { loadProjects } from '../storage';

export default function ProjectOverview() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  if (!projectId) return <div>Invalid project ID</div>;

  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);

  if (!project) return <div>Project not found</div>;

  return (
    <div className="project-overview">
      <button onClick={() => void navigate('/')}>← Back to Dashboard</button>
      <h1>{project.name}</h1>
      {project.description && <p>{project.description}</p>}
      <p>Pages: {project.pages.length} | Routes: {project.routes.length}</p>
      <div className="overview-nav">
        <button onClick={() => void navigate(`/project/${projectId}/graph`)}>
          📊 Page Graph
        </button>
        <button onClick={() => void navigate(`/project/${projectId}/state`)}>
          🗄️ State Editor
        </button>
        <button onClick={() => void navigate(`/project/${projectId}/logic`)}>
          🔀 Logic Annotations
        </button>
        <button onClick={() => void navigate(`/project/${projectId}/code`)}>
          💻 Code Generator
        </button>
        <button onClick={() => void navigate(`/project/${projectId}/export`)}>
          📄 Export DOCX
        </button>
      </div>
      <h2>Pages</h2>
      {project.pages.length === 0 && (
        <p>No pages yet. Use the Page Graph to add pages.</p>
      )}
      <ul>
        {project.pages.map((page) => (
          <li key={page.id}>
            <button
              onClick={() => void navigate(`/project/${projectId}/page/${page.id}`)}
            >
              {page.name}
            </button>
            <span> — {page.components.length} component(s)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
