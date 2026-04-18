// Host mascot imagery. Real photos drop into apps/juntti/public/hosts/
// with filenames matching the `variant` keys. Until they're added, each
// variant renders a CSS gradient placeholder so layouts aren't broken.

export type HostVariant =
  | "default" // brown suede / arkinen (black bg)
  | "bling" // blue sequin / esitys
  | "hockey" // suomi jerseys / urheilu
  | "classic"; // tweed & cap / historia

const PLACEHOLDER: Record<HostVariant, string> = {
  default: "linear-gradient(135deg, #3f2a1f, #1f1713)",
  bling: "linear-gradient(135deg, #1d4ed8, #312e81)",
  hockey: "linear-gradient(135deg, #1e3a8a, #0f172a)",
  classic: "linear-gradient(135deg, #6b4a2a, #2a1e14)",
};

export function HostImage({
  variant,
  className,
  alt,
}: {
  variant: HostVariant;
  className?: string;
  alt: string;
}) {
  const src = `/hosts/${variant}.jpg`;
  return (
    <div
      className={className}
      style={{
        background: `${PLACEHOLDER[variant]} center/cover`,
        backgroundImage: `url(${src}), ${PLACEHOLDER[variant]}`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      role="img"
      aria-label={alt}
    />
  );
}
