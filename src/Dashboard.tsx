import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import {
  Button,
  Window,
  WindowHeader,
  WindowContent,
  Toolbar,
  Separator,
  ProgressBar,
} from 'react95';
import type { GameState, CompetitorProduct } from './types';
import { DEFAULT_BANK, DEFAULT_FINANCE, DEFAULT_MARKETING, DEFAULT_COMPETITOR_STATE, LOAN_INTEREST_RATE, TAX_RATE, TAX_LATE_PENALTY } from './types';
import type { Transaction, MonthlySnapshot, MarketingCampaign } from './types';
import { AD_TYPES, CONTINENTS } from './types';
import RnD from './RnD';
import Bank from './Bank';
import NewHardware from './NewHardware';
import Products from './Products';
import Finances from './Finances';
import Marketing from './Marketing';
import Companies from './Companies';
import Market from './Market';
import CPUReview from './CPUReview';
import { MAX_SELL_PRICE, computeReviewScore, getCpuValueMetrics } from './cpuScoring';
import type { CPUProduct } from './types';
import { CPU_RESEARCH, TECH_RESEARCH, getMaxResearchBudget, rpPerDay } from './rndData';
import { COMPETITOR_CPUS, getCompetitorStats, generateCompanyLogoSvg, getCompanyById } from './competitorData';
import Milestones, { MILESTONES } from './Milestones';

// 16x16 pixel art icons as data URLs
function pixelIcon(pixels: string, color = '#000'): string {
  // pixels is a 16x16 grid where '#' = filled, '.' = empty
  const rows = pixels.trim().split('\n').map((r) => r.trim());
  let rects = '';
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      if (rows[y][x] === '#') {
        rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
      }
    }
  }
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${rects}</svg>`)}`;
}

const ICON_HARDWARE = pixelIcon(`
................
..###########...
..#.........#...
..#.##.##.#.#...
..#.........#...
..#.#.#.#.#.#...
..#.........#...
..#.##.##.#.#...
..#.........#...
..###########...
......###.......
......#.#.......
......#.#.......
....#######.....
....#.....#.....
................
`, '#2c6fbb');

const ICON_RND = pixelIcon(`
................
.....####.......
....#....#......
...#......#.....
...#..##..#.....
...#..##..#.....
...#......#.....
....#....#......
.....####.......
....#....#......
...#..##..#.....
..#..####..#....
..#..####..#....
..#........#....
...########.....
................
`, '#8b4513');

const ICON_PRODUCTS = pixelIcon(`
................
..############..
..#..........#..
..#..........#..
..#..........#..
..#..........#..
..#..........#..
..############..
..#..........#..
..#...####...#..
..#...#..#...#..
..#...####...#..
..#..........#..
..############..
................
................
`, '#4a4a4a');

const ICON_COMPANIES = pixelIcon(`
................
......##........
.....####.......
....######......
...########.....
.....#..#.......
.....#..#.......
...##....##.....
..###.##.###....
..#..#..#..#....
..#..#..#..#....
..#..#..#..#....
..#..####..#....
..############..
................
................
`, '#6b4c9a');

const ICON_MILESTONES = pixelIcon(`
................
.......#........
......##........
.....#.#........
....#..#........
...#...#........
..#....#........
.......#........
.......#........
..###..#..###...
..#.#..#..#.#...
..#.#..#..#.#...
..###..#..###...
.......#........
...########.....
................
`, '#daa520');

const ICON_MARKET = pixelIcon(`
................
..##......##....
..##......##....
..##......##....
..##..##..##....
..##..##..##....
..##..##..##....
..##..##..##....
..##..##..##....
..##..##..##....
..##..##..##....
.###..##..###...
.#.#..##..#.#...
.#.########.#...
.#..........#...
..############..
`, '#cc3333');

const ICON_MARKETING = pixelIcon(`
................
....########....
...#........#...
..#..######..#..
..#..#....#..#..
..#..#.##.#..#..
..#..#.##.#..#..
..#..#....#..#..
..#..######..#..
..#..........#..
...#........#...
....########....
.......##.......
......####......
.....######.....
................
`, '#e65100');

const ICON_BANK = pixelIcon(`
................
.....######.....
....########....
...##########...
..############..
.....#..#..#....
.....#..#..#....
.....#..#..#....
.....#..#..#....
.....#..#..#....
.....#..#..#....
.....#..#..#....
..############..
..#..........#..
..############..
................
`, '#006400');

const SIDEBAR_ITEMS = [
  { label: 'New Hardware', icon: ICON_HARDWARE },
  { label: 'R&D', icon: ICON_RND },
  { label: 'Products', icon: ICON_PRODUCTS },
  { label: 'Companies', icon: ICON_COMPANIES },
  { label: 'Milestones', icon: ICON_MILESTONES },
  { label: 'Marketing', icon: ICON_MARKETING },
  { label: 'Market', icon: ICON_MARKET },
  { label: 'Bank', icon: ICON_BANK },
] as const;

type Speed = 0 | 1 | 2 | 3;

const SPEED_MS: Record<Speed, number> = {
  0: 0,
  1: 500,
  2: 250,
  3: 167,
};

const AUTOSAVE_KEY = 'ht-autosave';
const SAVE_KEY = 'ht-current-game';

function saveState(key: string, state: GameState) {
  // Infinity doesn't survive JSON.stringify (becomes null), so mark it
  const toSave = state.infiniteMoney
    ? { ...state, balance: -1 }
    : state;
  localStorage.setItem(key, JSON.stringify(toSave));
}

function loadState(raw: string): GameState {
  const state = JSON.parse(raw) as GameState;
  if (state.infiniteMoney) {
    state.balance = Infinity;
  }
  return state;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatBalance(amount: number): string {
  if (amount >= 1_000_000) {
    return '$' + (amount / 1_000_000).toFixed(2) + 'M';
  }
  if (amount >= 1_000) {
    return '$' + (amount / 1_000).toFixed(1) + 'K';
  }
  return '$' + amount.toLocaleString();
}

function advanceDay(iso: string): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

interface DashboardProps {
  initialState: GameState;
  onQuit: () => void;
  onGameOver: (finalState: GameState) => void;
}

const DEFAULT_RESEARCH = {
  completedResearch: [],
  currentResearch: null,
  currentResearchPoints: 0,
  researchQueue: [],
  dailyBudget: 175,
  cpuExperience: 0,
};

const COMPETITOR_SALES_POWER_MULTIPLIER = 1.25;
const COMPETITOR_DAILY_SALES_MULTIPLIER = 0.35;
const COMPETITOR_REVENUE_VALUATION_SCALE = 1400;
const COMPETITOR_BASE_VALUATION = 250_000;

function getCompetitorBaseSalesPower(product: Pick<CompetitorProduct, 'performance' | 'build' | 'stability' | 'price'>): number {
  const qualityPower = product.performance * 3 + product.build * 2 + Math.max(0, product.stability) * 1.5;
  const premiumPower = product.price > 200 ? 90 : product.price > 120 ? 45 : 0;
  return (220 + qualityPower + premiumPower) * COMPETITOR_SALES_POWER_MULTIPLIER;
}

function getCompetitorRevenueValuation(revenue: number): number {
  return Math.sqrt(Math.max(0, revenue)) * COMPETITOR_REVENUE_VALUATION_SCALE;
}

function migrateState(state: GameState): GameState {
  let s = state;
  if (!s.research) {
    s = { ...s, research: DEFAULT_RESEARCH };
  } else if (!s.research.researchQueue) {
    s = { ...s, research: { ...s.research, researchQueue: [] } };
  }
  if (!s.bank) {
    s = { ...s, bank: { ...DEFAULT_BANK } };
  }
  if (s.bank.loanPrincipal === undefined) {
    s = { ...s, bank: { ...s.bank, loanPrincipal: s.bank.loanBalance } };
  }
  if (!s.cpuBrands) {
    s = { ...s, cpuBrands: [] };
  }
  if (!s.products) {
    s = { ...s, products: [] };
  } else {
    s = {
      ...s,
      products: s.products.map((p) => ({
        ...p,
        price: Math.min(MAX_SELL_PRICE, p.price),
        previousPrice: Math.min(MAX_SELL_PRICE, p.previousPrice ?? p.price),
      })),
    };
  }
  if (!s.finance) {
    s = { ...s, finance: { ...DEFAULT_FINANCE } };
  }
  if (!s.marketing) {
    s = { ...s, marketing: { ...DEFAULT_MARKETING } };
  }
  if (!s.competitorState) {
    s = { ...s, competitorState: { ...DEFAULT_COMPETITOR_STATE } };
  }
  return s;
}

function SalesGraph({ history }: { history: number[] }) {
  const w = 150;
  const h = 40;
  const padding = 2;
  const data = history.slice(-30); // show last 30 days
  if (data.length < 2) {
    return (
      <SalesGraphWrap>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} />
      </SalesGraphWrap>
    );
  }
  const max = Math.max(...data, 1);
  const stepX = (w - padding * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = padding + i * stepX;
    const y = h - padding - ((v / max) * (h - padding * 2));
    return `${x},${y}`;
  }).join(' ');
  const fillPoints = `${padding},${h - padding} ${points} ${padding + (data.length - 1) * stepX},${h - padding}`;
  return (
    <SalesGraphWrap>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <polygon points={fillPoints} fill="rgba(0, 100, 0, 0.15)" />
        <polyline points={points} fill="none" stroke="#006400" strokeWidth="1.5" />
      </svg>
    </SalesGraphWrap>
  );
}

