import { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  Window,
  WindowHeader,
  WindowContent,
  Button,
  GroupBox,
  Separator,
} from 'react95';
import type { GameState } from './types';

interface FinancesProps {
  gameState: GameState;
  onClose: () => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMoney(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateWithYear(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

export default function Finances({ gameState, onClose }: FinancesProps) {
  const currentYear = new Date(gameState.gameDate).getFullYear();
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    for (const s of gameState.finance.monthlySnapshots) {
      years.add(s.year);
    }
    for (const t of gameState.finance.transactions) {
      years.add(new Date(t.date).getFullYear());
    }
    return Array.from(years).sort();
  }, [gameState.finance, currentYear]);

  // null = "All" view
  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  const isAll = selectedYear === null;

  // Get snapshots for the selected year (or all)
  const filteredSnapshots = useMemo(() => {
    const snaps = isAll
      ? [...gameState.finance.monthlySnapshots]
      : gameState.finance.monthlySnapshots.filter((s) => s.year === selectedYear);
    return snaps.sort((a, b) => a.year - b.year || a.month - b.month);
  }, [gameState.finance.monthlySnapshots, selectedYear, isAll]);

  // Get transactions for the selected year (or all)
  const filteredTransactions = useMemo(() => {
    const txns = isAll
      ? [...gameState.finance.transactions]
      : gameState.finance.transactions.filter((t) => new Date(t.date).getFullYear() === selectedYear);
    return txns.reverse(); // most recent first
  }, [gameState.finance.transactions, selectedYear, isAll]);

  // Compute income/expense totals
  const { totalIncome, totalExpenses, incomeByCategory, expenseByCategory } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    const incCat: Record<string, number> = {};
    const expCat: Record<string, number> = {};
    for (const t of filteredTransactions) {
      if (t.type === 'income') {
        inc += t.amount;
        incCat[t.category] = (incCat[t.category] || 0) + t.amount;
      } else {
        exp += t.amount;
        expCat[t.category] = (expCat[t.category] || 0) + t.amount;
      }
    }
    return { totalIncome: inc, totalExpenses: exp, incomeByCategory: incCat, expenseByCategory: expCat };
  }, [filteredTransactions]);

  // --- Chart rendering ---
  const chartW = 480;
  const chartH = 140;
  const pad = { top: 10, right: 10, bottom: 20, left: 55 };
  const innerW = chartW - pad.left - pad.right;
  const innerH = chartH - pad.top - pad.bottom;

  // For yearly view: 12-month fixed axis
  // For all view: sequential points with labels like "Jan '76", "Mar '77" etc.
  const chartPoints = useMemo(() => {
    if (!isAll) {
      // Yearly: index 0-11 for months
      return filteredSnapshots.map((s) => ({
        index: s.month,
        total: 12,
        value: s.balance,
        label: MONTH_NAMES[s.month],
      }));
    } else {
      // All: sequential
      return filteredSnapshots.map((s, i) => ({
        index: i,
        total: filteredSnapshots.length,
        value: s.balance,
        label: `${MONTH_NAMES[s.month]} '${String(s.year).slice(2)}`,
      }));
    }
  }, [filteredSnapshots, isAll]);

  const maxIdx = isAll ? Math.max(chartPoints.length - 1, 1) : 11;
  const maxVal = chartPoints.length > 0 ? Math.max(...chartPoints.map((p) => p.value), 1) : 1;
  const minVal = chartPoints.length > 0 ? Math.min(...chartPoints.map((p) => p.value), 0) : 0;
  const range = maxVal - minVal || 1;

  const toX = (idx: number) => pad.left + (idx / maxIdx) * innerW;
  const toY = (val: number) => pad.top + innerH - ((val - minVal) / range) * innerH;

  const polyline = chartPoints.map((p) => `${toX(p.index)},${toY(p.value)}`).join(' ');
  const fillPoly = chartPoints.length >= 2
    ? `${toX(chartPoints[0].index)},${pad.top + innerH} ${polyline} ${toX(chartPoints[chartPoints.length - 1].index)},${pad.top + innerH}`
    : '';

  // For "All" view, show a subset of x-axis labels to avoid crowding
  const xLabels = useMemo(() => {
    if (!isAll) {
      return MONTH_NAMES.map((name, i) => ({ x: toX(i), label: name }));
    }
    if (chartPoints.length === 0) return [];
    // Show at most ~12 labels evenly spaced
    const step = Math.max(1, Math.floor(chartPoints.length / 12));
    const labels: { x: number; label: string }[] = [];
    for (let i = 0; i < chartPoints.length; i += step) {
      labels.push({ x: toX(chartPoints[i].index), label: chartPoints[i].label });
    }
    // Always include last
    const last = chartPoints[chartPoints.length - 1];
    if (labels.length === 0 || labels[labels.length - 1].label !== last.label) {
      labels.push({ x: toX(last.index), label: last.label });
    }
    return labels;
  }, [chartPoints, isAll]);

  const chartLabel = isAll ? 'Balance - All Time' : `Balance - ${selectedYear}`;
  const emptyMsg = isAll
    ? 'No data yet. Balance is recorded on the 1st of each month.'
    : `No data yet for ${selectedYear}. Balance is recorded on the 1st of each month.`;
  const txnEmptyMsg = isAll
    ? 'No transactions recorded'
    : `No transactions recorded for ${selectedYear}`;

  return (
    <StyledWindow>
      <WindowHeader>
        <HeaderRow>
          <span>Finances</span>
          <CloseButton onClick={onClose}>X</CloseButton>
        </HeaderRow>
      </WindowHeader>
      <WindowContent>
        <YearSelector>
          <Button
            size="sm"
            primary={isAll}
            onClick={() => setSelectedYear(null)}
          >
            All
          </Button>
          {availableYears.map((y) => (
            <Button
              key={y}
              size="sm"
              primary={y === selectedYear}
              onClick={() => setSelectedYear(y)}
            >
              {y}
            </Button>
          ))}
        </YearSelector>

        <GroupBox label={chartLabel}>
          {chartPoints.length === 0 ? (
            <EmptyChart>{emptyMsg}</EmptyChart>
          ) : (
            <ChartWrap>
              <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                  const y = pad.top + innerH - pct * innerH;
                  const val = minVal + pct * range;
                  return (
                    <g key={pct}>
                      <line x1={pad.left} y1={y} x2={chartW - pad.right} y2={y} stroke="#e0e0e0" strokeWidth="1" />
                      <text x={pad.left - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#888">
                        {formatMoney(Math.round(val))}
                      </text>
                    </g>
                  );
                })}
                {/* X-axis labels */}
                {xLabels.map((l, i) => (
                  <text key={i} x={l.x} y={chartH - 4} textAnchor="middle" fontSize={isAll ? '7' : '9'} fill="#666">
                    {l.label}
                  </text>
                ))}
                {/* Fill area */}
                {fillPoly && (
                  <polygon points={fillPoly} fill="rgba(0, 100, 0, 0.1)" />
                )}
                {/* Line */}
                {chartPoints.length >= 2 && (
                  <polyline points={polyline} fill="none" stroke="#006400" strokeWidth="2" />
                )}
                {/* Dots */}
                {chartPoints.map((p, i) => (
                  <circle key={i} cx={toX(p.index)} cy={toY(p.value)} r={isAll && chartPoints.length > 30 ? 2 : 3} fill="#006400" />
                ))}
              </svg>
            </ChartWrap>
          )}
        </GroupBox>

        <Separator style={{ margin: '8px 0' }} />

        <SummaryRow>
          <SummaryBlock>
            <GroupBox label="Income">
              <SummaryTotal $positive>{formatMoney(totalIncome)}</SummaryTotal>
              {Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                <CategoryRow key={cat}>
                  <CategoryName>{cat}</CategoryName>
                  <CategoryAmount $positive>{formatMoney(amt)}</CategoryAmount>
                </CategoryRow>
              ))}
              {Object.keys(incomeByCategory).length === 0 && (
                <EmptyText>No income recorded</EmptyText>
              )}
            </GroupBox>
          </SummaryBlock>
          <SummaryBlock>
            <GroupBox label="Expenses">
              <SummaryTotal $positive={false}>{formatMoney(totalExpenses)}</SummaryTotal>
              {Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                <CategoryRow key={cat}>
                  <CategoryName>{cat}</CategoryName>
                  <CategoryAmount $positive={false}>{formatMoney(amt)}</CategoryAmount>
                </CategoryRow>
              ))}
              {Object.keys(expenseByCategory).length === 0 && (
                <EmptyText>No expenses recorded</EmptyText>
              )}
            </GroupBox>
          </SummaryBlock>
        </SummaryRow>

        <ProfitRow>
          <span>Net {isAll ? 'Lifetime ' : ''}Profit:</span>
          <ProfitValue $positive={totalIncome >= totalExpenses}>
            {totalIncome >= totalExpenses ? '+' : '-'}{formatMoney(Math.abs(totalIncome - totalExpenses))}
          </ProfitValue>
        </ProfitRow>

        <Separator style={{ margin: '8px 0' }} />

        <GroupBox label="Transactions">
          <TransactionList>
            {filteredTransactions.length === 0 && (
              <EmptyText>{txnEmptyMsg}</EmptyText>
            )}
            {filteredTransactions.slice(0, 200).map((t, i) => (
              <TxnRow key={i}>
                <TxnDate>{isAll ? formatDateWithYear(t.date) : formatDate(t.date)}</TxnDate>
                <TxnCategory>{t.category}</TxnCategory>
                <TxnDesc>{t.description}</TxnDesc>
                <TxnAmount $income={t.type === 'income'}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                </TxnAmount>
              </TxnRow>
            ))}
            {filteredTransactions.length > 200 && (
              <EmptyText>Showing first 200 of {filteredTransactions.length} transactions</EmptyText>
            )}
          </TransactionList>
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

