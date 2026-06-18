import React from "react";

const PATHS = {
  add:      "M12 5v14M5 12h14",
  check:    "m5 12 4 4L19 6",
  download: "M12 3v12m0 0 5-5m-5 5-5-5M5 21h14",
  message:  "M4 5h16v11H8l-4 4V5Z",
  package:  "M4 8 12 4l8 4v8l-8 4-8-4V8Zm0 0 8 4m8-4-8 4m0 0v8",
  printer:  "M7 8V4h10v4M6 17H4v-7h16v7h-2M7 14h10v6H7v-6Z",
  refresh:  "M20 11a8 8 0 0 0-14-5L4 8m0 0h5M4 8V3m0 10a8 8 0 0 0 14 5l2-2m0 0h-5m5 0v5",
  temp:     "M14 14.76V5a2 2 0 1 0-4 0v9.76a4 4 0 1 0 4 0Z",
  review:   "M4 5h16M4 12h10M4 19h16",
  logout:   "M17 16l4-4m0 0-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1",
  shield:   "M12 3 4 7v5c0 5 4 9 8 10 4-1 8-5 8-10V7l-8-4Z",
  chart:    "M3 3v18h18M8 17V9m4 8V5m4 12v-5",
};

export default function Icon({ name, size = 16, className = "" }) {
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
      className={className}
      style={{ flex: "0 0 auto" }}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
