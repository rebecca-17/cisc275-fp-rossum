import { useCallback, useMemo, useState } from 'react';
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

type PageNodeData = {
  page: PageNode;
  projectId: string;
  onEditPage: (pageId: string) => void;
  [key: string]: PageNode | string | ((id: string) => void);
};

type RouteEdgeData = {
  routeId: string;
  [key: string]: string;
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

function buildFlowNodes(project: Project, projectId: string, onEditPage: (pageId: string) => void): PageFlowNode[] {
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

  if (!projectId) return <div>Invalid project ID</div>;

  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);

  if (!project) return <div>Project not found</div>;

  function handleEditPage(pageId: string) {
    if (!projectId) return;
    void navigate(`/project/${projectId}/page/${pageId}`);
  }

  const initialNodes = buildFlowNodes(project, projectId, handleEditPage);
  const initialEdges = buildFlowEdges(project);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [nodes, , onNodesChange] = useNodesState<PageFlowNode>(initialNodes);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [edges, setEdges, onEdgesChange] = useEdgesState<RouteFlowEdge>(initialEdges);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
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
    },
    [setEdges, projects, projectId]
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const nodeTypes = useMemo(
    () => ({ pageNode: PageFlowNodeComponent }),
    []
  );

  function handleAddPage() {
    if (!newPageName.trim()) return;
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p;
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
      return { ...p, pages: [...p.pages, newPage] };
    });
    saveProjects(updated);
    setNewPageName('');
    window.location.reload();
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px', display: 'flex', gap: '8px', alignItems: 'center', background: '#f5f5f5' }}>
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