const YearSelector = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const ChartWrap = styled.div`
  background: #fff;
  border: 2px inset #dfdfdf;
  padding: 4px;
  display: flex;
  justify-content: center;
`;

const EmptyChart = styled.div`
  text-align: center;
  font-size: 11px;
  color: #888;
  padding: 20px;
  font-style: italic;
`;

const SummaryRow = styled.div`
  display: flex;
  gap: 8px;
`;

const SummaryBlock = styled.div`
  flex: 1;
`;

const SummaryTotal = styled.div<{ $positive: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${(p) => (p.$positive ? '#006400' : '#cc0000')};
  margin-bottom: 6px;
`;

const CategoryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  padding: 1px 0;
`;

const CategoryName = styled.span`
  color: #444;
`;

const CategoryAmount = styled.span<{ $positive: boolean }>`
  font-weight: 700;
  color: ${(p) => (p.$positive ? '#006400' : '#cc0000')};
`;

const ProfitRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 8px;
  background: #f0f0f0;
  border: 1px solid #ccc;
`;

const ProfitValue = styled.span<{ $positive: boolean }>`
  color: ${(p) => (p.$positive ? '#006400' : '#cc0000')};
`;

const EmptyText = styled.div`
  font-size: 11px;
  color: #888;
  font-style: italic;
  padding: 4px 0;
`;

const TransactionList = styled.div`
  max-height: 250px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const TxnRow = styled.div`
  display: grid;
  grid-template-columns: 70px 90px 1fr auto;
  gap: 6px;
  font-size: 10px;
  padding: 2px 4px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;

  &:hover {
    background: #f8f8ff;
  }
`;

const TxnDate = styled.span`
  color: #666;
`;

const TxnCategory = styled.span`
  font-weight: 700;
  color: #444;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TxnDesc = styled.span`
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TxnAmount = styled.span<{ $income: boolean }>`
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
  color: ${(p) => (p.$income ? '#006400' : '#cc0000')};
`;
