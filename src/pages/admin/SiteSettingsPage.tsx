import { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState({
    company_name: '',
    company_tagline: '',
    company_location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/settings');
        const data = await response.json();
        setSettings({
          company_name: data.company_name || 'Bureau 710',
          company_tagline: data.company_tagline || 'Architecture & Consulting',
          company_location: data.company_location || 'Kyiv, Ukraine',
        });
        setLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSaving({ ...saving, [key]: true });
    setSuccess({ ...success, [key]: false });

    try {
      await fetch(`http://localhost:3000/api/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ value }),
      });

      setSettings({ ...settings, [key]: value });
      setSuccess({ ...success, [key]: true });
      setTimeout(() => setSuccess({ ...success, [key]: false }), 2000);
    } catch (error) {
      console.error('Error saving setting:', error);
    } finally {
      setSaving({ ...saving, [key]: false });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-zinc-900 mb-8">Налаштування сайту</h1>

      {loading ? (
        <div className="text-zinc-600">Завантаження...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 max-w-2xl">
          <Input
            label="Назва компанії"
            placeholder="Введіть назву компанії"
            value={settings.company_name}
            onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
            onBlur={() => handleSave('company_name', settings.company_name)}
          />
          {success.company_name && (
            <div className="text-sm text-green-600">✓ Збережено</div>
          )}

          <Input
            label="Слоган компанії"
            placeholder="Введіть слоган компанії"
            value={settings.company_tagline}
            onChange={(e) => setSettings({ ...settings, company_tagline: e.target.value })}
            onBlur={() => handleSave('company_tagline', settings.company_tagline)}
          />
          {success.company_tagline && (
            <div className="text-sm text-green-600">✓ Збережено</div>
          )}

          <Input
            label="Локація компанії"
            placeholder="Введіть локацію компанії"
            value={settings.company_location}
            onChange={(e) => setSettings({ ...settings, company_location: e.target.value })}
            onBlur={() => handleSave('company_location', settings.company_location)}
          />
          {success.company_location && (
            <div className="text-sm text-green-600">✓ Збережено</div>
          )}
        </div>
      )}
    </div>
  );
}
