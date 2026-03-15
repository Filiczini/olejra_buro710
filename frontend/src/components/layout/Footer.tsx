import { Icon } from '@iconify-icon/react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="max-w-[1800px] mx-auto px-6 py-12 md:flex justify-between items-center">
        <div className="text-zinc-400 text-sm">©2026 BURO 710. Всі права захищено.</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a
            href="https://www.instagram.com/buro_710/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-900 transition-colors"
            title="Instagram"
            aria-label="Instagram"
          >
            <Icon icon="lucide:instagram" width={20} />
          </a>
          <a
            href="https://www.facebook.com/buro710"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-900 transition-colors"
            title="Facebook"
            aria-label="Facebook"
          >
            <Icon icon="lucide:facebook" width={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
