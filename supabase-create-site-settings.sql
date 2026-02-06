-- Таблиця налаштувань сайту
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Додати дефолтні налаштування
INSERT INTO site_settings (key, value) VALUES
  ('company_name', 'Bureau 710'),
  ('company_tagline', 'Architecture & Consulting'),
  ('company_location', 'Kyiv, Ukraine')
ON CONFLICT (key) DO NOTHING;

-- Додати коментарі
COMMENT ON TABLE site_settings IS 'Глобальні налаштування сайту';
COMMENT ON COLUMN site_settings.key IS 'Ключ налаштування (наприклад, company_name)';
COMMENT ON COLUMN site_settings.value IS 'Значення налаштування';

-- Індекс для швидкого пошуку
CREATE INDEX IF NOT EXISTS site_settings_key_idx ON site_settings (key);
