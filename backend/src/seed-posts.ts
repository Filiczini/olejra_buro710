import 'dotenv/config';
import { db, pool } from './db';
import { posts, blocks } from './db/schema';

interface SeedBlock {
  type: 'text_full' | 'image_full' | 'text_image' | 'image_text';
  data: Record<string, unknown>;
  sort_order: number;
}

interface SeedPost {
  title: string;
  slug: string;
  status: 'draft' | 'published';
  seo_title: string;
  seo_description: string;
  hero_image_url: string;
  hero_title: string;
  hero_subtitle: string;
  hero_tags: string[];
  hero_location: string;
  hero_year: string;
  blocks: SeedBlock[];
  gallery_images: string[];
}

const heroImages = [
  'https://picsum.photos/seed/buro-hero1/1920/1080',
  'https://picsum.photos/seed/buro-hero2/1920/1080',
  'https://picsum.photos/seed/buro-hero3/1920/1080',
  'https://picsum.photos/seed/buro-hero4/1920/1080',
  'https://picsum.photos/seed/buro-hero5/1920/1080',
  'https://picsum.photos/seed/buro-hero6/1920/1080',
  'https://picsum.photos/seed/buro-hero7/1920/1080',
  'https://picsum.photos/seed/buro-hero8/1920/1080',
  'https://picsum.photos/seed/buro-hero9/1920/1080',
  'https://picsum.photos/seed/buro-hero10/1920/1080',
];

const contentImages = [
  'https://picsum.photos/seed/buro-content1/1200/800',
  'https://picsum.photos/seed/buro-content2/1200/800',
  'https://picsum.photos/seed/buro-content3/1200/800',
  'https://picsum.photos/seed/buro-content4/1200/800',
  'https://picsum.photos/seed/buro-content5/1200/800',
];

const seedPostsData: SeedPost[] = [
  {
    title: 'Про нашу студію',
    slug: 'pro-nashu-studiyu',
    status: 'published',
    seo_title: 'Про Buro 710 — Архітектурне бюро',
    seo_description:
      'Дізнайтеся більше про архітектурне бюро Buro 710. Наша команда, філософія та підхід до дизайну.',
    hero_image_url: heroImages[0],
    hero_title: 'Buro 710',
    hero_subtitle: 'Архітектура, що надихає',
    hero_tags: ['про нас', 'студія'],
    hero_location: 'Київ',
    hero_year: '2018',
    blocks: [
      {
        type: 'text_full',
        data: {
          content:
            'Buro 710 — це архітектурне бюро, яке спеціалізується на створенні сучасних житлових та комерційних просторів. Ми віримо, що архітектура повинна не лише задовольняти функціональні потреби, але й надихати.',
          label: 'Хто ми',
        },
        sort_order: 0,
      },
      {
        type: 'image_full',
        data: {
          image_url: contentImages[0],
          alt: "Інтер'єр офісу Buro 710",
          caption: 'Наш робочий простір',
        },
        sort_order: 1,
      },
      {
        type: 'text_image',
        data: {
          text: 'Наша команда складається з досвідчених архітекторів та дизайнерів, які працюють над кожним проєктом з особливою увагою до деталей.',
          image_url: contentImages[1],
          image_alt: 'Команда за роботою',
          icon: 'solar:buildings-linear',
          label: 'Команда',
          title: 'Професіонали своєї справи',
          features: ['10+ років досвіду', '50+ завершених проєктів', 'Міжнародні нагороди'],
        },
        sort_order: 2,
      },
    ],
    gallery_images: [contentImages[2], contentImages[3], contentImages[4]],
  },
  {
    title: 'Архітектура майбутнього',
    slug: 'arhitektura-maybutnego',
    status: 'published',
    seo_title: 'Архітектура майбутнього — Тренди та інновації',
    seo_description:
      'Досліджуємо головні тренди в сучасній архітектурі: сталий розвиток, смарт-будинки та біофільний дизайн.',
    hero_image_url: heroImages[1],
    hero_title: 'Майбутнє вже тут',
    hero_subtitle: 'Інновації в архітектурі',
    hero_tags: ['тренди', 'інновації'],
    hero_location: 'Світ',
    hero_year: '2025',
    blocks: [
      {
        type: 'text_full',
        data: {
          content:
            'Сучасна архітектура переживає революцію. Нові технології, екологічні матеріали та зміна способу життя формують нові підходи до проектування простору.',
          label: 'Вступ',
        },
        sort_order: 0,
      },
      {
        type: 'text_image',
        data: {
          text: 'Сталий розвиток стає пріоритетом для архітекторів у всьому світі.',
          image_url: contentImages[2],
          image_alt: 'Еко-будинок',
          icon: 'solar:leaf-linear',
          label: 'Екологія',
          title: 'Сталий розвиток',
        },
        sort_order: 1,
      },
      {
        type: 'image_text',
        data: {
          text: 'Смарт-технології інтегруються в будинки.',
          image_url: contentImages[3],
          image_alt: 'Смарт-будинок',
          icon: 'solar:lightbulb-linear',
          label: 'Технології',
          title: 'Розумні будинки',
        },
        sort_order: 2,
      },
    ],
    gallery_images: [contentImages[0], contentImages[1], contentImages[4]],
  },
  {
    title: 'Еко-будинки: гід по стилю',
    slug: 'eko-budinky-gid-po-stylu',
    status: 'published',
    seo_title: 'Еко-будинки — Повний гід по стилю',
    seo_description:
      'Все про еко-будинки: матеріали, технології, переваги та приклади реалізованих проєктів.',
    hero_image_url: heroImages[2],
    hero_title: 'Еко-будинки',
    hero_subtitle: 'Гармонія з природою',
    hero_tags: ['еко', 'екологія'],
    hero_location: 'Україна',
    hero_year: '2024',
    blocks: [
      {
        type: 'text_full',
        data: {
          content: 'Еко-будинки — це не просто тренд, а необхідність сучасності.',
          label: 'Вступ',
          area: '150-300 м²',
          months: '6-12',
          year: '2024',
        },
        sort_order: 0,
      },
      {
        type: 'image_full',
        data: {
          image_url: contentImages[4],
          alt: 'Еко-будинок з дерева',
          caption: 'Приклад еко-будинку з натуральних матеріалів',
        },
        sort_order: 1,
      },
      {
        type: 'text_full',
        data: {
          content: 'Основні принципи еко-будівництва: використання натуральних матеріалів.',
          label: 'Принципи',
        },
        sort_order: 2,
      },
    ],
    gallery_images: [contentImages[0], contentImages[2], contentImages[3]],
  },
];

