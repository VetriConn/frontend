import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import { getInitials } from "@/lib/initials";

interface AvatarProps {
  /** The image URL - can be profile picture or company logo */
  src?: string | null;
  /** Name to generate initials from if no image */
  name: string;
  /**
   * Size at 100% text, in pixels. Emitted as rem so it grows with the
   * accessibility text setting. Ignored when `className` sizes the box.
   */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Alt text for the image */
  alt?: string;
}

/**
 * Does the caller size this themselves?
 *
 * The inline width/height below beat any class, silently: ProfileHeader
 * passed `w-full h-full` and got 96px anyway. So a caller who states a size
 * in classes gets no inline size at all, and their classes decide.
 */
const SIZE_CLASS = /(?:^|\s)(?:w-|h-|size-|min-w-|min-h-|max-w-|max-h-)\S/;

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
  const callerSizes = SIZE_CLASS.test(className);
  /**
   * rem, not px.
   *
   * The accessibility panel scales text by setting a root font-size, so
   * everything measured in rem grows with it and everything in px does not.
   * A px avatar inside a rem-sized button drifts apart at 125%: the button
   * grew to 120px, this stayed at 96, and the gap showed as a ring of
   * parent background. The `size` prop stays in pixels because that is what
   * it means at 100% and what the image loader wants.
   */
  const boxRem = `${size / 16}rem`;

  const hasBgClass = className.split(" ").some((c) => c.startsWith("bg-"));
  const defaultBg = hasBgClass ? "" : "bg-gray-200";

  const hasTextClass = className.split(" ").some((c) => c.startsWith("text-"));
  const defaultText = hasTextClass ? "" : "text-gray-500";

  return (
    <div
      className={`rounded-full ${defaultBg} flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      style={
        callerSizes
          ? { aspectRatio: "1" }
          : { width: boxRem, height: boxRem, aspectRatio: "1" }
      }
    >
      {hasValidSrc ? (
        <Image
          loader={cloudinaryLoader}
          src={src}
          alt={altText}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          sizes={`${size}px`}
          loading="lazy"
        />
      ) : (
        <span
          className={`${defaultText} font-medium`}
          style={{ fontSize: `${(size * 0.35) / 16}rem` }}
        >
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
