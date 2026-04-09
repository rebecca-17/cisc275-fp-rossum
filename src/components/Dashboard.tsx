import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProjects, saveProjects } from '../storage';
import { demoProjects } from '../demoData';
import type { Project } from '../types';

function createNewProject(): Project {
  const id = `project-${Date.now()}`;
  return {
    id,
    name: 'New Project',
    description: '',
    lastModified: new Date().toISOString(),
    pages: [],
    routes: [],
    state: {
      id: `state-${id}`,
      name: 'State',
      description: '',
      attributes: [],
    },
    secondaryDataclasses: [],
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());

  function handleCreate() {
    const newProject = createNewProject();
    const updated = [...projects, newProject];
    saveProjects(updated);
    setProjects(updated);
    void navigate(`/project/${newProject.id}`);
  }

  function handleDelete(id: string) {
    const updated = projects.filter((p) => p.id !== id);
    saveProjects(updated);
    setProjects(updated);
  }

  function handleLoadDemos() {
    const existing = projects.filter(
      (p) => !demoProjects.some((d) => d.id === p.id)
    );
    const updated = [...existing, ...demoProjects];
    saveProjects(updated);
    setProjects(updated);
  }

  return (
    <div className="dashboard">
      <h1>Drafter Drafter</h1>
      <p>A website planning tool for Drafter (Python web framework) apps.</p>
      <div className="dashboard-actions">
        <button onClick={handleCreate}>+ New Project</button>
        <button onClick={handleLoadDemos}>Load Demo Projects</button>
      </div>
      <h2>Your Projects</h2>
      {projects.length === 0 && (
        <p>No projects yet. Create one or load the demo projects.</p>
      )}
      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.id} className="project-item">
            <div className="project-info">
              <strong>{project.name}</strong>
              {project.description && <span> — {project.description}</span>}
              <small> (last modified: {new Date(project.lastModified).toLocaleDateString()})</small>
            </div>
            <div className="project-actions">
              <button onClick={() => void navigate(`/project/${project.id}`)}>
                Open
              </button>
              <button onClick={() => handleDelete(project.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
