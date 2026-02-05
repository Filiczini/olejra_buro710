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
      title: 'Тиша в деталях',
      description: 'Ми прибираємо візуальний шум, залишаючи лише те, що має значення.',
      delay: 'delay-100',
    },
    {
      id: 2,
      icon: 'solar:ruler-pen-linear',
      title: 'Чистота форм',
      description: 'Геометрія простору як основа для комфортного життя.',
      delay: 'delay-200',
    },
    {
      id: 3,
      icon: 'solar:layers-minimalistic-linear',
      title: 'Натуральність',
      description: 'Камінь, дерево, метал — матеріали, що старіють красиво.',
      delay: 'delay-300',
    },
    {
      id: 4,
      icon: 'solar:sun-2-linear',
      title: 'Світло-архітектура',
      description: 'Світло як інструмент формування об\'єму та настрою.',
      delay: 'delay-100',
    },
  ];

  return (
    <section className="bg-zinc-900 text-white py-24 md:py-32 px-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {values.map((value) => (
            <div key={value.id} className={`space-y-4 animate-reveal-up ${value.delay}`}>
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
  );
}
