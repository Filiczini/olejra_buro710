import { Icon } from '@iconify-icon/react';
import ContactForm from '../components/contact/ContactForm';
import { useContactForm } from '../hooks/useContactForm';
import { contactInfo, socialLinks } from '../constants/contact';
import { InstagramIcon, LinkedinIcon, YoutubeIcon } from '../components/icons/SocialIcons';

const socialIcons: Record<string, typeof InstagramIcon> = {
  Instagram: InstagramIcon,
  YouTube: YoutubeIcon,
  LinkedIn: LinkedinIcon,
};

export default function ContactPage() {
  const { formData, loading, success, error, handleChange, handleSubmit, reset } = useContactForm();

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="pt-20">
        <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <div>
              <h1 className="text-5xl md:text-h1 font-display tracking-tight leading-tight animate-reveal-up">
                Зв'яжіться з нами
              </h1>
            </div>
            <div className="space-y-8 flex flex-col justify-between">
              <div className="space-y-6 text-body text-zinc-500 leading-relaxed max-w-xl">
                <p>Ми раді допомогти вам втілити ваш дизайн-проект у життя.</p>
              </div>
              <div className="flex gap-6">
                <a
                  href="mailto:hello@buro710.com"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  <Icon icon="solar:letter-linear" width={18} />
                  Написати нам
                </a>
                <a
                  href="#contact-form"
                  className="inline-flex items-center gap-2 px-8 py-3 border border-zinc-200 rounded-full text-sm font-medium hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors"
                >
                  <Icon icon="solar:chat-circle-dots-linear" width={18} />
                  Зв'язатися
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32 border-b border-zinc-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div>
              <h2 className="text-3xl md:text-h2 font-display tracking-tight mb-6">
                Контактна інформація
              </h2>
              <p className="text-zinc-500 text-body mb-8">
                Зв'яжіться з нами зручним для вас способом.
              </p>
              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Icon icon={info.icon} width={24} className="text-zinc-900" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-500 mb-1">{info.label}</p>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-lg text-zinc-900 hover:text-zinc-600 transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-lg text-zinc-900">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl md:text-h3 font-display tracking-tight mb-6">
                Соціальні мережі
              </h3>
              <p className="text-zinc-500 text-body mb-8">Дізнавайтеся про наші новини.</p>
              <div className="space-y-4">
                {socialLinks.map((social) => {
                  const SocialIcon = socialIcons[social.name];
                  return (
                    <a
                      key={social.name}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 border border-zinc-200 rounded-lg hover:border-zinc-900 hover:bg-zinc-100/50 transition-colors group"
                    >
                      <SocialIcon width={24} />
                      <span className="text-zinc-900">{social.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="contact-form" className="max-w-[1800px] mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-h2 font-display tracking-tight mb-4">Напишіть нам</h2>
              <p className="text-zinc-500 text-body max-w-2xl mx-auto">
                Розкажіть про свій проект.
              </p>
            </div>

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
        </section>

        <section className="bg-zinc-900 text-white py-24 md:py-32 px-6">
          <div className="max-w-[1800px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-h2 font-display tracking-tight mb-6">Знайти нас</h2>
                <p className="text-zinc-400 text-body mb-8">
                  Наш офіс знаходиться в районі Майдану.
                </p>
                <div className="flex items-start gap-4">
                  <Icon icon="solar:map-point-linear" width={24} className="text-zinc-500" />
                  <div>
                    <p className="text-zinc-400 text-sm">Адреса</p>
                    <p className="text-lg">Чернівці, вул. Рівненська, 5А</p>
                  </div>
                </div>
              </div>
              <div className="h-[400px] rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2679.46!2d25.9351!3d48.2922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473408f6b1d5d5d1%3A0x7d6b7e1f0a5b3c9d!2sRivnenska%20St%2C%205%D0%90%2C%20Chernivtsi%2C%20Chernivtsi%20Oblast%2C%20Ukraine!5e0!3m2!1suk!2sua!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
