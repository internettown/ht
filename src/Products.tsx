import { useState } from 'react';
import styled from 'styled-components';
import {
  Button,
  Window,
  WindowHeader,
  WindowContent,
  ProgressBar,
  Separator,
  GroupBox,
  TextInput,
  Tabs,
  Tab,
  TabBody,
} from 'react95';
import type { GameState, CPUProduct } from './types';
import { TECH_PROCESSES, CPU_PACKAGES, CORE_TYPES, formatClock } from './cpuData';
import { MAX_SELL_PRICE, computeReviewScore } from './cpuScoring';

interface ProductsProps {
  gameState: GameState;
  onChangePrice: (productId: string, newPrice: number) => void;
  onDiscontinue: (productId: string) => void;
  onClose: () => void;
}

function lookupName(id: string, list: { id: string; name: string }[]): string {
  return list.find((i) => i.id === id)?.name ?? id;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export default function Products({ gameState, onChangePrice, onDiscontinue, onClose }: ProductsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const designing = gameState.products.filter((p) => p.status === 'designing');
  const selling = gameState.products.filter((p) => p.status === 'selling');
  const discontinued = gameState.products.filter((p) => p.status === 'discontinued');

  const handleSavePrice = (id: string) => {
    const num = parseFloat(editPrice);
    if (!isNaN(num) && num > 0) {
      onChangePrice(id, Math.min(MAX_SELL_PRICE, num));
    }
    setEditingPriceId(null);
  };

  const renderProduct = (product: CPUProduct, showActions: boolean) => {
    const daysOnSale = product.sellStartDate
      ? daysBetween(product.sellStartDate, gameState.gameDate)
      : 0;

    const reviewScore = product.status !== 'designing'
      ? computeReviewScore(product, false, { completedResearch: gameState.research.completedResearch })
      : null;

    return (
      <ProductCard key={product.id}>
        <ProductHeader>
          <ProductName>
            {product.brand && <BrandTag>{product.brand}</BrandTag>}
            {product.name}
            {reviewScore !== null && (
              <ScoreBadge $score={reviewScore}>{reviewScore}</ScoreBadge>
            )}
          </ProductName>
          <StatusBadge $status={product.status}>
            {product.status === 'designing' ? 'In Development' :
             product.status === 'selling' ? 'On Sale' : 'Discontinued'}
          </StatusBadge>
        </ProductHeader>

        <ProductGrid>
          <GridLabel>Process:</GridLabel>
          <GridValue>{lookupName(product.techProcessId, TECH_PROCESSES)}</GridValue>
          <GridLabel>Package:</GridLabel>
          <GridValue>{lookupName(product.packageId, CPU_PACKAGES)}</GridValue>
          <GridLabel>Cores:</GridLabel>
          <GridValue>{lookupName(product.coreId, CORE_TYPES)}</GridValue>
          <GridLabel>Clock:</GridLabel>
          <GridValue>{formatClock(product.clockSpeed)}</GridValue>
          <GridLabel>Build Quality:</GridLabel>
          <GridValue>{product.buildQuality}%</GridValue>
        </ProductGrid>

        <Separator />

        <StatsRow>
          <StatBlock>
            <StatBlockLabel>Performance</StatBlockLabel>
            <StatBlockValue>{product.performance}</StatBlockValue>
          </StatBlock>
          <StatBlock>
            <StatBlockLabel>Stability</StatBlockLabel>
            <StatBlockValue style={{ color: product.stability < 0 ? '#cc0000' : undefined }}>
              {product.stability}
            </StatBlockValue>
          </StatBlock>
          <StatBlock>
            <StatBlockLabel>Build</StatBlockLabel>
            <StatBlockValue>{product.build}</StatBlockValue>
          </StatBlock>
        </StatsRow>

        {product.status === 'designing' && (
          <DesignSection>
            <ProgressInfo>
              <span>Design progress: {product.designDaysCompleted} / {product.designTimeDays} days</span>
              <span>{Math.round((product.designDaysCompleted / product.designTimeDays) * 100)}%</span>
            </ProgressInfo>
            <ProgressBar
              value={Math.min(100, Math.round((product.designDaysCompleted / product.designTimeDays) * 100))}
            />
          </DesignSection>
        )}

        {(product.status === 'selling' || product.status === 'discontinued') && (
          <SalesSection>
            <SalesGrid>
              <GridLabel>Price:</GridLabel>
              <GridValue>
                {editingPriceId === product.id ? (
                  <PriceEditRow>
                    <span>$</span>
                    <TextInput
                      value={editPrice}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const num = parseFloat(value);
                        setEditPrice(!isNaN(num) && num > MAX_SELL_PRICE ? String(MAX_SELL_PRICE) : value);
                      }}
                      style={{ width: 80 }}
                    />
                    <Button size="sm" onClick={() => handleSavePrice(product.id)}>OK</Button>
                    <Button size="sm" onClick={() => setEditingPriceId(null)}>X</Button>
                  </PriceEditRow>
                ) : (
                  <PriceDisplay>
                    ${product.price}
                    {showActions && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingPriceId(product.id);
                          setEditPrice(String(product.price));
                        }}
                        style={{ marginLeft: 6, fontSize: 10, padding: '1px 4px' }}
                      >
                        Change
                      </Button>
                    )}
                  </PriceDisplay>
                )}
              </GridValue>
              <GridLabel>Unit Cost:</GridLabel>
              <GridValue>${product.unitCost.toFixed(2)}</GridValue>
              <GridLabel>Margin:</GridLabel>
              <GridValue style={{ color: product.price > product.unitCost ? '#006400' : '#cc0000' }}>
                ${(product.price - product.unitCost).toFixed(2)} / unit
              </GridValue>
              <GridLabel>Units Sold:</GridLabel>
              <GridValue>{product.totalUnitsSold.toLocaleString()}</GridValue>
              <GridLabel>Revenue:</GridLabel>
              <GridValue>${product.totalRevenue.toLocaleString()}</GridValue>
              <GridLabel>Profit:</GridLabel>
              <GridValue style={{ color: (product.totalRevenue - product.designCost - product.totalUnitsSold * product.unitCost) >= 0 ? '#006400' : '#cc0000' }}>
                ${(product.totalRevenue - product.designCost - product.totalUnitsSold * product.unitCost).toLocaleString()}
              </GridValue>
              {product.sellStartDate && (
                <>
                  <GridLabel>On sale since:</GridLabel>
                  <GridValue>{formatDate(product.sellStartDate)} ({daysOnSale} days)</GridValue>
                </>
              )}
            </SalesGrid>
          </SalesSection>
        )}

        {showActions && product.status === 'selling' && (
          <ActionRow>
            <Button
              size="sm"
              onClick={() => onDiscontinue(product.id)}
            >
              Discontinue
            </Button>
          </ActionRow>
        )}
      </ProductCard>
    );
  };

  return (
    <StyledWindow>
      <WindowHeader>
        <HeaderRow>
          <span>Products</span>
          <CloseButton onClick={onClose}>X</CloseButton>
        </HeaderRow>
      </WindowHeader>
      <WindowContent>
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as number)}>
          <Tab value={0}>
            In Development ({designing.length})
          </Tab>
          <Tab value={1}>
            On Sale ({selling.length})
          </Tab>
          <Tab value={2}>
            Discontinued ({discontinued.length})
          </Tab>
        </Tabs>
        <TabBody>
          {activeTab === 0 && (
            <ProductList>
              {designing.length === 0 ? (
                <EmptyMessage>No CPUs in development. Use "New Hardware" to design one.</EmptyMessage>
              ) : (
                designing.map((p) => renderProduct(p, false))
              )}
            </ProductList>
          )}
          {activeTab === 1 && (
            <ProductList>
              {selling.length === 0 ? (
                <EmptyMessage>No CPUs currently on sale.</EmptyMessage>
              ) : (
                selling.map((p) => renderProduct(p, true))
              )}
            </ProductList>
          )}
          {activeTab === 2 && (
            <ProductList>
              {discontinued.length === 0 ? (
                <EmptyMessage>No discontinued products.</EmptyMessage>
              ) : (
                discontinued.map((p) => renderProduct(p, false))
              )}
            </ProductList>
          )}
        </TabBody>

        <GroupBox label="Summary" style={{ marginTop: 8 }}>
          <SummaryRow>
            <SummaryItem>
              <SummaryLabel>Total Products</SummaryLabel>
              <SummaryValue>{gameState.products.length}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Total Revenue</SummaryLabel>
              <SummaryValue>
                ${gameState.products.reduce((s, p) => s + p.totalRevenue, 0).toLocaleString()}
              </SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Total Units Sold</SummaryLabel>
              <SummaryValue>
                {gameState.products.reduce((s, p) => s + p.totalUnitsSold, 0).toLocaleString()}
              </SummaryValue>
            </SummaryItem>
          </SummaryRow>
        </GroupBox>
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

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #888;
  font-size: 12px;
  font-style: italic;
  padding: 24px 0;
  margin: 0;
