import { supabase } from './config/supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read seed data from JSON
const seedDataPath = path.join(__dirname, '../../projects-seed-data.json');

interface SeedProject {
  title: string;
  description: string[];
  image_url: string;
  tags: string[];
  location: string;
  area: string;
  year: string;
  team?: string;
  architects?: string;
  concept_heading?: string;
  concept_caption?: string;
  concept_quote?: string;
  heroMediaUrls: string[];
  galleryMediaUrls: string[];
}

// Generate seed data if file doesn't exist
function generateSeedData(): SeedProject[] {
  const cities = [
    'Київ',
    'Львів',
    'Одеса',
    'Харків',
    'Дніпро',
    'Вінниця',
    'Запоріжжя',
    'Тернопіль',
  ];
  const years = ['2020', '2021', '2022', '2023', '2024', '2025'];
  const areas = [
    '80 м²',
    '120 м²',
    '150 м²',
    '180 м²',
    '220 м²',
    '250 м²',
    '280 м²',
    '320 м²',
    '350 м²',
  ];

  const tagSets = [
    ['residential', 'modern'],
    ['residential', 'luxury'],
    ['residential', 'scandinavian'],
    ['residential', 'minimalist'],
    ['residential', 'classic'],
    ['commercial', 'office'],
    ['commercial', 'retail'],
    ['interior', 'design'],
    ['interior', 'renovation'],
  ];

  const teamNames = [
    'Олена Коваленко, Дмитро Петренко',
    'Марія Петренко, Андрій Бойко',
    'Наталія Мельник, Сергій Коваль',
    'Ірина Сидоренко, Олег Коваленко',
    'Тетяна Гришко, Володимир Шевченко',
    'Юлія Бондаренко, Олександр Савченко',
    'Вікторія Кравченко, Максим Павленко',
  ];

  const architects = ['Архітектурне бюро 710', 'Studio Modern', 'Architects Group', 'Design Lab'];

  const conceptHeadings = [
    'Концепція простору',
    'Архітектурне рішення',
    "Дизайн інтер'єру",
    'Сучасний підхід',
    'Екологічний дизайн',
    'Мінімалістична естетика',
    'Лофт-концепція',
  ];

  const conceptCaptions = [
    'Інтеграція природних матеріалів з сучасними технологіями.',
    'Створення затишного та зручного простору для життя.',
    'Максимізація природного світла та відкритості.',
    'Гармонійне поєднання функціональності та естетики.',
    'Використання екологічно чистих матеріалів.',
    'Прості лінії та мінімалістичний дизайн.',
    'Індустріальна естетика з теплими акцентами.',
  ];

  const conceptQuotes = [
    'Архітектура - це музика в просторі.',
    'Дизайн - це поезія функціональності.',
    'Простір формує людину, людина формує простір.',
    'Менше - це більше.',
    'Сучасність в гармонії з природою.',
    'Деталі створюють досконалість.',
    'Кожен сантиметр має значення.',
  ];

  const titles = [
    'Сучасний будинок у лісі',
    'Мінімалістична квартира',
    'Лофт в центрі міста',
    'Еко-будинок на березі річки',
    'Скандинавська вілла',
    'Пентхаус з панорамним видом',
    'Класичний особняк',
    "Кам'яний будинок",
    'Сучасний офіс',
    'Торговий центр',
    'Квартира-студія',
    'Двоповерховий будинок',
    'Садовий будинок',
    'Житловий комплекс',
    'Котедж',
  ];

  const descriptions = [
    [
      'Цей проєкт відображає сучасні тенденції в архітектурі з акцентом на природні матеріали.',
      'Великі панорамні вікна забезпечують максимальне природне освітлення протягом дня.',
      'Відкритий план дозволяє вільно переміщуватися між зонами, створюючи відчуття простору.',
    ],
    [
      'Лофт-стайл з високими стелями та промисловими елементами.',
      'Використання цегли та бетону як основних матеріалів.',
      'Великі вікна дозволяють проникати природному світлу, створюючи динамічний простір.',
    ],
    [
      'Скандінавська естетика з акцентом на світлі тони та мінімалізм.',
      "Функціональність кожного елемента інтер'єру.",
      'Натуральне дерево та білі стіни створюють затишну атмосферу.',
    ],
    [
      'Екологічно чисті матеріали та стале дах.',
      'Пасивне сонячне освітлення через встановлені панелі.',
      'Автономна система водопостачання з дощовою збором.',
    ],
    [
      "Кам'яний фасад з сучасними елементами.",
      "Теплий камінь в інтер'єрі для акцентів.",
      'Великі тераси для відпочинку на свіжому повітрі.',
    ],
    [
      'Класична архітектура з сучасними рішеннями.',
      'Високі стелі та декоративні елементи фасаду.',
      'Ландшафтний дизайн з садом та альтанкою.',
    ],
    [
      'Індустріальний дизайн з мінімалістичним підходом.',
      'Максимальне використання простору через високі стелі.',
      'Відкриті зони для спілкування та роботи.',
    ],
  ];

  const heroImageUrls = [
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
    'https://images.unsplash.com/photo-1556910103-1c02745a30bf',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83',
    'https://images.unsplash.com/photo-1600566753086-ce8a6c25118c',
    'https://images.unsplash.com/photo-1600607687692-eec32c4e8a82',
    'https://images.unsplash.com/photo-1600585424425-23c4153a5067',
    'https://images.unsplash.com/photo-1600573472591-ee6c362410a0',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea',
  ];

  const galleryImageUrls = [
    'https://images.unsplash.com/photo-1600210491584-724fe5c67fb0',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea',
    'https://images.unsplash.com/photo-1600585424137-6b0e432c0821',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
    'https://images.unsplash.com/photo-1600573472591-ee6c362410a0',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
    'https://images.unsplash.com/photo-1600585424425-23c4153a5067',
    'https://images.unsplash.com/photo-1600607687692-eec32c4e8a82',
    'https://images.unsplash.com/photo-1600573472591-ee6c362410a0',
  ];

  const projects: SeedProject[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < 15; i++) {
    // Get random unique indices
    let titleIndex: number;
    do {
      titleIndex = Math.floor(Math.random() * titles.length);
    } while (usedIndices.has(titleIndex));
    usedIndices.add(titleIndex);

    const heroMediaCount = Math.floor(Math.random() * 3) + 1; // 1-3
    const galleryMediaCount = Math.floor(Math.random() * 3) + 3; // 3-5

    // Shuffle arrays and pick random elements
    const shuffledHero = [...heroImageUrls].sort(() => Math.random() - 0.5);
    const shuffledGallery = [...galleryImageUrls].sort(() => Math.random() - 0.5);

    const project: SeedProject = {
      title: titles[titleIndex],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      image_url: shuffledHero[0],
      tags: tagSets[Math.floor(Math.random() * tagSets.length)],
      location: cities[Math.floor(Math.random() * cities.length)],
      area: areas[Math.floor(Math.random() * areas.length)],
      year: years[Math.floor(Math.random() * years.length)],
      team: teamNames[Math.floor(Math.random() * teamNames.length)],
      architects: architects[Math.floor(Math.random() * architects.length)],
      concept_heading: conceptHeadings[Math.floor(Math.random() * conceptHeadings.length)],
      concept_caption: conceptCaptions[Math.floor(Math.random() * conceptCaptions.length)],
      concept_quote: conceptQuotes[Math.floor(Math.random() * conceptQuotes.length)],
      heroMediaUrls: shuffledHero.slice(0, heroMediaCount),
      galleryMediaUrls: shuffledGallery.slice(0, galleryMediaCount),
    };

    projects.push(project);
  }

  return projects;
}