const GAME_END_YEAR = 2011;

export default function Dashboard({ initialState, onQuit, onGameOver }: DashboardProps) {
  const [gameState, setGameState] = useState<GameState>(() => migrateState(initialState));
  const [speed, setSpeed] = useState<Speed>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [saveFlash, setSaveFlash] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [reviewProduct, setReviewProduct] = useState<CPUProduct | null>(null);
  const [competitorReview, setCompetitorReview] = useState<{ product: CompetitorProduct; companyLogoSvg: string } | null>(null);
  const [newsItems, setNewsItems] = useState<string[]>([]);
  const [mobileNotifOpen, setMobileNotifOpen] = useState(false);
  const prevResearchRef = useRef<string | null>(initialState.research?.currentResearch ?? null);
  const speedBeforeMenu = useRef<Speed>(0);
  const speedBeforeReview = useRef<Speed>(0);
  const pendingReviewRef = useRef<CPUProduct | null>(null);
  const pendingCompetitorReviewRef = useRef<{ product: CompetitorProduct; companyLogoSvg: string } | null>(null);
  const pendingNewsRef = useRef<string[]>([]);
  const pendingGameOverRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedMilestonesRef = useRef<Set<string>>(new Set(MILESTONES.filter(m => m.check(initialState)).map(m => m.id)));

  const tick = useCallback(() => {
    setGameState((prev) => {
      const next = { ...prev, gameDate: advanceDay(prev.gameDate) };
      const res = { ...prev.research };
      const allResearch = [...CPU_RESEARCH, ...TECH_RESEARCH];
      const dayTxns: Transaction[] = [];
      const dateStr = next.gameDate.slice(0, 10);

      // Process daily research — only deduct if actively researching
      if (res.currentResearch && res.dailyBudget > 0) {
        const item = allResearch.find((r) => r.id === res.currentResearch);
        if (item) {
          const cost = res.dailyBudget;
          if (next.balance !== Infinity) next.balance -= cost;
          dayTxns.push({ date: dateStr, type: 'expense', category: 'R&D', description: `R&D daily budget (${item.name})`, amount: cost });
          res.currentResearchPoints += rpPerDay(res.dailyBudget);

          // Check if research is complete
          if (res.currentResearchPoints >= item.researchPoints) {
            res.completedResearch = [...res.completedResearch, item.id];
            res.currentResearch = null;
            res.currentResearchPoints = 0;
            // Grant CPU experience for completing CPU research
            if (CPU_RESEARCH.some((r) => r.id === item.id)) {
              res.cpuExperience += Math.round(item.researchPoints / 2);
            }
            // Auto-unlock free techs whose prerequisite was just completed
            const autoUnlocks = allResearch.filter(
              (r) => r.cost === 0 && r.prerequisite === item.id && !res.completedResearch.includes(r.id)
            );
            for (const auto of autoUnlocks) {
              res.completedResearch = [...res.completedResearch, auto.id];
            }

            // Dequeue next research if any
            if (res.researchQueue && res.researchQueue.length > 0 && !res.currentResearch) {
              const queue = [...res.researchQueue];
              while (queue.length > 0 && !res.currentResearch) {
                const nextId = queue.shift()!;
                if (!res.completedResearch.includes(nextId)) {
                  res.currentResearch = nextId;
                  res.currentResearchPoints = 0;
                }
              }
              res.researchQueue = queue;
            }
          }
        }
      }

      // --- Bank processing ---
      const prevDate = new Date(prev.gameDate);
      const nextDate = new Date(next.gameDate);
      const bk = { ...(prev.bank || DEFAULT_BANK) };

      // Monthly interest on loans: charged on 1st of each month, deducted from balance
      if (nextDate.getDate() === 1 && bk.loanBalance > 0) {
        const interest = Math.round(bk.loanBalance * LOAN_INTEREST_RATE);
        if (next.balance !== Infinity) next.balance -= interest;
        dayTxns.push({ date: dateStr, type: 'expense', category: 'Loan Interest', description: 'Monthly loan interest', amount: interest });
      }

      // Year transition: calculate tax from last year's income
      if (nextDate.getFullYear() > prevDate.getFullYear()) {
        const lastYearIncome = bk.yearlyIncome;
        const tax = Math.round(lastYearIncome * TAX_RATE);
        bk.taxDue = tax;
        bk.taxYear = prevDate.getFullYear();
        bk.taxPaidThisYear = false;
        bk.yearlyIncome = 0; // reset for new year

        // Auto-pay tax on Jan 1 if enabled
        if (bk.autoPayTax && tax > 0) {
          if (next.balance !== Infinity) next.balance -= tax;
          bk.taxDue = 0;
          bk.taxPaidThisYear = true;
          dayTxns.push({ date: dateStr, type: 'expense', category: 'Tax', description: `Income tax (${prevDate.getFullYear()})`, amount: tax });
        }
      }

      // Late tax penalty: if tax unpaid by April 1 (month index 3)
      if (
        nextDate.getMonth() === 3 &&
        nextDate.getDate() === 1 &&
        bk.taxDue > 0 &&
        !bk.taxPaidThisYear
      ) {
        const penalty = Math.round(bk.taxDue * TAX_LATE_PENALTY);
        const totalDue = bk.taxDue + penalty;
        if (next.balance !== Infinity) next.balance -= totalDue;
        dayTxns.push({ date: dateStr, type: 'expense', category: 'Tax Penalty', description: `Late tax payment + ${TAX_LATE_PENALTY * 100}% penalty`, amount: totalDue });
        bk.taxDue = 0;
        bk.taxPaidThisYear = true;
      }

      next.bank = bk;

      // --- Marketing processing ---
      const mkt = { ...(prev.marketing || DEFAULT_MARKETING) };
      let hype = mkt.hype || 0;

      // Process active campaigns: deduct cost and add hype
      const updatedCampaigns = (mkt.campaigns || []).map((c) => {
        if (!c.active) return c;
        const cost = c.dailyCost;
        if (next.balance !== Infinity) next.balance -= cost;
        dayTxns.push({ date: dateStr, type: 'expense', category: 'Marketing', description: 'Marketing campaign', amount: cost });

        // Calculate hype generated
        const adHype = c.adTypes.reduce((sum, adId) => {
          const ad = AD_TYPES.find((a) => a.id === adId);
          return sum + (ad?.hypeMultiplier ?? 0);
        }, 0);
        const regionHype = c.regions.reduce((sum, rId) => {
          const r = CONTINENTS.find((ct) => ct.id === rId);
          return sum + (r?.marketSize ?? 0);
        }, 0);
        // Hype gain scales with budget, diminishing returns above 50, with daily jitter
        const jitter = 0.6 + Math.random() * 0.8; // ±40% variance
        const baseHypeGain = (cost / 1000) * adHype * regionHype * 0.15 * jitter;
        const diminishing = hype > 50 ? 50 / hype : 1;
        hype = Math.min(100, hype + baseHypeGain * diminishing);
        return c;
      });
      mkt.campaigns = updatedCampaigns;

      // Hype decays ~3% per day with variance
      const decayRate = 0.96 + Math.random() * 0.02; // 2-4% decay
      hype *= decayRate;
      if (hype < 0.1) hype = 0;
      mkt.hype = hype;
      next.marketing = mkt;

      // --- Product processing ---
      // First pass: check if any designing product just finished
      let newProductFinished = false;
      let finishedProduct: CPUProduct | null = null;
      const productsPass1 = (prev.products || []).map((p) => {
        if (p.status === 'designing') {
          const updated = { ...p, designDaysCompleted: p.designDaysCompleted + 1 };
          if (updated.designDaysCompleted >= updated.designTimeDays) {
            updated.status = 'selling';
            updated.sellStartDate = next.gameDate;
            updated.daysOnSale = 0;
            updated.salesBoost = 0;
            updated.previousPrice = updated.price;
            res.cpuExperience += Math.round((updated.performance + updated.build) / 2);
            newProductFinished = true;
            finishedProduct = updated;
          }
          return updated;
        }
        return p;
      });
      // Show review for newly finished product
      if (finishedProduct) {
        pendingReviewRef.current = finishedProduct;
        // Stop all active marketing campaigns — product is released
        mkt.campaigns = mkt.campaigns.map((c) =>
          c.active ? { ...c, active: false } : c
        );
        next.marketing = mkt;
      }
      // If a new product just started selling, discontinue old selling products
      const products = productsPass1.map((p) => {
        if (p.status === 'selling') {
          if (newProductFinished && !p.sellStartDate?.startsWith(next.gameDate.slice(0, 10))) {
            // This is an older product — discontinue it
            return { ...p, status: 'discontinued' as const };
          }
          // --- Sales with natural decay and price-drop boosts ---
          const days = (p.daysOnSale || 0) + 1;

          // Detect price drop → add sales boost
          let boost = p.salesBoost || 0;
          const prevPrice = p.previousPrice ?? p.price;
          if (p.price < prevPrice) {
            // Boost proportional to the discount percentage
            const discountPct = (prevPrice - p.price) / prevPrice;
            boost += 1.5 * discountPct; // up to +1.5x multiplier for 100% discount
          }
          // Decay the boost exponentially (half-life ~10 days)
          boost *= 0.933;
          if (boost < 0.01) boost = 0;

          // Base sales from stats. Reviews and fair-price value drive demand,
          // so overpriced CPUs cannot sell strongly on specs alone.
          const scoreContext = { completedResearch: res.completedResearch };
          const reviewScore = computeReviewScore(p, false, scoreContext);
          const valueMetrics = getCpuValueMetrics(p, scoreContext);
          const scoreDemand = Math.pow(reviewScore / 100, 2.15);
          const demandMult = Math.max(0.03, scoreDemand);
          const valueMult = Math.max(0.1, 0.45 + valueMetrics.valueScore / 100);
          const overpricePenalty = valueMetrics.priceRatio > 1
            ? 1 / Math.pow(valueMetrics.priceRatio, 1.35)
            : 1 + Math.min(0.25, (1 - valueMetrics.priceRatio) * 0.35);
          // Hype multiplier: hype 0 = 1x, hype 50 ~= 3.75x, hype 100 = 8x
          const hypeRatio = mkt.hype / 100;
          const hypeMult = 1 + hypeRatio * 4 + Math.pow(hypeRatio, 2) * 3;
          // Competition multiplier: more competitors = harder to sell
          const compState = prev.competitorState || DEFAULT_COMPETITOR_STATE;
          const competitorPower = compState.activeProducts.reduce((sum, cp) => sum + cp.salesPower, 0);
          const competitionMult = competitorPower > 0 ? Math.max(0.25, 1 / (1 + competitorPower / 1800)) : 1;
          const baseMarketDemand = 700;
          const hardwareDemand = p.performance * 2 + p.build * 1.1 + 60;
          const launchMomentum = days <= 30 ? 1.35 : days <= 90 ? 1.15 : 1;
          const peakSales = (baseMarketDemand + hardwareDemand) * demandMult * valueMult * overpricePenalty * hypeMult * competitionMult * launchMomentum;

          // Natural decay: stays strong ~120 days, then gradually drops off over ~1 year
          const decayFactor = 1 / (1 + Math.pow(days / 200, 2.5));

          // Add ±35% random jitter so sales aren't perfectly smooth
          const jitter = 0.65 + Math.random() * 0.7;
          const dailySales = Math.floor(peakSales * decayFactor * (1 + boost) * jitter);
          if (dailySales <= 0) {
            return { ...p, status: 'discontinued' as const, daysOnSale: days, salesBoost: boost, previousPrice: p.price };
          }
          const dailyRevenue = dailySales * p.price;
          const manufacturingCost = Math.round(dailySales * p.unitCost * 100) / 100;
          const dailyProfit = dailyRevenue - manufacturingCost;
          if (next.balance !== Infinity) next.balance += dailyProfit;
          bk.yearlyIncome += dailyRevenue;
          dayTxns.push({ date: dateStr, type: 'income', category: 'CPU Sales', description: `${p.brand ? p.brand + ' ' : ''}${p.name} (${dailySales} units)`, amount: dailyRevenue });
          if (manufacturingCost > 0) {
            dayTxns.push({ date: dateStr, type: 'expense', category: 'Manufacturing', description: `${p.brand ? p.brand + ' ' : ''}${p.name} (${dailySales} units)`, amount: manufacturingCost });
          }

          const history = [...(p.salesHistory || []), dailySales];
          if (history.length > 90) history.shift();

          return {
            ...p,
            daysOnSale: days,
            salesBoost: boost,
            previousPrice: p.price,
            totalUnitsSold: p.totalUnitsSold + dailySales,
            totalRevenue: p.totalRevenue + dailyRevenue,
            salesHistory: history,
          };
        }
        return p;
      });
      next.products = products;
      next.research = res;

      // --- Competitor processing ---
      if (prev.competitors) {
        const compState = { ...(prev.competitorState || DEFAULT_COMPETITOR_STATE) };
        const currentDate = new Date(next.gameDate);
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // 1-12
        const currentDay = currentDate.getDate();
        const newNews: string[] = [];

        // Check for new competitor CPU launches (launch on the 1st of the month)
        if (currentDay === 1) {
          const cpusToLaunch = COMPETITOR_CPUS.filter(cpu =>
            cpu.year === currentYear &&
            cpu.month === currentMonth &&
            !compState.releasedCPUIds.includes(cpu.id)
          );

          for (const cpu of cpusToLaunch) {
            const company = getCompanyById(cpu.companyId);
            if (!company) continue;

            // Check if this is a new company entering the market
            if (!compState.knownCompanies.includes(cpu.companyId)) {
              compState.knownCompanies = [...compState.knownCompanies, cpu.companyId];
              newNews.push(`${company.name} has entered the CPU market!`);
            }

            const stats = getCompetitorStats(cpu);
            const newProduct: CompetitorProduct = {
              id: cpu.id,
              companyId: cpu.companyId,
              companyName: company.name,
              name: cpu.name,
              price: cpu.price,
              clockKHz: cpu.clockKHz,
              architecture: cpu.architecture,
              performance: stats.performance,
              stability: stats.stability,
              build: stats.build,
              unitCost: stats.unitCost,
              packageId: cpu.packageId,
              coreId: cpu.coreId,
              techProcessId: cpu.techProcessId,
              releaseDate: next.gameDate,
              salesPower: getCompetitorBaseSalesPower({ ...stats, price: cpu.price }),
            };

            // Remove older products from the same company (keep max 4)
            const companyProducts = compState.activeProducts.filter(p => p.companyId === cpu.companyId);
            if (companyProducts.length >= 4) {
              const oldest = companyProducts.sort((a, b) => a.salesPower - b.salesPower)[0];
              compState.activeProducts = compState.activeProducts.filter(p => p.id !== oldest.id);
            }

            compState.activeProducts = [...compState.activeProducts, newProduct];
            compState.releasedCPUIds = [...compState.releasedCPUIds, cpu.id];

            newNews.push(`${company.name} releases the ${cpu.name}!`);

            // Queue competitor review (show the last one launched this month)
            pendingCompetitorReviewRef.current = {
              product: newProduct,
              companyLogoSvg: generateCompanyLogoSvg(company),
            };
          }
        }

        // Decay competitor product sales power daily
        compState.activeProducts = compState.activeProducts
          .map(p => {
            const daysSinceRelease = Math.floor(
              (new Date(next.gameDate).getTime() - new Date(p.releaseDate).getTime()) / 86400000
            );
            // Competitor products stay relevant long enough to pressure the market.
            const decayFactor = 1 / (1 + Math.pow(daysSinceRelease / 260, 1.6));
            const basePower = getCompetitorBaseSalesPower(p);
            return { ...p, salesPower: Math.max(50, basePower * decayFactor) };
          })
          .filter(p => p.salesPower > 25); // Remove very old products

        // Accumulate daily competitor revenue and update valuations
        const revenues: Record<string, number> = { ...(compState.companyRevenues || {}) };
        const valuations: Record<string, number> = {};
        for (const compId of compState.knownCompanies) {
          const compProducts = compState.activeProducts.filter(p => p.companyId === compId);
          // Estimate daily revenue from salesPower * price
          for (const cp of compProducts) {
            const dailySales = Math.floor(cp.salesPower * COMPETITOR_DAILY_SALES_MULTIPLIER);
            revenues[compId] = (revenues[compId] || 0) + dailySales * cp.price;
          }
          const productStrength = compProducts.reduce((sum, cp) => sum + cp.salesPower * cp.price * 45, 0);
          valuations[compId] = Math.round(COMPETITOR_BASE_VALUATION + getCompetitorRevenueValuation(revenues[compId] || 0) + productStrength);
        }
        compState.companyRevenues = revenues;
        compState.companyValuations = valuations;

        next.competitorState = compState;

        if (newNews.length > 0) {
          pendingNewsRef.current = [...pendingNewsRef.current, ...newNews];
        }
      }

      // --- Finance tracking ---
      const fin = { ...(prev.finance || DEFAULT_FINANCE) };
      // Append transactions (keep last 365 days worth)
      let txns = [...fin.transactions, ...dayTxns];
      if (txns.length > 2000) txns = txns.slice(txns.length - 2000);
      fin.transactions = txns;

      // Monthly snapshot on 1st of month
      if (nextDate.getDate() === 1) {
        const monthIncome = dayTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const monthExpense = dayTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        // Find existing snapshot for this month or create
        const snaps = [...fin.monthlySnapshots];
        const existing = snaps.findIndex(s => s.year === nextDate.getFullYear() && s.month === nextDate.getMonth());
        const snap: MonthlySnapshot = {
          year: nextDate.getFullYear(),
          month: nextDate.getMonth(),
          balance: next.balance === Infinity ? 999999999 : Math.round(next.balance),
          totalIncome: monthIncome,
          totalExpenses: monthExpense,
        };
        if (existing >= 0) {
          snaps[existing] = snap;
        } else {
          snaps.push(snap);
        }
        fin.monthlySnapshots = snaps;
      }
      next.finance = fin;

      // Check for game end
      if (nextDate.getFullYear() >= GAME_END_YEAR && nextDate.getMonth() === 0 && nextDate.getDate() === 1) {
        pendingGameOverRef.current = true;
      }

      return next;
    });
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (speed > 0) {
      intervalRef.current = setInterval(tick, SPEED_MS[speed]);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [speed, tick]);

  // Check for pending product review after each state update
  useEffect(() => {
    const product = pendingReviewRef.current;
    if (product) {
      pendingReviewRef.current = null;
      speedBeforeReview.current = speed;
      setSpeed(0);
      setReviewProduct(product);
      return;
    }
    // Check for competitor product review (only if no player review pending)
    const compReview = pendingCompetitorReviewRef.current;
    if (compReview && !reviewProduct && !competitorReview) {
      pendingCompetitorReviewRef.current = null;
      speedBeforeReview.current = speed;
      setSpeed(0);
      setCompetitorReview(compReview);
    }
  });

  // Check for game over
  useEffect(() => {
    if (pendingGameOverRef.current) {
      pendingGameOverRef.current = false;
      setSpeed(0);
      // Save final state then trigger game over
      saveState(AUTOSAVE_KEY, gameState);
      onGameOver(gameState);
    }
  });

  // Process pending news items
  useEffect(() => {
    if (pendingNewsRef.current.length > 0) {
      const items = pendingNewsRef.current;
      pendingNewsRef.current = [];
      setNewsItems(prev => [...prev, ...items]);
      // Auto-clear after 6 seconds
      setTimeout(() => {
        setNewsItems(prev => prev.slice(items.length));
      }, 6000);
    }
  });

  // Detect research completion
  useEffect(() => {
    const prevId = prevResearchRef.current;
    const curId = gameState.research.currentResearch;
    if (prevId && !curId) {
      const allResearch = [...CPU_RESEARCH, ...TECH_RESEARCH];
      const completed = allResearch.find((r) => r.id === prevId);
      if (completed) {
        setToast(`Research complete: ${completed.name}`);
        setTimeout(() => setToast(null), 4000);
      }
    }
    prevResearchRef.current = curId;
  }, [gameState.research.currentResearch]);

  // Detect new milestone completions
  useEffect(() => {
    for (const m of MILESTONES) {
      if (!completedMilestonesRef.current.has(m.id) && m.check(gameState)) {
        completedMilestonesRef.current.add(m.id);
        setToast(`Milestone unlocked: ${m.name}`);
        setTimeout(() => setToast(null), 4000);
        break; // show one at a time
      }
    }
  }, [gameState]);

  // Autosave every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setGameState((current) => {
        saveState(AUTOSAVE_KEY, current);
        return current;
      });
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // Save on unmount / before unload — use ref to avoid re-registering every tick
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveState(AUTOSAVE_KEY, gameStateRef.current);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveState(AUTOSAVE_KEY, gameStateRef.current);
    };
  }, []);

  const handleOpenMenu = () => {
    speedBeforeMenu.current = speed;
    setSpeed(0);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setSpeed(speedBeforeMenu.current);
    setMenuOpen(false);
  };

  const handleSave = () => {
    saveState(SAVE_KEY, gameState);
    saveState(AUTOSAVE_KEY, gameState);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  };

  const handleLoad = () => {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
      setGameState(migrateState(loadState(data)));
      setMenuOpen(false);
      setSpeed(0);
    }
  };

  const handleLeave = () => {
    saveState(AUTOSAVE_KEY, gameState);
    onQuit();
  };

  const handleSidebarClick = (label: string) => {
    if (label === 'R&D') {
      setActivePanel(activePanel === 'rnd' ? null : 'rnd');
    } else if (label === 'Bank') {
      setActivePanel(activePanel === 'bank' ? null : 'bank');
    } else if (label === 'New Hardware') {
      setActivePanel(activePanel === 'hardware' ? null : 'hardware');
    } else if (label === 'Products') {
      setActivePanel(activePanel === 'products' ? null : 'products');
    } else if (label === 'Marketing') {
      setActivePanel(activePanel === 'marketing' ? null : 'marketing');
    } else if (label === 'Companies') {
      setActivePanel(activePanel === 'companies' ? null : 'companies');
    } else if (label === 'Market') {
      setActivePanel(activePanel === 'market' ? null : 'market');
    } else if (label === 'Milestones') {
      setActivePanel(activePanel === 'milestones' ? null : 'milestones');
    } else {
      setActivePanel(null);
    }
  };

  const handleStartResearch = (id: string) => {
    const allResearch = [...CPU_RESEARCH, ...TECH_RESEARCH];
    const item = allResearch.find((r) => r.id === id);
    if (!item) return;

    setGameState((prev) => {
      // Already completed or already the current research
      if (prev.research.completedResearch.includes(id)) return prev;
      if (prev.research.currentResearch === id) return prev;

      const q = prev.research.researchQueue || [];

      // If no current research, start it immediately
      if (!prev.research.currentResearch) {
        const dateStr = prev.gameDate.slice(0, 10);
        const txn: Transaction = { date: dateStr, type: 'expense', category: 'Research', description: `Started research: ${item.name}`, amount: item.cost };
        return {
          ...prev,
          balance: prev.balance === Infinity ? Infinity : prev.balance - item.cost,
          research: {
            ...prev.research,
            currentResearch: id,
            currentResearchPoints: 0,
          },
          finance: { ...prev.finance, transactions: [...prev.finance.transactions, txn] },
        };
      }

      // If already researching and not already in queue, add to queue
      if (!q.includes(id)) {
        const dateStr = prev.gameDate.slice(0, 10);
        const txn: Transaction = { date: dateStr, type: 'expense', category: 'Research', description: `Queued research: ${item.name}`, amount: item.cost };
        return {
          ...prev,
          balance: prev.balance === Infinity ? Infinity : prev.balance - item.cost,
          research: {
            ...prev.research,
            researchQueue: [...q, id],
          },
          finance: { ...prev.finance, transactions: [...prev.finance.transactions, txn] },
        };
      }

      return prev;
    });
  };

  const handleUnqueueResearch = (id: string) => {
    setGameState((prev) => {
      const q = prev.research.researchQueue || [];
      if (!q.includes(id)) return prev;

      const allResearch = [...CPU_RESEARCH, ...TECH_RESEARCH];
      const item = allResearch.find((r) => r.id === id);
      if (!item) return prev;

      const newQueue = q.filter((qId) => qId !== id);
      const dateStr = prev.gameDate.slice(0, 10);
      const txn: Transaction = { date: dateStr, type: 'income', category: 'Research', description: `Refund queued research: ${item.name}`, amount: item.cost };

      return {
        ...prev,
        balance: prev.balance === Infinity ? Infinity : prev.balance + item.cost,
        research: {
          ...prev.research,
          researchQueue: newQueue,
        },
        finance: { ...prev.finance, transactions: [...prev.finance.transactions, txn] },
      };
    });
  };

  const handleReorderQueue = (oldIndex: number, newIndex: number) => {
    setGameState((prev) => {
      if (!prev.research.researchQueue) return prev;
      const queue = [...prev.research.researchQueue];
      if (oldIndex < 0 || oldIndex >= queue.length || newIndex < 0 || newIndex >= queue.length) return prev;
      
      const [movedItem] = queue.splice(oldIndex, 1);
      queue.splice(newIndex, 0, movedItem);
      
      return {
        ...prev,
        research: {
          ...prev.research,
          researchQueue: queue,
        },
      };
    });
  };

  const handleBudgetChange = (budget: number) => {
    const currentYear = new Date(gameState.gameDate).getFullYear();
    const maxBudget = getMaxResearchBudget(currentYear);
    const clampedBudget = Math.max(0, Math.min(maxBudget, budget));
    setGameState((prev) => ({
      ...prev,
      research: {
        ...prev.research,
        dailyBudget: clampedBudget,
      },
    }));
  };

  const handleTakeLoan = (amount: number) => {
    setGameState((prev) => {
      const dateStr = prev.gameDate.slice(0, 10);
      const txn: Transaction = { date: dateStr, type: 'income', category: 'Loan', description: `Bank loan taken`, amount };
      return {
        ...prev,
        balance: prev.balance + amount,
        bank: {
          ...prev.bank,
          loanBalance: prev.bank.loanBalance + amount,
          loanPrincipal: (prev.bank.loanPrincipal || 0) + amount,
          loanTakenDate: prev.bank.loanTakenDate || prev.gameDate,
        },
        finance: { ...prev.finance, transactions: [...prev.finance.transactions, txn] },
      };
    });
  };

  const handleRepayLoan = (amount: number) => {
    setGameState((prev) => {
      const repay = Math.min(amount, prev.bank.loanBalance);
      const newLoanBalance = prev.bank.loanBalance - repay;
      const newPrincipal = newLoanBalance === 0 ? 0 : Math.min(prev.bank.loanPrincipal || 0, newLoanBalance);
      const dateStr = prev.gameDate.slice(0, 10);
      const txn: Transaction = { date: dateStr, type: 'expense', category: 'Loan Repayment', description: 'Loan repayment', amount: repay };
      return {
        ...prev,
        balance: prev.balance - repay,
        bank: {
          ...prev.bank,
          loanBalance: newLoanBalance,
          loanPrincipal: newPrincipal,
          loanTakenDate: newLoanBalance === 0 ? null : prev.bank.loanTakenDate,
        },
        finance: { ...prev.finance, transactions: [...prev.finance.transactions, txn] },
      };
    });
  };

  const handleToggleAutoTax = (auto: boolean) => {
    setGameState((prev) => ({
      ...prev,
      bank: { ...prev.bank, autoPayTax: auto },
    }));
  };

  const handlePayTax = () => {
    setGameState((prev) => {
      const dateStr = prev.gameDate.slice(0, 10);
      const txn: Transaction = { date: dateStr, type: 'expense', category: 'Tax', description: `Manual tax payment`, amount: prev.bank.taxDue };
      return {
        ...prev,
        balance: prev.balance - prev.bank.taxDue,
        bank: { ...prev.bank, taxDue: 0, taxPaidThisYear: true },
        finance: { ...prev.finance, transactions: [...prev.finance.transactions, txn] },
      };
    });
  };

  const handleRepayBailout = (amount: number) => {
    setGameState((prev) => {
      const repay = Math.min(amount, prev.bank.bailoutOwed);
      return {
        ...prev,
        balance: prev.balance - repay,
        bank: { ...prev.bank, bailoutOwed: prev.bank.bailoutOwed - repay },
      };
    });
  };

  const handleLaunchCampaign = (campaign: MarketingCampaign) => {
    setGameState((prev) => {
      const mkt = prev.marketing || { ...DEFAULT_MARKETING };
      return {
        ...prev,
        marketing: {
          ...mkt,
          campaigns: [...(mkt.campaigns || []), campaign],
        },
      };
    });
  };

  const handleStopCampaign = (campaignId: string) => {
    setGameState((prev) => {
      const mkt = prev.marketing || { ...DEFAULT_MARKETING };
      return {
        ...prev,
        marketing: {
          ...mkt,
          campaigns: (mkt.campaigns || []).map((c) =>
            c.id === campaignId ? { ...c, active: false } : c
          ),
        },
      };
    });
  };

  const allResearch = [...CPU_RESEARCH, ...TECH_RESEARCH];
  const currentResearch = gameState.research.currentResearch
    ? allResearch.find((r) => r.id === gameState.research.currentResearch) ?? null
    : null;
  const researchProgress = currentResearch
    ? Math.min(100, Math.round((gameState.research.currentResearchPoints / currentResearch.researchPoints) * 100))
    : 0;

  const logoDataUrl = 'data:image/svg+xml,' + encodeURIComponent(gameState.logoSvg);

  const designingProducts = gameState.products.filter((p) => p.status === 'designing');
  const sellingProducts = gameState.products.filter((p) => p.status === 'selling');

  return (
    <DashboardWrapper>
      <TopBar>
        <TopBarLeft>
          <MenuButton onClick={handleOpenMenu} size="sm">
            Menu
          </MenuButton>
          <BarSeparator orientation="vertical" />
          <CompanyLogo src={logoDataUrl} alt="Company logo" />
          <CompanyName>{gameState.companyName}</CompanyName>
          <BarSeparator orientation="vertical" />
          <DateDisplay>{formatDate(gameState.gameDate)}</DateDisplay>
          <SpeedControls>
            <SpeedButton
              primary={speed === 0}
              onClick={() => setSpeed(0)}
              size="sm"
            >
              ||
            </SpeedButton>
            <SpeedButton
              primary={speed === 1}
              onClick={() => setSpeed(1)}
              size="sm"
            >
              1x
            </SpeedButton>
            <SpeedButton
              primary={speed === 2}
              onClick={() => setSpeed(2)}
              size="sm"
            >
              2x
            </SpeedButton>
            <SpeedButton
              primary={speed === 3}
              onClick={() => setSpeed(3)}
              size="sm"
            >
              3x
            </SpeedButton>
          </SpeedControls>
        </TopBarLeft>
        <TopBarRight>
          <BalanceDisplay onClick={() => setActivePanel(activePanel === 'finances' ? null : 'finances')}>${gameState.balance.toLocaleString()}</BalanceDisplay>
          <NotifToggle size="sm" onClick={() => setMobileNotifOpen((v) => !v)}>
            {mobileNotifOpen ? '✕' : '📋'}
          </NotifToggle>
        </TopBarRight>
      </TopBar>

      <BodyLayout>
        <Sidebar>
          {SIDEBAR_ITEMS.map((item) => (
            <SidebarButton
              key={item.label}
              size="sm"
              primary={(item.label === 'R&D' && activePanel === 'rnd') || (item.label === 'Bank' && activePanel === 'bank') || (item.label === 'New Hardware' && activePanel === 'hardware') || (item.label === 'Products' && activePanel === 'products') || (item.label === 'Marketing' && activePanel === 'marketing') || (item.label === 'Companies' && activePanel === 'companies') || (item.label === 'Market' && activePanel === 'market') || (item.label === 'Milestones' && activePanel === 'milestones')}
              onClick={() => handleSidebarClick(item.label)}
            >
              <SidebarIcon src={item.icon} alt="" />
              <SidebarLabel>{item.label}</SidebarLabel>
            </SidebarButton>
          ))}
        </Sidebar>

        <MainArea>
        {!menuOpen && activePanel === 'hardware' && (
          <NewHardware
            gameState={gameState}
            onClose={() => setActivePanel(null)}
            onAddBrand={(name) => {
              setGameState((prev) => ({
                ...prev,
                cpuBrands: [...prev.cpuBrands, name],
              }));
            }}
            onStartProduction={(product: CPUProduct) => {
              setGameState((prev) => {
                const dateStr = prev.gameDate.slice(0, 10);
                const txn: Transaction = { date: dateStr, type: 'expense', category: 'Design Cost', description: `Started designing ${product.name}`, amount: product.designCost };
                return {
                  ...prev,
                  balance: prev.balance !== Infinity ? prev.balance - product.designCost : prev.balance,
                  products: [...prev.products, product],
                  finance: { ...prev.finance, transactions: [...prev.finance.transactions, txn] },
                };
              });
              setActivePanel('products');
            }}
          />
        )}

        {!menuOpen && activePanel === 'rnd' && (
          <RnD
            gameState={gameState}
            onStartResearch={handleStartResearch}
            onUnqueueResearch={handleUnqueueResearch}
            onReorderQueue={handleReorderQueue}
            onBudgetChange={handleBudgetChange}
            onClose={() => setActivePanel(null)}
          />
        )}

        {!menuOpen && activePanel === 'bank' && (
          <Bank
            gameState={gameState}
            onTakeLoan={handleTakeLoan}
            onRepayLoan={handleRepayLoan}
            onToggleAutoTax={handleToggleAutoTax}
            onPayTax={handlePayTax}
            onRepayBailout={handleRepayBailout}
            onClose={() => setActivePanel(null)}
          />
        )}

        {!menuOpen && activePanel === 'products' && (
          <Products
            gameState={gameState}
            onChangePrice={(productId, newPrice) => {
              const cappedPrice = Math.min(MAX_SELL_PRICE, newPrice);
              setGameState((prev) => ({
                ...prev,
                products: prev.products.map((p) =>
                  p.id === productId ? { ...p, price: cappedPrice } : p
                ),
              }));
            }}
            onDiscontinue={(productId) => {
              setGameState((prev) => ({
                ...prev,
                products: prev.products.map((p) =>
                  p.id === productId ? { ...p, status: 'discontinued' as const } : p
                ),
              }));
            }}
            onClose={() => setActivePanel(null)}
          />
        )}

        {!menuOpen && activePanel === 'marketing' && (
          <Marketing
            gameState={gameState}
            onLaunchCampaign={handleLaunchCampaign}
            onStopCampaign={handleStopCampaign}
            onClose={() => setActivePanel(null)}
          />
        )}

        {!menuOpen && activePanel === 'companies' && (
          <Companies
            gameState={gameState}
            onClose={() => setActivePanel(null)}
          />
        )}

        {!menuOpen && activePanel === 'market' && (
          <Market
            gameState={gameState}
            onClose={() => setActivePanel(null)}
          />
        )}

        {!menuOpen && activePanel === 'milestones' && (
          <Milestones
            gameState={gameState}
            onClose={() => setActivePanel(null)}
          />
        )}

        {!menuOpen && activePanel === 'finances' && (
          <Finances
            gameState={gameState}
            onClose={() => setActivePanel(null)}
          />
        )}

        {!menuOpen && !['rnd', 'bank', 'hardware', 'products', 'finances', 'marketing', 'companies', 'market', 'milestones'].includes(activePanel ?? '') && (
          <StyledWindow>
            <WindowHeader>
              <span>Dashboard - {gameState.companyName}</span>
            </WindowHeader>
            <WindowContent>
              <WelcomeContent>
                <WelcomeLogo src={logoDataUrl} alt="Company logo" />
                <h2 style={{ margin: '0 0 4px' }}>{gameState.companyName}</h2>
                <p style={{ margin: '0 0 8px', color: '#444', fontSize: 12 }}>
                  Founded by {gameState.founderName}
                </p>
                <Separator />
                <InfoGrid>
                  <InfoLabel>Difficulty</InfoLabel>
                  <InfoValue>
                    {gameState.difficulty === 'veryhard' ? 'Very Hard' :
                      gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}
                  </InfoValue>
                  <InfoLabel>Balance</InfoLabel>
                  <InfoValue>{formatBalance(gameState.balance)}</InfoValue>
                  <InfoLabel>Date</InfoLabel>
                  <InfoValue>{formatDate(gameState.gameDate)}</InfoValue>
                  <InfoLabel>Bankruptcy</InfoLabel>
                  <InfoValue>{gameState.bankruptcy ? 'Enabled' : 'Disabled'}</InfoValue>
                  <InfoLabel>Competitors</InfoLabel>
                  <InfoValue>{gameState.competitors ? 'Enabled' : 'Disabled'}</InfoValue>
                  <InfoLabel>Infinite Money</InfoLabel>
                  <InfoValue>{gameState.infiniteMoney ? 'On' : 'Off'}</InfoValue>
                </InfoGrid>
              </WelcomeContent>
            </WindowContent>
          </StyledWindow>
        )}

        {menuOpen && (
          <Overlay onClick={handleCloseMenu}>
            <MenuWindow onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <WindowHeader>
                <span>Menu - Paused</span>
              </WindowHeader>
              <WindowContent>
                <MenuContent>
                  <MenuTitle>Game Paused</MenuTitle>
                  <Separator />
                  <MenuButtons>
                    <Button onClick={handleSave} fullWidth>
                      {saveFlash ? 'Saved!' : 'Save Game'}
                    </Button>
                    <Button
                      onClick={handleLoad}
                      fullWidth
                      disabled={!localStorage.getItem(SAVE_KEY)}
                    >
                      Load Game
                    </Button>
                    <Separator />
                    <Button onClick={handleCloseMenu} fullWidth primary>
                      Resume
                    </Button>
                    <Button onClick={handleLeave} fullWidth>
                      Leave to Main Menu
                    </Button>
                  </MenuButtons>
                </MenuContent>
              </WindowContent>
            </MenuWindow>
          </Overlay>
        )}
      </MainArea>

        <NotifPanel $mobileOpen={mobileNotifOpen}>
            {!currentResearch && designingProducts.length === 0 && sellingProducts.length === 0 && (
              <NotifEmpty>No active tasks</NotifEmpty>
            )}
            {currentResearch && (
              <NotifCard onClick={() => setActivePanel(activePanel === 'rnd' ? null : 'rnd')}>
                <NotifIcon src={ICON_RND} alt="" />
                <NotifBody>
                  <NotifTitle>{currentResearch.name}</NotifTitle>
                  <NotifProgressRow>
                    <NotifProgressWrap>
                      <ProgressBar value={researchProgress} />
                    </NotifProgressWrap>
                    <NotifPct>{researchProgress}%</NotifPct>
                  </NotifProgressRow>
                </NotifBody>
              </NotifCard>
            )}
            {designingProducts.map((p) => {
              const pct = Math.min(100, Math.round((p.designDaysCompleted / p.designTimeDays) * 100));
              return (
                <NotifCard key={p.id} onClick={() => setActivePanel(activePanel === 'products' ? null : 'products')}>
                  <NotifIcon src={ICON_HARDWARE} alt="" />
                  <NotifBody>
                    <NotifTitle>{p.name}</NotifTitle>
                    <NotifProgressRow>
                      <NotifProgressWrap>
                        <ProgressBar value={pct} />
                      </NotifProgressWrap>
                      <NotifPct>{pct}%</NotifPct>
                    </NotifProgressRow>
                  </NotifBody>
                </NotifCard>
              );
            })}
            {sellingProducts.map((p) => {
              const history = p.salesHistory || [];
              const todaySales = history.length > 0 ? history[history.length - 1] : 0;
              return (
                <SellingCard key={p.id} onClick={() => setActivePanel(activePanel === 'products' ? null : 'products')}>
                  <SellingHeader>
                    <NotifIcon src={ICON_PRODUCTS} alt="" />
                    <SellingName>{p.brand ? `${p.brand} ` : ''}{p.name}</SellingName>
                  </SellingHeader>
                  <SellingStatsGrid>
                    <SellingStatLabel>Price</SellingStatLabel>
                    <SellingStatValue>${p.price}</SellingStatValue>
                    <SellingStatLabel>Today</SellingStatLabel>
                    <SellingStatValue>{todaySales} units</SellingStatValue>
                    <SellingStatLabel>Total sold</SellingStatLabel>
                    <SellingStatValue>{p.totalUnitsSold.toLocaleString()}</SellingStatValue>
                    <SellingStatLabel>Profit</SellingStatLabel>
                    {(() => {
                      const totalProfit = Math.round(p.totalRevenue - (p.unitCost * p.totalUnitsSold) - p.designCost);
                      return (
                        <SellingStatValue style={{ color: totalProfit >= 0 ? '#006400' : '#cc0000' }}>
                          {totalProfit >= 0 ? '+' : '-'}${Math.abs(totalProfit).toLocaleString()}
                        </SellingStatValue>
                      );
                    })()}
                  </SellingStatsGrid>
                  <SalesGraph history={history} />
                </SellingCard>
              );
            })}
          </NotifPanel>
      </BodyLayout>

      {reviewProduct && (
        <CPUReview
          product={reviewProduct}
          companyLogo={logoDataUrl}
          companyName={gameState.companyName}
          completedResearch={gameState.research.completedResearch}
          onClose={() => {
            setReviewProduct(null);
            setSpeed(speedBeforeReview.current);
          }}
        />
      )}

      {competitorReview && (
        <CPUReview
          product={{
            id: competitorReview.product.id,
            name: competitorReview.product.name,
            brand: competitorReview.product.companyName,
            techProcessId: competitorReview.product.techProcessId,
            packageId: competitorReview.product.packageId,
            coreId: competitorReview.product.coreId,
            clockSpeed: competitorReview.product.clockKHz,
            buildQuality: 75,
            price: competitorReview.product.price,
            unitCost: competitorReview.product.unitCost,
            designCost: 0,
            designTimeDays: 0,
            designStartDate: competitorReview.product.releaseDate,
            status: 'selling',
            designDaysCompleted: 0,
            totalUnitsSold: 0,
            totalRevenue: 0,
            sellStartDate: competitorReview.product.releaseDate,
            salesHistory: [],
            daysOnSale: 0,
            salesBoost: 0,
            previousPrice: competitorReview.product.price,
            performance: competitorReview.product.performance,
            stability: competitorReview.product.stability,
            build: competitorReview.product.build,
          }}
          companyLogo={'data:image/svg+xml,' + encodeURIComponent(competitorReview.companyLogoSvg)}
          companyName={competitorReview.product.companyName}
          isCompetitor
          completedResearch={gameState.research.completedResearch}
          onClose={() => {
            setCompetitorReview(null);
            setSpeed(speedBeforeReview.current);
          }}
        />
      )}

      {newsItems.length > 0 && (
        <NewsPanel>
          {newsItems.map((item, i) => (
            <NewsItem key={i}>
              <NewsIcon>&#128240;</NewsIcon>
              {item}
            </NewsItem>
          ))}
        </NewsPanel>
      )}

      {toast && (
        <Toast>
          <ToastIcon>&#10003;</ToastIcon>
          {toast}
        </Toast>
      )}

    </DashboardWrapper>
  );
}

