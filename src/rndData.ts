export interface ResearchItem {
  id: string;
  name: string;
  cost: number;
  researchPoints: number;
  requiredExp: number;
  minYear: number;
  x: number;
  category: 'package' | 'clock' | 'multicore' | 'process';
  prerequisite?: string; // ID of required tech
}

// CPU Research: packages, clock speeds, multi-core
export const CPU_RESEARCH: ResearchItem[] = [
  // --- Starting research ---
  { id: 'cpu-dev', name: 'CPU Development', cost: 5000, researchPoints: 100, requiredExp: 0, minYear: 0, x: 1, category: 'clock' },

  // --- Packages (DIP) ---
  { id: '14-dip', name: '14 pin DIP', cost: 0, researchPoints: 0, requiredExp: 0, minYear: 0, x: 2.2, category: 'package', prerequisite: 'cpu-dev' },
  { id: '18-dip', name: '18 pin DIP', cost: 7200, researchPoints: 76, requiredExp: 0, minYear: 0, x: 3.4, category: 'package', prerequisite: '14-dip' },
  { id: '24-dip', name: '24 pin DIP', cost: 13000, researchPoints: 90, requiredExp: 20, minYear: 0, x: 4.6, category: 'package', prerequisite: '18-dip' },
  { id: '32-dip', name: '32 pin DIP', cost: 16500, researchPoints: 110, requiredExp: 77, minYear: 1971, x: 6.5, category: 'package', prerequisite: '24-dip' },
  { id: '48-dip', name: '48 pin DIP', cost: 22000, researchPoints: 140, requiredExp: 110, minYear: 1972, x: 8.1, category: 'package', prerequisite: '32-dip' },
  { id: '56-dip', name: '56 pin DIP', cost: 26000, researchPoints: 155, requiredExp: 150, minYear: 1975, x: 10, category: 'package', prerequisite: '48-dip' },
  { id: '64-dip', name: '64 pin DIP', cost: 29000, researchPoints: 175, requiredExp: 190, minYear: 1975, x: 11.5, category: 'package', prerequisite: '56-dip' },
  { id: '72-dip', name: '72 pin DIP', cost: 33000, researchPoints: 200, requiredExp: 220, minYear: 1977, x: 13, category: 'package', prerequisite: '64-dip' },

  // --- Packages (PLCC) ---
  { id: '24-plcc', name: '24 pin PLCC', cost: 35000, researchPoints: 200, requiredExp: 180, minYear: 1973, x: 8.1, category: 'package', prerequisite: '48-dip' },
  { id: '32-plcc', name: '32 pin PLCC', cost: 35000, researchPoints: 140, requiredExp: 200, minYear: 1974, x: 9.4, category: 'package', prerequisite: '24-plcc' },
  { id: '48-plcc', name: '48 pin PLCC', cost: 35000, researchPoints: 155, requiredExp: 210, minYear: 1975, x: 10.8, category: 'package', prerequisite: '32-plcc' },
  { id: '56-plcc', name: '56 pin PLCC', cost: 36000, researchPoints: 175, requiredExp: 235, minYear: 1976, x: 12.2, category: 'package', prerequisite: '48-plcc' },
  { id: '64-plcc', name: '64 pin PLCC', cost: 38000, researchPoints: 205, requiredExp: 260, minYear: 1977, x: 13.6, category: 'package', prerequisite: '56-plcc' },
  { id: '72-plcc', name: '72 pin PLCC', cost: 43000, researchPoints: 230, requiredExp: 287, minYear: 1977, x: 15.1, category: 'package', prerequisite: '64-plcc' },
  { id: '84-plcc', name: '84 pin PLCC', cost: 48000, researchPoints: 240, requiredExp: 315, minYear: 1978, x: 16.7, category: 'package', prerequisite: '72-plcc' },
  { id: '96-plcc', name: '96 pin PLCC', cost: 51000, researchPoints: 250, requiredExp: 345, minYear: 1979, x: 18.6, category: 'package', prerequisite: '84-plcc' },
  { id: '116-plcc', name: '116 pin PLCC', cost: 58000, researchPoints: 262, requiredExp: 400, minYear: 1980, x: 20.2, category: 'package', prerequisite: '96-plcc' },
  { id: '136-plcc', name: '136 pin PLCC', cost: 66000, researchPoints: 270, requiredExp: 440, minYear: 1982, x: 21.8, category: 'package', prerequisite: '116-plcc' },
  { id: '156-plcc', name: '156 pin PLCC', cost: 75000, researchPoints: 290, requiredExp: 500, minYear: 1983, x: 23.3, category: 'package', prerequisite: '136-plcc' },
  { id: '182-plcc', name: '182 pin PLCC', cost: 80000, researchPoints: 305, requiredExp: 570, minYear: 1985, x: 24.9, category: 'package', prerequisite: '156-plcc' },
  { id: '208-plcc', name: '208 pin PLCC', cost: 85000, researchPoints: 328, requiredExp: 615, minYear: 1986, x: 26.6, category: 'package', prerequisite: '182-plcc' },
  { id: '240-plcc', name: '240 pin PLCC', cost: 91000, researchPoints: 350, requiredExp: 680, minYear: 1987, x: 28.2, category: 'package', prerequisite: '208-plcc' },

  // --- Packages (PGA) ---
  { id: '48-pga', name: '48 pin PGA', cost: 90000, researchPoints: 280, requiredExp: 430, minYear: 1979, x: 16.7, category: 'package', prerequisite: '84-plcc' },
  { id: '60-pga', name: '60 pin PGA', cost: 130000, researchPoints: 200, requiredExp: 440, minYear: 1979, x: 18.1, category: 'package', prerequisite: '48-pga' },
  { id: '78-pga', name: '78 pin PGA', cost: 145000, researchPoints: 210, requiredExp: 490, minYear: 1980, x: 19.5, category: 'package', prerequisite: '60-pga' },
  { id: '96-pga', name: '96 pin PGA', cost: 150000, researchPoints: 250, requiredExp: 505, minYear: 1981, x: 21, category: 'package', prerequisite: '78-pga' },
  { id: '112-pga', name: '112 pin PGA', cost: 150000, researchPoints: 275, requiredExp: 560, minYear: 1982, x: 22.6, category: 'package', prerequisite: '96-pga' },
  { id: '136-pga', name: '136 pin PGA', cost: 150000, researchPoints: 300, requiredExp: 580, minYear: 1982, x: 24.2, category: 'package', prerequisite: '112-pga' },
  { id: '152-pga', name: '152 pin PGA', cost: 125000, researchPoints: 330, requiredExp: 630, minYear: 1984, x: 25.7, category: 'package', prerequisite: '136-pga' },
  { id: '176-pga', name: '176 pin PGA', cost: 129000, researchPoints: 355, requiredExp: 660, minYear: 1985, x: 27.3, category: 'package', prerequisite: '152-pga' },
  { id: '200-pga', name: '200 pin PGA', cost: 135000, researchPoints: 375, requiredExp: 700, minYear: 1986, x: 28.9, category: 'package', prerequisite: '176-pga' },
  { id: '224-pga', name: '224 pin PGA', cost: 144000, researchPoints: 400, requiredExp: 730, minYear: 1987, x: 30.4, category: 'package', prerequisite: '200-pga' },
  { id: '248-pga', name: '248 pin PGA', cost: 160000, researchPoints: 425, requiredExp: 780, minYear: 1988, x: 31.9, category: 'package', prerequisite: '224-pga' },
  { id: '282-pga', name: '282 pin PGA', cost: 162800, researchPoints: 450, requiredExp: 830, minYear: 1990, x: 33.5, category: 'package', prerequisite: '248-pga' },
  { id: '320-pga', name: '320 pin PGA', cost: 175000, researchPoints: 480, requiredExp: 885, minYear: 1992, x: 35, category: 'package', prerequisite: '282-pga' },
  { id: '380-pga', name: '380 pin PGA', cost: 181000, researchPoints: 500, requiredExp: 930, minYear: 1994, x: 36.4, category: 'package', prerequisite: '320-pga' },
  { id: '456-pga', name: '456 pin PGA', cost: 170000, researchPoints: 520, requiredExp: 977, minYear: 1996, x: 38, category: 'package', prerequisite: '380-pga' },
  { id: '544-pga', name: '544 pin PGA', cost: 173000, researchPoints: 510, requiredExp: 1010, minYear: 1998, x: 39.8, category: 'package', prerequisite: '456-pga' },
  { id: '618-pga', name: '618 pin PGA', cost: 180000, researchPoints: 515, requiredExp: 1044, minYear: 1999, x: 41.7, category: 'package', prerequisite: '544-pga' },
  { id: '754-pga', name: '754 pin PGA', cost: 190000, researchPoints: 525, requiredExp: 1090, minYear: 2001, x: 44.2, category: 'package', prerequisite: '618-pga' },
  { id: '870-pga', name: '870 pin PGA', cost: 197000, researchPoints: 542, requiredExp: 1114, minYear: 2002, x: 47, category: 'package', prerequisite: '754-pga' },
  { id: '940-pga', name: '940 pin PGA', cost: 207000, researchPoints: 555, requiredExp: 1220, minYear: 2004, x: 50, category: 'package', prerequisite: '870-pga' },
  { id: '1086-pga', name: '1086 pin PGA', cost: 250000, researchPoints: 570, requiredExp: 1284, minYear: 2005, x: 55, category: 'package', prerequisite: '940-pga' },
  { id: '1207-pga', name: '1207 pin PGA', cost: 275000, researchPoints: 586, requiredExp: 1340, minYear: 2006, x: 58, category: 'package', prerequisite: '1086-pga' },
  { id: '1366-pga', name: '1366 pin PGA', cost: 300000, researchPoints: 600, requiredExp: 1400, minYear: 2007, x: 60, category: 'package', prerequisite: '1207-pga' },

  // --- Clock speeds ---
  { id: '200khz', name: '200kHz max clock', cost: 0, researchPoints: 0, requiredExp: 0, minYear: 0, x: 2.2, category: 'clock', prerequisite: 'cpu-dev' },
  { id: '400khz', name: '400kHz max clock', cost: 3000, researchPoints: 60, requiredExp: 0, minYear: 0, x: 3.4, category: 'clock', prerequisite: '200khz' },
  { id: '750khz', name: '750kHz max clock', cost: 10000, researchPoints: 70, requiredExp: 20, minYear: 0, x: 4.7, category: 'clock', prerequisite: '400khz' },
  { id: '900khz', name: '900kHz max clock', cost: 12000, researchPoints: 90, requiredExp: 46, minYear: 1971, x: 6.4, category: 'clock', prerequisite: '750khz' },
  { id: '1500khz', name: '1.5MHz max clock', cost: 16000, researchPoints: 120, requiredExp: 96, minYear: 1972, x: 9.2, category: 'clock', prerequisite: '900khz' },
  { id: '2500khz', name: '2.5MHz max clock', cost: 23000, researchPoints: 160, requiredExp: 145, minYear: 1974, x: 11, category: 'clock', prerequisite: '1500khz' },
  { id: '4mhz', name: '4MHz max clock', cost: 30000, researchPoints: 205, requiredExp: 210, minYear: 1976, x: 12.6, category: 'clock', prerequisite: '2500khz' },
  { id: '6500khz', name: '6.5MHz max clock', cost: 40000, researchPoints: 255, requiredExp: 270, minYear: 1977, x: 14, category: 'clock', prerequisite: '4mhz' },
  { id: '9mhz', name: '9MHz max clock', cost: 52000, researchPoints: 295, requiredExp: 310, minYear: 1977, x: 15.9, category: 'clock', prerequisite: '6500khz' },
  { id: '12mhz', name: '12MHz max clock', cost: 64000, researchPoints: 345, requiredExp: 375, minYear: 1979, x: 17.6, category: 'clock', prerequisite: '9mhz' },
  { id: '15mhz', name: '15MHz max clock', cost: 80000, researchPoints: 380, requiredExp: 480, minYear: 1981, x: 19.2, category: 'clock', prerequisite: '12mhz' },
  { id: '20mhz', name: '20MHz max clock', cost: 105000, researchPoints: 425, requiredExp: 530, minYear: 1983, x: 21.2, category: 'clock', prerequisite: '15mhz' },
  { id: '25mhz', name: '25MHz max clock', cost: 125000, researchPoints: 460, requiredExp: 580, minYear: 1984, x: 22.9, category: 'clock', prerequisite: '20mhz' },
  { id: '30mhz', name: '30MHz max clock', cost: 150000, researchPoints: 485, requiredExp: 700, minYear: 1986, x: 24.4, category: 'clock', prerequisite: '25mhz' },
  { id: '35mhz', name: '35MHz max clock', cost: 195000, researchPoints: 490, requiredExp: 780, minYear: 1987, x: 25.8, category: 'clock', prerequisite: '30mhz' },
  { id: '40mhz', name: '40MHz max clock', cost: 212000, researchPoints: 500, requiredExp: 810, minYear: 1989, x: 26.8, category: 'clock', prerequisite: '35mhz' },
  { id: '48mhz', name: '48MHz max clock', cost: 225000, researchPoints: 510, requiredExp: 840, minYear: 1989, x: 28, category: 'clock', prerequisite: '40mhz' },
  { id: '60mhz', name: '60MHz max clock', cost: 250000, researchPoints: 555, requiredExp: 866, minYear: 1991, x: 29.4, category: 'clock', prerequisite: '48mhz' },
  { id: '70mhz', name: '70MHz max clock', cost: 277000, researchPoints: 590, requiredExp: 920, minYear: 1993, x: 31.2, category: 'clock', prerequisite: '60mhz' },
  { id: '95mhz', name: '95MHz max clock', cost: 294000, researchPoints: 630, requiredExp: 955, minYear: 1994, x: 32.7, category: 'clock', prerequisite: '70mhz' },
  { id: '130mhz', name: '130MHz max clock', cost: 312000, researchPoints: 675, requiredExp: 1040, minYear: 1995, x: 34.5, category: 'clock', prerequisite: '95mhz' },
  { id: '210mhz', name: '210MHz max clock', cost: 333000, researchPoints: 705, requiredExp: 1060, minYear: 1996, x: 36.2, category: 'clock', prerequisite: '130mhz' },
  { id: '335mhz', name: '335MHz max clock', cost: 349000, researchPoints: 750, requiredExp: 1090, minYear: 1997, x: 37.9, category: 'clock', prerequisite: '210mhz' },
  { id: '486mhz', name: '486MHz max clock', cost: 380000, researchPoints: 795, requiredExp: 1116, minYear: 1998, x: 39.7, category: 'clock', prerequisite: '335mhz' },
  { id: '760mhz', name: '760MHz max clock', cost: 415000, researchPoints: 850, requiredExp: 1200, minYear: 1999, x: 41.5, category: 'clock', prerequisite: '486mhz' },
  { id: '1100mhz', name: '1.1GHz max clock', cost: 440000, researchPoints: 910, requiredExp: 1230, minYear: 2000, x: 43.5, category: 'clock', prerequisite: '760mhz' },
  { id: '1400mhz', name: '1.4GHz max clock', cost: 520000, researchPoints: 920, requiredExp: 1290, minYear: 2000, x: 45.2, category: 'clock', prerequisite: '1100mhz' },
  { id: '1800mhz', name: '1.8GHz max clock', cost: 310000, researchPoints: 910, requiredExp: 1320, minYear: 2001, x: 46.9, category: 'clock', prerequisite: '1400mhz' },
  { id: '2100mhz', name: '2.1GHz max clock', cost: 300000, researchPoints: 920, requiredExp: 1340, minYear: 2002, x: 48.5, category: 'clock', prerequisite: '1800mhz' },
  { id: '2500mhz', name: '2.5GHz max clock', cost: 700000, researchPoints: 920, requiredExp: 1365, minYear: 2002, x: 50, category: 'clock', prerequisite: '2100mhz' },
  { id: '2700mhz', name: '2.7GHz max clock', cost: 320000, researchPoints: 930, requiredExp: 1406, minYear: 2003, x: 51.8, category: 'clock', prerequisite: '2500mhz' },
  { id: '3000mhz', name: '3GHz max clock', cost: 250000, researchPoints: 950, requiredExp: 1420, minYear: 2003, x: 53.2, category: 'clock', prerequisite: '2700mhz' },
  { id: '3400mhz', name: '3.4GHz max clock', cost: 340000, researchPoints: 990, requiredExp: 1456, minYear: 2004, x: 54.8, category: 'clock', prerequisite: '3000mhz' },
  { id: '3800mhz', name: '3.8GHz max clock', cost: 390000, researchPoints: 1010, requiredExp: 1480, minYear: 2005, x: 56.5, category: 'clock', prerequisite: '3400mhz' },
  { id: '4000mhz', name: '4GHz max clock', cost: 442000, researchPoints: 1040, requiredExp: 1540, minYear: 2006, x: 58.2, category: 'clock', prerequisite: '3800mhz' },

  // --- Multi-core ---
  { id: 'exp-dual', name: 'Experimental dual-core', cost: 500000, researchPoints: 800, requiredExp: 1090, minYear: 1998, x: 39, category: 'multicore', prerequisite: '180nm' },
  { id: 'basic-dual', name: 'Basic dual-core', cost: 430000, researchPoints: 900, requiredExp: 1160, minYear: 2000, x: 42.1, category: 'multicore', prerequisite: 'exp-dual' },
  { id: 'dual-core', name: 'Dual-core', cost: 520000, researchPoints: 1050, requiredExp: 1440, minYear: 2002, x: 46.6, category: 'multicore', prerequisite: 'basic-dual' },
  { id: 'triple-core', name: 'Triple-core', cost: 900000, researchPoints: 1070, requiredExp: 1500, minYear: 2005, x: 57, category: 'multicore', prerequisite: 'dual-core' },
  { id: 'quad-core', name: 'Quad-core', cost: 700000, researchPoints: 1030, requiredExp: 1637, minYear: 2006, x: 60.4, category: 'multicore', prerequisite: 'triple-core' },
];

