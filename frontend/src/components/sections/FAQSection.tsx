import { useState } from 'react';
import { Icon } from '@iconify-icon/react';

const faqItems = [
  {
    question: 'Нас рекомендують ваші друзі',
    answer: 'ТЕКСТ-ЗАГЛУШКА: відредагуйте цю відповідь.',
  },
  {
    question: 'Не виходимо за межі бюджету',
    answer: 'ТЕКСТ-ЗАГЛУШКА: відредагуйте цю відповідь.',
  },
  {
    question: 'Ремонт з гарантією 5 років',
    answer: 'ТЕКСТ-ЗАГЛУШКА: відредагуйте цю відповідь.',
  },
  {
    question: 'Менеджмент процесу реалізації проєкту',
    answer: 'ТЕКСТ-ЗАГЛУШКА: відредагуйте цю відповідь.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32 border-b border-zinc-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-4">
          <h3 className="text-2xl md:text-h3 font-display tracking-tight mb-4">
            Найчастіші запитання
          </h3>
          <p className="text-zinc-500 text-body">
            Гарантуємо якісний, очікуваний кінцевий результат
          </p>
        </div>

        <div className="lg:col-span-8">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="border-t border-zinc-200 last:border-b">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left cursor-pointer group"
                >
                  <span className="text-lg font-medium text-zinc-900 group-hover:text-zinc-600 transition-colors">
                    {item.question}
                  </span>
                  <Icon
                    icon="solar:add-circle-linear"
                    width={24}
                    className={`text-zinc-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="text-zinc-500 text-body-sm leading-relaxed pb-6 pr-10">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
