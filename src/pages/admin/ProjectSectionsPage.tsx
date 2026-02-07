/**
 * Project Sections Management Page
 *
 * Admin page for managing all sections of a project.
 * Add/edit/delete/reorder sections with drag-and-drop support.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ProjectSection, SectionType } from '@/types/sections';
import type { Project } from '@/types/project';
import { createDefaultSectionContent, getSectionDefaultTitle } from '@/types/sections';
import { portfolioService } from '@/services/api';

export default function ProjectSectionsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Load project and sections
  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      try {
        setLoading(true);
        const data = await portfolioService.getById(projectId);
        setProject(data);
        setSections(data.sections || []);
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  // Reorder sections
  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);

    // Update order numbers
    const reordered = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    setSections(reordered);
  };

  // Toggle visibility
  const handleToggle = (sectionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    ));
  };

  // Add new section
  const handleAddSection = (type: SectionType) => {
    const newSection: ProjectSection = {
      id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      order: sections.length,
      enabled: true,
      title: getSectionDefaultTitle(type),
      content: createDefaultSectionContent(type)
    };

    setSections([...sections, newSection]);
    setEditingSection(newSection.id);
  };

  // Delete section
  const handleDeleteSection = (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    setSections(sections.filter(s => s.id !== sectionId));

    // Close editor if editing this section
    if (editingSection === sectionId) {
      setEditingSection(null);
    }
  };

  // Save all sections
  const handleSave = async () => {
    if (!projectId || saving) return;

    try {
      setSaving(true);

      // Sort sections by order before saving
      const sortedSections = sections
        .map((section, index) => ({ ...section, order: index }));

      const updatedProject = await fetch(`/api/portfolio/${projectId}/sections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sections: sortedSections })
      }).then(res => {
        if (!res.ok) throw new Error('Failed to save sections');
        return res.json();
      }).then(data => data.project);

      setProject(updatedProject);
      alert('Sections saved successfully!');
    } catch (error) {
      console.error('Failed to save sections:', error);
      alert('Failed to save sections. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-zinc-600">Loading sections...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Project not found</div>
      </div>
    );
  }

  const sectionTypes: SectionType[] = [
    'hero',
    'metadata',
    'about',
    'full-width-image',
    'concept',
    'design-zones',
    'text-block',
    'image-block',
    'gallery',
    'cta',
    'tags'
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Manage Sections</h1>
              <p className="text-zinc-500 mt-1">
                {project.title} - {sections.length} sections
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/admin/projects/edit/${projectId}`)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:bg-zinc-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add New Section */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Add New Section</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {sectionTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleAddSection(type)}
                className="p-4 border border-zinc-200 rounded-lg hover:border-zinc-400 hover:bg-zinc-50 transition-colors text-left"
              >
                <div className="text-sm font-medium text-zinc-900 capitalize">
                  {getSectionDefaultTitle(type)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sections List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Current Sections</h2>

          {sections.length === 0 ? (
            <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
              <p className="text-zinc-500">No sections yet. Add your first section above.</p>
            </div>
          ) : (
            sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                index={index}
                isEditing={editingSection === section.id}
                onToggle={handleToggle}
                onDelete={handleDeleteSection}
                onEdit={() => setEditingSection(section.id)}
                onClose={() => setEditingSection(null)}
                onUpdate={(updates) => {
                  setSections(sections.map(s =>
                    s.id === section.id ? { ...s, ...updates } : s
                  ));
                }}
                onReorder={handleReorder}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface SectionEditorProps {
  section: ProjectSection;
  index: number;
  isEditing: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
  onClose: () => void;
  onUpdate: (updates: Partial<ProjectSection>) => void;
  onReorder: (from: number, to: number) => void;
}

function SectionEditor({
  section,
  index,
  isEditing,
  onToggle,
  onDelete,
  onEdit,
  onClose,
  onUpdate,
  onReorder
}: SectionEditorProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border ${
        section.enabled ? 'border-zinc-200' : 'border-zinc-100 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-100">
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                onClick={() => onReorder(index, index - 1)}
                className="p-1 hover:bg-zinc-100 rounded"
                title="Move up"
              >
                ↑
              </button>
            )}
            {index < 10 && (
              <button
                onClick={() => onReorder(index, index + 1)}
                className="p-1 hover:bg-zinc-100 rounded"
                title="Move down"
              >
                ↓
              </button>
            )}
            <span className="w-6 h-6 rounded bg-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
              {index + 1}
            </span>
          </div>

          {/* Section Type & Title */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                {section.type}
              </span>
              <span className="text-sm font-medium text-zinc-900">
                {section.title}
              </span>
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              Order: {section.order}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Toggle Visibility */}
          <button
            onClick={() => onToggle(section.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              section.enabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {section.enabled ? 'Visible' : 'Hidden'}
          </button>

          {/* Edit */}
          <button
            onClick={isEditing ? onClose : onEdit}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              isEditing
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {isEditing ? 'Close' : 'Edit'}
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(section.id)}
            className="px-3 py-1.5 text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Content Editor (shown when editing) */}
      {isEditing && (
        <div className="p-6 border-t border-zinc-100">
          <SectionContentEditor
            type={section.type}
            content={section.content}
            onChange={(content) => onUpdate({ content })}
          />
        </div>
      )}
    </div>
  );
}

interface SectionContentEditorProps {
  type: SectionType;
  content: any;
  onChange: (content: any) => void;
}

function SectionContentEditor({ type, content, onChange }: SectionContentEditorProps) {
  switch (type) {
    case 'hero':
      return <HeroEditor content={content} onChange={onChange} />;

    case 'metadata':
      return <MetadataEditor content={content} onChange={onChange} />;

    case 'about':
      return <AboutEditor content={content} onChange={onChange} />;

    case 'concept':
      return <ConceptEditor content={content} onChange={onChange} />;

    case 'design-zones':
      return <DesignZonesEditor content={content} onChange={onChange} />;

    case 'text-block':
      return <TextBlockEditor content={content} onChange={onChange} />;

    case 'image-block':
    case 'full-width-image':
      return <ImageBlockEditor content={content} onChange={onChange} />;

    case 'gallery':
      return <GalleryEditor content={content} onChange={onChange} />;

    case 'cta':
      return <CTAEditor content={content} onChange={onChange} />;

    case 'tags':
      return <TagsEditor content={content} onChange={onChange} />;

    default:
      return <div className="text-red-500">Unknown section type: {type}</div>;
  }
}

// Simplified editors for each section type
// In production, these would be more sophisticated with image upload, etc.

function HeroEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Short Description</label>
        <textarea
          value={content.short_description || ''}
          onChange={(e) => onChange({ ...content, short_description: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Image URL</label>
        <input
          type="text"
          value={content.image_url || ''}
          onChange={(e) => onChange({ ...content, image_url: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Layout</label>
        <select
          value={content.layout || 'centered'}
          onChange={(e) => onChange({ ...content, layout: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        >
          <option value="centered">Centered</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="split">Split</option>
        </select>
      </div>
    </div>
  );
}

function MetadataEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.keys(content).map((key) => (
        <div key={key}>
          <label className="block text-sm font-medium text-zinc-700 mb-1 capitalize">
            {key.replace('_', ' ')}
          </label>
          <input
            type="text"
            value={content[key] || ''}
            onChange={(e) => onChange({ ...content, [key]: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 rounded"
          />
        </div>
      ))}
    </div>
  );
}

function AboutEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Description Paragraphs</label>
        {Array.isArray(content.description) ? content.description.map((para: string, idx: number) => (
          <div key={idx} className="mb-2">
            <textarea
              value={para}
              onChange={(e) => {
                const newDesc = [...content.description];
                newDesc[idx] = e.target.value;
                onChange({ ...content, description: newDesc });
              }}
              className="w-full px-3 py-2 border border-zinc-300 rounded"
              rows={3}
            />
          </div>
        )) : (
          <textarea
            value={content.description?.[0] || ''}
            onChange={(e) => onChange({ ...content, description: [e.target.value] })}
            className="w-full px-3 py-2 border border-zinc-300 rounded"
            rows={3}
          />
        )}
      </div>
    </div>
  );
}

function ConceptEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Heading</label>
        <input
          type="text"
          value={content.heading || ''}
          onChange={(e) => onChange({ ...content, heading: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Caption</label>
        <input
          type="text"
          value={content.caption || ''}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Quote</label>
        <textarea
          value={content.quote || ''}
          onChange={(e) => onChange({ ...content, quote: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
          rows={2}
        />
      </div>
    </div>
  );
}

function DesignZonesEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">Design zones editor coming soon...</p>
      <textarea
        value={JSON.stringify(content.zones || [], null, 2)}
        onChange={(e) => {
          try {
            const zones = JSON.parse(e.target.value);
            onChange({ ...content, zones });
          } catch (err) {
            console.error('Invalid JSON');
          }
        }}
        className="w-full px-3 py-2 border border-zinc-300 rounded font-mono text-sm"
        rows={10}
      />
    </div>
  );
}

function TextBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Content</label>
        {Array.isArray(content.content) ? content.content.map((para: string, idx: number) => (
          <div key={idx} className="mb-2">
            <textarea
              value={para}
              onChange={(e) => {
                const newContent = [...content.content];
                newContent[idx] = e.target.value;
                onChange({ ...content, content: newContent });
              }}
              className="w-full px-3 py-2 border border-zinc-300 rounded"
              rows={3}
            />
          </div>
        )) : null}
      </div>
    </div>
  );
}

function ImageBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Image URL</label>
        <input
          type="text"
          value={content.image_url || ''}
          onChange={(e) => onChange({ ...content, image_url: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Caption</label>
        <input
          type="text"
          value={content.caption || ''}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Alt Text</label>
        <input
          type="text"
          value={content.alt || ''}
          onChange={(e) => onChange({ ...content, alt: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Height</label>
        <input
          type="text"
          value={content.height || '80vh'}
          onChange={(e) => onChange({ ...content, height: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
    </div>
  );
}

function GalleryEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">Gallery editor coming soon...</p>
      <textarea
        value={JSON.stringify(content.images || [], null, 2)}
        onChange={(e) => {
          try {
            const images = JSON.parse(e.target.value);
            onChange({ ...content, images });
          } catch (err) {
            console.error('Invalid JSON');
          }
        }}
        className="w-full px-3 py-2 border border-zinc-300 rounded font-mono text-sm"
        rows={10}
      />
    </div>
  );
}

function CTAEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
        <textarea
          value={content.description || ''}
          onChange={(e) => onChange({ ...content, description: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Button Text</label>
        <input
          type="text"
          value={content.button_text || ''}
          onChange={(e) => onChange({ ...content, button_text: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Button URL</label>
        <input
          type="text"
          value={content.button_url || ''}
          onChange={(e) => onChange({ ...content, button_url: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
        />
      </div>
    </div>
  );
}

function TagsEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Tags (comma-separated)</label>
        <textarea
          value={Array.isArray(content.tags) ? content.tags.join(', ') : ''}
          onChange={(e) => onChange({ ...content, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
          className="w-full px-3 py-2 border border-zinc-300 rounded"
          rows={3}
        />
      </div>
    </div>
  );
}