// Technology Research: process nodes
export const TECH_RESEARCH: ResearchItem[] = [
  { id: '10um', name: '10 \u00b5m process', cost: 5000, researchPoints: 100, requiredExp: 0, minYear: 0, x: 1, category: 'process' },
  { id: '6um', name: '6 \u00b5m process', cost: 10000, researchPoints: 240, requiredExp: 110, minYear: 1973, x: 2.5, category: 'process', prerequisite: '10um' },
  { id: '3um', name: '3 \u00b5m process', cost: 18000, researchPoints: 300, requiredExp: 260, minYear: 1975, x: 4, category: 'process', prerequisite: '6um' },
  { id: '1500nm', name: '1.5 \u00b5m process', cost: 40000, researchPoints: 380, requiredExp: 420, minYear: 1981, x: 5.5, category: 'process', prerequisite: '3um' },
  { id: '1um', name: '1 \u00b5m process', cost: 60000, researchPoints: 440, requiredExp: 510, minYear: 1983, x: 7, category: 'process', prerequisite: '1500nm' },
  { id: '800nm', name: '800 nm process', cost: 104000, researchPoints: 496, requiredExp: 650, minYear: 1986, x: 8.5, category: 'process', prerequisite: '1um' },
  { id: '600nm', name: '600 nm process', cost: 140000, researchPoints: 560, requiredExp: 760, minYear: 1990, x: 10, category: 'process', prerequisite: '800nm' },
  { id: '350nm', name: '350 nm process', cost: 170000, researchPoints: 580, requiredExp: 900, minYear: 1993, x: 11.5, category: 'process', prerequisite: '600nm' },
  { id: '250nm', name: '250 nm process', cost: 200000, researchPoints: 620, requiredExp: 1010, minYear: 1996, x: 13, category: 'process', prerequisite: '350nm' },
  { id: '180nm', name: '180 nm process', cost: 222000, researchPoints: 680, requiredExp: 1078, minYear: 1999, x: 14.5, category: 'process', prerequisite: '250nm' },
  { id: '130nm', name: '130 nm process', cost: 260000, researchPoints: 780, requiredExp: 1190, minYear: 2001, x: 16, category: 'process', prerequisite: '180nm' },
  { id: '90nm', name: '90 nm process', cost: 290000, researchPoints: 895, requiredExp: 1300, minYear: 2003, x: 17.5, category: 'process', prerequisite: '130nm' },
  { id: '65nm', name: '65 nm process', cost: 322000, researchPoints: 955, requiredExp: 1434, minYear: 2005, x: 19, category: 'process', prerequisite: '90nm' },
  { id: '45nm', name: '45 nm process', cost: 380000, researchPoints: 1010, requiredExp: 1600, minYear: 2007, x: 20.5, category: 'process', prerequisite: '65nm' },
  { id: 'multi-enhance', name: 'Multi-core enhancement', cost: 885000, researchPoints: 900, requiredExp: 1800, minYear: 2008, x: 21.5, category: 'process', prerequisite: 'dual-core' },
];

