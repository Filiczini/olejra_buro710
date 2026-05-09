import type { PostHero } from '@buro710/shared';

export interface PostHeroFormData extends PostHero {
  heroImage?: File;
}
