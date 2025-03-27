import { cn } from "@/lib/utils";
export const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      width="512"
      height="512"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-16", className)}
    >
      <title>FinFlow</title>
      <circle cx="256" cy="256" r="240" fill="#4F46E5" opacity="0.1" />
      <rect
        x="136"
        y="136"
        width="240"
        height="240"
        rx="24"
        stroke="#4F46E5"
        strokeWidth="24"
        fill="none"
      />
      <path
        d="M192 256L236 300L320 216"
        stroke="#4F46E5"
        strokeWidth="32"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
