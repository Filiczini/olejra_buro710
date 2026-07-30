import { Icon } from '@iconify-icon/react';
import { socialLinks } from '../../constants/contact';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-white">
      <div className="max-w-[1800px] mx-auto px-6 py-16 md:py-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
          <a
            href="/"
            className="text-lg font-medium tracking-tight uppercase hover:opacity-70 transition-opacity"
          >
            Buro 710
          </a>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 text-sm font-medium hover:bg-white hover:text-zinc-900 transition-colors"
          >
            Зв'язатися
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 pb-16 border-b border-white/10">
          <div className="space-y-1">
            <a href="tel:+380441234567" className="block hover:text-white/70 transition-colors">
              +380 44 123 4567
            </a>
            <p className="text-white/50 text-sm">WhatsApp, Telegram, Viber</p>
            <a
              href="mailto:hello@buro710.com"
              className="block text-white/70 hover:text-white transition-colors mt-2"
            >
              hello@buro710.com
            </a>
          </div>

          <div>
            <span className="text-white/40 text-xs font-medium uppercase tracking-widest">
              Адреса
            </span>
            <p className="mt-3 leading-relaxed">
              Місто Чернівці,
              <br />
              вул. Рівненська, 5А
            </p>
          </div>

          <div>
            <span className="text-white/40 text-xs font-medium uppercase tracking-widest">
              Робочий час
            </span>
            <p className="mt-3 leading-relaxed">
              Пн-Пт: 10:00 - 19:00
              <br />
              Субота та неділя — вихідні
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-12">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              title={social.name}
              className="w-10 h-10 rounded-lg bg-white text-zinc-900 flex items-center justify-center hover:bg-zinc-200 transition-colors"
            >
              <Icon icon={social.icon} width={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