const MOBILE = '@media (max-width: 768px)';

const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const TopBar = styled(Toolbar)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  min-height: 36px;
  flex-shrink: 0;
  background: #c0c0c0;
  border-bottom: 2px outset #dfdfdf;
  overflow: hidden;

  ${MOBILE} {
    padding: 4px 6px;
    gap: 4px;
  }
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const MenuButton = styled(Button)`
  font-weight: 700;
  font-size: 12px;
  padding: 2px 12px;
`;

const BarSeparator = styled(Separator)`
  height: 24px;

  ${MOBILE} {
    display: none;
  }
`;

const CompanyLogo = styled.img`
  width: 24px;
  height: 24px;

  ${MOBILE} {
    display: none;
  }
`;

const CompanyName = styled.span`
  font-weight: 700;
  font-size: 13px;

  ${MOBILE} {
    display: none;
  }
`;

const DateDisplay = styled.span`
  font-size: 13px;
  font-weight: 700;
  min-width: 120px;
  font-variant-numeric: tabular-nums;

  ${MOBILE} {
    min-width: auto;
    font-size: 12px;
  }
`;

const SpeedControls = styled.div`
  display: flex;
  gap: 2px;
`;

const SpeedButton = styled(Button)`
  min-width: 32px;
  font-size: 11px;
  padding: 2px 6px;
`;

