import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  Window,
  WindowHeader,
  WindowContent,
  Button,
  Tabs,
  Tab,
  TabBody,
  Separator,
  ProgressBar,
  Slider,
} from 'react95';
import type { GameState } from './types';
import {
  CPU_RESEARCH,
  TECH_RESEARCH,
  getMaxResearchBudget,
  rpPerDay,
  type ResearchItem,
} from './rndData';

// --- SVG package illustrations ---

function DipSvg({ pins }: { pins: number }) {
  const rows = Math.min(Math.ceil(pins / 2), 12);
  const h = 20 + rows * 4;
  return (
    <svg viewBox={`0 0 48 ${h + 8}`} width="40" height="40">
      <rect x="14" y="4" width="20" height={h} rx="4" fill="#2d2d36" />
      <circle cx="24" cy="10" r="3" fill="#1e1e24" />
      <rect x="10" y="8" width="4" height={h - 8} rx="2" fill="#ffd700" opacity="0.8" />
      <rect x="34" y="8" width="4" height={h - 8} rx="2" fill="#ffd700" opacity="0.8" />
    </svg>
  );
}

function PlccSvg({ pins }: { pins: number }) {
  const side = Math.min(Math.ceil(pins / 4), 10);
  const size = 16 + side * 3;
  return (
    <svg viewBox={`0 0 ${size + 16} ${size + 16}`} width="40" height="40">
      <rect x="8" y="8" width={size} height={size} rx="6" fill="#2d2d36" />
      <circle cx="12" cy="12" r="2.5" fill="#ffd700" />
      <rect x="14" y="14" width={size - 12} height={size - 12} rx="4" fill="#1e1e24" />
      <rect x="16" y="4" width={size - 16} height="4" rx="2" fill="#aaa" />
      <rect x="16" y={size + 8} width={size - 16} height="4" rx="2" fill="#aaa" />
      <rect x="4" y="16" width="4" height={size - 16} rx="2" fill="#aaa" />
      <rect x={size + 8} y="16" width="4" height={size - 16} rx="2" fill="#aaa" />
    </svg>
  );
}

function PgaSvg({ pins }: { pins: number }) {
  const gridSize = Math.min(Math.ceil(Math.sqrt(pins)), 10);
  const size = 8 + gridSize * 4;
  return (
    <svg viewBox={`0 0 ${size + 16} ${size + 16}`} width="40" height="40">
      <rect x="4" y="4" width={size + 8} height={size + 8} rx="6" fill="#1e1e24" />
      <rect x="10" y="10" width={size - 4} height={size - 4} rx="4" fill="#2d2d36" />
      <rect x="8" y="8" width={size} height={size} rx="2" fill="none" stroke="#ffd700" strokeWidth="2.5" strokeDasharray="2 6" opacity="0.7" />
      <circle cx={4 + (size+8)/2} cy={4 + (size+8)/2} r="6" fill="#424250" />
      <circle cx="10" cy="10" r="2.5" fill="#ffd700" />
    </svg>
  );
}

function CpuDevSvg() {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40">
      <rect x="10" y="10" width="28" height="28" rx="6" fill="#1e1e24" />
      <rect x="16" y="16" width="16" height="16" rx="4" fill="#2d2d36" />
      <circle cx="24" cy="24" r="5" fill="#424250" />
      <rect x="18" y="5" width="12" height="5" rx="2" fill="#ffd700" opacity="0.8" />
      <rect x="18" y="38" width="12" height="5" rx="2" fill="#ffd700" opacity="0.8" />
      <rect x="5" y="18" width="5" height="12" rx="2" fill="#ffd700" opacity="0.8" />
      <rect x="38" y="18" width="5" height="12" rx="2" fill="#ffd700" opacity="0.8" />
    </svg>
  );
}

function ProcessSvg({ size }: { size: string }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40">
      <rect x="8" y="8" width="32" height="32" rx="16" fill="#1e1e24" />
      <circle cx="24" cy="24" r="10" fill="none" stroke="#00ffcc" strokeWidth="2" opacity="0.5" strokeDasharray="4 4" />
      <circle cx="24" cy="24" r="4" fill="#00ffcc" />
      <text x="24" y="44" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#00ffcc">{size}</text>
    </svg>
  );
}

