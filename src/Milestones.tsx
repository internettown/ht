import styled from 'styled-components';
import { Window, WindowHeader, WindowContent, ProgressBar } from 'react95';
import type { GameState } from './types';
import { computeReviewScore } from './cpuScoring';

interface MilestonesProps {
  gameState: GameState;
  onClose: () => void;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'research' | 'product' | 'market';
  check: (gs: GameState) => boolean;
  progress?: (gs: GameState) => number; // 0-100
}

const MILESTONES: Milestone[] = [
  // === Business milestones ===
  {
    id: 'first-dollar',
    name: 'First Dollar',
    description: 'Earn your first revenue from CPU sales',
    category: 'business',
    check: (gs) => gs.products.some(p => p.totalRevenue > 0),
  },
  {
    id: 'revenue-100k',
    name: 'Six Figures',
    description: 'Earn $100,000 in total revenue',
    category: 'business',
    check: (gs) => gs.products.reduce((s, p) => s + p.totalRevenue, 0) >= 100_000,
    progress: (gs) => Math.min(100, (gs.products.reduce((s, p) => s + p.totalRevenue, 0) / 100_000) * 100),
  },
  {
    id: 'revenue-1m',
    name: 'Millionaire',
    description: 'Earn $1,000,000 in total revenue',
    category: 'business',
    check: (gs) => gs.products.reduce((s, p) => s + p.totalRevenue, 0) >= 1_000_000,
    progress: (gs) => Math.min(100, (gs.products.reduce((s, p) => s + p.totalRevenue, 0) / 1_000_000) * 100),
  },
  {
    id: 'revenue-10m',
    name: 'Mega Corp',
    description: 'Earn $10,000,000 in total revenue',
    category: 'business',
    check: (gs) => gs.products.reduce((s, p) => s + p.totalRevenue, 0) >= 10_000_000,
    progress: (gs) => Math.min(100, (gs.products.reduce((s, p) => s + p.totalRevenue, 0) / 10_000_000) * 100),
  },
  {
    id: 'balance-500k',
    name: 'Cash Reserves',
    description: 'Have $500,000 in the bank at once',
    category: 'business',
    check: (gs) => gs.balance >= 500_000,
  },
  {
    id: 'balance-5m',
    name: 'War Chest',
    description: 'Have $5,000,000 in the bank at once',
    category: 'business',
    check: (gs) => gs.balance >= 5_000_000,
  },
  {
    id: 'loan-paid',
    name: 'Debt Free',
    description: 'Pay off a loan completely',
    category: 'business',
    check: (gs) => gs.bank.loanPrincipal > 0 && gs.bank.loanBalance === 0,
  },

  // === Product milestones ===
  {
    id: 'first-cpu',
    name: 'Hello World',
    description: 'Design and release your first CPU',
    category: 'product',
    check: (gs) => gs.products.some(p => p.status === 'selling' || p.status === 'discontinued'),
  },
  {
    id: '5-cpus',
    name: 'Product Line',
    description: 'Release 5 CPUs total',
    category: 'product',
    check: (gs) => gs.products.filter(p => p.status !== 'designing').length >= 5,
    progress: (gs) => Math.min(100, (gs.products.filter(p => p.status !== 'designing').length / 5) * 100),
  },
  {
    id: '10-cpus',
    name: 'Mass Production',
    description: 'Release 10 CPUs total',
    category: 'product',
    check: (gs) => gs.products.filter(p => p.status !== 'designing').length >= 10,
    progress: (gs) => Math.min(100, (gs.products.filter(p => p.status !== 'designing').length / 10) * 100),
  },
  {
    id: 'units-10k',
    name: 'Popular Choice',
    description: 'Sell 10,000 units of a single CPU',
    category: 'product',
    check: (gs) => gs.products.some(p => p.totalUnitsSold >= 10_000),
    progress: (gs) => {
      const best = Math.max(0, ...gs.products.map(p => p.totalUnitsSold));
      return Math.min(100, (best / 10_000) * 100);
    },
  },
  {
    id: 'units-100k',
    name: 'Bestseller',
    description: 'Sell 100,000 units of a single CPU',
    category: 'product',
    check: (gs) => gs.products.some(p => p.totalUnitsSold >= 100_000),
    progress: (gs) => {
      const best = Math.max(0, ...gs.products.map(p => p.totalUnitsSold));
      return Math.min(100, (best / 100_000) * 100);
    },
  },
  {
    id: 'review-80',
    name: 'Critical Acclaim',
    description: 'Get a review score of 80+ on a CPU',
    category: 'product',
    check: (gs) => gs.products.some(p => (p.status === 'selling' || p.status === 'discontinued') && computeReviewScore(p) >= 80),
  },
  {
    id: 'review-95',
    name: 'Masterpiece',
    description: 'Get a review score of 95+ on a CPU',
    category: 'product',
    check: (gs) => gs.products.some(p => (p.status === 'selling' || p.status === 'discontinued') && computeReviewScore(p) >= 95),
  },
  {
    id: 'brand-created',
    name: 'Brand Identity',
    description: 'Create a CPU brand',
    category: 'product',
    check: (gs) => gs.cpuBrands.length > 0,
  },

  // === Research milestones ===
  {
    id: 'first-research',
    name: 'Eureka!',
    description: 'Complete your first research',
    category: 'research',
    check: (gs) => gs.research.completedResearch.length > 0,
  },
  {
    id: 'research-10',
    name: 'Knowledge Base',
    description: 'Complete 10 research projects',
    category: 'research',
    check: (gs) => gs.research.completedResearch.length >= 10,
    progress: (gs) => Math.min(100, (gs.research.completedResearch.length / 10) * 100),
  },
  {
    id: 'research-25',
    name: 'Research Lab',
    description: 'Complete 25 research projects',
    category: 'research',
    check: (gs) => gs.research.completedResearch.length >= 25,
    progress: (gs) => Math.min(100, (gs.research.completedResearch.length / 25) * 100),
  },
  {
    id: 'clock-1mhz',
    name: 'Megahertz Barrier',
    description: 'Research 1.5MHz max clock speed',
    category: 'research',
    check: (gs) => gs.research.completedResearch.includes('1500khz'),
  },
  {
    id: 'clock-1ghz',
    name: 'Gigahertz Club',
    description: 'Research 1.1GHz max clock speed',
    category: 'research',
    check: (gs) => gs.research.completedResearch.includes('1100mhz'),
  },
  {
    id: 'dual-core',
    name: 'Two Brains',
    description: 'Research dual-core technology',
    category: 'research',
    check: (gs) => gs.research.completedResearch.includes('dual-core'),
  },
  {
    id: 'quad-core',
    name: 'Four Cores',
    description: 'Research quad-core technology',
    category: 'research',
    check: (gs) => gs.research.completedResearch.includes('quad-core'),
  },
  {
    id: 'process-1um',
    name: 'Shrink Ray',
    description: 'Research the 1 um process',
    category: 'research',
    check: (gs) => gs.research.completedResearch.includes('1um'),
  },
  {
    id: 'process-sub-100nm',
    name: 'Nanotechnology',
    description: 'Research the 90 nm process',
    category: 'research',
    check: (gs) => gs.research.completedResearch.includes('90nm'),
  },
  {
    id: 'plcc-unlocked',
    name: 'New Package',
    description: 'Research a PLCC package',
    category: 'research',
    check: (gs) => gs.research.completedResearch.includes('24-plcc'),
  },
  {
    id: 'pga-unlocked',
    name: 'Pin Grid Array',
    description: 'Research a PGA package',
    category: 'research',
    check: (gs) => gs.research.completedResearch.includes('48-pga'),
  },

  // === Market milestones ===
  {
    id: 'first-campaign',
    name: 'Spread the Word',
    description: 'Launch a marketing campaign',
    category: 'market',
    check: (gs) => gs.marketing.campaigns.length > 0,
  },
  {
    id: 'hype-50',
    name: 'Buzzing',
    description: 'Reach 50 hype',
    category: 'market',
    check: (gs) => gs.marketing.hype >= 50,
  },
  {
    id: 'hype-90',
    name: 'Maximum Hype',
    description: 'Reach 90 hype',
    category: 'market',
    check: (gs) => gs.marketing.hype >= 90,
  },
  {
    id: 'competitor-met',
    name: 'The Competition',
    description: 'Encounter your first competitor',
    category: 'market',
    check: (gs) => gs.competitorState.knownCompanies.length > 0,
  },
  {
    id: 'survive-5-years',
    name: 'Five Year Plan',
    description: 'Survive for 5 years',
    category: 'market',
    check: (gs) => {
      const start = new Date('1970-01-01');
      const now = new Date(gs.gameDate);
      return (now.getTime() - start.getTime()) / (365.25 * 86400000) >= 5;
    },
  },
  {
    id: 'survive-10-years',
    name: 'Decade of Innovation',
    description: 'Survive for 10 years',
    category: 'market',
    check: (gs) => {
      const start = new Date('1970-01-01');
      const now = new Date(gs.gameDate);
      return (now.getTime() - start.getTime()) / (365.25 * 86400000) >= 10;
    },
  },
  {
    id: 'survive-20-years',
    name: 'Industry Veteran',
    description: 'Survive for 20 years',
    category: 'market',
    check: (gs) => {
      const start = new Date('1970-01-01');
      const now = new Date(gs.gameDate);
      return (now.getTime() - start.getTime()) / (365.25 * 86400000) >= 20;
    },
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  business: 'Business',
  product: 'Product',
  research: 'Research',
  market: 'Market',
};

const CATEGORY_COLORS: Record<string, string> = {
  business: '#2c6fbb',
  product: '#4a4a4a',
  research: '#8b4513',
  market: '#006400',
};

export default function Milestones({ gameState, onClose }: MilestonesProps) {
  const completed = MILESTONES.filter(m => m.check(gameState));
  const total = MILESTONES.length;

  const categories = ['business', 'product', 'research', 'market'] as const;

  return (
    <StyledWindow>
      <WindowHeader>
        <span>Milestones</span>
        <CloseBtn onClick={onClose}>X</CloseBtn>
      </WindowHeader>
      <WindowContent>
        <SummaryBar>
          <SummaryText>{completed.length} / {total} completed</SummaryText>
          <ProgressWrap>
            <ProgressBar value={Math.round((completed.length / total) * 100)} />
          </ProgressWrap>
        </SummaryBar>

        <ScrollArea>
        {categories.map(cat => {
          const items = MILESTONES.filter(m => m.category === cat);
          const catCompleted = items.filter(m => m.check(gameState)).length;
          return (
            <CategorySection key={cat}>
              <CategoryHeader>
                <CategoryDot style={{ background: CATEGORY_COLORS[cat] }} />
                {CATEGORY_LABELS[cat]}
                <CategoryCount>{catCompleted}/{items.length}</CategoryCount>
              </CategoryHeader>
              <MilestoneList>
                {items.map(m => {
                  const done = m.check(gameState);
                  const pct = !done && m.progress ? Math.round(m.progress(gameState)) : done ? 100 : 0;
                  return (
                    <MilestoneItem key={m.id} $done={done}>
                      <MilestoneIcon>{done ? '\u2605' : '\u2606'}</MilestoneIcon>
                      <MilestoneInfo>
                        <MilestoneName $done={done}>{m.name}</MilestoneName>
                        <MilestoneDesc>{m.description}</MilestoneDesc>
                        {!done && pct > 0 && (
                          <ProgressMini>
                            <ProgressBar value={pct} />
                            <ProgressPct>{pct}%</ProgressPct>
                          </ProgressMini>
                        )}
                      </MilestoneInfo>
                    </MilestoneItem>
                  );
                })}
              </MilestoneList>
            </CategorySection>
          );
        })}
        </ScrollArea>
      </WindowContent>
    </StyledWindow>
  );
}

export { MILESTONES };

const StyledWindow = styled(Window)`
  width: 100%;
  max-width: 520px;
`;

const ScrollArea = styled.div`
  max-height: 420px;
  overflow-y: auto;
`;

const CloseBtn = styled.button`
  margin-left: auto;
  font-weight: bold;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
`;

const SummaryBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const SummaryText = styled.span`
  font-weight: bold;
  font-size: 13px;
  white-space: nowrap;
`;

const ProgressWrap = styled.div`
  flex: 1;
`;

const CategorySection = styled.div`
  margin-bottom: 8px;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  font-size: 13px;
  padding: 4px 0;
  border-bottom: 1px solid #888;
  margin-bottom: 4px;
`;

const CategoryDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 2px;
`;

const CategoryCount = styled.span`
  margin-left: auto;
  font-size: 11px;
  color: #666;
  font-weight: normal;
`;

const MilestoneList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MilestoneItem = styled.div<{ $done: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 6px;
  opacity: ${p => p.$done ? 1 : 0.7};
  background: ${p => p.$done ? 'rgba(0, 100, 0, 0.06)' : 'transparent'};
`;

const MilestoneIcon = styled.span`
  font-size: 16px;
  line-height: 1;
  margin-top: 1px;
`;

const MilestoneInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MilestoneName = styled.div<{ $done: boolean }>`
  font-weight: bold;
  font-size: 12px;
  color: ${p => p.$done ? '#006400' : '#333'};
`;

const MilestoneDesc = styled.div`
  font-size: 11px;
  color: #666;
`;

const ProgressMini = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  max-width: 180px;
`;

const ProgressPct = styled.span`
  font-size: 10px;
  color: #888;
  white-space: nowrap;
`;
