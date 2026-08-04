import { Icon } from '@iconify-icon/react';
import ContactForm from '../components/contact/ContactForm';
import { useContactForm } from '../hooks/useContactForm';

const contactDetails = [
  {
    icon: 'solar:map-point-linear',
    label: 'Адреса',
    value: 'Чернівці, вул. Рівненська, 5А',
  },
  {
    icon: 'solar:letter-linear',
    label: 'Email',
    value: 'hello@buro710.com',
    href: 'mailto:hello@buro710.com',
  },
  {
    icon: 'solar:phone-linear',
    label: 'Телефон',
    value: '+380 44 123 4567',
    href: 'tel:+380441234567',
  },
];

export default function ContactPage() {
  const { formData, loading, success, error, handleChange, handleSubmit, reset } = useContactForm();

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="pt-20 md:pt-24">
        <section className="mx-auto max-w-[1560px] px-6 py-20 md:px-10 lg:py-28">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-28">
            <div>
              <h1 className="mb-7 font-display text-5xl font-semibold tracking-tight sm:text-6xl lg:text-[74px]">
                Наші контакти
              </h1>
              <p className="mb-12 max-w-[470px] text-lg leading-relaxed text-zinc-400">
                Зв'яжіться з нами зручним для вас способом.
                <br />
                Ми відкриті до нових ідей та співпраці.
              </p>

              <div className="space-y-7">
                {contactDetails.map((detail) => (
                  <div key={detail.label} className="flex items-center gap-4">
                    <Icon icon={detail.icon} width={24} className="shrink-0 text-zinc-600" />
                    <div>
                      <p className="mb-1 text-sm text-zinc-400">{detail.label}</p>
                      {detail.href ? (
                        <a href={detail.href} className="text-lg hover:text-zinc-500">
                          {detail.value}
                        </a>
                      ) : (
                        <p className="text-lg">{detail.value}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div className="pl-10">
                  <p className="text-lg">Пн-Пт: 9:00 - 18:00</p>
                  <p className="text-sm text-zinc-400">Робочий час</p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[690px] lg:justify-self-end">
              <ContactForm
                formData={formData}
                loading={loading}
                error={error}
                success={success}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onReset={reset}
              />
            </div>
          </div>
        </section>

        <section className="bg-[#18181a] px-6 py-20 text-white md:px-10 lg:py-24">
          <div className="mx-auto grid max-w-[1560px] grid-cols-1 items-center gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <div>
              <h2 className="font-display text-4xl font-medium lg:text-5xl">Як нас знайти</h2>
              <p className="mt-4 max-w-sm text-zinc-500">
                Завітайте до нашої студії у Чернівцях — будемо раді познайомитися особисто.
              </p>
            </div>
            <div className="h-[360px] overflow-hidden bg-zinc-800 md:h-[430px]">
              <iframe
                title="Buro 710 на карті"
                src="https://www.google.com/maps?q=Чернівці,+вул.+Рівненська,+5А&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
