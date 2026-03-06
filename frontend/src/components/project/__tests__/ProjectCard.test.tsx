import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectCard from '../ProjectCard';
import type { Project } from '../../../types/project';

const baseProject: Project = {
  id: '1',
  title: 'Тестовий проєкт',
  image_url: 'https://example.com/image.jpg',
  tags: ['Житловий'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const renderCard = (project: Project) =>
  render(
    <MemoryRouter>
      <ProjectCard project={project} />
    </MemoryRouter>
  );

describe('ProjectCard', () => {
  it('renders project title', () => {
    renderCard(baseProject);
    expect(screen.getByText('Тестовий проєкт')).toBeInTheDocument();
  });

  it('renders project image with correct alt text', () => {
    renderCard(baseProject);
    const img = screen.getByAltText('Тестовий проєкт');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('links to correct project page', () => {
    renderCard(baseProject);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/project/1');
  });

  it('renders first tag as category in metadata', () => {
    renderCard(baseProject);
    expect(screen.getByText(/житловий/i)).toBeInTheDocument();
  });

  it('renders area with м² suffix when provided', () => {
    renderCard({ ...baseProject, area: '120' });
    expect(screen.getByText(/120 м²/)).toBeInTheDocument();
  });

  it('renders location when provided', () => {
    renderCard({ ...baseProject, location: 'Київ' });
    expect(screen.getByText(/Київ/)).toBeInTheDocument();
  });

  it('renders year when provided', () => {
    renderCard({ ...baseProject, year: '2023' });
    expect(screen.getByText(/2023/)).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    renderCard({ ...baseProject, subtitle: 'Короткий опис' });
    expect(screen.getByText('Короткий опис')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    renderCard(baseProject);
    expect(screen.queryByText('Короткий опис')).not.toBeInTheDocument();
  });

  it('does not render metadata when no tags, area, location, or year', () => {
    renderCard({ ...baseProject, tags: [] });
    expect(screen.queryByText('·')).not.toBeInTheDocument();
  });
});
