const steps = [
  { id: '01', name: 'Концепція', description: 'Вивчення контексту.' },
  { id: '02', name: 'Дизайн', description: 'Створення детальних проектів.' },
  { id: '03', name: 'Реалізація', description: 'Координація будівельних процесів.' },
  { id: '04', name: 'Здача', description: 'Фіналізація проекту.' },
];

export default function ProcessSection() {
  return (
    <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32 border-b border-zinc-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-4">
          <h3 className="text-2xl md:text-h3 font-display tracking-tight mb-4">
            Етапи співпраці із нами
          </h3>
          <p className="text-zinc-500 text-body">Як ми працюємо з клієнтами</p>
        </div>
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step) => (
              <div
                key={step.id}
                className="group py-6 px-6 border-t border-zinc-200 hover:border-zinc-900 transition-all duration-300 hover:bg-zinc-50 rounded-lg"
              >
                <span className="text-xs font-medium text-zinc-400 mb-2 block group-hover:text-zinc-900 transition-colors duration-300">
                  {step.id}
                </span>
                <h4 className="text-xl md:text-h4 font-display mb-2 group-hover:text-zinc-700 transition-colors duration-300">
                  {step.name}
                </h4>
                <p className="text-zinc-500 text-body-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
