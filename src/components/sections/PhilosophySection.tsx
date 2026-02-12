import { Icon } from '@iconify-icon/react';

interface Value {
  id: number;
  icon: string;
  title: string;
  description: string;
  delay: string;
}

export default function PhilosophySection() {
  const values: Value[] = [
    {
      id: 1,
      icon: 'solar:soundwave-square-linear',
      title: 'Звук',
      description: 'Враховуємо акустичні сценарії для створення комфортних просторів.',
      delay: 'delay-100',
    },
    {
      id: 2,
      icon: 'solar:ruler-pen-linear',
      title: 'Пропорції',
      description: 'Працюємо з золотим перетином для гармонійних композицій.',
      delay: 'delay-200',
    },
    {
      id: 3,
      icon: 'solar:layers-minimalistic-linear',
      title: 'Шари',
      description: 'Створюємо глибину через багатошаровість матеріалів та текстур.',
      delay: 'delay-300',
    },
    {
      id: 4,
      icon: 'solar:sun-2-linear',
      title: 'Світло',
      description: 'Проектуємо світлотіньові сценарії для розкриття простору.',
      delay: 'delay-100',
    },
  ];

  return (
    <section className="bg-zinc-900 text-white py-24 md:py-32 px-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {values.map((value) => (
            <div
              key={value.id}
              className={`space-y-4 animate-reveal-up ${value.delay} group p-6 -mx-6 rounded-lg hover:bg-zinc-800/50 transition-all duration-300`}
            >
              <Icon icon={value.icon} width={32} className="text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300" />
              <h4 className="text-xl font-medium group-hover:text-white transition-colors duration-300">{value.title}</h4>
              <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
