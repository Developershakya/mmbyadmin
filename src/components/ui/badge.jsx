import React from "react";

export function Badge({ className = "", ...props }) {
  return (
    <span
      className={
        "inline-block rounded-full bg-gradient-to-r from-teal-300 to-teal-500 text-white text-xs px-3 py-1 font-semibold " +
        className
      }
      {...props}
    />
  );
}
