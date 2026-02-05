import { Icon } from '@iconify-icon/react';

export default function ContactCTA() {
  return (
    <section className="max-w-[1800px] mx-auto px-6 py-32 text-center">
      <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-8 text-zinc-900">
        Маєте проект?
      </h2>
      <p className="text-zinc-500 text-lg mb-12 max-w-xl mx-auto">
        Ми відкриті до нових викликів. Розкажіть нам про свій простір, і ми знайдемо для нього ідеальну форму.
      </p>
      <a 
        href="#" 
        className="inline-flex items-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-full font-medium hover:bg-zinc-800 transition-all hover:px-10 group"
      >
        Зв'язатися з нами
        <Icon icon="solar:arrow-right-linear" width={20} className="group-hover:translate-x-1 transition-transform" />
      </a>
    </section>
  );
}
