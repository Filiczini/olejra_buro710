import { Icon } from '@iconify-icon/react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="max-w-[1800px] mx-auto px-6 py-12 md:flex justify-between items-center">
        <div className="text-zinc-400 text-sm">
          © 2024 BURO 710. Всі права захищено.
        </div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors" title="Instagram">
            <Icon icon="lucide:instagram" width={20} />
          </a>
          <a href="#" className="text-zinc-400 hover:text-zinc-900 transition-colors" title="Facebook">
            <Icon icon="lucide:facebook" width={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
