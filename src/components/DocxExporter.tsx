import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { loadProjects } from '../storage';
import type { Project } from '../types';

function buildDocumentSections(project: Project): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      text: project.name,
      heading: HeadingLevel.HEADING_1,
    })
  );

  if (project.description) {
    paragraphs.push(new Paragraph({ children: [new TextRun(project.description)] }));
  }

  paragraphs.push(
    new Paragraph({ text: 'Pages', heading: HeadingLevel.HEADING_2 })
  );

  for (const page of project.pages) {
    paragraphs.push(
      new Paragraph({ text: page.name, heading: HeadingLevel.HEADING_3 })
    );
    if (page.stateAnnotation) {
      paragraphs.push(
        new Paragraph({ children: [new TextRun({ text: `Purpose: ${page.stateAnnotation}`, italics: true })] })
      );
    }
    paragraphs.push(
      new Paragraph({ children: [new TextRun(`Components: ${page.components.map((c) => c.kind).join(', ') || 'none'}`)] })
    );
    if (page.ifAnnotations.length > 0) {
      paragraphs.push(new Paragraph({ children: [new TextRun('Conditional logic:')] }));
      for (const ann of page.ifAnnotations) {
        paragraphs.push(new Paragraph({ text: `• if: ${ann.description}` }));
      }
    }
    if (page.forAnnotations.length > 0) {
      paragraphs.push(new Paragraph({ children: [new TextRun('Loops:')] }));
      for (const ann of page.forAnnotations) {
        paragraphs.push(new Paragraph({ text: `• for each ${ann.stateAttribute}: ${ann.description}` }));
      }
    }
  }

  paragraphs.push(
    new Paragraph({ text: 'Routes', heading: HeadingLevel.HEADING_2 })
  );

  for (const route of project.routes) {
    const srcPage = project.pages.find((pg) => pg.id === route.sourcePageId);
    const tgtPage = project.pages.find((pg) => pg.id === route.targetPageId);
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${route.name}: `, bold: true }),
          new TextRun(`${srcPage?.name ?? route.sourcePageId} → ${tgtPage?.name ?? route.targetPageId}`),
        ],
      })
    );
    if (route.stateAnnotation) {
      paragraphs.push(
        new Paragraph({ children: [new TextRun({ text: route.stateAnnotation, italics: true })] })
      );
    }
  }

  paragraphs.push(
    new Paragraph({ text: 'State', heading: HeadingLevel.HEADING_2 })
  );

  paragraphs.push(
    new Paragraph({ text: `class ${project.state.name}:`, heading: HeadingLevel.HEADING_3 })
  );

  for (const attr of project.state.attributes) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${attr.name}: ${attr.type}`, bold: true }),
          new TextRun(attr.description ? ` — ${attr.description}` : ''),
        ],
      })
    );
  }

  return paragraphs;
}

export default function DocxExporter() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');

  if (!projectId) return <div>Invalid project ID</div>;

  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return <div>Project not found</div>;

  function handleExport(proj: Project) {
    setStatus('Generating...');

    const doc = new Document({
      sections: [
        {
          children: buildDocumentSections(proj),
        },
      ],
    });

    const projectName = proj.name;
    Packer.toBlob(doc)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus('Downloaded!');
      })
      .catch(() => {
        setStatus('Export failed. Please try again.');
      });
  }

  return (
    <div className="docx-exporter">
      <button onClick={() => void navigate(`/project/${projectId}`)}>← Back</button>
      <h1>Export DOCX: {project.name}</h1>
      <p>Export your project design as a Word document (.docx).</p>
      <p>The document will include all pages, routes, components, and state information.</p>
      <button onClick={() => handleExport(project)} style={{ padding: '12px 24px', fontSize: '16px' }}>
        📄 Download DOCX
      </button>
      {status && <p style={{ marginTop: '8px', color: status === 'Downloaded!' ? 'green' : '#666' }}>{status}</p>}
    </div>
  );
}
