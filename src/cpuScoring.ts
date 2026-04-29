import type { CPUProduct } from './types';

const MAX_SELL_PRICE = 1200;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getFairCpuPrice(product: CPUProduct): number {
  const statValue =
    20 +
    product.performance * 1.8 +
    Math.max(0, product.stability) * 8 +
    product.build * 0.9;

  return Math.max(product.unitCost * 2.25, statValue);
}

function getCpuValueMetrics(product: CPUProduct) {
  const fairPrice = getFairCpuPrice(product);
  const priceRatio = fairPrice > 0 ? product.price / fairPrice : 10;

  let valueScore: number;
  if (priceRatio <= 0.8) {
    valueScore = 100;
  } else if (priceRatio <= 1) {
    valueScore = 95;
  } else if (priceRatio <= 1.5) {
    valueScore = 95 - (priceRatio - 1) * 50;
  } else if (priceRatio <= 3) {
    valueScore = 70 - (priceRatio - 1.5) * 35;
  } else {
    valueScore = 17.5 - (priceRatio - 3) * 8;
  }

  return {
    fairPrice,
    priceRatio,
    valueScore: clamp(valueScore, 0, 100),
  };
}

function computeReviewScore(product: CPUProduct, isCompetitor = false): number {
  const perfScore = clamp(product.performance / 3.8, 0, 100);
  const stabilityScore = clamp(((product.stability + 10) / 45) * 100, 0, 100);
  const buildScore = clamp(product.build / 2, 0, 100);
  const hardwareScore = perfScore * 0.55 + stabilityScore * 0.2 + buildScore * 0.25;
  const { priceRatio, valueScore } = getCpuValueMetrics(product);

  let score = hardwareScore * 0.65 + valueScore * 0.35;

  if (priceRatio > 2.5) score = Math.min(score, 69);
  if (priceRatio > 4) score = Math.min(score, 49);
  if (priceRatio > 6) score = Math.min(score, 29);

  if (isCompetitor) score *= 0.92;
  return clamp(Math.round(score), 1, 100);
}

export { MAX_SELL_PRICE, computeReviewScore, getCpuValueMetrics };
