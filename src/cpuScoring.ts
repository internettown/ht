import type { CPUProduct } from './types';
import {
  CORE_TYPES,
  CPU_PACKAGES,
  TECH_PROCESSES,
  getAvailableCores,
  getAvailablePackages,
  getAvailableTechProcesses,
} from './cpuData';

const MAX_SELL_PRICE = 1200;

interface ScoreContext {
  completedResearch?: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getProductTier(product: CPUProduct, context?: ScoreContext): number {
  if (!context?.completedResearch) return 1;

  const availableProcesses = getAvailableTechProcesses(context.completedResearch);
  const availablePackages = getAvailablePackages(context.completedResearch);
  const bestPackage = availablePackages.reduce(
    (best, pkg) => (pkg.performance > best.performance ? pkg : best),
    availablePackages[0] ?? CPU_PACKAGES[0],
  );
  const availableCores = getAvailableCores(context.completedResearch, bestPackage.maxCore);
  const bestCore = availableCores.reduce(
    (best, core) => (core.performance > best.performance ? core : best),
    availableCores[0] ?? CORE_TYPES[0],
  );

  const productProcessIndex = TECH_PROCESSES.findIndex((tp) => tp.id === product.techProcessId);
  const bestProcessIndex = Math.max(...availableProcesses.map((tp) => TECH_PROCESSES.findIndex((known) => known.id === tp.id)), 0);
  const processTier = bestProcessIndex > 0 ? clamp((productProcessIndex + 1) / (bestProcessIndex + 1), 0.15, 1) : 1;

  const productPackage = CPU_PACKAGES.find((pkg) => pkg.id === product.packageId);
  const packageTier = bestPackage.performance > 0 && productPackage
    ? clamp(productPackage.performance / bestPackage.performance, 0.15, 1)
    : 1;

  const productCore = CORE_TYPES.find((core) => core.id === product.coreId);
  const coreTier = bestCore.performance > 0 && productCore
    ? clamp((productCore.performance + 25) / (bestCore.performance + 25), 0.15, 1)
    : 1;

  return processTier * 0.3 + packageTier * 0.45 + coreTier * 0.25;
}

function getRelativeHardwareScore(product: CPUProduct, context?: ScoreContext): number {
  if (!context?.completedResearch) {
    return clamp(product.performance / 3.8, 0, 100) * 0.55 +
      clamp(((product.stability + 10) / 45) * 100, 0, 100) * 0.2 +
      clamp(product.build / 2, 0, 100) * 0.25;
  }

  const availablePackages = getAvailablePackages(context.completedResearch);
  const bestPackage = availablePackages.reduce(
    (best, pkg) => (pkg.performance > best.performance ? pkg : best),
    availablePackages[0] ?? CPU_PACKAGES[0],
  );
  const availableCores = getAvailableCores(context.completedResearch, bestPackage.maxCore);
  const bestCore = availableCores.reduce(
    (best, core) => (core.performance > best.performance ? core : best),
    availableCores[0] ?? CORE_TYPES[0],
  );

  const bestPerformance = Math.max(1, bestPackage.performance + bestCore.performance);
  const bestStability = Math.max(1, bestPackage.stability + bestCore.stability);
  const bestBuild = Math.max(1, (bestPackage.build + bestCore.build) * 1.05);

  return clamp(product.performance / bestPerformance, 0, 1.15) * 55 +
    clamp(Math.max(0, product.stability) / bestStability, 0, 1.15) * 20 +
    clamp(product.build / bestBuild, 0, 1.15) * 25;
}

function getFairCpuPrice(product: CPUProduct, context?: ScoreContext): number {
  const tier = getProductTier(product, context);
  const normalMarkup = 2.5 - tier * 0.45;
  const statValue = product.unitCost * normalMarkup;

  return Math.max(product.unitCost * 1.6, statValue);
}

function getCpuValueMetrics(product: CPUProduct, context?: ScoreContext) {
  const fairPrice = getFairCpuPrice(product, context);
  const costRatio = product.unitCost > 0 ? product.price / product.unitCost : 10;
  const priceRatio = fairPrice > 0 ? product.price / fairPrice : 10;

  let valueScore: number;
  if (costRatio <= 2.2) {
    valueScore = 96;
  } else if (costRatio <= 3) {
    valueScore = 96 - (costRatio - 2.2) * 20;
  } else if (priceRatio <= 1.4) {
    valueScore = 80 - (priceRatio - 1) * 35;
  } else if (priceRatio <= 2.5) {
    valueScore = 66 - (priceRatio - 1.4) * 45;
  } else {
    valueScore = 16.5 - (priceRatio - 2.5) * 14;
  }

  return {
    costRatio,
    fairPrice,
    priceRatio,
    valueScore: clamp(valueScore, 0, 100),
  };
}

function computeReviewScore(product: CPUProduct, isCompetitor = false, context?: ScoreContext): number {
  const hardwareScore = getRelativeHardwareScore(product, context);
  const technologyScore = getProductTier(product, context) * 100;
  const { costRatio, priceRatio, valueScore } = getCpuValueMetrics(product, context);

  let score = hardwareScore * 0.45 + technologyScore * 0.3 + valueScore * 0.25;

  if (technologyScore < 45) score = Math.min(score, 49);
  if (technologyScore < 30) score = Math.min(score, 34);
  if (costRatio > 3.5 || priceRatio > 1.8) score = Math.min(score, 72);
  if (costRatio > 5 || priceRatio > 2.5) score = Math.min(score, 49);
  if (costRatio > 8 || priceRatio > 4) score = Math.min(score, 29);

  if (isCompetitor) score *= 0.92;
  return clamp(Math.round(score), 1, 100);
}

export { MAX_SELL_PRICE, computeReviewScore, getCpuValueMetrics };
