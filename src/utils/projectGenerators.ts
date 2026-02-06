import type { Project, DesignZone, Material } from '../types/project';

interface CategoryResult {
  primary: string;
  secondary?: string;
  full: string;
}

const CATEGORY_MAPPING: Record<string, { primary: string; secondaryMap: Record<string, string> }> = {
  residential: {
    primary: 'Residential',
    secondaryMap: {
      'modern': 'Modern',
      'scandinavian': 'Scandinavian',
      'minimalist': 'Minimalist',
      'luxury': 'Luxury',
      'villa': 'Villa',
      'house': 'House',
      'stone': 'Stone',
      'glass': 'Contemporary',
      'nordic': 'Scandinavian'
    }
  },
  restaurant: {
    primary: 'Hospitality',
    secondaryMap: {
      'elegant': 'Restaurant',
      'fine-dining': 'Fine Dining',
      'dark': 'Ambient',
      'natural': 'Biophilic',
      'urban': 'Bistro',
      'garden': 'Garden',
      'green': 'Biophilic',
      'biophilic': 'Biophilic'
    }
  },
  cafe: {
    primary: 'Hospitality',
    secondaryMap: {
      'coffee': 'Coffee',
      'industrial': 'Industrial',
      'artisan': 'Specialty',
      'specialty': 'Specialty',
      'urban': 'Urban',
      'cozy': 'Cozy'
    }
  },
  bistro: {
    primary: 'Hospitality',
    secondaryMap: {
      'urban': 'Urban',
      'modern': 'Modern'
    }
  },
  shop: {
    primary: 'Commercial',
    secondaryMap: {
      'retail': 'Retail',
      'boutique': 'Boutique',
      'store': 'Store',
      'local': 'Local'
    }
  }
};

const MATERIAL_MAPPING: Record<string, Material[]> = {
  'stone': [{ name: 'Stone', color: 'bg-stone-300', type: 'natural' }],
  'wood': [{ name: 'Oak', color: 'bg-amber-700', type: 'natural' }, { name: 'Pine', color: 'bg-amber-600', type: 'natural' }],
  'marble': [{ name: 'Marble', color: 'bg-zinc-100', type: 'surface' }],
  'brass': [{ name: 'Brass', color: 'bg-orange-200', type: 'accent' }],
  'velvet': [{ name: 'Velvet', color: 'bg-yellow-500', type: 'surface' }],
  'concrete': [{ name: 'Concrete', color: 'bg-zinc-400', type: 'surface' }],
  'metal': [{ name: 'Metal', color: 'bg-zinc-600', type: 'accent' }],
  'steel': [{ name: 'Steel', color: 'bg-zinc-500', type: 'accent' }],
  'glass': [{ name: 'Glass', color: 'bg-blue-100', type: 'surface' }],
  'dark': [{ name: 'Charcoal', color: 'bg-zinc-900', type: 'surface' }],
  'natural': [{ name: 'Natural Wood', color: 'bg-amber-800', type: 'natural' }, { name: 'Stone', color: 'bg-stone-300', type: 'natural' }],
  'modern': [{ name: 'Steel', color: 'bg-zinc-500', type: 'accent' }, { name: 'Concrete', color: 'bg-zinc-400', type: 'surface' }],
  'scandinavian': [{ name: 'Light Wood', color: 'bg-amber-200', type: 'natural' }, { name: 'White Marble', color: 'bg-zinc-50', type: 'surface' }],
  'nordic': [{ name: 'Light Oak', color: 'bg-amber-200', type: 'natural' }, { name: 'White Marble', color: 'bg-zinc-50', type: 'surface' }],
  'industrial': [{ name: 'Brick', color: 'bg-orange-300', type: 'surface' }, { name: 'Steel', color: 'bg-zinc-600', type: 'accent' }],
  'luxury': [{ name: 'Velvet', color: 'bg-yellow-500', type: 'surface' }, { name: 'Brass', color: 'bg-orange-200', type: 'accent' }],
  'plants': [{ name: 'Greenery', color: 'bg-green-400', type: 'natural' }],
  'green': [{ name: 'Greenery', color: 'bg-green-400', type: 'natural' }],
  'biophilic': [{ name: 'Living Plants', color: 'bg-green-500', type: 'natural' }, { name: 'Wood', color: 'bg-amber-700', type: 'natural' }],
  'residential': [{ name: 'Wood', color: 'bg-amber-600', type: 'natural' }, { name: 'Stone', color: 'bg-stone-300', type: 'natural' }],
  'restaurant': [{ name: 'Velvet', color: 'bg-yellow-500', type: 'surface' }, { name: 'Wood', color: 'bg-amber-800', type: 'natural' }],
  'cafe': [{ name: 'Concrete', color: 'bg-zinc-400', type: 'surface' }, { name: 'Wood', color: 'bg-amber-700', type: 'natural' }],
  'coffee': [{ name: 'Brass', color: 'bg-orange-200', type: 'accent' }, { name: 'Dark Wood', color: 'bg-amber-900', type: 'natural' }],
  'cozy': [{ name: 'Light Wood', color: 'bg-amber-200', type: 'natural' }, { name: 'Soft Fabrics', color: 'bg-rose-200', type: 'surface' }],
  'boutique': [{ name: 'White Marble', color: 'bg-zinc-50', type: 'surface' }, { name: 'Brass', color: 'bg-orange-200', type: 'accent' }],
  'retail': [{ name: 'Wood', color: 'bg-amber-600', type: 'natural' }, { name: 'Natural Stone', color: 'bg-stone-400', type: 'natural' }],
  'store': [{ name: 'Pine', color: 'bg-amber-500', type: 'natural' }, { name: 'Natural Stone', color: 'bg-stone-400', type: 'natural' }],
  'local': [{ name: 'Cotton', color: 'bg-stone-200', type: 'surface' }, { name: 'Black Iron', color: 'bg-zinc-800', type: 'accent' }]
};

