import Image from 'next/image';

interface EquipmentVisualProps {
  /** Source URL for the equipment visual asset (supports static image or future animated GIF) */
  src?: string;
  /** Accessible description of the machinery */
  alt?: string;
  /** Optional container style overrides */
  className?: string;
}

/**
 * Dedicated visual asset container for heavy equipment.
 * Renders the HD875 rigid dump truck in a vertically calibrated container
 * that preserves maximum visual prominence without forcing vertical scrolling
 * on 16:9 wallboard displays.
 * 
 * Architecture note: Preserves swappable structure for future animated GIF/stream assets.
 */
export function EquipmentVisual({
  src = '/images/hd875.jpg',
  alt = 'HD875 Heavy Rigid Dump Truck',
  className = '',
}: EquipmentVisualProps) {
  return (
    <div
      className={`relative w-full h-full min-h-[70px] overflow-hidden flex items-center justify-center ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 400px"
        className="object-contain object-center"
        priority
      />
    </div>
  );
}
