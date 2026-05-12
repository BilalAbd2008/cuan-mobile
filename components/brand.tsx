import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  large?: boolean;
};

export function BrandMark({ compact = false, large = false }: BrandMarkProps) {
  const size = large ? 170 : compact ? 34 : 92;

  return (
    <Image
      alt="Logo Cuanin"
      className={`brand-logo${compact ? " compact" : ""}${large ? " large" : ""}`}
      height={size}
      priority
      src="/assets/cuanin-logo.png"
      width={size}
    />
  );
}
