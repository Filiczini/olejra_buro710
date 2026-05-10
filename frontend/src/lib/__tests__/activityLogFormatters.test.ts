import { describe, it, expect } from 'vitest';
import {
  getEntityTypeBadge,
  getEntityTypeText,
  formatChanges,
  getActionBadge,
  getActionText,
} from '../activityLogFormatters';

describe('activityLogFormatters', () => {
  describe('getEntityTypeBadge', () => {
    it('returns project badge class', () => {
      expect(getEntityTypeBadge('project')).toContain('purple');
    });

    it('returns post badge class', () => {
      expect(getEntityTypeBadge('post')).toContain('orange');
    });

    it('returns default badge class for unknown type', () => {
      expect(getEntityTypeBadge('user')).toContain('gray');
    });
  });

  describe('getEntityTypeText', () => {
    it('returns Ukrainian text for project', () => {
      expect(getEntityTypeText('project')).toBe('Проєкт');
    });

    it('returns Ukrainian text for post', () => {
      expect(getEntityTypeText('post')).toBe('Сторінка');
    });

    it('returns original string for unknown type', () => {
      expect(getEntityTypeText('user')).toBe('user');
    });
  });

  describe('formatChanges', () => {
    it('returns dash for empty changes', () => {
      expect(formatChanges({})).toBe('-');
    });

    it('formats fields array', () => {
      expect(formatChanges({ fields: ['title', 'slug'] })).toBe('Поля: title, slug');
    });

    it('formats hero_updated with hero_fields', () => {
      expect(formatChanges({ hero_updated: true, hero_fields: ['hero_title'] })).toBe(
        'Hero: hero_title'
      );
    });

    it('formats hero_updated without hero_fields', () => {
      expect(formatChanges({ hero_updated: true })).toBe('Hero оновлено');
    });

    it('formats blocks_count', () => {
      expect(formatChanges({ blocks_count: 5 })).toBe('Блоків: 5');
    });

    it('formats media_added', () => {
      expect(formatChanges({ media_added: 3 })).toBe('Медіа+: 3');
    });

    it('formats media_removed', () => {
      expect(formatChanges({ media_removed: 2 })).toBe('Медіа-: 2');
    });

    it('formats media_reordered', () => {
      expect(formatChanges({ media_reordered: true })).toBe('Порядок медіа');
    });

    it('joins multiple changes with pipe', () => {
      expect(formatChanges({ fields: ['title'], blocks_count: 3 })).toBe('Поля: title | Блоків: 3');
    });
  });

  describe('getActionBadge', () => {
    it('returns create badge', () => {
      expect(getActionBadge('create')).toContain('emerald');
    });

    it('returns update badge', () => {
      expect(getActionBadge('update')).toContain('blue');
    });

    it('returns delete badge', () => {
      expect(getActionBadge('delete')).toContain('red');
    });

    it('returns default badge for unknown action', () => {
      expect(getActionBadge('unknown')).toContain('gray');
    });
  });

  describe('getActionText', () => {
    it('returns Ukrainian text for create', () => {
      expect(getActionText('create')).toBe('Створення');
    });

    it('returns Ukrainian text for update', () => {
      expect(getActionText('update')).toBe('Редагування');
    });

    it('returns Ukrainian text for delete', () => {
      expect(getActionText('delete')).toBe('Видалення');
    });

    it('returns original string for unknown action', () => {
      expect(getActionText('unknown')).toBe('unknown');
    });
  });
});
