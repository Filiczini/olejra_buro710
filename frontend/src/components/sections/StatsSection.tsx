const stats = [
  { value: '500+', label: 'Ексклюзивних проєктів', sublabel: 'У різних країнах' },
  { value: '500+', label: 'Ексклюзивних проєктів', sublabel: 'У різних країнах' },
  { value: '500+', label: 'Ексклюзивних проєктів', sublabel: 'У різних країнах' },
];

export default function StatsSection() {
  return (
    <section className="bg-zinc-900 text-white py-16 md:py-20 px-6">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {stats.map((stat, index) => (
          <div key={index}>
            <div className="text-3xl md:text-h4 font-display tracking-tight mb-2">{stat.value}</div>
            <div className="text-body-sm text-white/70">{stat.label}</div>
            <div className="text-body-sm text-white/40">{stat.sublabel}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
