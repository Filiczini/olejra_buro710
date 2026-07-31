import { socialLinks } from '../../constants/contact';
import { InstagramIcon, LinkedinIcon, YoutubeIcon } from '../icons/SocialIcons';

const socialIcons: Record<string, typeof InstagramIcon> = {
  Instagram: InstagramIcon,
  YouTube: YoutubeIcon,
  LinkedIn: LinkedinIcon,
};

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-white">
      <div className="max-w-[1800px] mx-auto px-6 py-16 md:py-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
          <a
            href="/"
            className="inline-flex items-center font-sans font-normal text-[46px] leading-[28px] tracking-[-0.45px] align-middle uppercase hover:opacity-70 transition-opacity"
          >
            Buro 710
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 w-[350px] h-14 rounded-xl border border-white/20 text-xl font-display hover:bg-white hover:text-zinc-900 transition-colors"
          >
            Написати
          </a>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between gap-10 md:gap-12 pb-16">
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
          {socialLinks.map((social) => {
            const SocialIcon = socialIcons[social.name];
            return (
              <a
                key={social.name}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                title={social.name}
                className="w-16 h-16 flex items-center justify-center hover:opacity-70 transition-opacity"
              >
                <SocialIcon width={64} />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
