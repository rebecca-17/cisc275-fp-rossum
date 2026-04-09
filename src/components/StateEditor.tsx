import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadProjects, saveProjects } from '../storage';
import type { StateAttribute, Dataclass } from '../types';

function makeAttribute(): StateAttribute {
  return {
    id: `attr-${Date.now()}`,
    name: 'new_attribute',
    type: 'str',
    description: '',
    defaultValue: '""',
  };
}

function makeDataclass(): Dataclass {
  return {
    id: `dc-${Date.now()}`,
    name: 'NewDataclass',
    attributes: [],
    description: '',
  };
}

export default function StateEditor() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [editingAttr, setEditingAttr] = useState<string | null>(null);

  if (!projectId) return <div>Invalid project ID</div>;

  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return <div>Project not found</div>;

  function saveAndReload(updated: typeof projects) {
    saveProjects(updated);
    setEditingAttr(null);
    window.location.reload();
  }

  function handleAddAttribute() {
    const newAttr = makeAttribute();
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      return { ...p, state: { ...p.state, attributes: [...p.state.attributes, newAttr] } };
    });
    saveAndReload(updated);
  }

  function handleUpdateAttribute(attrId: string, field: string, value: string) {
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        state: {
          ...p.state,
          attributes: p.state.attributes.map((a) =>
            a.id === attrId ? { ...a, [field]: value } : a
          ),
        },
      };
    });
    saveProjects(updated);
  }

  function handleDeleteAttribute(attrId: string) {
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        state: {
          ...p.state,
          attributes: p.state.attributes.filter((a) => a.id !== attrId),
        },
      };
    });
    saveAndReload(updated);
  }

  function handleAddDataclass() {
    const newDc = makeDataclass();
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      return { ...p, secondaryDataclasses: [...p.secondaryDataclasses, newDc] };
    });
    saveAndReload(updated);
  }

  function handleDeleteDataclass(dcId: string) {
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      return { ...p, secondaryDataclasses: p.secondaryDataclasses.filter((d) => d.id !== dcId) };
    });
    saveAndReload(updated);
  }

  return (
    <div className="state-editor">
      <button onClick={() => void navigate(`/project/${projectId}`)}>← Back</button>
      <h1>State Editor: {project.name}</h1>

      <h2>State Dataclass: {project.state.name}</h2>
      <button onClick={handleAddAttribute}>+ Add Attribute</button>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {project.state.attributes.map((attr) => (
            <tr key={attr.id}>
              {editingAttr === attr.id ? (
                <>
                  <td>
                    <input
                      defaultValue={attr.name}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        handleUpdateAttribute(attr.id, 'name', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      defaultValue={attr.type}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        handleUpdateAttribute(attr.id, 'type', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      defaultValue={attr.defaultValue}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        handleUpdateAttribute(attr.id, 'defaultValue', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      defaultValue={attr.description}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        handleUpdateAttribute(attr.id, 'description', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button onClick={() => setEditingAttr(null)}>Done</button>
                    <button onClick={() => handleDeleteAttribute(attr.id)}>Delete</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{attr.name}</td>
                  <td>{attr.type}</td>
                  <td>{attr.defaultValue}</td>
                  <td>{attr.description}</td>
                  <td>
                    <button onClick={() => setEditingAttr(attr.id)}>Edit</button>
                    <button onClick={() => handleDeleteAttribute(attr.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '24px' }}>Secondary Dataclasses</h2>
      <button onClick={handleAddDataclass}>+ Add Dataclass</button>
      {project.secondaryDataclasses.map((dc) => (
        <div key={dc.id} style={{ border: '1px solid #ccc', padding: '12px', marginTop: '8px', borderRadius: '4px' }}>
          <strong>{dc.name}</strong>
          <button onClick={() => handleDeleteDataclass(dc.id)} style={{ marginLeft: '8px' }}>Delete</button>
          <p style={{ color: '#666', fontSize: '14px' }}>{dc.attributes.length} attribute(s)</p>
        </div>
      ))}
    </div>
  );
}