`;

const ProductCard = styled.div`
  border: 2px outset #dfdfdf;
  background: #fff;
  padding: 8px 10px;
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const ProductName = styled.span`
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BrandTag = styled.span`
  font-size: 10px;
  font-weight: 400;
  background: #e0e0e0;
  border: 1px solid #999;
  padding: 1px 4px;
`;

const ScoreBadge = styled.span<{ $score: number }>`
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 2px;
  border: 1px solid;
  ${(p) =>
    p.$score >= 70
      ? 'background: #e8f5e9; color: #2e7d32; border-color: #4caf50;'
      : p.$score >= 50
      ? 'background: #fff8e1; color: #f57f17; border-color: #fbc02d;'
      : p.$score >= 30
      ? 'background: #fff3e0; color: #e65100; border-color: #ff9800;'
      : 'background: #ffebee; color: #c62828; border-color: #ef5350;'}
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border: 1px solid;
  ${(p) =>
    p.$status === 'designing'
      ? 'background: #fff8dc; color: #996600; border-color: #cc9900;'
      : p.$status === 'selling'
      ? 'background: #e8f5e9; color: #2e7d32; border-color: #4caf50;'
      : 'background: #f5f5f5; color: #666; border-color: #999;'}
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 10px;
  font-size: 11px;
`;

const GridLabel = styled.span`
  font-weight: 700;
  text-align: right;
  color: #555;
`;

const GridValue = styled.span`
  color: #222;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 6px;
  justify-content: center;
`;

const StatBlock = styled.div`
  text-align: center;
  min-width: 60px;
`;

const StatBlockLabel = styled.div`
  font-size: 9px;
  color: #666;
  text-transform: uppercase;
`;

const StatBlockValue = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const DesignSection = styled.div`
  margin-top: 8px;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 2px;
  color: #555;
`;

const SalesSection = styled.div`
  margin-top: 6px;
`;

const SalesGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 10px;
  font-size: 11px;
`;

const PriceEditRow = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 700;
`;

const PriceDisplay = styled.span`
  display: flex;
  align-items: center;
`;

const ActionRow = styled.div`
  margin-top: 6px;
  display: flex;
  justify-content: flex-end;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-around;
  font-size: 12px;
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryLabel = styled.div`
  font-size: 10px;
  color: #666;
`;

const SummaryValue = styled.div`
  font-weight: 700;
`;