function MulticoreSvg({ cores }: { cores: string }) {
  const coreCount = cores === 'Triple' ? 3 : cores === 'Quad' ? 4 : 2;
  const isQuad = coreCount === 4;
  const isTriple = coreCount === 3;
  return (
    <svg viewBox="0 0 48 48" width="40" height="40">
      <rect x="6" y="6" width="36" height="36" rx="6" fill="#1e1e24" />
      {Array.from({ length: coreCount }).map((_, i) => {
        let cx = 15;
        let cy = 15;
        if (isQuad) {
          cx = i % 2 === 0 ? 15 : 33;
          cy = i < 2 ? 15 : 33;
        } else if (isTriple) {
          cx = i === 0 ? 24 : (i === 1 ? 14 : 34);
          cy = i === 0 ? 15 : 30;
        } else {
          cx = i === 0 ? 15 : 33;
          cy = 24;
        }
        return (
          <g key={i}>
            <rect x={cx - 6} y={cy - 6} width="12" height="12" rx="3" fill="#ff4d4d" opacity="0.9" />
          </g>
        );
      })}
    </svg>
  );
}

function getIllustration(item: ResearchItem) {
  if (item.id === 'cpu-dev') return <CpuDevSvg />;
  if (item.category === 'package') {
    const match = item.name.match(/(\d+)\s*pin\s*(DIP|PLCC|PGA)/i);
    if (match) {
      const pinCount = parseInt(match[1]);
      const type = match[2].toUpperCase();
      if (type === 'DIP') return <DipSvg pins={pinCount} />;
      if (type === 'PLCC') return <PlccSvg pins={pinCount} />;
      if (type === 'PGA') return <PgaSvg pins={pinCount} />;
    }
  }
  if (item.category === 'clock') {
    const speed = item.name.replace(' max clock', '');
    return <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.1, textAlign: 'center' }}>{speed}</span>;
  }
  if (item.category === 'multicore') return <MulticoreSvg cores={item.name.includes('Triple') ? 'Triple' : item.name.includes('Quad') ? 'Quad' : 'Dual'} />;
  if (item.category === 'process') {
    if (item.name.includes('Multi-core')) return <MulticoreSvg cores="Enhanced" />;
    const size = item.name.replace(' process', '');
    return <ProcessSvg size={size} />;
  }
  return null;
}

// --- Tree helpers ---

const SCALE_X = 82;
const NODE_W = 74;
const NODE_H = 74;
const ROW_H = 100;
const PAD_X = 24;
const PAD_Y = 24;

type NodeStatus = 'completed' | 'researching' | 'queued' | 'available' | 'locked';

function getItemStatus(
  item: ResearchItem,
  completedSet: Set<string>,
  currentResearch: string | null,
  researchQueue: string[],
  cpuExperience: number,
  currentYear: number,
): NodeStatus {
  if (completedSet.has(item.id)) return 'completed';
  if (currentResearch === item.id) return 'researching';
  if (researchQueue.includes(item.id)) return 'queued';
  if (item.prerequisite && !completedSet.has(item.prerequisite)) return 'locked';
  if (item.requiredExp > cpuExperience) return 'locked';
  if (item.minYear > 0 && item.minYear > currentYear) return 'locked';
  return 'available';
}

function getCpuRow(item: ResearchItem): number {
  if (item.id === 'cpu-dev') return 1;
  if (item.category === 'package') {
    if (item.name.includes('DIP')) return 0;
    if (item.name.includes('PLCC')) return 2;
    if (item.name.includes('PGA')) return 3;
  }
  if (item.category === 'clock') return 1;
  if (item.category === 'multicore') return 4;
  return 1;
}

function getTechRow(item: ResearchItem): number {
  if (item.name.includes('Multi-core enhancement')) return 1;
  return 0;
}

