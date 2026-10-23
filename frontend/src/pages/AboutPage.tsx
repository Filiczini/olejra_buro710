import { Icon } from '@iconify-icon/react';
import { Link } from 'react-router-dom';

const values = [
  {
    icon: '/icon-water.png',
    title: 'Звук',
    description: 'Враховуємо акустичні сценарії.',
  },
  {
    icon: '/icon-earth.png',
    title: 'Пропорції',
    description: 'Працюємо з золотим перетином.',
  },
  {
    icon: '/icon-wind.png',
    title: 'Шари',
    description: 'Створюємо глибину через багатошаровість.',
  },
  {
    icon: '/icon-fire.png',
    title: 'Світло',
    description: 'Проєктуємо світлотіньові сценарії.',
  },
];

const brandLogos = [
  { src: '/quarter.png', alt: 'Quarter' },
  { src: '/receptura.png', alt: 'Receptura' },
  { src: '/school-and-beauty.png', alt: 'School and Beauty' },
  { src: '/treskare.png', alt: 'Treskare' },
  { src: '/trible.png', alt: 'Trible' },
];

const STORY_IMAGE = '/about-person.webp';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="pt-20 md:pt-24">
        <section className="mx-auto flex min-h-[540px] max-w-[1560px] items-center px-6 py-20 md:px-10 lg:min-h-[650px] lg:py-28">
          <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-24 xl:gap-36">
            <h1 className="max-w-[760px] font-display text-[44px] font-semibold leading-[1.08] tracking-[-0.025em] sm:text-6xl lg:text-[76px]">
              Ми створюємо простори,
              <br className="hidden sm:block" /> що зустрічаються
              <br className="hidden sm:block" /> з тишею
            </h1>

            <div className="max-w-[560px]">
              <h2 className="mb-4 font-display text-2xl font-medium lg:text-4xl">
                Buro 710 — інтер'єрна студія.
              </h2>
              <p className="mb-9 text-lg text-zinc-400 lg:text-xl">
                Наш підхід базується на чистоті ліній.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="mailto:hello@buro710.com"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-7 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  <Icon icon="solar:letter-linear" width={17} />
                  Написати нам
                </a>
                <Link
                  to="/projects"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-400 px-7 text-sm font-medium transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                >
                  Переглянути проєкти
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#18181a] px-6 py-20 text-white md:px-10 md:py-24 lg:py-28">
          <div className="mx-auto max-w-[1560px]">
            <div className="mb-16 lg:mb-24">
              <h2 className="mb-3 font-display text-4xl font-medium">Наші цінності</h2>
              <p className="text-zinc-500">Ми віримо в силу простоти.</p>
            </div>

            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-20">
              {values.map((value) => (
                <article key={value.title} className="max-w-[250px]">
                  <img
                    src={value.icon}
                    alt=""
                    width={40}
                    height={40}
                    className="mb-7 h-10 w-auto"
                  />
                  <h3 className="mb-3 font-display text-xl font-medium">{value.title}</h3>
                  <p className="text-base leading-snug text-zinc-500">{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1560px] px-6 py-24 md:px-10 lg:py-36">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24 xl:gap-40">
            <div className="max-w-[570px] lg:justify-self-end">
              <h2 className="mb-5 font-display text-4xl font-medium lg:text-5xl">
                Хто ми слово про нас
              </h2>
              <p className="mb-8 text-base leading-relaxed text-zinc-500 lg:text-lg">
                Людина, яка стоїть за кожним проєктом. Ми створюємо інтер'єри, у яких архітектура,
                світло та матеріали працюють як єдине ціле. Для нас важливі точність пропорцій,
                чесність фактур і тиша, що залишається після першого враження. Кожен простір
                народжується з діалогу та уваги до способу життя його майбутніх мешканців.
              </p>
              <Link
                to="/projects"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-400 px-7 text-sm font-medium transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
              >
                Переглянути проєкти
              </Link>
            </div>

            <div className="mx-auto aspect-[3/4] w-full max-w-[570px] overflow-hidden bg-zinc-100">
              <img
                src={STORY_IMAGE}
                alt="Засновниця студії Buro 710"
                className="h-full w-full object-cover grayscale"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1560px] px-6 pb-28 md:px-10 lg:pb-36">
          <h2 className="mb-10 text-3xl tracking-tight lg:text-4xl">
            Ми працюємо з такими брендами
          </h2>
          <div className="flex flex-wrap items-center gap-x-14 gap-y-8 text-zinc-900">
            {brandLogos.map((logo) => (
              <img
                key={logo.src}
                src={logo.src}
                alt={logo.alt}
                className="h-16 w-auto object-contain"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
