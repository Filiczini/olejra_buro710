export default function DashboardPage() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-zinc-900">Успіх</h2>
        </div>
      </div>
    </div>
  );
}
