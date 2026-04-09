import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadProjects, saveProjects } from '../storage';
import type { IfAnnotation, ForAnnotation } from '../types';

export default function LogicAnnotations() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [newIfDesc, setNewIfDesc] = useState('');
  const [newForDesc, setNewForDesc] = useState('');
  const [newForAttr, setNewForAttr] = useState('');
  const [selectedPageId, setSelectedPageId] = useState('');

  if (!projectId) return <div>Invalid project ID</div>;

  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return <div>Project not found</div>;

  const currentPage = selectedPageId
    ? project.pages.find((pg) => pg.id === selectedPageId)
    : project.pages[0];

  function saveAndReload(updated: typeof projects) {
    saveProjects(updated);
    window.location.reload();
  }

  function handleAddIfAnnotation() {
    if (!newIfDesc.trim() || !currentPage) return;
    const annotation: IfAnnotation = {
      id: `if-${Date.now()}`,
      description: newIfDesc.trim(),
    };
    const updatedProjects = projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        pages: p.pages.map((pg) => {
          if (pg.id !== currentPage.id) return pg;
          return { ...pg, ifAnnotations: [...pg.ifAnnotations, annotation] };
        }),
      };
    });
    saveAndReload(updatedProjects);
  }

  function handleAddForAnnotation() {
    if (!newForDesc.trim() || !newForAttr.trim() || !currentPage) return;
    const annotation: ForAnnotation = {
      id: `for-${Date.now()}`,
      description: newForDesc.trim(),
      stateAttribute: newForAttr.trim(),
    };
    const updatedProjects = projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        pages: p.pages.map((pg) => {
          if (pg.id !== currentPage.id) return pg;
          return { ...pg, forAnnotations: [...pg.forAnnotations, annotation] };
        }),
      };
    });
    saveAndReload(updatedProjects);
  }

  function handleDeleteIfAnnotation(pageId: string, annotId: string) {
    const updatedProjects = projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        pages: p.pages.map((pg) => {
          if (pg.id !== pageId) return pg;
          return { ...pg, ifAnnotations: pg.ifAnnotations.filter((a) => a.id !== annotId) };
        }),
      };
    });
    saveAndReload(updatedProjects);
  }

  function handleDeleteForAnnotation(pageId: string, annotId: string) {
    const updatedProjects = projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        pages: p.pages.map((pg) => {
          if (pg.id !== pageId) return pg;
          return { ...pg, forAnnotations: pg.forAnnotations.filter((a) => a.id !== annotId) };
        }),
      };
    });
    saveAndReload(updatedProjects);
  }

  return (
    <div className="logic-annotations">
      <button onClick={() => void navigate(`/project/${projectId}`)}>← Back</button>
      <h1>Logic Annotations: {project.name}</h1>
      <p>Add if/for logic annotations to pages to document conditional rendering and loops.</p>

      <div style={{ marginBottom: '16px' }}>
        <label>Select page: </label>
        <select
          value={selectedPageId || (project.pages[0]?.id ?? '')}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPageId(e.target.value)}
        >
          {project.pages.map((pg) => (
            <option key={pg.id} value={pg.id}>{pg.name}</option>
          ))}
        </select>
      </div>

      {project.pages.length === 0 && <p>No pages yet. Add pages in the Page Graph.</p>}

      {project.pages.map((page) => {
        const isSelected = selectedPageId ? page.id === selectedPageId : page.id === project.pages[0]?.id;
        if (!isSelected) return null;
        return (
          <div key={page.id} style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '4px' }}>
            <h2>Page: {page.name}</h2>

            <h3>If Annotations (conditional rendering)</h3>
            <ul>
              {page.ifAnnotations.map((ann) => (
                <li key={ann.id}>
                  {ann.description}
                  <button onClick={() => handleDeleteIfAnnotation(page.id, ann.id)} style={{ marginLeft: '8px' }}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={newIfDesc}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIfDesc(e.target.value)}
                placeholder="e.g. Show error message if name is empty"
              />
              <button onClick={handleAddIfAnnotation}>Add If</button>
            </div>

            <h3 style={{ marginTop: '16px' }}>For Annotations (loops)</h3>
            <ul>
              {page.forAnnotations.map((ann) => (
                <li key={ann.id}>
                  <em>for each</em> <code>{ann.stateAttribute}</code>: {ann.description}
                  <button onClick={() => handleDeleteForAnnotation(page.id, ann.id)} style={{ marginLeft: '8px' }}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={newForAttr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForAttr(e.target.value)}
                placeholder="State attribute (e.g. todos)"
              />
              <input
                value={newForDesc}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForDesc(e.target.value)}
                placeholder="e.g. Render each todo item"
              />
              <button onClick={handleAddForAnnotation}>Add For</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
