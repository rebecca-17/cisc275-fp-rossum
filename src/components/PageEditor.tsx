import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadProjects, saveProjects } from '../storage';
import type { PageComponent, ComponentKind, Project } from '../types';

function createComponent(kind: ComponentKind): PageComponent {
  const id = `comp-${Date.now()}`;
  switch (kind) {
    case 'Text':
      return { id, kind: 'Text', content: 'Text content' };
    case 'TextBox':
      return { id, kind: 'TextBox', name: 'field_name', defaultValue: '' };
    case 'TextArea':
      return { id, kind: 'TextArea', name: 'field_name', defaultValue: '' };
    case 'CheckBox':
      return { id, kind: 'CheckBox', name: 'field_name', defaultValue: false };
    case 'SelectBox':
      return { id, kind: 'SelectBox', name: 'field_name', options: ['option1', 'option2'], defaultValue: 'option1' };
    case 'Button':
      return { id, kind: 'Button', label: 'Click Me', routeId: '' };
    case 'Header':
      return { id, kind: 'Header', content: 'Heading', level: 1 };
  }
}

const COMPONENT_KINDS: ComponentKind[] = ['Text', 'TextBox', 'TextArea', 'CheckBox', 'SelectBox', 'Button', 'Header'];

export default function PageEditor() {
  const { projectId, pageId } = useParams<{ projectId: string; pageId: string }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [selectedKind, setSelectedKind] = useState<ComponentKind>('Text');

  if (!projectId || !pageId) return <div>Invalid parameters</div>;

  const project = projects.find((p) => p.id === projectId);
  if (!project) return <div>Project not found</div>;

  const page = project.pages.find((pg) => pg.id === pageId);
  if (!page) return <div>Page not found</div>;

  function applyComponents(updated: PageComponent[]) {
    const updatedProjects = projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        pages: p.pages.map((pg) => {
          if (pg.id !== pageId) return pg;
          return { ...pg, components: updated };
        }),
      };
    });
    saveProjects(updatedProjects);
    setProjects(updatedProjects);
  }

  function handleAddComponent(currentComponents: PageComponent[]) {
    const newComp = createComponent(selectedKind);
    applyComponents([...currentComponents, newComp]);
  }

  function handleDeleteComponent(compId: string, currentComponents: PageComponent[]) {
    applyComponents(currentComponents.filter((c) => c.id !== compId));
  }

  function handleUpdateText(compId: string, field: string, value: string, currentComponents: PageComponent[]) {
    const updated = currentComponents.map((c) => {
      if (c.id !== compId) return c;
      return { ...c, [field]: value };
    });
    applyComponents(updated);
  }

  return (
    <div className="page-editor">
      <button onClick={() => void navigate(`/project/${projectId}`)}>← Back to Project</button>
      <h1>Edit Page: {page.name}</h1>
      <div className="add-component">
        <select
          value={selectedKind}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedKind(e.target.value as ComponentKind)
          }
        >
          {COMPONENT_KINDS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <button onClick={() => handleAddComponent(page.components)}>Add Component</button>
      </div>
      <h2>Components ({page.components.length})</h2>
      {page.components.length === 0 && <p>No components yet.</p>}
      <ul className="component-list">
        {page.components.map((comp) => (
          <li key={comp.id} className="component-item">
            <strong>{comp.kind}</strong>
            {comp.kind === 'Text' && (
              <input
                value={comp.content}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateText(comp.id, 'content', e.target.value, page.components)
                }
                placeholder="Content"
              />
            )}
            {comp.kind === 'Header' && (
              <>
                <input
                  value={comp.content}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdateText(comp.id, 'content', e.target.value, page.components)
                  }
                  placeholder="Heading text"
                />
                <select
                  value={comp.level}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleUpdateText(comp.id, 'level', e.target.value, page.components)
                  }
                >
                  {[1, 2, 3, 4, 5, 6].map((l) => (
                    <option key={l} value={l}>H{l}</option>
                  ))}
                </select>
              </>
            )}
            {(comp.kind === 'TextBox' || comp.kind === 'TextArea' || comp.kind === 'CheckBox' || comp.kind === 'SelectBox') && (
              <input
                value={comp.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateText(comp.id, 'name', e.target.value, page.components)
                }
                placeholder="Field name"
              />
            )}
            {comp.kind === 'Button' && (
              <input
                value={comp.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUpdateText(comp.id, 'label', e.target.value, page.components)
                }
                placeholder="Button label"
              />
            )}
            <button onClick={() => handleDeleteComponent(comp.id, page.components)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
