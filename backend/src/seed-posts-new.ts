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
  featured: boolean;
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

const posts: SeedPost[] = [
  {
    title: 'Osteria Mano — італійський ресторан',
    slug: 'osteria-mano',
    status: 'published',
    featured: true,
    seo_title: 'Osteria Mano — дизайн італійського ресторану, Київ',
    seo_description:
      'Проєкт дизайну Osteria Mano у Києві: тепла атмосфера, натуральні матеріали та відкрита кухня.',
    hero_image_url:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop',
    hero_title: 'Osteria Mano',
    hero_subtitle: 'Тепло Апеннін у центрі Києва',
    hero_tags: ['ресторан', 'Кухня'],
    hero_location: 'Київ',
    hero_year: '2023',
    blocks: [
      {
        type: 'text_full',
        data: {
          label: 'Концепція',
          content:
            'Osteria Mano — сімейний ресторан на 80 посадочних місць у Печерському районі. Задум: відтворити атмосферу маленької тратторії десь між Болоньєю та Флоренцією. Замовник хотів, щоб кухня була видна гостям — відкрита «театральна» зона стала головним акцентом залу.',
        },
        sort_order: 0,
      },
      {
        type: 'text_image',
        data: {
          label: 'Простір',
          title: 'Відкрита кухня як серце ресторану',
          text: 'Ми зробили кухню центром простору: лічильник з мармуру, підвісні мідні каструлі, цегляне обрамлення печі. Гості бачать весь процес приготування, що підсилює відчуття довіри та автентичності.',
          image_url:
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop',
          image_alt: 'Відкрита кухня Osteria Mano',
          icon: 'solar:chef-hat-linear',
          features: ['Відкрита кухня', 'Піч на дровах', 'Мармуровий лічильник'],
        },
        sort_order: 1,
      },
      {
        type: 'image_full',
        data: {
          image_url:
            'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop',
          alt: 'Зала Osteria Mano',
          caption: 'Основна зала: теракота, лляні штори, оливкове дерево',
        },
        sort_order: 2,
      },
      {
        type: 'text_full',
        data: {
          label: 'Матеріали',
          content:
            'Основна палітра — теракотовий, вохристий, оливковий. Підлога з грубої терацо, стіни — вапнякова штукатурка, стеля — дерево, що імітує амбар. Освітлення: теплі Edison-лампи у матових ковпаках.',
        },
        sort_order: 3,
      },
    ],
    gallery_images: [
      'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=1935&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop',
    ],
  },
  {
    title: 'Nox — нічний бар',
    slug: 'nox-bar',
    status: 'published',
    featured: true,
    seo_title: 'Nox Bar — дизайн нічного бару, Київ',
    seo_description:
      'Дизайн бару Nox: темна палітра, матеріали на межі між клубом та lounge-простором.',
    hero_image_url:
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1974&auto=format&fit=crop',
    hero_title: 'Nox',
    hero_subtitle: 'Темрява як дизайн-елемент',
    hero_tags: ['бар', 'нічний'],
    hero_location: 'Київ',
    hero_year: '2022',
    blocks: [
      {
        type: 'text_full',
        data: {
          label: 'Задум',
          content:
            'Клієнт поставив нетипове завдання: бар, де гості хочуть залишатися якомога довше. Рішення — усунути всі подразники. Немає яскравого світла, немає суєти, немає зайвих форм. Тільки глибокий темний простір, що поглинає.',
        },
        sort_order: 0,
      },
      {
        type: 'image_full',
        data: {
          image_url:
            'https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1935&auto=format&fit=crop',
          alt: 'Бар-стійка Nox',
          caption: 'Бар-стійка з підсвіченим акрилом та чорним мармуром',
        },
        sort_order: 1,
      },
      {
        type: 'text_image',
        data: {
          label: 'Деталі',
          title: 'Світло як єдиний інструмент',
          text: 'Весь дизайн будується навколо точкового освітлення. Стелі пофарбовані у матовий чорний, стіни — темно-зелений велюр та вугільна мікроцемент. Акценти — brass (латунь): поручні, ніжки стільців, рамки.',
          image_url:
            'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=2069&auto=format&fit=crop',
          image_alt: "Деталі інтер'єру Nox",
          icon: 'solar:moon-linear',
          features: ['Акустична обробка', 'Велюрові панелі', 'Латунні акценти'],
        },
        sort_order: 2,
      },
    ],
    gallery_images: [
      'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1929&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?q=80&w=2072&auto=format&fit=crop',
    ],
  },
  {
    title: 'Solarium — ресторан на даху',
    slug: 'solarium-rooftop',
    status: 'published',
    featured: true,
    seo_title: 'Solarium Rooftop — дизайн ресторану на даху, Одеса',
    seo_description:
      'Ресторан на даху готелю в Одесі: морська естетика, відкрита тераса та ліфт-bar.',
    hero_image_url:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
    hero_title: 'Solarium',
    hero_subtitle: 'Над морем, над містом',
    hero_tags: ['ресторан', 'руфтоп'],
    hero_location: 'Одеса',
    hero_year: '2023',
    blocks: [
      {
        type: 'text_full',
        data: {
          label: 'Локація',
          content:
            'Двоповерховий готель в Аркадії потребував ресторану, що конкурував би з видом на море. Ми не намагалися відволікти увагу від пейзажу — навпаки, побудували весь простір так, щоб акцентувати його.',
        },
        sort_order: 0,
      },
      {
        type: 'text_image',
        data: {
          label: 'Концепція',
          title: 'Мінімум стін — максимум горизонту',
          text: "Суцільне скління периметру, розсувні секції для повного відкриття у сторону моря. Підлога з тикового дерева, що тягнеться від інтер'єру назовні без перерви — розмиває межу між «всередині» та «ззовні».",
          image_url:
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop',
          image_alt: 'Тераса Solarium',
          icon: 'solar:sun-linear',
          features: ['Панорамне скління', 'Тикова підлога', 'Розсувні секції'],
        },
        sort_order: 1,
      },
      {
        type: 'image_full',
        data: {
          image_url:
            'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?q=80&w=2070&auto=format&fit=crop',
          alt: 'Вид з тераси Solarium',
          caption: 'Вечірній вид: тераса на 60 місць, sunrise bar',
        },
        sort_order: 2,
      },
    ],
    gallery_images: [
      'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop',
    ],
  },
  {
    title: 'Karst — грузинський ресторан',
    slug: 'karst-georgian',
    status: 'published',
    featured: false,
    seo_title: 'Karst — дизайн грузинського ресторану, Львів',
    seo_description:
      'Проєкт ресторану грузинської кухні у Львові: кавказька естетика, підвальна атмосфера та хачапурна зона.',
    hero_image_url:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop',
    hero_title: 'Karst',
    hero_subtitle: 'Кавказька душа у старому підвалі',
    hero_tags: ['ресторан', 'кавказ'],
    hero_location: 'Львів',
    hero_year: '2022',
    blocks: [
      {
        type: 'text_full',
        data: {
          label: 'Простір',
          content:
            "Приміщення — підвал XIX століття у центрі Львова з цегляними склепінчастими стелями та нерівними кам'яними стінами. Завдання: не «задушити» простір декором, а підкреслити його природній характер.",
        },
        sort_order: 0,
      },
      {
        type: 'image_full',
        data: {
          image_url:
            'https://images.unsplash.com/photo-1550966871-3ed3cbe818b5?q=80&w=2070&auto=format&fit=crop',
          alt: 'Підвальний зал Karst',
          caption: 'Основний зал: арочні склепіння, глиняні амфори, вогонь',
        },
        sort_order: 1,
      },
      {
        type: 'text_image',
        data: {
          label: 'Матеріали',
          title: 'Земля, вогонь, дерево',
          text: 'Три ключових матеріали: грубий природний камінь, обпалена глина та дерево з тріщинами. Освітлення — виключно свічки та відкритий вогонь. Тандирна зона відокремлена підвищенням і видима з усього залу.',
          image_url:
            'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1974&auto=format&fit=crop',
          image_alt: 'Тандирна зона Karst',
          icon: 'solar:fire-linear',
          features: ['Відкритий вогонь', 'Тандирна зона', 'Глиняний посуд'],
        },
        sort_order: 2,
      },
    ],
    gallery_images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2094&auto=format&fit=crop',
    ],
  },
  {
    title: "Grain — пекарня-кав'ярня",
    slug: 'grain-bakery',
    status: 'published',
    featured: false,
    seo_title: "Grain Bakery — дизайн пекарні-кав'ярні, Харків",
    seo_description:
      'Концепція пекарні з відкритим виробництвом у Харкові: промисловий мінімалізм та аромат свіжого хліба.',
    hero_image_url:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1974&auto=format&fit=crop',
    hero_title: 'Grain',
    hero_subtitle: 'Хліб як архітектура',
    hero_tags: ["кав'ярня", 'пекарня'],
    hero_location: 'Харків',
    hero_year: '2024',
    blocks: [
      {
        type: 'text_full',
        data: {
          label: 'Формат',
          content:
            "Grain — це пекарня-кав'ярня з відкритим виробництвом на 120 м². Головна ідея: гість бачить та чує процес випікання. Звук тіста, запах кориці, вигляд деки з круасанами, що виїжджає з печі — це і є головний декор.",
        },
        sort_order: 0,
      },
      {
        type: 'text_image',
        data: {
          label: 'Виробництво',
          title: 'Відкрите виробництво як шоу',
          text: 'Пекарня відокремлена від зони гостей лише скляною перегородкою на повну висоту. Це дає відчуття максимальної відкритості, але зберігає температурний режим та санітарні норми.',
          image_url:
            'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?q=80&w=2069&auto=format&fit=crop',
          image_alt: 'Відкрите виробництво Grain',
          icon: 'solar:fire-square-linear',
          features: ['Скляна перегородка', 'Пекарська стійка', 'Дровяна піч'],
        },
        sort_order: 1,
      },
      {
        type: 'image_full',
        data: {
          image_url:
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2094&auto=format&fit=crop',
          alt: 'Зал Grain',
          caption: 'Зала: бетонна підлога, дубові стільниці, металеві полиці з хлібом',
        },
        sort_order: 2,
      },
    ],
    gallery_images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=2070&auto=format&fit=crop',
    ],
  },
  {
    title: 'Birch — ресторан у лісі',
    slug: 'birch-forest-restaurant',
    status: 'published',
    featured: false,
    seo_title: 'Birch — дизайн ресторану у лісі, Буковель',
    seo_description:
      'Ресторан Birch у Буковелі: природні матеріали, панорамні вікна та живе дерево всередині.',
    hero_image_url:
      'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=2070&auto=format&fit=crop',
    hero_title: 'Birch',
    hero_subtitle: 'Ліс починається за вікном і не закінчується',
    hero_tags: ['ресторан', 'природа'],
    hero_location: 'Буковель',
    hero_year: '2023',
    blocks: [
      {
        type: 'text_full',
        data: {
          label: 'Місце',
          content:
            'Ресторан при еко-готелі в Буковелі, оточений карпатським лісом. Завдання: збудувати простір так, щоб межа між будівлею та природою зникла.',
        },
        sort_order: 0,
      },
      {
        type: 'image_full',
        data: {
          image_url:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
          alt: 'Ресторан Birch',
          caption: "Панорамна стіна: п'ять секцій по 3.5 метри",
        },
        sort_order: 1,
      },
      {
        type: 'text_image',
        data: {
          label: 'Конструкція',
          title: 'Дерево та скло',
          text: 'Несучі балки — зрубані на ділянці смереки. Підлога — дошка 50 мм, оброблена льняною олією. Усередині ресторану — живе дерево берези, що проходить крізь покрівлю.',
          image_url:
            'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?q=80&w=2070&auto=format&fit=crop',
          image_alt: "Деталі інтер'єру Birch",
          icon: 'solar:tree-linear',
          features: ["Живе дерево в інтер'єрі", 'Смерекові балки', 'Льняна олія'],
        },
        sort_order: 2,
      },
    ],
    gallery_images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop',
    ],
  },
  {
    title: 'Assembly — коворкінг-кафе',
    slug: 'assembly-coworking',
    status: 'published',
    featured: false,
    seo_title: 'Assembly — дизайн коворкінг-кафе, Київ',
    seo_description:
      'Коворкінг-кафе Assembly у Подолі: гнучкі зони, акустика та вся необхідна інфраструктура для роботи.',
    hero_image_url:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=2070&auto=format&fit=crop',
    hero_title: 'Assembly',
    hero_subtitle: 'Місце, де починаються проєкти',
    hero_tags: ['кафе', 'коворкінг'],
    hero_location: 'Київ',
    hero_year: '2024',
    blocks: [
      {
        type: 'text_full',
        data: {
          label: 'Гібридний формат',
          content:
            "Assembly — гібрид кав'ярні та коворкінгу на 280 м² у Подолі. Вранці — тиха робоча локація, ввечері — простір для нетворкінгу та невеликих подій. Одне приміщення — різний режим протягом дня.",
        },
        sort_order: 0,
      },
      {
        type: 'text_image',
        data: {
          label: 'Зонування',
          title: 'Чотири режими простору',
          text: 'Зона тихої роботи з акустичними панелями, відкритий простір з великими столами, конференц-кімната та бар-лічильник. Кожна зона може трансформуватися: столи на роликах, розсувні перегородки.',
          image_url:
            'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
          image_alt: 'Зони Assembly',
          icon: 'solar:laptop-linear',
          features: ['Акустична ізоляція', 'Мобільні меблі', 'Конференц-кімната'],
        },
        sort_order: 1,
      },
      {
        type: 'image_full',
        data: {
          image_url:
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop',
          alt: 'Бар Assembly',
          caption: 'Центральний бар: 12 метрів, дубова стільниця, 40 посадочних місць',
        },
        sort_order: 2,
      },
    ],
    gallery_images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1978&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=2071&auto=format&fit=crop',
    ],
  },
  {
    title: 'Marea — риба-бар',
    slug: 'marea-fish-bar',
    status: 'published',
    featured: false,
    seo_title: 'Marea — дизайн риба-бару, Одеса',
    seo_description:
      'Риба-бар Marea в Одесі: морська естетика без кітчу, льодова вітрина та рибальська атмосфера.',
    hero_image_url:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop',
    hero_title: 'Marea',
    hero_subtitle: 'Море на тарілці та в просторі',
    hero_tags: ['ресторан', 'морепродукти'],
    hero_location: 'Одеса',
    hero_year: '2023',
    blocks: [
      {
        type: 'text_full',
        data: {
          label: 'Виклик',
          content:
            'Головне завдання: зробити морську тематику без китч-декору — без сіток, якорів та ракушок. Замість цього — матеріали та кольори, що відсилають до моря через асоціації.',
        },
        sort_order: 0,
      },
      {
        type: 'text_image',
        data: {
          label: 'Вітрина',
          title: 'Льодова вітрина як центр уваги',
          text: 'Велика вітрина з льодом та свіжою рибою розміщена на вході — є першим, що бачить гість. Вона замінює меню: гість показує на рибу і вибирає спосіб приготування.',
          image_url:
            'https://images.unsplash.com/photo-1534482421-64566f976cfa?q=80&w=2069&auto=format&fit=crop',
          image_alt: 'Вітрина Marea',
          icon: 'solar:fish-linear',
          features: ['Льодова вітрина', 'Жива риба', 'Show-cooking'],
        },
        sort_order: 1,
      },
      {
        type: 'image_full',
        data: {
          image_url:
            'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1974&auto=format&fit=crop',
          alt: 'Зала Marea',
          caption: 'Зала: колір морської піни, необроблений бетон, мідь',
        },
        sort_order: 2,
      },
    ],
    gallery_images: [
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=1935&auto=format&fit=crop',
    ],
  },
  {
    title: 'Dvor — двір-ресторан',
    slug: 'dvor-courtyard',
    status: 'published',
    featured: false,
    seo_title: 'Dvor — ресторан у закритому дворі, Київ',
    seo_description:
      'Проєкт ресторану у закритому дворі на Подолі: сезонна тераса, вуличне освітлення та камінний барбекю.',
    hero_image_url:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=2071&auto=format&fit=crop',
    hero_title: 'Dvor',
    hero_subtitle: 'Київський двір, що нагодує',
    hero_tags: ['ресторан', 'тераса'],
    hero_location: 'Київ',
    hero_year: '2022',
    blocks: [
      {
        type: 'text_full',
        data: {
          label: 'Місце',
          content:
            'Закритий київський двір на Подолі, 400 м². Завдання: перетворити занедбаний простір на ресторан, який працює в будь-яку погоду і зберігає дух автентичного київського двору.',
        },
        sort_order: 0,
      },
      {
        type: 'image_full',
        data: {
          image_url:
            'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?q=80&w=2070&auto=format&fit=crop',
          alt: 'Двір Dvor',
          caption: 'Основний двір: бруківка, шпалерне виноградне озеленення, підвісні ліхтарі',
        },
        sort_order: 1,
      },
      {
        type: 'text_image',
        data: {
          label: 'Конструкції',
          title: 'Всепогодна тераса',
          text: 'Над 70% двору встановлена розсувна скляна покрівля з підігрівом. У холодну пору — повністю закрита та тепла. Влітку — відкривається, перетворюючись на справжнє відкрите небо.',
          image_url:
            'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop',
          image_alt: 'Покрівля Dvor',
          icon: 'solar:roof-linear',
          features: ['Розсувна покрівля', 'Підігрів підлоги', 'Камінний барбекю'],
        },
        sort_order: 2,
      },
    ],
    gallery_images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop',
    ],
  },
  {
    title: 'Alto — wine bar',
    slug: 'alto-wine-bar',
    status: 'published',
    featured: false,
    seo_title: 'Alto Wine Bar — дизайн вінного бару, Київ',
    seo_description:
      'Вінний бар Alto у Києві: мінімалізм, підвал-погріб та колекція з 400 позицій.',
    hero_image_url:
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2070&auto=format&fit=crop',
    hero_title: 'Alto',
    hero_subtitle: 'Вино, що заслуговує на правильний простір',
    hero_tags: ['бар', 'вино'],
    hero_location: 'Київ',
    hero_year: '2024',
    blocks: [
      {
        type: 'text_full',
        data: {
          label: 'Концепція',
          content:
            "Alto — камерний вінний бар на 40 місць у Липках. Власник — сомельє з 15-річним досвідом — хотів простір, де вино на першому плані, а інтер'єр не відволікає від нього. Чистота, тиша та правильна температура.",
        },
        sort_order: 0,
      },
      {
        type: 'text_image',
        data: {
          label: 'Погріб',
          title: 'Підвальний погріб-вітрина',
          text: 'Ключовий елемент — скляна підлога над погребом, де зберігаються 2000 пляшок. Гості бачать колекцію під ногами. Сомельє спускається до погреба через люк у барній стійці.',
          image_url:
            'https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?q=80&w=2075&auto=format&fit=crop',
          image_alt: 'Погріб Alto',
          icon: 'solar:wineglass-linear',
          features: ['Скляна підлога-вітрина', 'Погріб з кліматом', '2000 пляшок'],
        },
        sort_order: 1,
      },
      {
        type: 'image_full',
        data: {
          image_url:
            'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=1935&auto=format&fit=crop',
          alt: 'Зала Alto',
          caption: 'Зала: вапняковий камінь, льон, приглушене точкове освітлення',
        },
        sort_order: 2,
      },
      {
        type: 'text_full',
        data: {
          label: 'Деталі',
          content:
            'Барна стійка — суцільна плита чорного граніту 4.5 метри. Стільці — льон та дерево волоського горіха. Кожна деталь підібрана так, щоб не сперечатися з вином.',
        },
        sort_order: 3,
      },
    ],
    gallery_images: [
      'https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1935&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1472653431158-6364773b2a56?q=80&w=2069&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1929&auto=format&fit=crop',
    ],
  },
];

async function seedNewPosts() {
  console.log('Seeding new posts to Supabase...');
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
          featured: post.featured,
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

      if (postError) throw postError;
      if (!insertedPost) throw new Error('Failed to insert post');

      if (post.blocks.length > 0) {
        const blockRecords = post.blocks.map((block) => ({
          post_id: insertedPost.id,
          type: block.type,
          data: block.data,
          sort_order: block.sort_order,
        }));

        const { error: blocksError } = await supabase.from('blocks').insert(blockRecords);
        if (blocksError) console.error('   Error inserting blocks:', blocksError);
      }

      successCount++;
      console.log(`   ✓ ${post.title} (featured: ${post.featured})`);
      console.log('');
    } catch (error: any) {
      errorCount++;
      console.error(`   ✗ Error: ${error?.message}`);
      console.log('');
    }
  }

  console.log('========================================');
  console.log(`Inserted: ${successCount} / ${posts.length}`);
  if (errorCount > 0) console.log(`Failed: ${errorCount}`);
  console.log('========================================');

  process.exit(errorCount > 0 ? 1 : 0);
}

seedNewPosts();
