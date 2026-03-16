import React from "react";
import Image from "next/image";
import clsx from "clsx";
import { AvatarProps, AvatarGroupProps } from "@/types/component";
import { getInitials } from "@/lib/initials";

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  alt,
  fallback,
  size = 40,
  className,
}) => {
  const initials = getInitials(name || "", "");

  return (
    <div
      className={clsx(
        "inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-800 font-semibold text-base overflow-hidden relative",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          className="w-full h-full object-cover rounded-full block"
          width={size}
          height={size}
        />
      ) : fallback ? (
        fallback
      ) : (
        <span className="text-base text-gray-800">{initials}</span>
      )}
    </div>
  );
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  className,
}) => (
  <div className={clsx("flex items-center -space-x-2", className)}>
    {children}
  </div>
);

export type { AvatarProps, AvatarGroupProps };
