import type { Project } from './types';

const STORAGE_KEY = 'drafter-drafter-projects';

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function loadProjects(): Project[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  return JSON.parse(raw) as Project[];
}
