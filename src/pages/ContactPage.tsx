import { Icon } from '@iconify-icon/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ContactPage() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Implement form submission logic
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactInfo = [
    {
      icon: 'solar:letter-linear',
      label: language === 'uk' ? 'Email' : 'Email',
      value: 'hello@buro710.com',
      link: 'mailto:hello@buro710.com'
    },
    {
      icon: 'solar:phone-linear',
      label: language === 'uk' ? 'Телефон' : 'Phone',
      value: '+380 44 123 45 67',
      link: 'tel:+380441234567'
    },
    {
      icon: 'solar:map-point-linear',
      label: language === 'uk' ? 'Адреса' : 'Address',
      value: language === 'uk' ? 'Київ, вул. Хрещатик, 1' : 'Kyiv, Khreshchatyk Street, 1',
      link: null
    },
    {
      icon: 'solar:clock-linear',
      label: language === 'uk' ? 'Робочий час' : 'Working Hours',
      value: language === 'uk' ? 'Пн-Пт: 9:00 - 18:00' : 'Mon-Fri: 9:00 - 18:00',
      link: null
    }
  ];

  const socialLinks = [
    {
      icon: 'solar:instagram-linear',
      name: 'Instagram',
      link: 'https://instagram.com/buro710'
    },
    {
      icon: 'solar:linkedin-linear',
      name: 'LinkedIn',
      link: 'https://linkedin.com/company/buro710'
    },
    {
      icon: 'solar:behance-linear',
      name: 'Behance',
      link: 'https://behance.net/buro710'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <div>
              <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-tight animate-reveal-up">
                {language === 'uk' ? (
                  <>
                    Зв&apos;яжіться з нами
                  </>
                ) : (
                  <>
                    Get in touch
                  </>
                )}
              </h1>
            </div>
            <div className="space-y-8 flex flex-col justify-between">
              <div className="space-y-6 text-lg text-zinc-500 font-light leading-relaxed max-w-xl">
                <p>
                  {language === 'uk' ? (
                    <>Ми раді допомогти вам втілити ваш дизайн-проект у життя. Напишіть нам, і ми відповімо протягом 24 годин.</>
                  ) : (
                    <>We are here to help you bring your design project to life. Write to us, and we will respond within 24 hours.</>
                  )}
                </p>
              </div>
              <div className="flex gap-6">
                <a
                  href="mailto:hello@buro710.com"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  <Icon icon="solar:letter-linear" width={18} />
                  {language === 'uk' ? 'Написати нам' : 'Write to us'}
                </a>
                <a
                  href="#contact-form"
                  className="inline-flex items-center gap-2 px-8 py-3 border border-zinc-200 rounded-full text-sm font-medium hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors"
                >
                  <Icon icon="solar:chat-circle-dots-linear" width={18} />
                  {language === 'uk' ? 'Зв&apos;язатися' : 'Contact'}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32 border-b border-zinc-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div>
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">
                {language === 'uk' ? 'Контактна інформація' : 'Contact Information'}
              </h2>
              <p className="text-zinc-500 text-lg mb-8">
                {language === 'uk'
                  ? 'Зв&apos;яжіться з нами зручним для вас способом.'
                  : 'Contact us in a way that is convenient for you.'}
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
              <h3 className="text-2xl font-medium tracking-tight mb-6">
                {language === 'uk' ? 'Соціальні мережі' : 'Social Media'}
              </h3>
              <p className="text-zinc-500 text-lg mb-8">
                {language === 'uk'
                  ? 'Дізнавайтеся про наші нові проекти та новини.'
                  : 'Stay updated with our new projects and news.'}
              </p>
              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border border-zinc-200 rounded-lg hover:border-zinc-900 hover:bg-zinc-100/50 transition-colors group"
                  >
                    <Icon icon={social.icon} width={24} className="text-zinc-900 group-hover:text-zinc-900" />
                    <span className="text-zinc-900">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="max-w-[1800px] mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">
                {language === 'uk' ? 'Напишіть нам' : 'Write to us'}
              </h2>
              <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
                {language === 'uk'
                  ? 'Розкажіть про свій проект, і ми зв&apos;яжемося з вами протягом 24 годин.'
                  : 'Tell us about your project, and we will get back to you within 24 hours.'}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={language === 'uk' ? 'Ім&apos;я' : 'Name'}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={language === 'uk' ? 'Ваше ім&apos;я' : 'Your name'}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={language === 'uk' ? 'Ваш email' : 'Your email'}
                  required
                />
              </div>
              <Input
                label={language === 'uk' ? 'Тема' : 'Subject'}
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={language === 'uk' ? 'Тема вашого повідомлення' : 'Subject of your message'}
                required
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">
                  {language === 'uk' ? 'Повідомлення' : 'Message'}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={language === 'uk' ? 'Ваше повідомлення...' : 'Your message...'}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
                  required
                />
              </div>
              <div className="text-center">
                <Button
                  type="submit"
                  variant="primary"
                  className="px-12 py-4"
                >
                  {language === 'uk' ? 'Надіслати повідомлення' : 'Send message'}
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Map/Location Section */}
        <section className="bg-zinc-900 text-white py-24 md:py-32 px-6">
          <div className="max-w-[1800px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">
                  {language === 'uk' ? 'Знайти нас' : 'Find us'}
                </h2>
                <p className="text-zinc-400 text-lg mb-8">
                  {language === 'uk'
                    ? 'Наш офіс знаходиться в центрі Києва. Приходьте на зустріч для обговорення вашого проекту.'
                    : 'Our office is located in the center of Kyiv. Come for a meeting to discuss your project.'}
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Icon icon="solar:map-point-linear" width={24} className="text-zinc-500" />
                    <div>
                      <p className="text-zinc-400 text-sm">{language === 'uk' ? 'Адреса' : 'Address'}</p>
                      <p className="text-lg">{language === 'uk' ? 'Київ, вул. Хрещатик, 1' : 'Kyiv, Khreshchatyk Street, 1'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Icon icon="solar:train-linear" width={24} className="text-zinc-500" />
                    <div>
                      <p className="text-zinc-400 text-sm">{language === 'uk' ? 'Метро' : 'Metro'}</p>
                      <p className="text-lg">{language === 'uk' ? 'Майдан Незалежності' : 'Maidan Nezalezhnosti'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-[400px] bg-zinc-800 rounded-lg flex items-center justify-center">
                <p className="text-zinc-500">{language === 'uk' ? 'Інтерактивна карта' : 'Interactive map'}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
