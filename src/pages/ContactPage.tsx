import { Icon } from '@iconify-icon/react';
import { useTranslation } from '../hooks/useTranslation';
import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ContactPage() {
  const t = useTranslation();
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
      label: t.contact.email,
      value: t.contact.emailAddress,
      link: `mailto:${t.contact.emailAddress}`
    },
    {
      icon: 'solar:phone-linear',
      label: t.contact.phone,
      value: t.contact.phoneNumber,
      link: `tel:${t.contact.phoneNumber.replace(/\s/g, '')}`
    },
    {
      icon: 'solar:map-point-linear',
      label: t.contact.address,
      value: t.contact.addressValue,
      link: null
    },
    {
      icon: 'solar:clock-linear',
      label: t.contact.workingHours,
      value: t.contact.workingHoursValue,
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
                <>
                  {t.contact.title}
                </>
              </h1>
            </div>
            <div className="space-y-8 flex flex-col justify-between">
              <div className="space-y-6 text-lg text-zinc-500 font-light leading-relaxed max-w-xl">
                <p>
                  <>{t.contact.subtitle}</>
                </p>
              </div>
              <div className="flex gap-6">
                <a
                  href={`mailto:${t.contact.emailAddress}`}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  <Icon icon="solar:letter-linear" width={18} />
                  {t.contact.writeToUs}
                </a>
                <a
                  href="#contact-form"
                  className="inline-flex items-center gap-2 px-8 py-3 border border-zinc-200 rounded-full text-sm font-medium hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors"
                >
                  <Icon icon="solar:chat-circle-dots-linear" width={18} />
                  {t.contact.contactButton}
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
                {t.contact.contactInfo}
              </h2>
              <p className="text-zinc-500 text-lg mb-8">
                {t.contact.contactInfoDesc}
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
                {t.contact.socialMedia}
              </h3>
              <p className="text-zinc-500 text-lg mb-8">
                {t.contact.socialMediaDesc}
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
                {t.contact.formTitle}
              </h2>
              <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
                {t.contact.formDesc}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t.contact.name}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t.contact.namePlaceholder}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.contact.emailPlaceholder}
                  required
                />
              </div>
              <Input
                label={t.contact.subject}
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={t.contact.subjectPlaceholder}
                required
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">
                  {t.contact.message}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t.contact.messagePlaceholder}
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
                  {t.contact.sendMessage}
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
                  {t.contact.findUs}
                </h2>
                <p className="text-zinc-400 text-lg mb-8">
                  {t.contact.findUsDesc}
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Icon icon="solar:map-point-linear" width={24} className="text-zinc-500" />
                    <div>
                      <p className="text-zinc-400 text-sm">{t.contact.address}</p>
                      <p className="text-lg">{t.contact.addressValue}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Icon icon="solar:train-linear" width={24} className="text-zinc-500" />
                    <div>
                      <p className="text-zinc-400 text-sm">{t.contact.metro}</p>
                      <p className="text-lg">{t.contact.metroStation}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-[400px] bg-zinc-800 rounded-lg flex items-center justify-center">
                <p className="text-zinc-500">{t.contact.interactiveMap}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
