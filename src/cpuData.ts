export interface TechProcess {
  id: string;
  name: string;
  designTimeMultiplier: number; // percentage, e.g. 100 = no effect
  minClock: number; // kHz
  maxClock: number; // kHz
}

export interface CPUPackage {
  id: string;
  name: string;
  designCost: number;
  designTime: number; // days
  unitCost: number;
  performance: number;
  stability: number;
  build: number;
  maxClock: number; // kHz
  maxCore: number; // 0=single, 1=exp-dual, 2=basic-dual, 3=dual, 4=triple, 5=quad
}

export interface CoreType {
  id: string;
  name: string;
  designCost: number;
  designTime: number; // days
  unitCost: number;
  performance: number;
  stability: number;
  build: number;
  coreIndex: number; // 0=single, 1=exp-dual, etc.
  researchId: string | null; // null = always available
}

// Map research IDs to tech process IDs
export const TECH_PROCESS_RESEARCH_MAP: Record<string, string> = {
  '': '15um', // default, no research needed
  '10um': '10um',
  '6um': '6um',
  '3um': '3um',
  '1500nm': '1500nm',
  '1um': '1um',
  '800nm': '800nm',
  '600nm': '600nm',
  '350nm': '350nm',
  '250nm': '250nm',
  '180nm': '180nm',
  '130nm': '130nm',
  '90nm': '90nm',
  '65nm': '65nm',
  '45nm': '45nm',
};

export const TECH_PROCESSES: TechProcess[] = [
  { id: '15um', name: '15 \u00b5m', designTimeMultiplier: 100, minClock: 100, maxClock: 600 },
  { id: '10um', name: '10 \u00b5m', designTimeMultiplier: 99, minClock: 100, maxClock: 2200 },
  { id: '6um', name: '6 \u00b5m', designTimeMultiplier: 98, minClock: 200, maxClock: 3800 },
  { id: '3um', name: '3 \u00b5m', designTimeMultiplier: 98, minClock: 600, maxClock: 12000 },
  { id: '1500nm', name: '1.5 \u00b5m', designTimeMultiplier: 97, minClock: 1200, maxClock: 22000 },
  { id: '1um', name: '1 \u00b5m', designTimeMultiplier: 97, minClock: 2000, maxClock: 34000 },
  { id: '800nm', name: '800 nm', designTimeMultiplier: 96, minClock: 4000, maxClock: 60000 },
  { id: '600nm', name: '600 nm', designTimeMultiplier: 96, minClock: 6000, maxClock: 98000 },
  { id: '350nm', name: '350 nm', designTimeMultiplier: 95, minClock: 9000, maxClock: 210000 },
  { id: '250nm', name: '250 nm', designTimeMultiplier: 95, minClock: 14000, maxClock: 695000 },
  { id: '180nm', name: '180 nm', designTimeMultiplier: 95, minClock: 19000, maxClock: 1400000 },
  { id: '130nm', name: '130 nm', designTimeMultiplier: 96, minClock: 24000, maxClock: 2700000 },
  { id: '90nm', name: '90 nm', designTimeMultiplier: 97, minClock: 32000, maxClock: 3600000 },
  { id: '65nm', name: '65 nm', designTimeMultiplier: 98, minClock: 46000, maxClock: 4000000 },
  { id: '45nm', name: '45 nm', designTimeMultiplier: 99, minClock: 58000, maxClock: 4320000 },
];