const DEFAULT_MATERIALS: Material[] = [
  { name: 'Wood', color: 'bg-amber-600', type: 'natural' },
  { name: 'Stone', color: 'bg-stone-300', type: 'natural' },
  { name: 'Concrete', color: 'bg-zinc-400', type: 'surface' },
  { name: 'Steel', color: 'bg-zinc-500', type: 'accent' }
];

export function generateCategory(tags: string[]): CategoryResult {
  const tagsLower = tags.map(t => t.toLowerCase());

  for (const [key, mapping] of Object.entries(CATEGORY_MAPPING)) {
    if (tagsLower.includes(key)) {
      let secondary = 'Contemporary';
      for (const [tagKey, sec] of Object.entries(mapping.secondaryMap)) {
        if (tagsLower.includes(tagKey)) {
          secondary = sec;
          break;
        }
      }
      return {
        primary: mapping.primary,
        secondary,
        full: `${mapping.primary} / ${secondary}`
      };
    }
  }

  return {
    primary: 'Project',
    secondary: undefined,
    full: 'Project'
  };
}

export function generateMaterials(tags: string[]): Material[] {
  const tagsLower = tags.map(t => t.toLowerCase());
  const uniqueMaterials = new Map<string, Material>();

  for (const [key, materials] of Object.entries(MATERIAL_MAPPING)) {
    if (tagsLower.includes(key)) {
      materials.forEach(mat => {
        uniqueMaterials.set(mat.name, mat);
      });
    }
  }

  return uniqueMaterials.size > 0 ? Array.from(uniqueMaterials.values()) : DEFAULT_MATERIALS;
}

