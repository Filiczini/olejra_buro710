-- Заповнити існуючі проекти дефолтними значеннями
UPDATE projects
SET
  architects = COALESCE(architects, 'Bureau 710'),
  concept_heading = COALESCE(concept_heading, 'Культурний Код'),
  concept_caption = COALESCE(concept_caption, 'Концепція дизайну')
WHERE architects IS NULL
   OR concept_heading IS NULL
   OR concept_caption IS NULL;

-- Вивести статистику оновлення
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Оновлено % проектів', updated_count;
END $$;