async function seed() {
  console.log('Seeding project data to Supabase...');
  console.log('');

  let seedProjects: SeedProject[];

  try {
    // Try to read from JSON file, generate if doesn't exist
    if (fs.existsSync(seedDataPath)) {
      console.log('Reading seed data from JSON file...');
      const jsonContent = fs.readFileSync(seedDataPath, 'utf-8');
      seedProjects = JSON.parse(jsonContent);
    } else {
      console.log('Generating new seed data...');
      seedProjects = generateSeedData();

      // Write to JSON file for future reference
      fs.writeFileSync(seedDataPath, JSON.stringify(seedProjects, null, 2), 'utf-8');
      console.log(`Generated ${seedProjects.length} projects and saved to ${seedDataPath}`);
    }
  } catch (error) {
    console.error('Error reading/generating seed data:', error);
    console.log('Generating new seed data instead...');
    seedProjects = generateSeedData();
  }

  console.log(`Total projects to insert: ${seedProjects.length}`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < seedProjects.length; i++) {
    const project = seedProjects[i];
    console.log(`[${i + 1}/${seedProjects.length}] Inserting: ${project.title}...`);

    try {
      // Insert project
      const { data: insertedProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: project.title,
          description: project.description,
          image_url: project.image_url,
          tags: project.tags,
          location: project.location,
          area: project.area,
          year: project.year,
          team: project.team,
          architects: project.architects,
          concept_heading: project.concept_heading,
          concept_caption: project.concept_caption,
          concept_quote: project.concept_quote,
        })
        .select()
        .single();

      if (projectError) {
        throw projectError;
      }

      if (!insertedProject) {
        throw new Error('Failed to insert project');
      }

      // Insert hero media
      const heroMediaRecords = project.heroMediaUrls.map((url, index) => ({
        project_id: insertedProject.id,
        url,
        role: 'hero' as const,
        sort_order: index,
      }));

      if (heroMediaRecords.length > 0) {
        const { error: heroError } = await supabase.from('media').insert(heroMediaRecords);

        if (heroError) {
          console.error('   Error inserting hero media:', heroError);
        }
      }

      // Insert gallery media
      const galleryMediaRecords = project.galleryMediaUrls.map((url, index) => ({
        project_id: insertedProject.id,
        url,
        role: 'gallery' as const,
        sort_order: index,
      }));

      if (galleryMediaRecords.length > 0) {
        const { error: galleryError } = await supabase.from('media').insert(galleryMediaRecords);

        if (galleryError) {
          console.error('   Error inserting gallery media:', galleryError);
        }
      }

      successCount++;
      console.log(`Inserted: ${project.title}`);
      console.log(`   Location: ${project.location}`);
      console.log(`   Area: ${project.area}`);
      console.log(`   Year: ${project.year}`);
      console.log(`   Hero media: ${project.heroMediaUrls.length}`);
      console.log(`   Gallery media: ${project.galleryMediaUrls.length}`);
      console.log(`   Tags: ${project.tags.join(', ')}`);
      console.log('');
    } catch (error: any) {
      errorCount++;
      console.error(`Error inserting "${project.title}":`);
      console.error(`   Code: ${error?.code}`);
      console.error(`   Message: ${error?.message}`);
      console.error('');
    }
  }

  console.log('========================================');
  console.log('Summary:');
  console.log(`   Successfully inserted: ${successCount}`);
  console.log(`   Failed to insert: ${errorCount}`);
  console.log(`   Total: ${seedProjects.length}`);
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

seed();