function getShortName(item: ResearchItem): string {
  if (item.id === 'cpu-dev') return 'CPU';
  const pkgMatch = item.name.match(/(\d+)\s*pin\s*(DIP|PLCC|PGA)/i);
  if (pkgMatch) return `${pkgMatch[2]}${pkgMatch[1]}`;
  if (item.category === 'clock') return item.name.replace(' max clock', '');
  if (item.category === 'process') return item.name.replace(' process', '');
  if (item.name.includes('Multi-core enhancement')) return 'Multi enh.';
  if (item.name.includes('Experimental')) return 'Exp. dual';
  if (item.name.includes('Basic dual')) return 'Basic dual';
  if (item.name.includes('Dual')) return 'Dual-core';
  if (item.name.includes('Triple')) return 'Triple';
  if (item.name.includes('Quad')) return 'Quad';
  return item.name;
}

interface TreeNodeData {
  item: ResearchItem;
  status: NodeStatus;
  px: number;
  py: number;
}

const CPU_ROW_LABELS = ['DIP', 'Clock', 'PLCC', 'PGA', 'Multi-core'];
const TECH_ROW_LABELS = ['Process', 'Multi-core'];

// --- Tree component ---

function ResearchTree({
  items,
  rowFn,
  rowLabels,
  research,
  currentYear,
  gameBalance,
  onStartResearch,
  onUnqueueResearch,
  selectedId,
  onSelect,
}: {
  items: ResearchItem[];
  rowFn: (item: ResearchItem) => number;
  rowLabels: string[];
  research: GameState['research'];
  currentYear: number;
  gameBalance: number;
  onStartResearch: (id: string) => void;
  onUnqueueResearch: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const completedSet = useMemo(() => new Set(research.completedResearch), [research.completedResearch]);

  const nodes: TreeNodeData[] = useMemo(() => {
    return items.map((item) => {
      const row = rowFn(item);
      const queue = research.researchQueue || [];
      const status = getItemStatus(item, completedSet, research.currentResearch, queue, research.cpuExperience, currentYear);
      return {
        item,
        status,
        px: item.x * SCALE_X + PAD_X,
        py: row * ROW_H + PAD_Y,
      };
    });
  }, [items, rowFn, completedSet, research.currentResearch, research.cpuExperience, currentYear]);

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.item.id, n])), [nodes]);

  const connections = useMemo(() => {
    const conns: { from: TreeNodeData; to: TreeNodeData }[] = [];
    for (const node of nodes) {
      if (node.item.prerequisite) {
        const parent = nodeMap.get(node.item.prerequisite);
        if (parent) conns.push({ from: parent, to: node });
      }
    }
    return conns;
  }, [nodes, nodeMap]);

  const maxX = Math.max(...nodes.map((n) => n.px)) + NODE_W + PAD_X + 20;
  const numRows = Math.max(...nodes.map((n) => rowFn(n.item))) + 1;
  const canvasH = numRows * ROW_H + PAD_Y * 2;

  const selectedNode = selectedId ? nodeMap.get(selectedId) ?? null : null;

  const scrollRef = useRef<HTMLDivElement>(null);

  // Convert vertical scroll wheel to horizontal scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft += e.deltaY + e.deltaX;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Auto-scroll to the rightmost available/researching node on mount
  const hasScrolled = useRef(false);
  useEffect(() => {
    if (hasScrolled.current || nodes.length === 0) return;
    hasScrolled.current = true;

    const frontier = nodes
      .filter((n) => n.status === 'available' || n.status === 'researching')
      .sort((a, b) => b.px - a.px);
    const target = frontier[0];
    if (!target) return;

    // Wait for layout to complete before scrolling
    const doScroll = () => {
      const el = scrollRef.current;
      if (!el || el.clientWidth === 0) return;
      el.scrollLeft = Math.max(0, target.px - el.clientWidth / 2 + NODE_W / 2);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(doScroll);
    });
  }, [nodes]);

  return (
    <TreeWrapper>
      <TreeScrollArea ref={scrollRef}>
        {/* Row labels */}
        <RowLabelsColumn style={{ height: canvasH }}>
          {rowLabels.slice(0, numRows).map((label, i) => (
            <RowLabel key={label} style={{ top: PAD_Y + i * ROW_H + NODE_H / 2 - 8 }}>
              {label}
            </RowLabel>
          ))}
        </RowLabelsColumn>
        <TreeCanvas style={{ width: maxX, height: canvasH }}>
          <ConnectorSvg width={maxX} height={canvasH}>
            {connections.map(({ from, to }, i) => {
              const bothCompleted = from.status === 'completed' && (to.status === 'completed' || to.status === 'researching');
              const stroke = bothCompleted ? '#81c784' : '#ccc';
              const x1 = from.px + NODE_W;
              const y1 = from.py + NODE_H / 2;
              const x2 = to.px;
              const y2 = to.py + NODE_H / 2;

              if (Math.abs(y1 - y2) < 5) {
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="2" />;
              }
              // Cross-row: L-shaped connector
              const midX = from.px + NODE_W / 2;
              const goDown = y2 > y1;
              const fy = goDown ? from.py + NODE_H : from.py;
              return (
                <path
                  key={i}
                  d={`M${midX},${fy} L${midX},${y2} L${x2},${y2}`}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="2"
                />
              );
            })}
          </ConnectorSvg>
          {nodes.map((node) => {
            const isSelected = selectedId === node.item.id;
            return (
              <TreeNodeBox
                key={node.item.id}
                $status={node.status}
                $selected={isSelected}
                style={{ left: node.px, top: node.py, width: NODE_W, height: NODE_H }}
                onClick={() => onSelect(isSelected ? null : node.item.id)}
              >
                <NodeIcon>{getIllustration(node.item)}</NodeIcon>
                <NodeLabel $status={node.status}>{getShortName(node.item)}</NodeLabel>
                {node.status === 'researching' && <ResearchingDot />}
              </TreeNodeBox>
            );
          })}
        </TreeCanvas>
      </TreeScrollArea>
      {/* Detail panel */}
      {selectedNode && (
        <DetailBar>
          <DetailInfo>
            <DetailName>{selectedNode.item.name}</DetailName>
            <DetailStats>
              {selectedNode.item.cost > 0 && <span>Cost: ${selectedNode.item.cost.toLocaleString()}</span>}
              {selectedNode.item.cost === 0 && <span>Free</span>}
              <span>RP: {selectedNode.item.researchPoints}</span>
              {selectedNode.item.minYear > 0 && <span>Year: {selectedNode.item.minYear}+</span>}
              {selectedNode.item.requiredExp > 0 && <span>Exp: {selectedNode.item.requiredExp}</span>}
            </DetailStats>
          </DetailInfo>
          <DetailActions>
            {selectedNode.status === 'completed' && <StatusChip $color="#4caf50">Completed</StatusChip>}
            {selectedNode.status === 'researching' && <StatusChip $color="#2196f3">Researching...</StatusChip>}
            {selectedNode.status === 'locked' && <StatusChip $color="#999">Locked</StatusChip>}
            {(selectedNode.status === 'available' || selectedNode.status === 'queued') && (
              <Button
                primary={selectedNode.status !== 'queued'}
                size="sm"
                disabled={gameBalance < selectedNode.item.cost && selectedNode.status === 'available'}
                onClick={() => {
                  if (selectedNode.status === 'queued') {
                    onUnqueueResearch(selectedNode.item.id);
                  } else {
                    onStartResearch(selectedNode.item.id);
                  }
                  onSelect(null);
                }}
              >
                {selectedNode.status === 'queued'
                  ? 'Remove from Queue'
                  : gameBalance < selectedNode.item.cost
                    ? "Can't Afford"
                    : research.currentResearch !== null 
                      ? 'Queue Research'
                      : 'Start Research'}
              </Button>
            )}
          </DetailActions>
        </DetailBar>
      )}
    </TreeWrapper>
  );
}

