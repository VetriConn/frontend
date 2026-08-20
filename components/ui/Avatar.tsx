import Image from "next/image";
import { getInitials } from "@/lib/initials";

interface AvatarProps {
  /** The image URL - can be profile picture or company logo */
  src?: string | null;
  /** Name to generate initials from if no image */
  name: string;
  /** Size in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Alt text for the image */
  alt?: string;
}

/**
 * Avatar component that displays profile pictures or company logos
 * Falls back to initials if no image is provided
 * 
 * Usage:
 * - <Avatar src={userProfile.picture} name={userProfile.full_name} />
 * - Company: <Avatar src={company.logo_url} name={company.name} />
 */
export function Avatar({ src, name, size = 40, className = "", alt }: AvatarProps) {
  const hasValidSrc = src && src.trim() !== "";
  const initials = getInitials(name);
  const altText = alt || name;

  const hasBgClass = className.split(" ").some((c) => c.startsWith("bg-"));
  const defaultBg = hasBgClass ? "" : "bg-gray-200";

  const hasTextClass = className.split(" ").some((c) => c.startsWith("text-"));
  const defaultText = hasTextClass ? "" : "text-gray-500";

  return (
    <div
      className={`rounded-full ${defaultBg} flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size, aspectRatio: '1' }}
    >
      {hasValidSrc ? (
        <Image
          src={src}
          alt={altText}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          sizes={`${size}px`}
          loading="lazy"
        />
      ) : (
        <span className={`${defaultText} font-medium`} style={{ fontSize: `${size * 0.35}px` }}>
          {initials}
        </span>
      )}
    </div>
  );
}

/**
 * Hook to get the appropriate avatar URL based on user role
 * 
 * @param userProfile - The user profile object
 * @returns The avatar URL (picture for job seekers, logo for employers)
 */
export function useAvatarUrl(
  userProfile: { picture?: string } | null | undefined,
): string | null {
  return userProfile?.picture || null;
}
