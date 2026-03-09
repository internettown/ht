export type Difficulty = 'easy' | 'normal' | 'hard' | 'veryhard';

export interface LogoConfig {
  shape: string;
  bgColor: string;
  iconChar: string;
  iconColor: string;
  borderColor: string;
  borderWidth: string;
  iconSize: number;
  rotation: number;
  text: string;
  textColor: string;
  showText: boolean;
}

export interface ResearchState {
  completedResearch: string[]; // IDs of completed research
  currentResearch: string | null; // ID of currently researching tech
  currentResearchPoints: number; // points accumulated so far
  researchQueue: string[]; // IDs of queued research items
  dailyBudget: number; // daily R&D budget
  cpuExperience: number; // accumulated CPU experience
}

export interface BankState {
  loanBalance: number; // current outstanding loan (principal + interest)
  loanPrincipal: number; // total principal borrowed (excludes interest)
  loanTakenDate: string | null; // ISO date when loan was taken
  yearlyIncome: number; // income accumulated this fiscal year
  taxDue: number; // tax owed from last year
  taxYear: number; // the year the taxDue applies to (0 = none yet)
  autoPayTax: boolean; // automatically pay tax on Jan 1
  taxPaidThisYear: boolean; // whether tax for taxYear has been paid
  bailoutOwed: number; // bailout debt
}

export const DEFAULT_BANK: BankState = {
  loanBalance: 0,
  loanPrincipal: 0,
  loanTakenDate: null,
  yearlyIncome: 0,
  taxDue: 0,
  taxYear: 0,
  autoPayTax: true,
  taxPaidThisYear: true,
  bailoutOwed: 0,
};

export const MAX_LOAN_BASE = 500_000;

export const MAX_LOAN_YEARLY_INCREASE: Record<Difficulty, number> = {
  easy: 200_000,
  normal: 100_000,
  hard: 50_000,
  veryhard: 25_000,
};

export const TAX_RATE = 0.30;
export const LOAN_INTEREST_RATE = 0.02; // 2% per month
export const TAX_LATE_PENALTY = 0.33; // 33% penalty on unpaid tax

export interface CPUProduct {
  id: string;
  name: string;
  brand: string;
  techProcessId: string;
  packageId: string;
  coreId: string;
  clockSpeed: number; // kHz
  buildQuality: number; // 50-100
  price: number;
  unitCost: number;
  designCost: number;
  designTimeDays: number;
  designStartDate: string; // ISO date
  status: 'designing' | 'selling' | 'discontinued';
  designDaysCompleted: number;
  totalUnitsSold: number;
  totalRevenue: number;
  sellStartDate: string | null; // ISO date when it went on sale
  salesHistory: number[]; // daily units sold, most recent last
  daysOnSale: number;
  salesBoost: number; // temporary multiplier from price drops, decays over time
  previousPrice: number; // to detect price changes
  // Computed stats stored at creation
  performance: number;
  stability: number;
  build: number;
}

export interface Transaction {
  date: string; // ISO date
  type: 'income' | 'expense';
  category: string; // e.g. 'CPU Sales', 'R&D', 'Tax', 'Loan Interest', 'Design Cost'
  description: string;
  amount: number; // always positive
}

export interface MonthlySnapshot {
  year: number;
  month: number; // 0-11
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface FinanceState {
  transactions: Transaction[]; // recent transactions (keep last ~365 days)
  monthlySnapshots: MonthlySnapshot[];
}

export const DEFAULT_FINANCE: FinanceState = {
  transactions: [],
  monthlySnapshots: [],
};

export type AdType = 'flyers' | 'posters' | 'magazines' | 'billboards' | 'tv_ads' | 'internet_ads';
export type Continent = 'north_america' | 'south_america' | 'europe' | 'asia' | 'africa' | 'oceania';

export const AD_TYPES: { id: AdType; name: string; costMultiplier: number; hypeMultiplier: number }[] = [
  { id: 'flyers', name: 'Flyers', costMultiplier: 0.5, hypeMultiplier: 0.3 },
  { id: 'posters', name: 'Posters', costMultiplier: 0.7, hypeMultiplier: 0.5 },
  { id: 'magazines', name: 'Magazines', costMultiplier: 1.0, hypeMultiplier: 0.8 },
  { id: 'billboards', name: 'Billboards', costMultiplier: 1.5, hypeMultiplier: 1.0 },
  { id: 'tv_ads', name: 'TV Ads', costMultiplier: 3.0, hypeMultiplier: 2.0 },
  { id: 'internet_ads', name: 'Internet Ads', costMultiplier: 2.0, hypeMultiplier: 1.5 },
];

export const CONTINENTS: { id: Continent; name: string; marketSize: number }[] = [
  { id: 'north_america', name: 'North America', marketSize: 1.2 },
  { id: 'south_america', name: 'South America', marketSize: 0.6 },
  { id: 'europe', name: 'Europe', marketSize: 1.0 },
  { id: 'asia', name: 'Asia', marketSize: 1.5 },
  { id: 'africa', name: 'Africa', marketSize: 0.4 },
  { id: 'oceania', name: 'Oceania', marketSize: 0.3 },
];

export interface MarketingCampaign {
  id: string;
  adTypes: AdType[];
  regions: Continent[];
  dailyCost: number; // daily spend
  startDate: string; // ISO date
  active: boolean;
}

export interface MarketingState {
  campaigns: MarketingCampaign[];
  hype: number; // 0-100, decays over time
}

export const DEFAULT_MARKETING: MarketingState = {
  campaigns: [],
  hype: 0,
};

export interface CompetitorProduct {
  id: string; // matches CompetitorCPU.id
  companyId: string;
  companyName: string;
  name: string;
  price: number;
  clockKHz: number;
  architecture: string;
  performance: number;
  stability: number;
  build: number;
  unitCost: number;
  packageId: string;
  coreId: string;
  techProcessId: string;
  releaseDate: string; // ISO date
  salesPower: number; // decays over time, used for market share
}

export interface CompetitorState {
  releasedCPUIds: string[]; // IDs of competitor CPUs already launched
  activeProducts: CompetitorProduct[]; // currently on market
  knownCompanies: string[]; // company IDs player has seen
  companyValuations: Record<string, number>; // companyId -> valuation
  companyRevenues: Record<string, number>; // companyId -> total accumulated revenue
}

export const DEFAULT_COMPETITOR_STATE: CompetitorState = {
  releasedCPUIds: [],
  activeProducts: [],
  knownCompanies: [],
  companyValuations: {},
  companyRevenues: {},
};

export interface GameState {
  companyName: string;
  founderName: string;
  difficulty: Difficulty;
  bankruptcy: boolean;
  competitors: boolean;
  infiniteMoney: boolean;
  logoSvg: string;
  logoConfig: LogoConfig;
  balance: number;
  gameDate: string; // ISO date string
  research: ResearchState;
  bank: BankState;
  cpuBrands: string[];
  products: CPUProduct[];
  finance: FinanceState;
  marketing: MarketingState;
  competitorState: CompetitorState;
}

export const STARTING_BALANCE: Record<Difficulty, number> = {
  easy: 200_000,
  normal: 100_000,
  hard: 50_000,
  veryhard: 10_000,
};