// --- Main component ---

interface RnDProps {
  gameState: GameState;
  onStartResearch: (id: string) => void;
  onUnqueueResearch: (id: string) => void;
  onReorderQueue: (oldIndex: number, newIndex: number) => void;
  onBudgetChange: (budget: number) => void;
  onClose: () => void;
}

export default function RnD({ 
  gameState, 
  onStartResearch, 
  onUnqueueResearch, 
  onReorderQueue, 
  onBudgetChange, 
  onClose 
}: RnDProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { research } = gameState;
  const currentYear = new Date(gameState.gameDate).getFullYear();
  const maxBudget = getMaxResearchBudget(currentYear);

  const currentResearchItem = research.currentResearch
    ? [...CPU_RESEARCH, ...TECH_RESEARCH].find((r) => r.id === research.currentResearch)
    : null;

  const currentProgress = currentResearchItem
    ? Math.min(100, Math.round((research.currentResearchPoints / currentResearchItem.researchPoints) * 100))
    : 0;

  return (
    <RnDWindow>
      <StyledWindowHeader>
        <span>Research & Development</span>
        <CloseButton size="sm" onClick={onClose}>
          <span style={{ fontWeight: 700 }}>&#10005;</span>
        </CloseButton>
      </StyledWindowHeader>
      <WindowContent>
        {/* Current research banner */}
        {currentResearchItem && (
          <CurrentResearchBox>
            <CurrentRow>
              <IllustrationBox>{getIllustration(currentResearchItem)}</IllustrationBox>
              <CurrentInfo>
                <CurrentName>{currentResearchItem.name}</CurrentName>
                <ProgressBar value={currentProgress} />
                <CurrentDetail>
                  {Math.round(research.currentResearchPoints)} / {currentResearchItem.researchPoints} RP
                  &nbsp;&middot;&nbsp; ${research.dailyBudget}/day
                  &nbsp;&middot;&nbsp;
                  {research.dailyBudget > 0
                    ? `~${Math.ceil((currentResearchItem.researchPoints - research.currentResearchPoints) / rpPerDay(research.dailyBudget))}d left`
                    : 'Paused'}
                </CurrentDetail>
              </CurrentInfo>
            </CurrentRow>
          </CurrentResearchBox>
        )}

        <Tabs value={activeTab} onChange={(v: number) => { setActiveTab(v); setSelectedId(null); }}>
          <Tab value={0}>CPU</Tab>
          <Tab value={1}>Technology</Tab>
          <Tab value={2}>Budget</Tab>
          <Tab value={3}>Queue</Tab>
        </Tabs>
        <StyledTabBody>
          {activeTab === 0 && (
            <ResearchTree
              items={CPU_RESEARCH}
              rowFn={getCpuRow}
              rowLabels={CPU_ROW_LABELS}
              research={research}
              currentYear={currentYear}
              gameBalance={gameState.balance}
              onStartResearch={onStartResearch}
              onUnqueueResearch={onUnqueueResearch}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
          {activeTab === 1 && (
            <ResearchTree
              items={TECH_RESEARCH}
              rowFn={getTechRow}
              rowLabels={TECH_ROW_LABELS}
              research={research}
              currentYear={currentYear}
              gameBalance={gameState.balance}
              onStartResearch={onStartResearch}
              onUnqueueResearch={onUnqueueResearch}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
          {activeTab === 2 && (
            <BudgetPanel>
              <BudgetTitle>Daily R&D Budget</BudgetTitle>
              <BudgetSliderRow>
                <BudgetLabel>$0</BudgetLabel>
                <BudgetSliderWrap>
                  <Slider
                    min={0}
                    max={maxBudget}
                    step={maxBudget > 5_000 ? 250 : 25}
                    value={Math.min(research.dailyBudget, maxBudget)}
                    onChange={(value: number) => onBudgetChange(value)}
                    marks={[
                      { value: 0, label: '' },
                      { value: Math.round(maxBudget * 0.25), label: '' },
                      { value: Math.round(maxBudget * 0.5), label: '' },
                      { value: Math.round(maxBudget * 0.75), label: '' },
                      { value: maxBudget, label: '' },
                    ]}
                  />
                </BudgetSliderWrap>
                <BudgetLabel>${maxBudget.toLocaleString()}</BudgetLabel>
              </BudgetSliderRow>
              <BudgetValueBox>
                <BudgetValueLabel>Daily cost</BudgetValueLabel>
                <BudgetValue>${research.dailyBudget}</BudgetValue>
              </BudgetValueBox>
              <BudgetValueBox>
                <BudgetValueLabel>Research points / day</BudgetValueLabel>
                <BudgetValue>{rpPerDay(research.dailyBudget).toFixed(2)} RP/day</BudgetValue>
              </BudgetValueBox>
              {currentResearchItem && (
                <BudgetValueBox>
                  <BudgetValueLabel>Est. days to complete current</BudgetValueLabel>
                  <BudgetValue>
                    {research.dailyBudget > 0
                      ? Math.ceil(
                          (currentResearchItem.researchPoints - research.currentResearchPoints) /
                            rpPerDay(research.dailyBudget),
                        ) + ' days'
                      : 'Paused'}
                  </BudgetValue>
                </BudgetValueBox>
              )}
              <Separator />
              <BudgetNote>
                Budget is deducted daily while researching. If you can't afford it, research pauses automatically.
              </BudgetNote>
            </BudgetPanel>
          )}          {activeTab === 3 && (
            <QueuePanel>
              <BudgetTitle>Research Queue</BudgetTitle>
              {(!research.researchQueue || research.researchQueue.length === 0) ? (
                <EmptyQueue>Your queue is empty.</EmptyQueue>
              ) : (
                <QueueList>
                  {research.researchQueue.map((qId, index) => {
                    const item = [...CPU_RESEARCH, ...TECH_RESEARCH].find(r => r.id === qId);
                    if (!item) return null;
                    return (
                      <QueueItem key={`${qId}-${index}`}>
                        <QueueItemDetails>
                          <QueueItemNum>{index + 1}.</QueueItemNum>
                          <QueueItemName>{item.name}</QueueItemName>
                        </QueueItemDetails>
                        <QueueItemActions>
                          <Button 
                            size="sm" 
                            disabled={index === 0}
                            onClick={() => onReorderQueue(index, index - 1)}
                          >
                            ↑
                          </Button>
                          <Button 
                            size="sm" 
                            disabled={index === research.researchQueue.length - 1}
                            onClick={() => onReorderQueue(index, index + 1)}
                          >
                            ↓
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => onUnqueueResearch(qId)}
                          >
                            ✕
                          </Button>
                        </QueueItemActions>
                      </QueueItem>
                    );
                  })}
                </QueueList>
              )}
            </QueuePanel>
          )}        </StyledTabBody>
      </WindowContent>
    </RnDWindow>
  );
}

// --- Styled components ---

const RnDWindow = styled(Window)`
  width: 780px;
  max-width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
`;

const StyledWindowHeader = styled(WindowHeader)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled(Button)`
  margin-left: auto;
  min-width: 24px;
  padding: 0 4px;
`;

const StyledTabBody = styled(TabBody)`
  padding: 4px;
  overflow: hidden;
`;

// Current research

const CurrentResearchBox = styled.div`
  border: 2px inset #dfdfdf;
  background: #fffff0;
  padding: 8px;
  margin-bottom: 6px;
`;

const CurrentRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IllustrationBox = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CurrentInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const CurrentName = styled.div`
  font-weight: 700;
  font-size: 12px;
`;

const CurrentDetail = styled.div`
  font-size: 10px;
  color: #666;
`;

// Tree layout

const TreeWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const TreeScrollArea = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  border: 2px inset #dfdfdf;
  background: #fafafa;
`;

const RowLabelsColumn = styled.div`
  position: sticky;
  left: 0;
  z-index: 2;
  width: 60px;
  min-width: 60px;
  background: #f0f0f0;
  border-right: 1px solid #ddd;
`;

const RowLabel = styled.div`
  position: absolute;
  left: 4px;
  right: 4px;
  font-size: 9px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  text-align: center;
`;

const TreeCanvas = styled.div`
  position: relative;
  min-width: 100%;
`;

const ConnectorSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
`;

const statusBg: Record<NodeStatus, string> = {
  completed: '#c8e6c9',
  researching: '#fff9c4',
  queued: '#ffe0b2',
  available: '#fff',
  locked: '#f5f5f5',
};

const statusBorder: Record<NodeStatus, string> = {
  completed: '#4caf50',
  researching: '#fbc02d',
  queued: '#ff9800',
  available: '#bbb',
  locked: '#ddd',
};

const TreeNodeBox = styled.div<{ $status: NodeStatus; $selected: boolean }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: ${(p) => statusBg[p.$status]};
  border: 2px solid ${(p) => (p.$selected ? '#1565c0' : statusBorder[p.$status])};
  box-shadow: ${(p) => (p.$selected ? '0 0 0 2px #90caf9' : 'none')};
  cursor: pointer;
  opacity: ${(p) => (p.$status === 'locked' ? 0.5 : 1)};
  transition: opacity 0.15s, box-shadow 0.15s;

  &:hover {
    opacity: ${(p) => (p.$status === 'locked' ? 0.65 : 1)};
    box-shadow: 0 0 0 2px ${(p) => (p.$selected ? '#90caf9' : '#e0e0e0')};
  }
`;

const NodeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
`;

const NodeLabel = styled.div<{ $status: NodeStatus }>`
  font-size: 9px;
  font-weight: 700;
  text-align: center;
  line-height: 1.1;
  color: ${(p) => (p.$status === 'locked' ? '#999' : '#333')};
  max-width: ${NODE_W - 4}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ResearchingDot = styled.div`
  position: absolute;
  top: 3px;
  right: 3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fbc02d;
  box-shadow: 0 0 4px #fbc02d;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  animation: pulse 1.5s infinite;
`;

// Detail bar

const DetailBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px inset #dfdfdf;
  background: #fff;
  padding: 6px 10px;
  margin-top: 4px;
  gap: 12px;
`;

const DetailInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const DetailName = styled.div`
  font-weight: 700;
  font-size: 12px;
`;

const DetailStats = styled.div`
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: #666;
`;

const DetailActions = styled.div`
  flex-shrink: 0;
`;

const StatusChip = styled.span<{ $color: string }>`
  font-size: 11px;
  font-weight: 700;
  color: ${(p) => p.$color};
  padding: 2px 8px;
  border: 1px solid ${(p) => p.$color};
  border-radius: 2px;
`;

// Budget

const BudgetPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
`;

const BudgetTitle = styled.div`
  font-weight: 700;
  font-size: 14px;
`;

const BudgetSliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BudgetLabel = styled.span`
  font-size: 11px;
  color: #666;
  min-width: 32px;
  text-align: center;
`;

const BudgetSliderWrap = styled.div`
  flex: 1;
`;

const BudgetValueBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px inset #dfdfdf;
  background: #fff;
  padding: 6px 10px;
`;

const BudgetValueLabel = styled.span`
  font-size: 12px;
  color: #444;
`;

const BudgetValue = styled.span`
  font-size: 13px;
  font-weight: 700;
`;

const BudgetNote = styled.div`
  font-size: 10px;
  color: #888;
  line-height: 1.4;
`;

// Queue

const QueuePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
  flex: 1;
  overflow-y: auto;
`;

const EmptyQueue = styled.div`
  font-size: 12px;
  color: #666;
  font-style: italic;
  padding: 12px;
`;

const QueueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const QueueItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 2px inset #dfdfdf;
  padding: 6px 8px;
`;

const QueueItemDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QueueItemNum = styled.div`
  font-weight: bold;
  color: #666;
`;

const QueueItemName = styled.div`
  font-size: 13px;
`;

const QueueItemActions = styled.div`
  display: flex;
  gap: 4px;
`;
