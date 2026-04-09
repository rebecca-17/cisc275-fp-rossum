import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react';
import type {
  Node,
  Edge,
  Connection,
  NodeProps,
  OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { loadProjects, saveProjects } from '../storage';
import type { Project, PageNode } from '../types';

// PageNodeData properties are all subtypes of unknown, satisfying Node<T extends Record<string, unknown>>
// without needing an explicit index signature.
type PageNodeData = {
  page: PageNode;
  projectId: string;
  onEditPage: (pageId: string) => void;
};

type RouteEdgeData = {
  routeId: string;
};

type PageFlowNode = Node<PageNodeData>;
type RouteFlowEdge = Edge<RouteEdgeData>;

function PageFlowNodeComponent({ data }: NodeProps<PageFlowNode>) {
  return (
    <div
      style={{
        padding: '10px',
        border: '2px solid #4a90d9',
        borderRadius: '8px',
        background: '#fff',
        minWidth: '150px',
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{data.page.name}</div>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
        {data.page.components.length} component(s)
      </div>
      <button
        onClick={() => data.onEditPage(data.page.id)}
        style={{ fontSize: '12px' }}
      >
        Edit
      </button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function buildFlowNodes(
  project: Project,
  projectId: string,
  onEditPage: (pageId: string) => void
): PageFlowNode[] {
  return project.pages.map((page) => ({
    id: page.id,
    type: 'pageNode',
    position: page.position,
    data: { page, projectId, onEditPage },
  }));
}

function buildFlowEdges(project: Project): RouteFlowEdge[] {
  return project.routes.map((route) => ({
    id: route.id,
    source: route.sourcePageId,
    target: route.targetPageId,
    label: route.name,
    data: { routeId: route.id },
  }));
}

function PageGraphInner() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [newPageName, setNewPageName] = useState('');
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());

  const handleEditPage = useCallback(
    (pageId: string) => {
      if (!projectId) return;
      void navigate(`/project/${projectId}/page/${pageId}`);
    },
    [navigate, projectId]
  );

  const project = projectId ? projects.find((p) => p.id === projectId) : undefined;

  const [nodes, setNodes, onNodesChange] = useNodesState<PageFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RouteFlowEdge>([]);

  useEffect(() => {
    if (project && projectId) {
      setNodes(buildFlowNodes(project, projectId, handleEditPage));
      setEdges(buildFlowEdges(project));
    }
  }, [project, projectId, handleEditPage, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!projectId) return;
      setEdges((eds) => addEdge(connection, eds));
      const updated = projects.map((p) => {
        if (p.id !== projectId) return p;
        const newRoute = {
          id: `route-${Date.now()}`,
          sourcePageId: connection.source,
          targetPageId: connection.target,
          name: 'route',
          stateAnnotation: '',
          ifAnnotations: [],
        };
        return { ...p, routes: [...p.routes, newRoute] };
      });
      saveProjects(updated);
      setProjects(updated);
    },
    [setEdges, projects, projectId]
  );

  const nodeTypes = useMemo(() => ({ pageNode: PageFlowNodeComponent }), []);

  if (!projectId) return <div>Invalid project ID</div>;
  if (!project) return <div>Project not found</div>;

  function handleAddPage() {
    if (!newPageName.trim() || !projectId) return;
    const newPage: PageNode = {
      id: `page-${Date.now()}`,
      name: newPageName.trim(),
      components: [],
      componentStyles: {},
      pageStyle: {
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px',
      },
      ifAnnotations: [],
      forAnnotations: [],
      stateAnnotation: '',
      position: { x: Math.random() * 400, y: Math.random() * 300 },
    };
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
      return { ...p, pages: [...p.pages, newPage] };
    });
    saveProjects(updated);
    setProjects(updated);

    const newNode: PageFlowNode = {
      id: newPage.id,
      type: 'pageNode',
      position: newPage.position,
      data: { page: newPage, projectId, onEditPage: handleEditPage },
    };
    setNodes((ns) => [...ns, newNode]);
    setNewPageName('');
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '8px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          background: '#f5f5f5',
        }}
      >
        <button onClick={() => void navigate(`/project/${projectId}`)}>← Back</button>
        <strong>Page Graph: {project.name}</strong>
        <input
          value={newPageName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPageName(e.target.value)}
          placeholder="New page name"
          style={{ marginLeft: 'auto' }}
        />
        <button onClick={handleAddPage}>Add Page</button>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function PageGraph() {
  return (
    <ReactFlowProvider>
      <PageGraphInner />
    </ReactFlowProvider>
  );
}
