import { CPU_PACKAGES, CORE_TYPES, TECH_PROCESSES } from './cpuData';

export interface CompetitorCompany {
  id: string;
  name: string;
  color: string;
  initials: string;
  bgColor: string;
}

export interface CompetitorCPU {
  id: string;
  companyId: string;
  name: string;
  year: number;
  month: number; // 1-12
  clockKHz: number;
  packageId: string; // maps to cpuData package IDs
  coreId: string; // maps to cpuData core IDs
  techProcessId: string; // maps to cpuData tech process IDs
  price: number;
  architecture: string;
}

export const COMPETITOR_COMPANIES: CompetitorCompany[] = [
  { id: 'inlet', name: 'Inlet', color: '#0068B5', initials: 'IN', bgColor: '#0068B5' },
  { id: 'nic', name: 'NIC', color: '#CC0000', initials: 'NC', bgColor: '#CC0000' },
  { id: 'toshina', name: 'Toshina', color: '#E60012', initials: 'TS', bgColor: '#E60012' },
  { id: 'imd', name: 'IMD', color: '#00A859', initials: 'IM', bgColor: '#00A859' },
  { id: 'morotola', name: 'Morotola', color: '#003DA5', initials: 'MR', bgColor: '#003DA5' },
  { id: 'fastchild', name: 'Fastchild', color: '#FF6600', initials: 'FC', bgColor: '#FF6600' },
  { id: 'zelog', name: 'Zelog', color: '#008080', initials: 'ZL', bgColor: '#008080' },
  { id: 'element', name: 'Element', color: '#6B3FA0', initials: 'EL', bgColor: '#6B3FA0' },
  { id: 'iam', name: 'IAM', color: '#054ADA', initials: 'IA', bgColor: '#054ADA' },
  { id: 'sekkusu', name: 'Sekkusu', color: '#E91E63', initials: 'SK', bgColor: '#E91E63' },
];

// Package name mapping from wiki format to cpuData IDs
function pkgId(wikiPkg: string): string {
  // DIP14 -> 14-dip, PLCC72 -> 72-plcc, PGA96 -> 96-pga
  const m = wikiPkg.match(/^(DIP|PLCC|PGA)(\d+)$/);
  if (!m) return '32-dip';
  return `${m[2]}-${m[1].toLowerCase()}`;
}

// Core mapping
function coreId(wikiCore: string): string {
  switch (wikiCore) {
    case 'Single': return 'single';
    case 'Experimental dual': return 'exp-dual';
    case 'Basic dual': return 'basic-dual';
    case 'Dual': return 'dual-core';
    case 'Triple': return 'triple-core';
    case 'Quad': return 'quad-core';
    default: return 'single';
  }
}

// Tech process mapping
function techId(wikiTech: string): string {
  const map: Record<string, string> = {
    '10 \u00b5m': '10um', '6 \u00b5m': '6um', '3 \u00b5m': '3um',
    '1.5 \u00b5m': '1500nm', '1 \u00b5m': '1um', '800 nm': '800nm',
    '600 nm': '600nm', '350 nm': '350nm', '250 nm': '250nm',
    '180 nm': '180nm', '130 nm': '130nm', '90 nm': '90nm',
    '65 nm': '65nm', '45 nm': '45nm',
  };
  return map[wikiTech] || '10um';
}

// Raw data: [companyId, name, year, month, clockKHz, package, core, tech, price, architecture]
type RawCPU = [string, string, number, number, number, string, string, string, number, string];