export function generateDesignZones(project: Project): DesignZone[] {
  const tagsLower = project.tags.map(t => t.toLowerCase());
  const zones: DesignZone[] = [];

  const addZone = (id: string, name: string, order: number, title: string, description: string, layout: DesignZone['layout'], image_url?: string, features?: string[]): void => {
    zones.push({ id, name, order, title, description, layout, image_url, features });
  };

  // Extract descriptions for zone generation
  const mainDesc = project.description[0] || '';
  const addDesc = project.description[1] || '';

  // Residential zones
  if (tagsLower.includes('residential') || tagsLower.includes('house') || tagsLower.includes('villa')) {
    const style = tagsLower.includes('scandinavian') ? 'scandinavian' :
                  tagsLower.includes('modern') ? 'modern' :
                  tagsLower.includes('stone') ? 'stone' : 'contemporary';

    const livingDesc = style === 'scandinavian'
      ? 'Світла вітальня з білими стінами та світлим деревом. Панорамні вікна забезпечують максимальне природне світло, створюючи відчуття легкості.'
      : style === 'stone'
      ? 'Вітальня з акцентами з натурального каменю та дерева. Великі вікна забезпечують максимальне природне світло.'
      : 'Центральна зона з великими панорамними вікнами, що виходять на сад. Відкритий план дозволяє вільно переміщатися між просторами.';

    const kitchenDesc = style === 'scandinavian'
      ? 'Мінімалістична кухня з сучасними лініями. Білі фасади та стільниці з натурального каменю.'
      : style === 'stone'
      ? 'Кухня з кам\'яними акцентами. Натуральний камінь на робочій поверхні та тепле дерево в шафах.'
      : 'Сучасна кухня з острівцем та обідньою зоною. Натуральні матеріали та сучасне обладнання.';

    const livingFeatures = style === 'scandinavian'
      ? ['Natural Light', 'White Walls', 'Panoramic Views']
      : style === 'stone'
      ? ['Natural Light', 'Open Plan', 'Stone Accents']
      : ['Natural Light', 'Open Plan', 'Comfort'];

    addZone('zone-1', 'living', 1, 'Living Space', livingDesc, 'split', undefined, livingFeatures);
    addZone('zone-2', 'kitchen', 2, 'Kitchen & Dining', kitchenDesc, 'split-reverse', undefined, ['Open Concept', 'Natural Materials', 'Functional Design']);
    addZone('zone-3', 'bedroom', 3, 'Master Bedroom', 'Спальна зона з приглушеними тонами та простими лініями. Спокій та релаксація.', 'centered');
  }

  // Hospitality zones (Restaurant/Cafe)
  else if (tagsLower.includes('restaurant') || tagsLower.includes('bistro')) {
    const style = tagsLower.includes('urban') ? 'urban' :
                  tagsLower.includes('garden') || tagsLower.includes('green') || tagsLower.includes('biophilic') ? 'garden' :
                  tagsLower.includes('dark') || tagsLower.includes('elegant') ? 'dark' : 'classic';

    const hallDesc = style === 'urban'
      ? 'Головний зал з індустріальними матеріалами - цегла, бетон, метал. Відкритий простір з високими стелями.'
      : style === 'garden'
      ? 'Основна зона з вертикальними садами та зеленими стінами. Багато природного світла та зелених рослин.'
      : style === 'dark'
      ? 'Головний зал з приглушеним освітленням. Темні стіни, дерево та шкіра створюють інтимну атмосферу.'
      : 'Основна зона ресторану з відкритим планом. Велика кількість природного світла та комфортна атмосфера.';

    const barDesc = style === 'urban'
      ? 'Барна зона з металевими елементами та сучасним обладнанням. Темні тони та індустріальні акценти.'
      : style === 'dark'
      ? 'Барна зона з мідними акцентами та винним холодильником. Відкритий бар дозволяє спостерігати за барменами.'
      : 'Барна зона з сучасним обладнанням. Комфортні місця для відпочинку та спілкування.';

    const hallFeatures = style === 'urban'
      ? ['Exposed Brick', 'Concrete Floors', 'High Ceilings']
      : style === 'garden'
      ? ['Vertical Gardens', 'Natural Light', 'Plant Walls']
      : style === 'dark'
      ? ['Ambient Lighting', 'Fireplace', 'Velvet Seating']
      : ['Natural Light', 'Open Kitchen', 'Social Seating'];

    addZone('zone-1', 'dining-hall', 1, 'Main Hall / Dining', hallDesc, 'split', undefined, hallFeatures);
    addZone('zone-2', 'bar', 2, 'Bar Area', barDesc, 'split-reverse', undefined, ['Modern Equipment', 'Comfortable Seating', 'Quality Lighting']);
    addZone('zone-3', 'kitchen', 3, 'Open Kitchen', 'Відкрита кухня з сучасним обладнанням. Гості можуть спостерігати за процесом приготування.', 'centered');
  }

  // Coffee shops
  else if (tagsLower.includes('cafe') || tagsLower.includes('coffee')) {
    const style = tagsLower.includes('industrial') ? 'industrial' :
                  tagsLower.includes('cozy') ? 'cozy' : 'modern';

    const barDesc = style === 'industrial'
      ? 'Основна барна зона з сучасним обладнанням. Відкритий простір дозволяє гостям спостерігати за баристами.'
      : style === 'cozy'
      ? 'Основна зона з теплими тонами та м\'якими меблями. Затишна атмосфера для відпочинку.'
      : 'Основна барна зона з сучасним обладнанням. Світлі тони та простий дизайн.';

    const seatingDesc = style === 'cozy'
      ? 'Зона для відпочинку з дерев\'яними столами та комфортними кріслами. Рослини додають затишок.'
      : 'Зона для відпочинку з комфортними столами та кріслами. Світлий та просторий дизайн.';

    const barFeatures = style === 'industrial'
      ? ['Specialty Equipment', 'Barista Station', 'Bean Bar']
      : ['Coffee Equipment', 'Barista Station', 'Bean Selection'];

    addZone('zone-1', 'coffee-bar', 1, 'Coffee Bar', barDesc, 'split', undefined, barFeatures);
    addZone('zone-2', 'seating', 2, 'Cozy Seating', seatingDesc, 'centered', undefined, ['Wood Tables', 'Comfortable Chairs', 'Greenery']);
    addZone('zone-3', 'lounge', 3, 'Lounge Area', 'Лаунж зона з софами та кутками для роботи. Світлі тони та м\'яке освітлення.', 'split-reverse');
  }

  // Commercial zones (Shop/Store)
  else if (tagsLower.includes('shop') || tagsLower.includes('store') || tagsLower.includes('retail') || tagsLower.includes('boutique')) {
    const style = tagsLower.includes('boutique') ? 'boutique' : 'retail';

    const showroomDesc = style === 'boutique'
      ? 'Основний шоурум з мінімалістичним дизайном та фокусом на продукти. Світлі тони та чисті лінії.'
      : 'Основний простір магазину з фокусом на продукти. Використання натуральних матеріалів та простий дизайн.';

    const showroomFeatures = style === 'boutique'
      ? ['Minimal Design', 'Product Focus', 'Clean Lines']
      : ['Product Display', 'Natural Materials', 'Clear Layout'];

    addZone('zone-1', 'showroom', 1, 'Main Showroom', showroomDesc, 'split', undefined, showroomFeatures);
    addZone('zone-2', 'fitting', 2, 'Fitting Area', 'Примерні кімнати з дзеркалами та якісним освітленням. Затишна та приватна атмосфера.', 'centered');
    addZone('zone-3', 'checkout', 3, 'Checkout Counter', 'Оформлення замовлень з брендованими елементами та якісними матеріалами.', 'split-reverse');
  }

  return zones;
}
