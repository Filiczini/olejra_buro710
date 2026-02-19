import { Icon } from '@iconify-icon/react';
import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { contactService } from '../services/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await contactService.submit(formData);
      if (result.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(result.message || 'Помилка при відправці');
      }
    } catch {
      setError('Помилка при відправці повідомлення. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactInfo = [
    {
      icon: 'solar:letter-linear',
      label: 'Email',
      value: 'hello@buro710.com',
      link: 'mailto:hello@buro710.com',
    },
    {
      icon: 'solar:phone-linear',
      label: 'Телефон',
      value: '+380 44 123 4567',
      link: 'tel:+380441234567',
    },
    {
      icon: 'solar:map-point-linear',
      label: 'Адреса',
      value: 'Чернівці, вул. Рівненська, 5А',
      link: null,
    },
    {
      icon: 'solar:clock-linear',
      label: 'Робочий час',
      value: 'Пн-Пт: 9:00 - 18:00',
      link: null,
    },
  ];

  const socialLinks = [
    {
      icon: 'solar:instagram-linear',
      name: 'Instagram',
      link: 'https://instagram.com/buro710',
    },
    {
      icon: 'solar:linkedin-linear',
      name: 'LinkedIn',
      link: 'https://linkedin.com/company/buro710',
    },
    {
      icon: 'solar:behance-linear',
      name: 'Behance',
      link: 'https://behance.net/buro710',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <div className="pt-20">
        <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <div>
              <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-tight animate-reveal-up">
                Зв'яжіться з нами
              </h1>
            </div>
            <div className="space-y-8 flex flex-col justify-between">
              <div className="space-y-6 text-lg text-zinc-500 font-light leading-relaxed max-w-xl">
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
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">
                Контактна інформація
              </h2>
              <p className="text-zinc-500 text-lg mb-8">
                Зв'яжіться з нами зручним для вас способом.
              </p>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
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
              <h3 className="text-2xl font-medium tracking-tight mb-6">Соціальні мережі</h3>
              <p className="text-zinc-500 text-lg mb-8">Дізнавайтеся про наші новини.</p>
              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border border-zinc-200 rounded-lg hover:border-zinc-900 hover:bg-zinc-100/50 transition-colors group"
                  >
                    <Icon
                      icon={social.icon}
                      width={24}
                      className="text-zinc-900 group-hover:text-zinc-900"
                    />
                    <span className="text-zinc-900">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact-form" className="max-w-[1800px] mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">Напишіть нам</h2>
              <p className="text-zinc-500 text-lg max-w-2xl mx-auto">Розкажіть про свій проект.</p>
            </div>

            {success ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <Icon icon="solar:check-circle-linear" width={32} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-medium mb-2">Повідомлення надіслано!</h3>
                <p className="text-zinc-500 mb-6">Ми зв'яжемося з вами найближчим часом.</p>
                <Button variant="secondary" onClick={() => setSuccess(false)}>
                  Надіслати ще одне повідомлення
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Ім'я"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ваше ім'я"
                    required
                    disabled={loading}
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Введіть ваш email"
                    required
                    disabled={loading}
                  />
                </div>
                <Input
                  label="Тема"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Тема вашого повідомлення"
                  required
                  disabled={loading}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-700">Повідомлення</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Ваше повідомлення..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none disabled:bg-zinc-100 disabled:cursor-not-allowed"
                    required
                    disabled={loading}
                    minLength={10}
                  />
                </div>
                <div className="text-center">
                  <Button type="submit" variant="primary" className="px-12 py-4" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Icon icon="solar:spinner-linear" width={18} className="animate-spin" />
                        Відправка...
                      </span>
                    ) : (
                      'Надіслати повідомлення'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>

        <section className="bg-zinc-900 text-white py-24 md:py-32 px-6">
          <div className="max-w-[1800px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">Знайти нас</h2>
                <p className="text-zinc-400 text-lg mb-8">Наш офіс знаходиться в районі Майдану.</p>
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
      <Footer />
    </div>
  );
}
