import styled from 'styled-components';
import { Window, WindowHeader, WindowContent } from 'react95';
import type { GameState } from './types';
import { COMPETITOR_COMPANIES } from './competitorData';
import { formatClock } from './cpuData';

const PLAYER_MARKET_POWER_MULTIPLIER = 0.22;
const PLAYER_BASE_PRODUCT_POWER = 25;
const COMPETITOR_MARKET_POWER_MULTIPLIER = 1.8;
const COMPETITOR_BASE_PRODUCT_POWER = 90;

interface MarketProps {
  gameState: GameState;
  onClose: () => void;
}

interface MarketSlice {
  id: string;
  name: string;
  label: string; // company name
  color: string;
  share: number; // 0-1
  isPlayer: boolean;
}

// Simple pie chart using SVG arcs
function PieChart({ slices }: { slices: MarketSlice[] }) {
  if (slices.length === 0) return null;

  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  let cumAngle = -Math.PI / 2; // start at top

  const paths = slices.map((slice) => {
    const angle = slice.share * 2 * Math.PI;
    const startX = cx + r * Math.cos(cumAngle);
    const startY = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const endX = cx + r * Math.cos(cumAngle);
    const endY = cy + r * Math.sin(cumAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    if (slice.share >= 0.999) {
      return <circle key={slice.id} cx={cx} cy={cy} r={r} fill={slice.color} />;
    }

    return (
      <path
        key={slice.id}
        d={`M${cx},${cy} L${startX},${startY} A${r},${r} 0 ${largeArc},1 ${endX},${endY} Z`}
        fill={slice.color}
        stroke="#fff"
        strokeWidth="1"
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
      <circle cx={cx} cy={cy} r={25} fill="#fff" />
    </svg>
  );
}

export default function Market({ gameState, onClose }: MarketProps) {
  const cs = gameState.competitorState;
  const sellingProducts = gameState.products.filter(p => p.status === 'selling');
  const hasPlayerProducts = sellingProducts.length > 0;

  // Calculate market shares
  const entries: { id: string; companyId: string; name: string; cpuName: string; salesPower: number; isPlayer: boolean; color: string; price: number; clockKHz: number; performance: number }[] = [];

  // Player products
  for (const p of sellingProducts) {
    const history = p.salesHistory || [];
    const recentSales = history.slice(-7).reduce((s, v) => s + v, 0);
    const valuePenalty = p.price > p.unitCost * 2.5 ? 0.7 : 1;
    entries.push({
      id: p.id,
      companyId: 'player',
      name: gameState.companyName,
      cpuName: (p.brand ? p.brand + ' ' : '') + p.name,
      salesPower: Math.max(
        PLAYER_BASE_PRODUCT_POWER,
        (recentSales * PLAYER_MARKET_POWER_MULTIPLIER + p.performance * 0.8 + p.build * 0.4) * valuePenalty,
      ),
      isPlayer: true,
      color: '#FFD700',
      price: p.price,
      clockKHz: p.clockSpeed,
      performance: p.performance,
    });
  }

  // Competitor products
  for (const p of cs.activeProducts) {
    const comp = COMPETITOR_COMPANIES.find(c => c.id === p.companyId);
    entries.push({
      id: p.id,
      companyId: p.companyId,
      name: p.companyName,
      cpuName: p.name,
      salesPower: (
        COMPETITOR_BASE_PRODUCT_POWER +
        p.salesPower * COMPETITOR_MARKET_POWER_MULTIPLIER +
        p.performance * 4
      ) * (hasPlayerProducts ? 1 : 0.35),
      isPlayer: false,
      color: comp?.color || '#888',
      price: p.price,
      clockKHz: p.clockKHz,
      performance: p.performance,
    });
  }

  // Aggregate by company for pie chart
  const companyMap = new Map<string, { name: string; totalPower: number; color: string; isPlayer: boolean }>();
  for (const e of entries) {
    const existing = companyMap.get(e.companyId);
    if (existing) {
      existing.totalPower += e.salesPower;
    } else {
      companyMap.set(e.companyId, { name: e.name, totalPower: e.salesPower, color: e.color, isPlayer: e.isPlayer });
    }
  }

  const totalPower = Array.from(companyMap.values()).reduce((s, c) => s + c.totalPower, 0);
  const slices: MarketSlice[] = Array.from(companyMap.entries())
    .map(([id, c]) => ({
      id,
      name: c.name,
      label: c.name,
      color: c.color,
      share: totalPower > 0 ? c.totalPower / totalPower : 0,
      isPlayer: c.isPlayer,
    }))
    .sort((a, b) => b.share - a.share);

  const hasProducts = entries.length > 0;

  return (
    <StyledWindow>
      <WindowHeader>
        <HeaderRow>
          <span>Market</span>
          <CloseButton onClick={onClose}>X</CloseButton>
        </HeaderRow>
      </WindowHeader>
      <WindowContent>
        {!hasProducts ? (
          <EmptyMsg>No products on the market yet.</EmptyMsg>
        ) : (
          <>
            <ChartRow>
              <PieChart slices={slices} />
              <Legend>
                <LegendTitle>Market Share</LegendTitle>
                {slices.map(s => (
                  <LegendItem key={s.id}>
                    <LegendColor style={{ background: s.color }} />
                    <LegendName $isPlayer={s.isPlayer}>{s.name}</LegendName>
                    <LegendPct>{(s.share * 100).toFixed(1)}%</LegendPct>
                  </LegendItem>
                ))}
              </Legend>
            </ChartRow>

            <ProductsTitle>Active Products ({entries.length})</ProductsTitle>
            <ProductList>
              {entries.sort((a, b) => b.salesPower - a.salesPower).map(e => (
                <ProductRow key={e.id}>
                  <ProdColor style={{ background: e.color }} />
                  <ProdInfo>
                    <ProdName $isPlayer={e.isPlayer}>{e.cpuName}</ProdName>
                    <ProdCompany>{e.name}</ProdCompany>
                  </ProdInfo>
                  <ProdStats>
                    <ProdStat>${e.price}</ProdStat>
                    <ProdStat>{formatClock(e.clockKHz)}</ProdStat>
                    <ProdStat>Perf: {e.performance}</ProdStat>
                  </ProdStats>
                  <ProdShare>{totalPower > 0 ? ((e.salesPower / totalPower) * 100).toFixed(1) : '0'}%</ProdShare>
                </ProductRow>
              ))}
            </ProductList>
          </>
        )}
      </WindowContent>
    </StyledWindow>
  );
}

const StyledWindow = styled(Window)`
  width: 560px;
  max-width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const CloseButton = styled.button`
  background: #c0c0c0;
  border: 2px outset #dfdfdf;
  font-weight: 700;
  font-size: 10px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  &:active { border-style: inset; }
`;

const ChartRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 12px;
  padding: 8px;
  border: 2px inset #dfdfdf;
  background: #fff;
`;

const Legend = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LegendTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 4px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border: 1px solid #999;
  flex-shrink: 0;
`;

const LegendName = styled.span<{ $isPlayer: boolean }>`
  font-size: 11px;
  font-weight: ${p => p.$isPlayer ? 700 : 400};
  flex: 1;
`;

const LegendPct = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #333;
`;

const ProductsTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 4px;
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 280px;
  overflow-y: auto;
`;

const ProductRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border: 1px solid #ddd;
  background: #fafafa;
`;

const ProdColor = styled.div`
  width: 4px;
  height: 28px;
  flex-shrink: 0;
`;

const ProdInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProdName = styled.div<{ $isPlayer: boolean }>`
  font-size: 11px;
  font-weight: 700;
  color: ${p => p.$isPlayer ? '#8B6914' : '#222'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProdCompany = styled.div`
  font-size: 9px;
  color: #888;
`;

const ProdStats = styled.div`
  display: flex;
  gap: 8px;
`;

const ProdStat = styled.span`
  font-size: 9px;
  color: #555;
  white-space: nowrap;
`;

const ProdShare = styled.span`
  font-size: 11px;
  font-weight: 700;
  width: 40px;
  text-align: right;
`;

const EmptyMsg = styled.p`
  text-align: center;
  color: #888;
  font-size: 12px;
  font-style: italic;
  padding: 24px;
  margin: 0;
`;