async function seedPosts() {
  console.log('Seeding posts...');
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < seedPostsData.length; i++) {
    const post = seedPostsData[i];
    console.log(`[${i + 1}/${seedPostsData.length}] Inserting: ${post.title}...`);

    try {
      const [insertedPost] = await db
        .insert(posts)
        .values({
          title: post.title,
          slug: post.slug,
          status: post.status,
          seo_title: post.seo_title,
          seo_description: post.seo_description,
          hero_image_url: post.hero_image_url,
          hero_title: post.hero_title,
          hero_subtitle: post.hero_subtitle,
          hero_tags: post.hero_tags,
          hero_location: post.hero_location,
          hero_year: post.hero_year,
          gallery_images: post.gallery_images,
        })
        .returning();

      if (!insertedPost) {
        throw new Error('Failed to insert post');
      }

      if (post.blocks.length > 0) {
        const blockRecords = post.blocks.map((block) => ({
          post_id: insertedPost.id,
          type: block.type as
            | 'text_full'
            | 'image_full'
            | 'text_image'
            | 'image_text'
            | 'three_images',
          data: block.data,
          sort_order: block.sort_order,
        }));

        await db.insert(blocks).values(blockRecords);
      }

      successCount++;
      console.log(`   Done: ${post.title}`);
      console.log(`     Slug: ${post.slug}`);
      console.log(`     Blocks: ${post.blocks.length}`);
      console.log(`     Gallery: ${post.gallery_images.length}`);
      console.log('');
    } catch (error: any) {
      errorCount++;
      console.error(`   Error inserting "${post.title}":`);
      console.error(`     Message: ${error?.message}`);
      console.log('');
    }
  }

  console.log('========================================');
  console.log('Summary:');
  console.log(`   Successfully inserted: ${successCount}`);
  console.log(`   Failed to insert: ${errorCount}`);
  console.log(`   Total: ${seedPostsData.length}`);
  console.log('========================================');

  await pool.end();

  if (errorCount === 0) {
    console.log('Seeding completed successfully!');
    process.exit(0);
  } else if (successCount > 0) {
    console.log('Seeding completed with some errors');
    process.exit(1);
  } else {
    console.log('Seeding failed completely');
    process.exit(1);
  }
}

seedPosts();