export const CPU_PACKAGES: CPUPackage[] = [
  { id: '14-dip', name: '14 pin DIP', designCost: 40000, designTime: 46, unitCost: 6, performance: 6.5, stability: 5, build: 2, maxClock: 1250, maxCore: 0 },
  { id: '18-dip', name: '18 pin DIP', designCost: 44000, designTime: 47, unitCost: 6.6, performance: 9, stability: 5.1, build: 2.5, maxClock: 2250, maxCore: 0 },
  { id: '24-dip', name: '24 pin DIP', designCost: 49000, designTime: 49, unitCost: 7.3, performance: 12, stability: 5.2, build: 3.3, maxClock: 3000, maxCore: 0 },
  { id: '32-dip', name: '32 pin DIP', designCost: 55000, designTime: 51, unitCost: 8.2, performance: 16, stability: 5.3, build: 4.8, maxClock: 4000, maxCore: 0 },
  { id: '48-dip', name: '48 pin DIP', designCost: 60000, designTime: 53, unitCost: 9.7, performance: 21, stability: 5.4, build: 6.6, maxClock: 5600, maxCore: 0 },
  { id: '56-dip', name: '56 pin DIP', designCost: 70000, designTime: 57, unitCost: 11.6, performance: 25, stability: 5.2, build: 9, maxClock: 7400, maxCore: 0 },
  { id: '64-dip', name: '64 pin DIP', designCost: 82000, designTime: 61, unitCost: 14.2, performance: 30, stability: 4.9, build: 11, maxClock: 8200, maxCore: 0 },
  { id: '72-dip', name: '72 pin DIP', designCost: 95000, designTime: 66, unitCost: 16.8, performance: 34, stability: 4.5, build: 12.5, maxClock: 9200, maxCore: 0 },
  { id: '24-plcc', name: '24 pin PLCC', designCost: 72000, designTime: 58, unitCost: 7.2, performance: 11.5, stability: 7, build: 8, maxClock: 5000, maxCore: 0 },
  { id: '32-plcc', name: '32 pin PLCC', designCost: 81000, designTime: 58, unitCost: 8.2, performance: 16, stability: 7.1, build: 10.5, maxClock: 6500, maxCore: 0 },
  { id: '48-plcc', name: '48 pin PLCC', designCost: 92000, designTime: 59, unitCost: 9.5, performance: 22, stability: 7.2, build: 13, maxClock: 8000, maxCore: 0 },
  { id: '56-plcc', name: '56 pin PLCC', designCost: 100000, designTime: 61, unitCost: 11.5, performance: 28, stability: 7.3, build: 16, maxClock: 9400, maxCore: 0 },
  { id: '64-plcc', name: '64 pin PLCC', designCost: 113000, designTime: 62, unitCost: 14, performance: 34, stability: 7.3, build: 19, maxClock: 11100, maxCore: 0 },
  { id: '72-plcc', name: '72 pin PLCC', designCost: 127000, designTime: 64, unitCost: 16.5, performance: 40, stability: 7.3, build: 22, maxClock: 15000, maxCore: 1 },
  { id: '84-plcc', name: '84 pin PLCC', designCost: 144000, designTime: 67, unitCost: 18.8, performance: 46, stability: 7.2, build: 24, maxClock: 17500, maxCore: 1 },
  { id: '96-plcc', name: '96 pin PLCC', designCost: 166000, designTime: 68, unitCost: 21, performance: 52, stability: 7.2, build: 26, maxClock: 20000, maxCore: 1 },
  { id: '116-plcc', name: '116 pin PLCC', designCost: 190000, designTime: 70, unitCost: 23.1, performance: 58, stability: 7.1, build: 28, maxClock: 24000, maxCore: 2 },
  { id: '136-plcc', name: '136 pin PLCC', designCost: 210000, designTime: 73, unitCost: 25.1, performance: 65, stability: 7.1, build: 30, maxClock: 29000, maxCore: 2 },
  { id: '156-plcc', name: '156 pin PLCC', designCost: 245000, designTime: 77, unitCost: 27.2, performance: 71, stability: 7, build: 32, maxClock: 35000, maxCore: 2 },
  { id: '182-plcc', name: '182 pin PLCC', designCost: 289000, designTime: 80, unitCost: 29.3, performance: 77, stability: 6.8, build: 33.5, maxClock: 40000, maxCore: 2 },
  { id: '208-plcc', name: '208 pin PLCC', designCost: 335000, designTime: 82, unitCost: 31.4, performance: 82, stability: 6.8, build: 35, maxClock: 45000, maxCore: 2 },
  { id: '240-plcc', name: '240 pin PLCC', designCost: 360000, designTime: 83, unitCost: 34, performance: 87, stability: 6.5, build: 36, maxClock: 52000, maxCore: 2 },
  { id: '48-pga', name: '48 pin PGA', designCost: 300000, designTime: 83, unitCost: 20, performance: 29, stability: 12, build: 15, maxClock: 14000, maxCore: 1 },
  { id: '60-pga', name: '60 pin PGA', designCost: 310000, designTime: 83, unitCost: 20.5, performance: 36, stability: 12.2, build: 19, maxClock: 18000, maxCore: 1 },
  { id: '78-pga', name: '78 pin PGA', designCost: 320000, designTime: 84, unitCost: 21, performance: 43, stability: 12.2, build: 23, maxClock: 22000, maxCore: 2 },
  { id: '96-pga', name: '96 pin PGA', designCost: 330000, designTime: 85, unitCost: 21.7, performance: 54, stability: 12.3, build: 27, maxClock: 27700, maxCore: 2 },
  { id: '112-pga', name: '112 pin PGA', designCost: 350000, designTime: 85, unitCost: 22.7, performance: 61, stability: 12.3, build: 31, maxClock: 34500, maxCore: 3 },
  { id: '136-pga', name: '136 pin PGA', designCost: 370000, designTime: 86, unitCost: 23.9, performance: 67, stability: 12.2, build: 35, maxClock: 42000, maxCore: 3 },
  { id: '152-pga', name: '152 pin PGA', designCost: 400000, designTime: 87, unitCost: 25.3, performance: 74, stability: 12.2, build: 40, maxClock: 49000, maxCore: 3 },
  { id: '176-pga', name: '176 pin PGA', designCost: 450000, designTime: 89, unitCost: 26.7, performance: 80, stability: 12.1, build: 46, maxClock: 53000, maxCore: 3 },
  { id: '200-pga', name: '200 pin PGA', designCost: 520000, designTime: 91, unitCost: 28, performance: 85, stability: 12, build: 53, maxClock: 59500, maxCore: 3 },
  { id: '224-pga', name: '224 pin PGA', designCost: 580000, designTime: 94, unitCost: 29.4, performance: 89, stability: 12, build: 59, maxClock: 65000, maxCore: 3 },
  { id: '248-pga', name: '248 pin PGA', designCost: 660000, designTime: 96, unitCost: 31, performance: 93, stability: 12, build: 64, maxClock: 83000, maxCore: 3 },
  { id: '282-pga', name: '282 pin PGA', designCost: 745000, designTime: 99, unitCost: 32.5, performance: 98, stability: 11.9, build: 68, maxClock: 122000, maxCore: 3 },
  { id: '320-pga', name: '320 pin PGA', designCost: 810000, designTime: 102, unitCost: 34, performance: 102, stability: 11.8, build: 72, maxClock: 220000, maxCore: 3 },
  { id: '380-pga', name: '380 pin PGA', designCost: 880000, designTime: 105, unitCost: 36, performance: 106, stability: 11.8, build: 75.5, maxClock: 390000, maxCore: 3 },
  { id: '456-pga', name: '456 pin PGA', designCost: 960000, designTime: 107, unitCost: 38, performance: 111, stability: 11.7, build: 78.5, maxClock: 750000, maxCore: 3 },
  { id: '544-pga', name: '544 pin PGA', designCost: 1050000, designTime: 110, unitCost: 40.2, performance: 116, stability: 11.7, build: 81.5, maxClock: 1500000, maxCore: 3 },
  { id: '618-pga', name: '618 pin PGA', designCost: 1150000, designTime: 112, unitCost: 42, performance: 120, stability: 11.6, build: 84, maxClock: 2000000, maxCore: 4 },
  { id: '754-pga', name: '754 pin PGA', designCost: 1240000, designTime: 115, unitCost: 44.2, performance: 125, stability: 11.5, build: 87, maxClock: 3000000, maxCore: 4 },
  { id: '870-pga', name: '870 pin PGA', designCost: 1320000, designTime: 117, unitCost: 46, performance: 128, stability: 11.4, build: 90.5, maxClock: 3400000, maxCore: 4 },
  { id: '940-pga', name: '940 pin PGA', designCost: 1370000, designTime: 119, unitCost: 48.4, performance: 132, stability: 11.4, build: 94, maxClock: 3900000, maxCore: 4 },
  { id: '1086-pga', name: '1086 pin PGA', designCost: 1450000, designTime: 122, unitCost: 50.5, performance: 138, stability: 11.3, build: 99, maxClock: 4360000, maxCore: 5 },
  { id: '1207-pga', name: '1207 pin PGA', designCost: 1590000, designTime: 125, unitCost: 53.5, performance: 144, stability: 11.1, build: 105, maxClock: 4700000, maxCore: 6 },
  { id: '1366-pga', name: '1366 pin PGA', designCost: 1840000, designTime: 126, unitCost: 56.6, performance: 149, stability: 11.2, build: 111, maxClock: 5000000, maxCore: 8 },
];