const NotifPanel = styled.div<{ $mobileOpen?: boolean }>`
  width: 180px;
  background: #c0c0c0;
  border-left: 2px outset #dfdfdf;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  overflow-y: auto;
  flex-shrink: 0;

  ${MOBILE} {
    display: ${({ $mobileOpen }) => ($mobileOpen ? 'flex' : 'none')};
    position: fixed;
    top: 36px;
    right: 0;
    bottom: 48px;
    width: 200px;
    z-index: 90;
    box-shadow: -2px 0 8px rgba(0,0,0,0.3);
  }
`;

const NotifToggle = styled(Button)`
  display: none;

  ${MOBILE} {
    display: flex;
    align-items: center;
    font-size: 11px;
    padding: 2px 6px;
  }
`;

const NotifEmpty = styled.div`
  font-size: 10px;
  color: #888;
  text-align: center;
  padding: 12px 4px;
  font-style: italic;
`;

const NotifCard = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border: 2px outset #dfdfdf;
  background: #fff;
  cursor: pointer;
  min-height: 58px;

  &:hover {
    background: #f0f0ff;
  }
`;

const NotifIcon = styled.img`
  width: 24px;
  height: 24px;
  image-rendering: pixelated;
  flex-shrink: 0;
`;

const NotifBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotifTitle = styled.div`
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
`;

const NotifProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NotifProgressWrap = styled.div`
  flex: 1;
  transform: scaleY(0.7);
