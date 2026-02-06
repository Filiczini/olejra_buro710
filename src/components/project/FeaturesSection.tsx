import { Icon } from '@iconify-icon/react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section className="bg-zinc-50 py-32 mb-32">
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-zinc-200 pt-12">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col gap-6 group">
              <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                <Icon icon={feature.icon} width={20} />
              </div>
              <h4 className="text-lg font-medium uppercase tracking-tight">{feature.title}</h4>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
