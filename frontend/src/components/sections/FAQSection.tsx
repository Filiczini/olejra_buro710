import { useState } from 'react';
import { Icon } from '@iconify-icon/react';

const faqItems = [
  {
    question: "Скільки коштує дизайн-проєкт інтер'єру та з чого складається його вартість?",
    answer:
      "Вартість дизайн-проєкту залежить від площі приміщення, складності простору та ваших цілей. Вона охоплює всі етапи: від дослідження об'єкта та створення візуальної концепції — де ми поєднуємо функціональність, еклектику та предмети з історією — до фотореалістичної 3D-візуалізації і повного пакета інженерних креслень. Ви  інвестуєте в покрокову інструкцію, яка перетворює ідеї на живий простір і захищає від дорогих помилок та переробок під час будівництва.",
  },
  {
    question: 'Які терміни розробки дизайн-проєкту комерційного приміщення?',
    answer:
      "Терміни залежать від масштабу та специфіки об'єкта, але зазвичай розробка повного проєкту займає від 1 до 3 місяців. Ми розуміємо: для бізнесу час — це гроші, а швидке й точне планування напряму впливає на довгострокову успішність проєкту. Тому ми фіксуємо чіткий графік робіт — для того, щоб ви могли точно спланувати старт ремонту й запуск справи без затримок.",
  },
  {
    question: 'Як контролювати бюджет ремонту і не перевищити кошторис під час реалізації?',
    answer:
      'Головний секрет — прорахунок ще до початку будівельних робіт. Ми проєктуємо простір виключно в межах вашого реального бюджету — і одразу відкидаємо рішення, які можуть роздути кошторис. Завдяки детальній технічній документації та нашому супроводу на етапі комплектування ми контролюємо кожну статтю витрат. За потреби ми гнучко підбираємо альтернативні матеріали — і стежимо, щоб фінальна вартість залишилася суворо в межах плану.',
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
