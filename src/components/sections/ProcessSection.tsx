export default function ProcessSection() {
  const steps = [
    { id: '01', name: 'Концепція' },
    { id: '02', name: 'Проектування' },
    { id: '03', name: 'Реалізація' },
    { id: '04', name: 'Стайлінг' },
  ];

  return (
    <section className="max-w-[1800px] mx-auto px-6 py-24 border-b border-zinc-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-4">
          <h3 className="text-2xl font-medium tracking-tight mb-4">Процес</h3>
          <p className="text-zinc-500">Системний підхід до творчості гарантує передбачуваний результат.</p>
        </div>
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.id} className="group py-4 border-t border-zinc-200 hover:border-zinc-900 transition-colors">
                <span className="text-xs font-medium text-zinc-400 mb-2 block group-hover:text-zinc-900">{step.id}</span>
                <span className="text-lg font-medium">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