export const CORE_TYPES: CoreType[] = [
  { id: 'single', name: 'Single-core', designCost: 25000, designTime: 70, unitCost: 9, performance: 5, stability: 20, build: 5, coreIndex: 0, researchId: null },
  { id: 'exp-dual', name: 'Experimental dual-core', designCost: 276000, designTime: 152, unitCost: 25, performance: 95, stability: -10, build: 11, coreIndex: 1, researchId: 'exp-dual' },
  { id: 'basic-dual', name: 'Basic dual-core', designCost: 322000, designTime: 160, unitCost: 27, performance: 110, stability: 1, build: 16, coreIndex: 2, researchId: 'basic-dual' },
  { id: 'dual-core', name: 'Dual-core', designCost: 350000, designTime: 153, unitCost: 32, performance: 120, stability: 12, build: 27, coreIndex: 3, researchId: 'dual-core' },
  { id: 'triple-core', name: 'Triple-core', designCost: 550000, designTime: 170, unitCost: 40, performance: 170, stability: 12, build: 42, coreIndex: 4, researchId: 'triple-core' },
  { id: 'quad-core', name: 'Quad-core', designCost: 575000, designTime: 173, unitCost: 43, performance: 220, stability: 12, build: 55, coreIndex: 5, researchId: 'quad-core' },
];

