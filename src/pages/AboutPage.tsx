import { Icon } from '@iconify-icon/react';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function AboutPage() {
  const { language } = useLanguage();

  const values = [
    {
      id: 1,
      icon: 'solar:soundwave-square-linear',
      title: language === 'uk' ? 'Тиша в деталях' : 'Silence in details',
      description: language === 'uk'
        ? 'Ми прибираємо візуальний шум, залишаючи лише те, що має значення.'
        : 'We remove visual noise, leaving only what matters.',
    },
    {
      id: 2,
      icon: 'solar:ruler-pen-linear',
      title: language === 'uk' ? 'Чистота форм' : 'Purity of form',
      description: language === 'uk'
        ? 'Геометрія простору як основа для комфортного життя.'
        : 'Space geometry as a foundation for comfortable living.',
    },
    {
      id: 3,
      icon: 'solar:layers-minimalistic-linear',
      title: language === 'uk' ? 'Натуральність' : 'Naturalness',
      description: language === 'uk'
        ? 'Камінь, дерево, метал — матеріали, що старіють красиво.'
        : 'Stone, wood, metal — materials that age beautifully.',
    },
    {
      id: 4,
      icon: 'solar:sun-2-linear',
      title: language === 'uk' ? 'Світло-архітектура' : 'Light architecture',
      description: language === 'uk'
        ? 'Світло як інструмент формування об\'єму та настрою.'
        : 'Light as a tool for forming volume and mood.',
    },
  ];

  const steps = [
    {
      id: '01',
      name: language === 'uk' ? 'Концепція' : 'Concept',
      description: language === 'uk'
        ? 'Вивчаємо потреби клієнта, аналізуємо простір, формуємо бачення.'
        : 'Study client needs, analyze space, form vision.',
    },
    {
      id: '02',
      name: language === 'uk' ? 'Проектування' : 'Design',
      description: language === 'uk'
        ? 'Розробляємо проектну документацію, візуалізуємо рішення.'
        : 'Develop project documentation, visualize solutions.',
    },
    {
      id: '03',
      name: language === 'uk' ? 'Реалізація' : 'Implementation',
      description: language === 'uk'
        ? 'Супроводжуємо будівельний процес, контролюємо якість.'
        : 'Supervise construction process, control quality.',
    },
    {
      id: '04',
      name: language === 'uk' ? 'Стайлінг' : 'Styling',
      description: language === 'uk'
        ? 'Доповнюємо інтер\'єр деталями, меблями, текстилями.'
        : 'Complement interior with details, furniture, textiles.',
    },
  ];

  const team = [
    {
      name: language === 'uk' ? 'Олена Петренко' : 'Olena Petrenko',
      role: language === 'uk' ? 'Головний архітектор' : 'Lead Architect',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&fit=crop',
    },
    {
      name: language === 'uk' ? 'Андрій Коваль' : 'Andriy Koval',
      role: language === 'uk' ? 'Архітектор' : 'Architect',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&fit=crop',
    },
    {
      name: language === 'uk' ? 'Марія Шевченко' : 'Maria Shevchenko',
      role: language === 'uk' ? 'Інтер\'єрний дизайнер' : 'Interior Designer',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <div className="pt-20">
        {/* Hero Section */}
      <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div>
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-tight animate-reveal-up">
              {language === 'uk' ? (
                <>
                  Ми створюємо простори, <br className="hidden md:block" />
                  де архітектура зустрічається <br className="hidden md:block" />
                  з тишею.
                </>
              ) : (
                <>
                  We create spaces where <br className="hidden md:block" />
                  architecture meets <br className="hidden md:block" />
                  silence.
                </>
              )}
            </h1>
          </div>
          <div className="space-y-8 flex flex-col justify-between">
            <div className="space-y-6 text-lg text-zinc-500 font-light leading-relaxed max-w-xl">
              <p>
                {language === 'uk' ? (
                  <>Buro 710 — інтер'єрна студія, що спеціалізується на проектуванні приватних резиденцій, комерційних просторів та концептуальних об'єктів.</>
                ) : (
                  <>Buro 710 is an interior design studio specializing in private residences, commercial spaces, and conceptual objects.</>
                )}
              </p>
              <p>
                {language === 'uk' ? (
                  <>Наш підхід базується на чистоті ліній, тактильності натуральних матеріалів та увазі до світлотіньових сценаріїв. Ми не просто робимо ремонт, ми створюємо атмосферу для життя.</>
                ) : (
                  <>Our approach is based on line purity, tactility of natural materials, and attention to light and shadow scenarios. We don't just do renovations, we create an atmosphere for life.</>
                )}
              </p>
            </div>
            <div className="flex gap-6">
              <a
                href="mailto:hello@buro710.com"
                className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                <Icon icon="solar:letter-linear" width={18} />
                {language === 'uk' ? 'Написати нам' : 'Contact us'}
              </a>
              <a
                href="#team"
                className="inline-flex items-center gap-2 px-8 py-3 border border-zinc-200 rounded-full text-sm font-medium hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors"
              >
                <Icon icon="solar:users-group-rounded-linear" width={18} />
                {language === 'uk' ? 'Команда' : 'Team'}
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
              {language === 'uk' ? 'Наші цінності' : 'Our values'}
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl">
              {language === 'uk'
                ? 'Принципи, що керують нашою роботою.'
                : 'Principles that guide our work.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {values.map((value) => (
              <div
                key={value.id}
                className="space-y-4 animate-reveal-up"
                style={{ animationDelay: `${value.id * 100}ms` }}
              >
                <Icon icon={value.icon} width={32} className="text-zinc-500" />
                <h4 className="text-xl font-medium">{value.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32 border-b border-zinc-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">
              {language === 'uk' ? 'Процес' : 'Process'}
            </h2>
            <p className="text-zinc-500 text-lg">
              {language === 'uk'
                ? 'Системний підхід до творчості гарантує передбачуваний результат.'
                : 'Systematic approach to creativity guarantees predictable results.'}
            </p>
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
            {language === 'uk' ? 'Команда' : 'Team'}
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl">
            {language === 'uk'
              ? 'Архітектори та дизайнери, що перетворюють ідеї в реальність.'
              : 'Architects and designers who turn ideas into reality.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <div
              key={member.name}
              className="group space-y-4"
            >
              <div className="relative overflow-hidden aspect-[3/4] bg-zinc-100">
                <img
                  src={member.image}
                  alt={member.name}
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
            {language === 'uk' ? 'Давайте працювати разом' : "Let's work together"}
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-12">
            {language === 'uk'
              ? 'Розкажіть про свій проект, і ми перетворимо вашу візію на реальність.'
              : 'Tell us about your project, and we will turn your vision into reality.'}
          </p>
          <a
            href="mailto:hello@buro710.com"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-zinc-900 rounded-full text-sm font-medium hover:bg-zinc-100 transition-colors"
          >
            <Icon icon="solar:letter-linear" width={18} />
            {language === 'uk' ? 'Написати нам' : 'Contact us'}
          </a>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}
