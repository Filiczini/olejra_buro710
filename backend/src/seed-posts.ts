import { supabase } from './config/supabase';

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

const posts: SeedPost[] = [
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
          text: 'Сталий розвиток стає пріоритетом для архітекторів у всьому світі. Використання перероблених матеріалів, енергоефективність та мінімізація вуглецевого сліду.',
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
          text: 'Смарт-технології інтегруються в будинки, роблячи їх більш зручними та енергоефективними. Автоматичне керування освітленням, кліматом та безпекою.',
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
          content:
            'Еко-будинки — це не просто тренд, а необхідність сучасності. Вони поєднують комфорт проживання з мінімальним впливом на навколишнє середовище.',
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
          content:
            'Основні принципи еко-будівництва: використання натуральних матеріалів (дерево, камінь, глина), енергоефективність, збір дощової води, сонячні панелі.',
          label: 'Принципи',
        },
        sort_order: 2,
      },
    ],
    gallery_images: [contentImages[0], contentImages[2], contentImages[3]],
  },
  {
    title: 'Ремонт квартири: з чого почати',
    slug: 'remont-kvartyry-z-choho-pochaty',
    status: 'published',
    seo_title: 'Ремонт квартири — Покроковий гід',
    seo_description:
      'Повний гід з ремонту квартири: планування, бюджет, вибір матеріалів та підрядників.',
    hero_image_url: heroImages[3],
    hero_title: 'Ремонт квартири',
    hero_subtitle: 'Покроковий гід',
    hero_tags: ['ремонт', 'квартира'],
    hero_location: 'Київ',
    hero_year: '2024',
    blocks: [
      {
        type: 'text_full',
        data: {
          content:
            'Ремонт квартири — це складний процес, який потребує ретельного планування. У цій статті ми розкажемо про основні етапи та помилки, яких варто уникнути.',
          label: 'Вступ',
        },
        sort_order: 0,
      },
      {
        type: 'text_image',
        data: {
          text: 'Перший крок — визначення бюджету та термінів. Рекомендуємо додати 15-20% до запланованої суми на непередбачені витрати.',
          image_url: contentImages[0],
          image_alt: 'Планування ремонту',
          icon: 'solar:pen-linear',
          label: 'Крок 1',
          title: 'Планування',
          features: ['Визначення бюджету', 'Розробка дизайн-проекту', 'Выбір підрядника'],
        },
        sort_order: 1,
      },
      {
        type: 'image_text',
        data: {
          text: 'Другий крок — демонтаж та підготовчі роботи. Важливо перевірити стан стін, стелі та підлоги перед початком оздоблювальних робіт.',
          image_url: contentImages[1],
          image_alt: 'Демонтажні роботи',
          icon: 'solar:hammer-linear',
          label: 'Крок 2',
          title: 'Демонтаж',
        },
        sort_order: 2,
      },
      {
        type: 'text_full',
        data: {
          content:
            'Третій крок — інженерні комунікації (електрика, сантехніка, опалення). Це найважливіший етап, від якого залежить комфорт проживання.',
          label: 'Крок 3',
        },
        sort_order: 3,
      },
    ],
    gallery_images: [contentImages[2], contentImages[3], contentImages[4]],
  },
  {
    title: "Мінімалізм в інтер'єрі",
    slug: 'minimalizm-v-interyeri',
    status: 'published',
    seo_title: "Мінімалізм в інтер'єрі — Принципи та ідеї",
    seo_description:
      "Дізнайтеся, як створити мінімалістичний інтер'єр: основні принципи, кольорова палітра та практичні поради.",
    hero_image_url: heroImages[4],
    hero_title: 'Мінімалізм',
    hero_subtitle: 'Менше — це більше',
    hero_tags: ['мінімалізм', 'дизайн'],
    hero_location: 'Київ',
    hero_year: '2024',
    blocks: [
      {
        type: 'text_full',
        data: {
          content:
            "Мінімалізм — це не просто стиль, а філософія життя. В інтер'єрі він проявляється через чисті лінії, відкритий простір та функціональність кожного елемента.",
          label: 'Філософія',
        },
        sort_order: 0,
      },
      {
        type: 'image_full',
        data: {
          image_url: contentImages[2],
          alt: "Мінімалістичний інтер'єр",
          caption: 'Приклад мінімалістичної вітальні',
        },
        sort_order: 1,
      },
      {
        type: 'text_full',
        data: {
          content:
            'Основні принципи мінімалізму: нейтральна кольорова палітра (білий, сірий, бежевий), натуральні матеріали, відсутність зайвих деталей, приховані системи зберігання.',
          label: 'Принципи',
        },
        sort_order: 2,
      },
    ],
    gallery_images: [contentImages[0], contentImages[1], contentImages[3]],
  },
  {
    title: 'Скандинавський стиль',
    slug: 'skandinavskyi-styl',
    status: 'published',
    seo_title: "Скандинавський стиль в інтер'єрі",
    seo_description:
      'Все про скандинавський стиль: затишок, натуральні матеріали, світлі тони та функціональність.',
    hero_image_url: heroImages[5],
    hero_title: 'Scandinavian Style',
    hero_subtitle: 'Затишок та функціональність',
    hero_tags: ['скандинавія', 'дизайн'],
    hero_location: 'Скандинавія',
    hero_year: '2024',
    blocks: [
      {
        type: 'text_full',
        data: {
          content:
            'Скандинавський стиль зародився в країнах Північної Європи і став одним з найпопулярніших у світі. Його головні риси — світлі тони, натуральне дерево та затишна атмосфера.',
          label: 'Походження',
        },
        sort_order: 0,
      },
      {
        type: 'text_image',
        data: {
          text: 'Світло відіграє ключову роль у скандинавському дизайні. Великі вікна, світлі стіни та дзеркала допомагають最大化 використання природного освітлення.',
          image_url: contentImages[3],
          image_alt: "Скандинавський інтер'єр",
          icon: 'solar:sun-2-linear',
          label: 'Світло',
          title: 'Гра світла',
          features: ['Великі вікна', 'Світлі стіни', 'Дзеркала'],
        },
        sort_order: 1,
      },
    ],
    gallery_images: [contentImages[1], contentImages[2], contentImages[4]],
  },
  {
    title: 'Лофт: від промисловості до дому',
    slug: 'loft-vid-promyslovosti-do-domu',
    status: 'published',
    seo_title: 'Стиль лофт — Історія та особливості',
    seo_description:
      "Історія виникнення стилю лофт, його особливості та як створити лофт-інтер'єр у своїй квартирі.",
    hero_image_url: heroImages[6],
    hero_title: 'Loft Style',
    hero_subtitle: 'Індустріальна естетика',
    hero_tags: ['лофт', 'індустріальний'],
    hero_location: 'Нью-Йорк',
    hero_year: '2023',
    blocks: [
      {
        type: 'text_full',
        data: {
          content:
            "Лофт зародився в 1950-х роках в Нью-Йорку, коли художники почали заселяти покинуті промислові будівлі. Сьогодні це один з наймодніших стилів інтер'єру.",
          label: 'Історія',
        },
        sort_order: 0,
      },
      {
        type: 'image_full',
        data: {
          image_url: contentImages[0],
          alt: "Лофт інтер'єр",
          caption: 'Класичний лофт з цегляними стінами',
        },
        sort_order: 1,
      },
      {
        type: 'text_full',
        data: {
          content:
            'Характерні риси лофту: відкритий план, високі стелі, цегляні стіни, великі вікна, відкриті комунікації, поєднання старого та нового.',
          label: 'Особливості',
        },
        sort_order: 2,
      },
    ],
    gallery_images: [contentImages[1], contentImages[3], contentImages[4]],
  },
  {
    title: 'Кухня мрії: планування',
    slug: 'kuhnya-mriyi-planuvannya',
    status: 'published',
    seo_title: 'Планування кухні — Практичні поради',
    seo_description:
      'Як спланувати ідеальну кухню: робочий трикутник, зони зберігання, вибір матеріалів та техніки.',
    hero_image_url: heroImages[7],
    hero_title: 'Кухня мрії',
    hero_subtitle: 'Планування та дизайн',
    hero_tags: ['кухня', 'планування'],
    hero_location: 'Київ',
    hero_year: '2024',
    blocks: [
      {
        type: 'text_full',
        data: {
          content:
            'Кухня — серце дому. Правильне планування зробить приготування їжі комфортним та приємним. Розглянемо основні принципи ергономіки кухні.',
          label: 'Вступ',
        },
        sort_order: 0,
      },
      {
        type: 'text_image',
        data: {
          text: 'Робочий трикутник — основа ергономіки кухні. Холодильник, мийка та плита повинні утворювати трикутник з сумою сторін 4-6 метрів.',
          image_url: contentImages[1],
          image_alt: 'Планування кухні',
          icon: 'solar:chef-hat-linear',
          label: 'Ергономіка',
          title: 'Робочий трикутник',
          features: ['Холодильник', 'Мийка', 'Плита'],
        },
        sort_order: 1,
      },
      {
        type: 'text_full',
        data: {
          content:
            'Зони зберігання: продукти біля холодильника, посуд біля мийки, каструлі та сковорідки біля плити. Верхні шафки — для рідко використовуваних предметів.',
          label: 'Зберігання',
        },
        sort_order: 2,
      },
    ],
    gallery_images: [contentImages[0], contentImages[2], contentImages[3]],
  },
  {
    title: 'Ванна кімната: тренд 2025',
    slug: 'vanna-kimnata-trend-2025',
    status: 'published',
    seo_title: 'Тренди в дизайні ванної кімнати 2025',
    seo_description:
      'Головні тренді в дизайні ванних кімнат у 2025 році: натуральні матеріали, кольори та технології.',
    hero_image_url: heroImages[8],
    hero_title: 'Ванна 2025',
    hero_subtitle: 'Нові тренди',
    hero_tags: ['ванна', 'тренди'],
    hero_location: 'Світ',
    hero_year: '2025',
    blocks: [
      {
        type: 'text_full',
        data: {
          content:
            'У 2025 році ванні кімнати стають справжніми спа-зонами. Натуральні матеріали, теплі тони та розумні технології — головні тенденції року.',
          label: 'Тренди',
        },
        sort_order: 0,
      },
      {
        type: 'image_full',
        data: {
          image_url: contentImages[4],
          alt: 'Сучасна ванна кімната',
          caption: 'Мінімалістична ванна з натуральним каменем',
        },
        sort_order: 1,
      },
      {
        type: 'text_full',
        data: {
          content:
            'Популярні матеріали: натуральний камінь, дерево (з вологостійкою обробкою), латунь та матовий чорний метал. Кольорова палітра: пісочний, оливковий, теракотовий.',
          label: 'Матеріали',
        },
        sort_order: 2,
      },
    ],
    gallery_images: [contentImages[0], contentImages[1], contentImages[2]],
  },
  {
    title: 'Дизайн дитячої кімнати',
    slug: 'dyzayn-dytyachoyi-kimnaty',
    status: 'published',
    seo_title: 'Дизайн дитячої кімнати — Ідеї та поради',
    seo_description:
      'Як створити ідеальну дитячу кімнату: зонування, безпека, кольори та меблі, що ростуть разом з дитиною.',
    hero_image_url: heroImages[9],
    hero_title: 'Дитяча кімната',
    hero_subtitle: 'Простір для розвитку',
    hero_tags: ['дитяча', 'дизайн'],
    hero_location: 'Київ',
    hero_year: '2024',
    blocks: [
      {
        type: 'text_full',
        data: {
          content:
            'Дитяча кімната — це не просто місце для сну, а простір для гри, навчання та розвитку. Важливо створити безпечне та функціональне середовище.',
          label: 'Вступ',
        },
        sort_order: 0,
      },
      {
        type: 'text_image',
        data: {
          text: 'Зонування дитячої: зона сну, зона гри, зона навчання. Кожна зона повинна мати власне освітлення та зберігання.',
          image_url: contentImages[2],
          image_alt: 'Дитяча кімната',
          icon: 'solar:bed-linear',
          label: 'Зонування',
          title: 'Функціональні зони',
          features: ['Зона сну', 'Зона гри', 'Зона навчання'],
        },
        sort_order: 1,
      },
      {
        type: 'text_full',
        data: {
          content:
            'Безпека — пріоритет дитячої кімнати. Закруглені кути, безпечні матеріали, фіксація меблів до стіни, захисти на розетках.',
          label: 'Безпека',
        },
        sort_order: 2,
      },
    ],
    gallery_images: [contentImages[0], contentImages[3], contentImages[4]],
  },
];

