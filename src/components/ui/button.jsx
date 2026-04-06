import React from "react";

export function Button({ className = "", ...props }) {
  return (
    <button
      className={`bg-orange-500 text-white px-4 py-2 rounded  ${className}`}
      {...props}
    />
  );
}
