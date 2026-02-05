import { Icon } from '@iconify-icon/react';

interface IconProps {
  icon: string;
  width?: number | string;
  className?: string;
}

export default function IconWrapper({ icon, width = 20, className = '' }: IconProps) {
  return <Icon icon={icon} width={width} className={className} />;
}
