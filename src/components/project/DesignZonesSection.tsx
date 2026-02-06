import type { DesignZone as DesignZoneType } from '../../types/project';
import DesignZone from './DesignZone';

interface DesignZonesSectionProps {
  zones: DesignZoneType[];
}

export default function DesignZonesSection({ zones }: DesignZonesSectionProps) {
  const sortedZones = [...zones].sort((a, b) => a.order - b.order);

  return (
    <>
      {sortedZones.map((zone, index) => (
        <DesignZone key={zone.id} zone={zone} zoneNumber={index + 1} />
      ))}
    </>
  );
}
