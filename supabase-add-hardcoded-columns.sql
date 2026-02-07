-- Додати колонки для проекту
ALTER TABLE projects ADD COLUMN IF NOT EXISTS architects TEXT DEFAULT 'Bureau 710';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS concept_heading TEXT DEFAULT 'Культурний Код';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS concept_caption TEXT DEFAULT 'Концепція дизайну';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS concept_quote TEXT;

-- Додати коментарі до колонок
COMMENT ON COLUMN projects.architects IS 'Назва архітектора або бюро';
COMMENT ON COLUMN projects.concept_heading IS 'Заголовок концепції (наприклад, "Культурний Код")';
COMMENT ON COLUMN projects.concept_caption IS 'Підпис концепції (наприклад, "Концепція дизайну")';
COMMENT ON COLUMN projects.concept_quote IS 'Цитата концепції';
