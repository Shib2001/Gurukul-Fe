import Image from "next/image";
import Link from "next/link";

export function BrandLink({
  href,
  label = "Gurukul.ai",
  className,
  imageClassName,
  width = 170,
  height = 54,
  sizes,
  priority = false,
  caption,
}: {
  href: string;
  label?: string;
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  caption?: string;
}) {
  return (
    <Link className={className} href={href} aria-label={label}>
      <Image
        className={imageClassName}
        src="/Gurukul.ai (B-FONT).png"
        alt={label}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
      />
      {caption && <span>{caption}</span>}
    </Link>
  );
}