const RAW_CPUS: RawCPU[] = [
  // 1971
  ['inlet', 'i4000', 1971, 1, 740, 'DIP14', 'Single', '10 \u00b5m', 62, 'i4000'],
  // 1972
  ['inlet', 'i8000', 1972, 4, 900, 'DIP18', 'Single', '10 \u00b5m', 75, 'i8000'],
  // 1973
  ['nic', 'COM4', 1973, 4, 1000, 'DIP32', 'Single', '10 \u00b5m', 65, 'COM-4'],
  ['toshina', 'TLCA12', 1973, 10, 1000, 'DIP18', 'Single', '6 \u00b5m', 72, 'TLCA'],
  // 1974
  ['inlet', 'i8800', 1974, 4, 1900, 'DIP32', 'Single', '6 \u00b5m', 85, 'i8800'],
  ['nic', 'COM8', 1974, 6, 2000, 'DIP32', 'Single', '6 \u00b5m', 80, 'COM-8'],
  ['imd', 'IM9800', 1974, 8, 1850, 'DIP32', 'Single', '6 \u00b5m', 79, 'i8800'],
  ['morotola', 'MC 6900', 1974, 11, 1800, 'DIP32', 'Single', '6 \u00b5m', 74, '6900'],
  // 1975
  ['toshina', 'TLCA121', 1975, 3, 1200, 'DIP18', 'Single', '6 \u00b5m', 62, 'TLCA'],
  ['fastchild', 'G6', 1975, 7, 1800, 'DIP48', 'Single', '6 \u00b5m', 65, 'G8'],
  // 1976
  ['inlet', 'i8808', 1976, 3, 3000, 'DIP48', 'Single', '3 \u00b5m', 90, 'i8808'],
  ['zelog', 'Z1', 1976, 6, 3500, 'DIP32', 'Single', '6 \u00b5m', 81, 'Z8800'],
  // 1977
  ['element', 'One EL3677', 1977, 4, 3680, 'DIP32', 'Single', '6 \u00b5m', 70, 'CE'],
  ['fastchild', 'F9440', 1977, 10, 4800, 'DIP48', 'Single', '3 \u00b5m', 120, 'F16'],
  // 1978
  ['inlet', '16i 1600', 1978, 6, 5000, 'DIP48', 'Single', '3 \u00b5m', 105, '16x'],
  ['element', 'One EL4400', 1978, 10, 4400, 'DIP56', 'Single', '3 \u00b5m', 70, 'CE'],
  ['nic', 'COM16', 1978, 12, 4250, 'DIP64', 'Single', '3 \u00b5m', 87, 'COM-16'],
  // 1979
  ['zelog', 'Z100', 1979, 2, 4600, 'DIP64', 'Single', '3 \u00b5m', 90, 'Z100'],
  ['iam', 'M EPU', 1979, 7, 5220, 'PLCC72', 'Single', '3 \u00b5m', 150, 'RIMM'],
  ['morotola', 'MC 69000', 1979, 12, 6500, 'DIP56', 'Single', '3 \u00b5m', 100, '69000'],
  // 1980
  ['element', 'Cost EL4780', 1980, 8, 4780, 'PLCC56', 'Single', '3 \u00b5m', 70, 'CE'],
  // 1981
  ['sekkusu', 'IN P645600', 1981, 2, 5600, 'PLCC64', 'Single', '3 \u00b5m', 96, 'IN'],
  ['element', 'Cost EL5300', 1981, 5, 5300, 'PLCC64', 'Single', '1.5 \u00b5m', 75, 'CE'],
  ['iam', 'M EPU II', 1981, 10, 10000, 'PLCC116', 'Single', '1.5 \u00b5m', 170, 'RIMM II'],
  // 1982
  ['inlet', '16i 1616', 1982, 1, 11600, 'PLCC96', 'Single', '3 \u00b5m', 150, '16x'],
  ['inlet', '16i 1632', 1982, 4, 12000, 'PGA96', 'Single', '1.5 \u00b5m', 150, '16x'],
  ['morotola', 'MC 69001', 1982, 9, 8300, 'DIP72', 'Single', '1.5 \u00b5m', 105, '69000'],
  // 1984
  ['nic', 'W20', 1984, 3, 10000, 'DIP48', 'Single', '3 \u00b5m', 110, 'W20 ISA'],
  ['morotola', 'MC 69002', 1984, 11, 13000, 'PGA112', 'Single', '1.5 \u00b5m', 135, '69000'],
  // 1985
  ['inlet', '32i 3200', 1985, 10, 23000, 'PGA136', 'Single', '1 \u00b5m', 175, '32x'],
  // 1986
  ['zelog', 'Z1000', 1986, 1, 18800, 'PLCC96', 'Single', '1 \u00b5m', 128, 'Z32x'],
  ['nic', 'W60', 1986, 2, 16000, 'PGA136', 'Single', '1.5 \u00b5m', 145, 'W60'],
  ['fastchild', 'CC100', 1986, 7, 24000, 'PLCC136', 'Single', '1 \u00b5m', 155, 'Cipper'],
  // 1987
  ['morotola', 'MC 69003', 1987, 6, 23300, 'PGA136', 'Single', '1 \u00b5m', 135, '69000'],
  ['nic', 'W70', 1987, 8, 20000, 'PGA136', 'Single', '1.5 \u00b5m', 160, 'W60'],
  ['sekkusu', 'IN P13624550', 1987, 11, 24550, 'PLCC136', 'Single', '1 \u00b5m', 119, 'IN'],
  // 1988
  ['fastchild', 'CC300', 1988, 3, 29000, 'PLCC136', 'Single', '1 \u00b5m', 162, 'Cipper'],
  // 1989
  ['nic', 'W80', 1989, 2, 33000, 'PGA224', 'Single', '800 nm', 180, 'W60'],
  ['inlet', '32i 3232', 1989, 4, 39000, 'PGA176', 'Single', '800 nm', 185, '32x'],
  // 1990
  ['morotola', 'MC 69004', 1990, 4, 31000, 'PGA176', 'Single', '1 \u00b5m', 145, '69000'],
  ['element', 'Cost+ E-28', 1990, 7, 28000, 'PGA176', 'Single', '800 nm', 110, 'CE+'],
  ['fastchild', 'CC400', 1990, 9, 35000, 'PGA224', 'Single', '800 nm', 150, 'Cipper'],
  // 1991
  ['imd', 'IM3200', 1991, 4, 47000, 'PGA200', 'Single', '800 nm', 150, '32x'],
  // 1993
  ['inlet', 'Tetrum 4', 1993, 5, 56000, 'PGA248', 'Single', '600 nm', 195, '32x'],
  // 1994
  ['morotola', 'MC 69006', 1994, 4, 50000, 'PGA200', 'Single', '600 nm', 145, '69000'],
  ['iam', 'M EPU III', 1994, 8, 52000, 'PGA320', 'Single', '800 nm', 235, 'RIMM III'],
  // 1995
  ['sekkusu', 'PGA24875000', 1995, 5, 75000, 'PGA248', 'Single', '600 nm', 155, 'IN32'],
  ['inlet', 'Tetrum 4 Pro', 1995, 12, 110000, 'PGA320', 'Single', '350 nm', 205, '32x'],
  // 1996
  ['imd', 'K5', 1996, 4, 107500, 'PGA320', 'Single', '350 nm', 175, '32x'],
  ['element', 'Cost+ E-81', 1996, 9, 81000, 'PGA248', 'Single', '600 nm', 155, 'CE+2'],
  // 1997
  ['iam', 'RA64/S', 1997, 1, 170000, 'PGA320', 'Single', '350 nm', 255, 'RA 64'],
  ['imd', 'K6', 1997, 4, 197000, 'PGA320', 'Single', '250 nm', 189, '32x'],
  ['inlet', 'Tetrum 5', 1997, 6, 216000, 'PGA320', 'Single', '250 nm', 210, '32x'],
  // 1998
  ['morotola', 'AIM PWR008', 1998, 3, 166000, 'PGA320', 'Single', '350 nm', 170, 'PWRISA'],
  ['iam', 'RA64/II', 1998, 11, 200000, 'PGA380', 'Single', '350 nm', 270, 'RA 64'],
  // 1999
  ['inlet', 'Tetrum 6', 1999, 2, 450000, 'PGA456', 'Single', '250 nm', 220, '32x'],
  ['imd', 'Attlon 7', 1999, 7, 500000, 'PGA456', 'Single', '250 nm', 215, '32x'],
  // 2000
  ['iam', 'RA64/III', 2000, 4, 550000, 'PGA618', 'Single', '180 nm', 300, 'RA 64'],
  ['inlet', 'Tetrum 7', 2000, 11, 1100000, 'PGA544', 'Single', '180 nm', 230, '32x'],
  // 2001
  ['imd', 'Attlon XP', 2001, 5, 1330000, 'PGA544', 'Single', '180 nm', 225, '32x'],
  ['iam', 'PWR4', 2001, 9, 1000000, 'PGA754', 'Experimental dual', '180 nm', 300, 'PWRPC'],
  // 2002
  ['element', 'EZ990', 2002, 8, 990000, 'PGA456', 'Single', '130 nm', 160, 'PWRPC'],
  // 2003
  ['imd', 'Attlon 64', 2003, 9, 2200000, 'PGA754', 'Single', '130 nm', 220, '64x'],
  // 2004
  ['iam', 'PWR5', 2004, 4, 1900000, 'PGA940', 'Basic dual', '130 nm', 315, 'PWR'],
  // 2005
  ['inlet', 'Tetrum D', 2005, 5, 3000000, 'PGA754', 'Experimental dual', '90 nm', 250, '64x'],
  ['imd', 'Attlon 64 X2', 2005, 7, 2300000, 'PGA940', 'Basic dual', '90 nm', 259, '64x'],
  ['iam', 'XCPU Zenon', 2005, 11, 3200000, 'PGA940', 'Triple', '90 nm', 300, 'PWRPC'],
  // 2006
  ['inlet', 'Crux 2 Dual', 2006, 7, 2670000, 'PGA754', 'Dual', '65 nm', 245, '64x'],
  ['iam', 'SELL BE', 2006, 10, 3200000, 'PGA1207', 'Single', '90 nm', 295, 'PWRCELL'],
  // 2007
  ['iam', 'PWR6', 2007, 6, 3700000, 'PGA1207', 'Dual', '65 nm', 335, 'PWR'],
  ['imd', 'Phenomena I', 2007, 11, 2600000, 'PGA940', 'Quad', '65 nm', 260, '64x'],
  // 2008
  ['inlet', 'Atmos Silverthorn', 2008, 4, 1500000, 'PGA618', 'Single', '45 nm', 122, '32x'],
  ['inlet', 'Crux i7', 2008, 11, 2660000, 'PGA1366', 'Quad', '45 nm', 270, '64x'],
  // 2009
  ['imd', 'Phenomena II', 2009, 1, 3700000, 'PGA940', 'Quad', '45 nm', 269, '64x'],
];

