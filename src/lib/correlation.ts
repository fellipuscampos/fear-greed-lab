/**
 * Pearson correlation coefficient between two equal-length numeric series.
 * Returns a value in [-1, 1], or 0 when either series has no variance.
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length) {
    throw new Error("Series must have the same length");
  }
  const n = x.length;
  if (n < 2) return 0;

  const meanX = x.reduce((sum, v) => sum + v, 0) / n;
  const meanY = y.reduce((sum, v) => sum + v, 0) / n;

  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }

  if (varianceX === 0 || varianceY === 0) return 0;

  return covariance / Math.sqrt(varianceX * varianceY);
}
