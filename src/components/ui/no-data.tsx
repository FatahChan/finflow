interface NoDataProps {
  message?: string;
  className?: string;
}

function NoData({ message = "No data available", className }: NoDataProps) {
  return (
    <div className={`flex-col items-center justify-center p-8 ${className}`}>
      <div className="mb-2 flex items-center justify-center text-gray-400">
        <svg
          aria-label="No data illustration"
          className="h-16 w-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>No data</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

export default NoData;