`;

const NotifPct = styled.span`
  font-size: 9px;
  font-weight: 700;
  color: #333;
  min-width: 24px;
  text-align: right;
`;

const BalanceDisplay = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #006400;
  padding: 2px 8px;
  border: 2px inset #dfdfdf;
  background: #fff;
  min-width: 120px;
  text-align: right;
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  &:hover {
    background: #f0fff0;
  }

  ${MOBILE} {
    font-size: 12px;
    min-width: auto;
    padding: 2px 6px;
  }
`;

const BodyLayout = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;

  ${MOBILE} {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 100px;
  background: #c0c0c0;
  border-right: 2px outset #dfdfdf;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
  overflow-y: auto;
  flex-shrink: 0;

  ${MOBILE} {
    width: 100%;
    height: 44px;
    min-height: 44px;
    flex-direction: row;
    border-right: none;
    border-top: 2px outset #dfdfdf;
    order: 2;
    overflow-x: auto;
    overflow-y: hidden;
    gap: 1px;
    padding: 2px;
    -webkit-overflow-scrolling: touch;
  }
`;

const SidebarButton = styled(Button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  min-height: 64px;
  width: 100%;

  ${MOBILE} {
    min-height: auto;
    min-width: 56px;
    width: auto;
    padding: 4px 6px;
    gap: 2px;
    flex-shrink: 0;
  }
`;

const SidebarIcon = styled.img`
  width: 32px;
  height: 32px;
  image-rendering: pixelated;

  ${MOBILE} {
    width: 24px;
    height: 24px;
  }
`;

const SidebarLabel = styled.span`
  font-size: 10px;
  text-align: center;
  line-height: 1.1;

  ${MOBILE} {
    display: none;
  }
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: auto;
  position: relative;

  ${MOBILE} {
    padding: 4px;
    align-items: flex-start;
    order: 1;
    min-height: 0;
  }
`;

const StyledWindow = styled(Window)`
  width: 460px;

  ${MOBILE} {
    width: 100%;
  }
`;

const WelcomeContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
`;

const WelcomeLogo = styled.img`
  width: 80px;
  height: 80px;
  margin-bottom: 8px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 16px;
  width: 100%;
  margin-top: 12px;
  font-size: 12px;
`;

const InfoLabel = styled.span`
  font-weight: 700;
  text-align: right;
`;

const InfoValue = styled.span`
  color: #333;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const MenuWindow = styled(Window)`
  width: 320px;

  ${MOBILE} {
    width: 90vw;
    max-width: 320px;
  }
`;

const MenuContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
`;

const MenuTitle = styled.h2`
  margin: 0;
  font-size: 16px;
`;

const MenuButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const Toast = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 2px outset #dfdfdf;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 200;
  animation: toast-in 0.2s ease-out;

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;

const ToastIcon = styled.span`
  color: #2e7d32;
  font-size: 16px;
`;

const SellingCard = styled.div`
  border: 2px outset #dfdfdf;
  background: #fff;
  padding: 6px;
  cursor: pointer;
  min-height: 146px;

  &:hover {
    background: #f0fff0;
  }
`;

const SellingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
`;

const SellingName = styled.span`
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SellingStatsGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1px 6px;
  font-size: 9px;
`;

const SellingStatLabel = styled.span`
  color: #666;
  text-align: right;
`;

const SellingStatValue = styled.span`
  font-weight: 700;
  color: #222;
  min-width: 0;
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SalesGraphWrap = styled.div`
  margin-top: 4px;
  border: 1px inset #dfdfdf;
  background: #fafafa;
  padding: 2px;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 46px;
  overflow: hidden;
`;

const NewsPanel = styled.div`
  position: fixed;
  top: 44px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 180;
  animation: news-in 0.3s ease-out;

  @keyframes news-in {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;

const NewsItem = styled.div`
  background: #fffde7;
  border: 2px outset #dfdfdf;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  white-space: nowrap;

  ${MOBILE} {
    white-space: normal;
    font-size: 11px;
    padding: 6px 10px;
    max-width: 90vw;
  }
`;

const NewsIcon = styled.span`
  font-size: 14px;
`;
