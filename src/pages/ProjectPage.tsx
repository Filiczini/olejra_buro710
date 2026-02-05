import { Icon } from '@iconify-icon/react';

interface Project {
  id: string;
  title: string;
  location: string;
  area: string;
  year: string;
  team: string;
  description: string[];
  image: string;
}

export default function ProjectPage() {
  const project: Project = {
    id: 'golden-ray',
    title: 'Golden Ray Residence',
    location: 'Київ, Україна',
    area: '145 м²',
    year: '2023',
    team: 'Олена Марченко, Іван Петренко',
    description: [
      'Інтер\'єр цієї резиденції втілює баланс між монументальною елегантністю та домашнім теплом. Ми використали поєднання натурального каменю, латуні та оксамиту глибокого бурштинового кольору, щоб створити простір, який випромінює спокій та статус.',
      'Центральним елементом вітальної стала акцентна стіна з мармуру Nero Marquina, доповнена вертикальними латунними вставками, що візуально збільшують висоту приміщення. Освітлення спроектоване таким чином, щоб підкреслювати текстури матеріалів у вечірній час.',
    ],
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop',
  };

  const materials = [
    { name: 'Velvet', color: 'bg-yellow-500' },
    { name: 'Marble', color: 'bg-zinc-800' },
    { name: 'Brass', color: 'bg-orange-200' },
    { name: 'Stone', color: 'bg-stone-300' },
  ];

  return (
    <div className="bg-zinc-50 text-zinc-900 antialiased selection:bg-orange-100 selection:text-orange-900">
      <Header />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="space-y-6">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <Icon 
                icon="lucide:arrow-left" 
                width={18} 
                className="group-hover:-translate-x-1 transition-transform" 
              />
              Повернутися до проектів
            </a>
            <h1 className="text-4xl md:text-6xl tracking-tight font-medium text-zinc-900">
              {project.title}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            <button className="p-3 rounded-full hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all">
              <Icon icon="lucide:share-2" width={20} />
            </button>
            <button className="p-3 rounded-full hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all">
              <Icon icon="lucide:info" width={20} />
            </button>
          </div>
        </div>

        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl shadow-zinc-200 bg-zinc-100 group">
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute bottom-6 right-6 flex gap-2">
            <button className="bg-white/90 backdrop-blur text-zinc-900 p-3 rounded-full hover:scale-105 transition-transform shadow-lg">
              <Icon icon="lucide:maximize-2" width={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-16">
          <div className="md:col-span-4 space-y-8">
            <div className="pb-8 border-b border-zinc-200">
              <h3 className="text-base font-medium text-zinc-900 mb-2">Локація</h3>
              <p className="text-lg text-zinc-500">{project.location}</p>
            </div>
            <div className="pb-8 border-b border-zinc-200">
              <h3 className="text-base font-medium text-zinc-900 mb-2">Площа</h3>
              <p className="text-lg text-zinc-500">{project.area}</p>
            </div>
            <div className="pb-8 border-b border-zinc-200">
              <h3 className="text-base font-medium text-zinc-900 mb-2">Рік</h3>
              <p className="text-lg text-zinc-500">{project.year}</p>
            </div>
            <div>
              <h3 className="text-base font-medium text-zinc-900 mb-2">Команда</h3>
              <p className="text-lg text-zinc-500">{project.team}</p>
            </div>
          </div>

          <div className="md:col-span-8 md:pl-12">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-zinc-900 mb-8">
              Концепція розкоші та затишку
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-zinc-600">
              {project.description.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-12">
              <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Палітра матеріалів</h3>
              <div className="flex gap-4">
                {materials.map((material, index) => (
                  <div 
                    key={index}
                    className={`w-16 h-16 rounded-full ${material.color} shadow-inner ring-4 ring-zinc-50 cursor-pointer hover:scale-110 transition-transform`}
                    title={material.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32 pt-12 border-t border-zinc-200 flex justify-between items-center group cursor-pointer">
          <div>
            <span className="text-sm text-zinc-400 font-medium mb-1 block">Наступний проект</span>
            <span className="text-2xl font-medium text-zinc-900 group-hover:text-yellow-600 transition-colors">Onyx Penthouse</span>
          </div>
          <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-900 group-hover:border-zinc-900 group-hover:text-white transition-all">
            <Icon icon="lucide:arrow-right" width={20} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/50">
      <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
        <a href="/" className="text-xl tracking-tight font-medium hover:opacity-70 transition-opacity">
          BURO 710
        </a>
        <nav className="hidden md:flex items-center gap-10">
          <a href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Проекти</a>
          <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Про бюро</a>
          <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Контакти</a>
        </nav>
        <div className="flex items-center gap-6">
          <a href="#" className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
            <Icon icon="solar:user-circle-linear" width={18} />
            <span>admin</span>
          </a>
          <a href="#" className="text-sm font-medium bg-zinc-900 text-white px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200">
            Ввійти
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="max-w-[1800px] mx-auto px-6 py-12 md:flex justify-between items-center">
        <div className="text-zinc-400 text-sm">
          © 2024 BURO 710. Всі права захищено.
        </div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors" title="Instagram">
            <Icon icon="lucide:instagram" width={20} />
          </a>
          <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors" title="Facebook">
            <Icon icon="lucide:facebook" width={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