// Build quality affects:
// - Max clock: 50% quality = 66.66%, 100% quality = 103%
// - Build stat: 50% quality = 90%, 100% quality = 100%
// - Unit cost: scales with quality
export function buildQualityClockMultiplier(quality: number): number {
  // Linear interpolation: 50->0.6666, 100->1.03
  return 0.6666 + ((quality - 50) / 50) * (1.03 - 0.6666);
}

export function buildQualityBuildMultiplier(quality: number): number {
  // Linear interpolation: 50->0.9, 100->1.0
  return 0.9 + ((quality - 50) / 50) * 0.1;
}

export function buildQualityUnitCostMultiplier(quality: number): number {
  // Higher quality = higher unit cost; linear from 0.8 at 50% to 1.0 at 100%
  return 0.8 + ((quality - 50) / 50) * 0.2;
}

export function formatClock(kHz: number): string {
  if (kHz >= 1000000) return (kHz / 1000000).toFixed(2) + ' GHz';
  if (kHz >= 1000) return (kHz / 1000).toFixed(1) + ' MHz';
  return kHz + ' kHz';
}

export function getAvailableTechProcesses(completedResearch: string[]): TechProcess[] {
  const completed = new Set(completedResearch);
  // 15um is always available if cpu-dev is researched
  if (!completed.has('cpu-dev')) return [];
  const available: TechProcess[] = [TECH_PROCESSES[0]]; // 15um
  for (const tp of TECH_PROCESSES.slice(1)) {
    if (completed.has(tp.id)) {
      available.push(tp);
    }
  }
  return available;
}

export function getAvailablePackages(completedResearch: string[]): CPUPackage[] {
  const completed = new Set(completedResearch);
  return CPU_PACKAGES.filter((pkg) => completed.has(pkg.id));
}

export function getAvailableCores(completedResearch: string[], packageMaxCore: number): CoreType[] {
  const completed = new Set(completedResearch);
  return CORE_TYPES.filter((core) => {
    if (core.coreIndex > packageMaxCore) return false;
    if (core.researchId && !completed.has(core.researchId)) return false;
    return true;
  });
}

export interface CPUDesignResult {
  designCost: number;
  designTimeDays: number;
  unitCost: number;
  effectiveMaxClock: number;
}

export function calculateCPUDesign(
  pkg: CPUPackage,
  core: CoreType,
  techProcess: TechProcess,
  buildQuality: number,
  clockSpeed: number,
): CPUDesignResult {
  const designCost = pkg.designCost + core.designCost;
  const baseDesignTime = pkg.designTime + core.designTime;
  const designTimeDays = Math.round(baseDesignTime * (techProcess.designTimeMultiplier / 100));
  const effectiveMaxClock = Math.min(pkg.maxClock, techProcess.maxClock) * buildQualityClockMultiplier(buildQuality);

  // Unit cost scales with package, core, clock speed, tech process, and build quality
  const baseHardwareCost = (pkg.unitCost + core.unitCost) * buildQualityUnitCostMultiplier(buildQuality);
  // Clock speed adds cost — pushing clocks higher is expensive
  const clockRatio = clockSpeed / Math.max(1, techProcess.minClock);
  const clockCostMult = 1 + Math.log2(Math.max(1, clockRatio)) * 0.3;
  // Smaller process nodes cost more to fabricate
  const processIndex = TECH_PROCESSES.findIndex((tp) => tp.id === techProcess.id);
  const processCostMult = 1 + processIndex * 0.15;
  const unitCost = Math.round(baseHardwareCost * clockCostMult * processCostMult * 100) / 100;

  return { designCost, designTimeDays, unitCost, effectiveMaxClock };
}
