import { Icon } from '@iconify-icon/react';

const values = [
  {
    id: 1,
    icon: 'solar:soundwave-square-linear',
    title: 'Звук',
    description: 'Враховуємо акустичні сценарії.',
  },
  {
    id: 2,
    icon: 'solar:ruler-pen-linear',
    title: 'Пропорції',
    description: 'Працюємо з золотим перетином.',
  },
  {
    id: 3,
    icon: 'solar:layers-minimalistic-linear',
    title: 'Шари',
    description: 'Створюємо глибину через багатошаровість.',
  },
  {
    id: 4,
    icon: 'solar:sun-2-linear',
    title: 'Світло',
    description: 'Проектуємо світлотіньові сценарії.',
  },
];

const steps = [
  {
    id: '01',
    name: 'Концепція',
    description: 'Вивчення контексту.',
  },
  {
    id: '02',
    name: 'Дизайн',
    description: 'Створення детальних проектів.',
  },
  {
    id: '03',
    name: 'Реалізація',
    description: 'Координація будівельних процесів.',
  },
  {
    id: '04',
    name: 'Здача',
    description: 'Фіналізація проекту.',
  },
];

const team = [
  {
    name: 'Олена Коваленко',
    role: 'Головний архітектор',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&fit=crop',
  },
  {
    name: 'Андрій Петренко',
    role: "Інтер'єрний дизайнер",
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&fit=crop',
  },
  {
    name: 'Марія Сидоренко',
    role: 'Архітектор',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&fit=crop',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="pt-20">
        {/* Hero Section */}
        <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <div>
              <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-tight animate-reveal-up">
                <>
                  Ми створюємо простори, <br className="hidden md:block" />
                  де архітектура зустрічається <br className="hidden md:block" />з тишею.
                </>
              </h1>
            </div>
            <div className="space-y-8 flex flex-col justify-between">
              <div className="space-y-6 text-lg text-zinc-500 font-light leading-relaxed max-w-xl">
                <p>
                  <>Buro 710 — інтер'єрна студія.</>
                </p>
                <p>
                  <>Наш підхід базується на чистоті ліній.</>
                </p>
              </div>
              <div className="flex gap-6">
                <a
                  href="mailto:hello@buro710.com"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  <Icon icon="solar:letter-linear" width={18} />
                  Написати нам
                </a>
                <a
                  href="#team"
                  className="inline-flex items-center gap-2 px-8 py-3 border border-zinc-200 rounded-full text-sm font-medium hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors"
                >
                  <Icon icon="solar:users-group-rounded-linear" width={18} />
                  Наша команда
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-zinc-900 text-white py-24 md:py-32 px-6">
          <div className="max-w-[1800px] mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">
                Наші цінності
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl">Ми віримо в силу простоти.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {values.map((value) => (
                <div
                  key={value.id}
                  className={`space-y-4 animate-reveal-up [animation-delay:${value.id * 100}ms]`}
                >
                  <Icon icon={value.icon} width={32} className="text-zinc-500" />
                  <h4 className="text-xl font-medium">{value.title}</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32 border-b border-zinc-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">Наш процес</h2>
              <p className="text-zinc-500 text-lg">Як ми працюємо з клієнтами.</p>
            </div>
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className="group py-6 px-6 border-t border-zinc-200 hover:border-zinc-900 transition-colors hover:bg-zinc-100/50 rounded-lg"
                  >
                    <div className="mb-3">
                      <span className="text-xs font-medium text-zinc-400 mb-2 block group-hover:text-zinc-900">
                        {step.id}
                      </span>
                      <h4 className="text-xl font-medium mb-2">{step.name}</h4>
                    </div>
                    <p className="text-zinc-500 text-sm leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="max-w-[1800px] mx-auto px-6 py-24 md:py-32">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">
              Познайомтеся з командою
            </h2>
            <p className="text-zinc-500 text-lg max-w-2xl">Люди, які стоять за кожним проектом.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="group space-y-4">
                <div className="relative overflow-hidden aspect-[3/4] bg-zinc-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-zinc-900">{member.name}</h4>
                  <p className="text-sm text-zinc-500 mt-1">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-zinc-900 text-white py-24 md:py-32 px-6">
          <div className="max-w-[1800px] mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">
              Готові розпочати?
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-12">
              Дозвольте нам допомогти вам.
            </p>
            <a
              href="mailto:hello@buro710.com"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-zinc-900 rounded-full text-sm font-medium hover:bg-zinc-100 transition-colors"
            >
              <Icon icon="solar:letter-linear" width={18} />
              Написати нам
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
