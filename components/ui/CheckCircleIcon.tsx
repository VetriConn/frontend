import React from "react";

interface CheckCircleIconProps {
  color?: "red" | "green";
  className?: string;
  size?: number;
}

/**
 * Custom SVG check-circle icon matching the design system.
 * Outlined style with animated checkmark extending beyond the circle.
 */
export const CheckCircleIcon: React.FC<CheckCircleIconProps> = ({
  color = "green",
  className = "",
  size = 22,
}) => {
  const stroke = color === "red" ? "#E2283A" : "#20B16D";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M19.5867 8.98402C19.997 10.9977 19.7046 13.0912 18.7582 14.9153C17.8118 16.7395 16.2687 18.1841 14.3861 19.0082C12.5035 19.8323 10.3953 19.9861 8.41309 19.444C6.43084 18.9018 4.69436 17.6965 3.49322 16.029C2.29209 14.3616 1.6989 12.3327 1.81259 10.2808C1.92628 8.22891 2.73997 6.27801 4.11797 4.75343C5.49597 3.22885 7.35498 2.22276 9.38499 1.90294C11.415 1.58312 13.4933 1.96889 15.2733 2.99593"
        stroke={stroke}
        strokeWidth="1.79688"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.08594 9.88257L10.7812 12.5779L19.7656 3.59351"
        stroke={stroke}
        strokeWidth="1.79688"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
