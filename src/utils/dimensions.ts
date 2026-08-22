// Utility functions for dimension conversions

/**
 * Convert millimeters to points (1 point = 1/72 inch).
 */
export function mmToPoints(mm: number): number {
  return (mm / 25.4) * 72;
}

/**
 * Convert millimeters to pixels based on DPI.
 */
export function mmToPixels(mm: number, dpi: number): number {
  return (mm * dpi) / 25.4;
}
