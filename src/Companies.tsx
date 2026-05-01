import styled from 'styled-components';
import { Window, WindowHeader, WindowContent } from 'react95';
import type { GameState } from './types';
import { COMPETITOR_COMPANIES, generateCompanyLogoSvg } from './competitorData';

const COMPETITOR_REPUTATION: Record<string, number> = {
  inlet: 1.35,
  imd: 1.25,
  iam: 1.18,
  nic: 1.08,
  morotola: 1.05,
  fastchild: 0.98,
  sekkusu: 0.92,
  element: 0.88,
  zelog: 0.82,
  toshina: 0.72,
};

function getEraValuationFloor(compId: string, currentYear: number): number {
  const yearsElapsed = Math.max(0, currentYear - 1970);
  const eraScale = Math.pow(yearsElapsed + 1, 1.25);
  const reputation = COMPETITOR_REPUTATION[compId] || 0.85;
  return Math.round(45_000 * eraScale * reputation);
}

interface CompaniesProps {
  gameState: GameState;
  onClose: () => void;
}

interface CompanyEntry {
  id: string;
  name: string;
  logoSvg: string;
  color: string;
  valuation: number;
  isPlayer: boolean;
  productCount: number;
}

function formatValuation(v: number): string {
  if (v >= 1_000_000) return '$' + (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000) return '$' + (v / 1_000).toFixed(0) + 'K';
  return '$' + v.toLocaleString();
}

export default function Companies({ gameState, onClose }: CompaniesProps) {
  const cs = gameState.competitorState;
  const currentYear = new Date(gameState.gameDate).getFullYear();
  const companies: CompanyEntry[] = [];

  // Player company valuation emphasizes durable profit instead of raw lifetime revenue.
  const playerValuation = gameState.products.reduce((s, p) => {
    const productProfit = p.totalRevenue - p.designCost - p.totalUnitsSold * p.unitCost;
    return s + Math.max(0, productProfit);
  }, Math.max(0, gameState.balance === Infinity ? 0 : gameState.balance));
  companies.push({
    id: 'player',
    name: gameState.companyName,
    logoSvg: gameState.logoSvg,
    color: '#FFD700',
    valuation: Math.round(playerValuation),
    isPlayer: true,
    productCount: gameState.products.length,
  });

  // Competitor companies (only ones we've seen)
  for (const compId of cs.knownCompanies) {
    const comp = COMPETITOR_COMPANIES.find(c => c.id === compId);
    if (!comp) continue;
    const activeProducts = cs.activeProducts.filter(p => p.companyId === compId);
    const activeProductValue = activeProducts.reduce(
      (sum, p) => sum + p.salesPower * Math.max(75, p.price) * 2.5,
      0,
    );
    const valuation = Math.max(
      cs.companyValuations[compId] || 0,
      getEraValuationFloor(compId, currentYear) + activeProductValue,
    );
    // Count all released CPUs for this company
    const totalProducts = cs.releasedCPUIds.length > 0
      ? activeProducts.length
      : 0;

    companies.push({
      id: compId,
      name: comp.name,
      logoSvg: generateCompanyLogoSvg(comp),
      color: comp.color,
      valuation,
      isPlayer: false,
      productCount: Math.max(totalProducts, 1),
    });
  }

  // Sort by valuation descending
  companies.sort((a, b) => b.valuation - a.valuation);

  const maxVal = Math.max(...companies.map(c => c.valuation), 1);

  return (
    <StyledWindow>
      <WindowHeader>
        <HeaderRow>
          <span>Companies</span>
          <CloseButton onClick={onClose}>X</CloseButton>
        </HeaderRow>
      </WindowHeader>
      <WindowContent>
        <ChartSection>
          <ChartTitle>Company Valuations</ChartTitle>
          <BarChart>
            {companies.map(c => (
              <BarRow key={c.id}>
                <BarLabel $isPlayer={c.isPlayer}>{c.name}</BarLabel>
                <BarTrack>
                  <BarFill style={{ width: `${(c.valuation / maxVal) * 100}%`, background: c.isPlayer ? '#FFD700' : c.color }} />
                </BarTrack>
                <BarValue>{formatValuation(c.valuation)}</BarValue>
              </BarRow>
            ))}
          </BarChart>
        </ChartSection>

        <CompanyList>
          {companies.map((c, i) => {
            const logoUrl = 'data:image/svg+xml,' + encodeURIComponent(c.logoSvg);
            return (
              <CompanyCard key={c.id} $isPlayer={c.isPlayer}>
                <RankBadge>#{i + 1}</RankBadge>
                <CompanyLogo src={logoUrl} alt={c.name} />
                <CompanyInfo>
                  <CompanyNameRow>
                    <CompanyNameText>{c.name}</CompanyNameText>
                    {c.isPlayer && <PlayerTag>YOU</PlayerTag>}
                  </CompanyNameRow>
                  <CompanyValText>{formatValuation(c.valuation)}</CompanyValText>
                </CompanyInfo>
                <ProductBadge>{c.productCount} CPU{c.productCount !== 1 ? 's' : ''}</ProductBadge>
              </CompanyCard>
            );
          })}
        </CompanyList>

        {companies.length <= 1 && (
          <EmptyMsg>No competitors have entered the market yet.</EmptyMsg>
        )}
      </WindowContent>
    </StyledWindow>
  );
}

const StyledWindow = styled(Window)`
  width: 520px;
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

const ChartSection = styled.div`
  margin-bottom: 12px;
  border: 2px inset #dfdfdf;
  padding: 8px;
  background: #fff;
`;

const ChartTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #555;
  margin-bottom: 6px;
  text-transform: uppercase;
`;

const BarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BarLabel = styled.span<{ $isPlayer: boolean }>`
  font-size: 10px;
  font-weight: ${p => p.$isPlayer ? 700 : 400};
  width: 70px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${p => p.$isPlayer ? '#8B6914' : '#333'};
`;

const BarTrack = styled.div`
  flex: 1;
  height: 14px;
  background: #e8e8e8;
  border: 1px solid #ccc;
`;

const BarFill = styled.div`
  height: 100%;
  min-width: 2px;
  transition: width 0.3s ease;
`;

const BarValue = styled.span`
  font-size: 9px;
  font-weight: 700;
  width: 55px;
  text-align: right;
  color: #333;
`;

const CompanyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 320px;
  overflow-y: auto;
`;

const CompanyCard = styled.div<{ $isPlayer: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 2px outset #dfdfdf;
  background: ${p => p.$isPlayer ? '#fffde7' : '#fff'};
`;

const RankBadge = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #888;
  width: 24px;
  text-align: center;
`;

const CompanyLogo = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const CompanyInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CompanyNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CompanyNameText = styled.span`
  font-weight: 700;
  font-size: 13px;
`;

const PlayerTag = styled.span`
  font-size: 9px;
  font-weight: 700;
  background: #FFD700;
  color: #333;
  padding: 1px 4px;
  border-radius: 2px;
`;

const CompanyValText = styled.div`
  font-size: 11px;
  color: #006400;
  font-weight: 700;
`;

const ProductBadge = styled.span`
  font-size: 10px;
  color: #666;
  white-space: nowrap;
`;

const EmptyMsg = styled.p`
  text-align: center;
  color: #888;
  font-size: 12px;
  font-style: italic;
  padding: 16px;
  margin: 0;
`;