async function seedPosts() {
  console.log('Seeding posts to Supabase...');
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[${i + 1}/${posts.length}] Inserting: ${post.title}...`);

    try {
      const { data: insertedPost, error: postError } = await supabase
        .from('posts')
        .insert({
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
        .select()
        .single();

      if (postError) {
        throw postError;
      }

      if (!insertedPost) {
        throw new Error('Failed to insert post');
      }

      if (post.blocks.length > 0) {
        const blockRecords = post.blocks.map((block) => ({
          post_id: insertedPost.id,
          type: block.type,
          data: block.data,
          sort_order: block.sort_order,
        }));

        const { error: blocksError } = await supabase.from('blocks').insert(blockRecords);

        if (blocksError) {
          console.error('   Error inserting blocks:', blocksError);
        }
      }

      successCount++;
      console.log(`   ✓ Inserted: ${post.title}`);
      console.log(`     Slug: ${post.slug}`);
      console.log(`     Blocks: ${post.blocks.length}`);
      console.log(`     Gallery: ${post.gallery_images.length}`);
      console.log('');
    } catch (error: any) {
      errorCount++;
      console.error(`   ✗ Error inserting "${post.title}":`);
      console.error(`     Code: ${error?.code}`);
      console.error(`     Message: ${error?.message}`);
      console.log('');
    }
  }

  console.log('========================================');
  console.log('Summary:');
  console.log(`   Successfully inserted: ${successCount}`);
  console.log(`   Failed to insert: ${errorCount}`);
  console.log(`   Total: ${posts.length}`);
  console.log('========================================');

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
