import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectOverview from './components/ProjectOverview';
import PageGraph from './components/PageGraph';
import PageEditor from './components/PageEditor';
import StateEditor from './components/StateEditor';
import LogicAnnotations from './components/LogicAnnotations';
import CodeGenerator from './components/CodeGenerator';
import DocxExporter from './components/DocxExporter';
import './App.css';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:projectId" element={<ProjectOverview />} />
        <Route path="/project/:projectId/graph" element={<PageGraph />} />
        <Route path="/project/:projectId/page/:pageId" element={<PageEditor />} />
        <Route path="/project/:projectId/state" element={<StateEditor />} />
        <Route path="/project/:projectId/logic" element={<LogicAnnotations />} />
        <Route path="/project/:projectId/code" element={<CodeGenerator />} />
        <Route path="/project/:projectId/export" element={<DocxExporter />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