export const COMPETITOR_CPUS: CompetitorCPU[] = RAW_CPUS.map((r, i) => ({
  id: `comp-${i}`,
  companyId: r[0],
  name: r[1],
  year: r[2],
  month: r[3],
  clockKHz: r[4],
  packageId: pkgId(r[5]),
  coreId: coreId(r[6]),
  techProcessId: techId(r[7]),
  price: r[8],
  architecture: r[9],
}));

// Compute stats for a competitor CPU using the same system as player CPUs
export function getCompetitorStats(cpu: CompetitorCPU): { performance: number; stability: number; build: number; unitCost: number } {
  const pkg = CPU_PACKAGES.find(p => p.id === cpu.packageId);
  const core = CORE_TYPES.find(c => c.id === cpu.coreId);
  const tech = TECH_PROCESSES.find(t => t.id === cpu.techProcessId);

  if (!pkg || !core) {
    // Fallback: estimate from price and year
    const eraPerf = (cpu.year - 1970) * 3 + 10;
    return { performance: eraPerf, stability: 15, build: eraPerf * 0.6, unitCost: cpu.price * 0.4 };
  }

  const performance = Math.round(pkg.performance + core.performance);
  const stability = Math.round(pkg.stability + core.stability);
  // Competitors have ~75% build quality
  const buildMult = 0.95;
  const build = Math.round((pkg.build + core.build) * buildMult * 10) / 10;

  // Unit cost: approximate from package + core costs
  const processIndex = tech ? TECH_PROCESSES.indexOf(tech) : 0;
  const processCostMult = 1 + processIndex * 0.15;
  const unitCost = Math.round((pkg.unitCost + core.unitCost) * processCostMult * 0.9 * 100) / 100;

  return { performance, stability, build, unitCost };
}

// Generate a simple SVG logo for a competitor company
export function generateCompanyLogoSvg(company: CompetitorCompany): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="${company.bgColor}"/><text x="32" y="32" text-anchor="middle" dominant-baseline="central" fill="white" font-size="22" font-weight="bold" font-family="sans-serif">${company.initials}</text></svg>`;
}

export function getCompanyById(id: string): CompetitorCompany | undefined {
  return COMPETITOR_COMPANIES.find(c => c.id === id);
}
