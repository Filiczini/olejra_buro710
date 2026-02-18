import { Icon } from '@iconify-icon/react';

export default function UsersPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-zinc-100 rounded-full">
          <Icon icon="solar:users-group-rounded-linear" width={32} className="text-zinc-400" />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Користувачі</h1>
        <p className="text-zinc-500">Сторінка в розробці</p>
      </div>
    </div>
  );
}
