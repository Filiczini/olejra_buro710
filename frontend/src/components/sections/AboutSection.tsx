import { Icon } from '@iconify-icon/react';

export default function AboutSection() {
  return (
    <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32 border-zinc-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
        <div>
          <h2 className="text-3xl md:text-h2 font-display tracking-tight leading-tight animate-reveal-up">
            Простір продовження <br className="hidden md:block" />
            особистості, відображення
            <br className="hidden md:block" /> характеру через архітектуру
          </h2>
        </div>
        <div className="space-y-8 flex flex-col justify-between">
          <div className="space-y-6 text-body text-zinc-500 leading-relaxed max-w-xl">
            <p>
              БЮРО 710 створює простори — комерційні та приватні, де продуманий дизайн підсилюється
              речима з власною історією.
            </p>
            <p>
              Для нас важливо, щоб кожен метр працював на якість вашого життя або капіталізацію
              бізнесу. Ми не займаємося “паперовою архітектурою”, кожне рішення трансформується у
              результат: впізнаваність бренду, щоденний комфорт та оптимізацію витрат замовника.
            </p>
            <p>
              Ми відмовляємося від візуального шуму на користь складних тактильних матеріалів і
              діалогу епох, формуючи об’єкти, що з роками лише зростають у ціні.
            </p>
          </div>
          <div>
            <a
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider border-b border-zinc-900 pb-1 hover:opacity-60 hover:border-zinc-600 hover:gap-3 transition-all duration-300 group"
            >
              Про студію
              <Icon
                icon="solar:arrow-right-up-linear"
                width={16}
                className="group-hover:-translate-y-0.5 group-hover:-translate-x-0.5 transition-transform duration-300"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