export function getNextUnlocks(
  completedResearch: string[],
  cpuExperience: number,
  currentYear: number,
  researchList: ResearchItem[],
): ResearchItem[] {
  const completed = new Set(completedResearch);

  return researchList.filter((item) => {
    if (completed.has(item.id)) return false;
    if (item.requiredExp > cpuExperience) return false;
    if (item.minYear > 0 && item.minYear > currentYear) return false;
    if (item.prerequisite && !completed.has(item.prerequisite)) return false;
    // For items with cost 0, they auto-unlock with their prerequisite
    if (item.cost === 0 && item.prerequisite && completed.has(item.prerequisite)) return true;
    return true;
  });
}

export const MAX_RESEARCH_BUDGET = 20_000;

export function getMaxResearchBudget(currentYear: number): number {
  if (currentYear <= 1970) return 800;
  const yearsElapsed = Math.max(0, currentYear - 1970);
  return Math.min(MAX_RESEARCH_BUDGET, 800 + yearsElapsed * 500);
}

// RP/day formula: $175/day = 1 RP/day, $500/day = 2.27 RP/day (from wiki)
export function rpPerDay(budget: number): number {
  if (budget <= 0) return 0;
  return Math.pow(budget / 175, 0.78);
}

export function getRecentlyCompleted(
  completedResearch: string[],
  researchList: ResearchItem[],
): ResearchItem[] {
  const completed = new Set(completedResearch);
  return researchList.filter((item) => completed.has(item.id));
}
