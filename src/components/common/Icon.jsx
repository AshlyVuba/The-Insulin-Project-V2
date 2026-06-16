import React from "react";

const ICON_PATHS = {
  add: "M12 5v14M5 12h14",
  check: "m5 12 4 4L19 6",
  download: "M12 3v12m0 0 5-5m-5 5-5-5M5 21h14",
  message: "M4 5h16v11H8l-4 4V5Z",
  package: "M4 8 12 4l8 4v8l-8 4-8-4V8Zm0 0 8 4m8-4-8 4m0 0v8",
  printer: "M7 8V4h10v4M6 17H4v-7h16v7h-2M7 14h10v6H7v-6Z",
  refresh: "M20 11a8 8 0 0 0-14-5L4 8m0 0h5M4 8V3m0 10a8 8 0 0 0 14 5l2-2m0 0h-5m5 0v5",
  review: "M4 5h16M4 12h10M4 19h16",
  temp: "M14 14.76V5a2 2 0 1 0-4 0v9.76a4 4 0 1 0 4 0Z",
};

export default function Icon({ name, size = 16 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "0 0 auto" }}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
