import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

interface FeaturedProject {
  id: string | number;
  image: string;
  title: string;
  type: string;
  area: string;
  city: string;
  year: string;
  description: string;
  badge?: string;
}

export default function FeaturedProjectsSection() {
  const t = useTranslation();

  // Featured projects data - replace with actual project data from API
  const featuredProjects: FeaturedProject[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1517248135812-f8b4b6f6a66fe3e4c7d4615?q=80&w=2000&auto=format&fit=crop',
      title: 'Kyiv Food Market',
      type: t.featured.commercial || 'Commercial',
      area: '2000 м²',
      city: 'Київ',
      year: '2019',
      description: t.featured.project1Description || 'Kyiv Food Market розташовано у приміщеному колишньому військовому арсеналі XVIII століття. Завданням було перетворення індустріального об\'єкта на сучасний ринок їжі, зберігши архітектурну автентичність будівлі. Фудкорті розміщені по периметру замкненим колом, у центрі — атріум на 300 гостей. Другий рівень відведений під винний бар та шоу-кухню.',
      badge: 'The Architecture MasterPrize'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1554118811-1e058524f24?q=80&w=2000&auto=format&fit=crop',
      title: 'Markó / кафе',
      type: t.featured.horeca || 'Horeca',
      area: '333 м²',
      city: 'Київ',
      year: '2022',
      description: t.featured.project2Description || 'Markó — кафе на першому поверсі Sophia Hotel біля Софійської площі. Простір адаптований для щоденних гостей і великих груп, та оформлений вінтажними меблями. Кафе піділене на три зони: основна зала з баром, внутрішній дворик і засклена тераса. Особливу увагу приділено акустиці та шумоізоляції для комфорту гостей готелю.',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1504194921103-f8b80c967a8?q=80&w=2000&auto=format&fit=crop',
      title: '«Тайський Привіт» / ресторан',
      type: t.featured.restaurant || 'Restaurant',
      area: '208 м²',
      city: 'Київ',
      year: '2021',
      description: t.featured.project3Description || 'Тайський Привіт переносить гостей у атмосферу вуличної Таїланду. Простір поєднує автентичні локальні смаки, відкриває кухонну зону та кімнати для чайних церемоній. Інтер\'єр побудовано на контрастах: вінтажні меблі, предмети побуту та декор з Таїланду, натуральні матеріали, тропічна зелень і гіпсовий тигр біля входу.',
    }
  ];

  return (
    <section className="max-w-[1600px] mx-auto px-6 mb-40">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-16 border-b border-zinc-200 pb-6">
        <h2 className="text-4xl font-medium tracking-tight uppercase text-zinc-900">
          {t.featured.title}
        </h2>
        <Link
          to="/projects"
          className="hidden md:flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          {t.featured.allProjects}
        </Link>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {featuredProjects.map((project) => (
          <article
            key={project.id}
            className="group flex flex-col gap-6"
          >
            {/* Project Image */}
            <div className="aspect-[4/3] bg-zinc-100 overflow-hidden w-full relative rounded-lg">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 grayscale group-hover:grayscale-0 rounded-lg"
              />
            </div>

            {/* Project Content */}
            <div className="flex flex-col gap-4 group-hover:translate-y-[-4px] transition-transform duration-300">
              {/* Project Title */}
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 group-hover:text-zinc-700 transition-colors duration-300">
                {project.title}
              </h3>

              {/* Project Badge (optional) */}
              {project.badge && (
                <div className="text-xs text-zinc-800 mt-2 font-medium group-hover:text-zinc-600 transition-colors duration-300">
                  {project.badge}
                </div>
              )}

              {/* Project Metadata */}
              <div className="text-xs text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors duration-300">
                {project.type} | {project.area} | {project.city} | {project.year}
              </div>

              {/* Project Description */}
              <p className="text-sm leading-relaxed text-zinc-500 text-justify mt-[0.625rem] group-hover:text-zinc-600 transition-colors duration-300">
                {project.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
