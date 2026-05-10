export interface ContactInfoItem {
  icon: string;
  label: string;
  value: string;
  link: string | null;
}

export interface SocialLinkItem {
  icon: string;
  name: string;
  link: string;
}

export const contactInfo: ContactInfoItem[] = [
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

export const socialLinks: SocialLinkItem[] = [
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
