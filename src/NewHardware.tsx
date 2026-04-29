import { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  Button,
  Window,
  WindowHeader,
  WindowContent,
  Select,
  TextInput,
  Slider,
  Separator,
  GroupBox,
} from 'react95';
import type { GameState, CPUProduct } from './types';
import { MAX_SELL_PRICE } from './cpuScoring';
import {
  TECH_PROCESSES,
  CPU_PACKAGES,
  CORE_TYPES,
  getAvailableTechProcesses,
  getAvailablePackages,
  getAvailableCores,
  calculateCPUDesign,
  formatClock,
  buildQualityClockMultiplier,
  buildQualityBuildMultiplier,
} from './cpuData';

type Step = 'select-hardware' | 'select-process' | 'design';

interface NewHardwareProps {
  gameState: GameState;
  onClose: () => void;
  onAddBrand: (name: string) => void;
  onStartProduction: (product: CPUProduct) => void;
}

export default function NewHardware({ gameState, onClose, onAddBrand, onStartProduction }: NewHardwareProps) {
  const [step, setStep] = useState<Step>('select-hardware');
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

  // CPU Design state
  const [newBrandName, setNewBrandName] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [cpuName, setCpuName] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [showPackagePicker, setShowPackagePicker] = useState(false);
  const [selectedCoreId, setSelectedCoreId] = useState<string>('single');
  const [clockSpeed, setClockSpeed] = useState(100);
  const [buildQuality, setBuildQuality] = useState(75);
  const [price, setPrice] = useState(50);

  const availableProcesses = useMemo(
    () => getAvailableTechProcesses(gameState.research.completedResearch),
    [gameState.research.completedResearch],
  );

  const availablePackages = useMemo(
    () => getAvailablePackages(gameState.research.completedResearch),
    [gameState.research.completedResearch],
  );

  const techProcess = useMemo(
    () => TECH_PROCESSES.find((tp) => tp.id === selectedProcess) ?? null,
    [selectedProcess],
  );

  const selectedPackage = useMemo(
    () => CPU_PACKAGES.find((p) => p.id === selectedPackageId) ?? null,
    [selectedPackageId],
  );

  const availableCores = useMemo(() => {
    if (!selectedPackage) return CORE_TYPES.filter((c) => c.coreIndex === 0);
    return getAvailableCores(gameState.research.completedResearch, selectedPackage.maxCore);
  }, [gameState.research.completedResearch, selectedPackage]);

  const selectedCore = useMemo(
    () => CORE_TYPES.find((c) => c.id === selectedCoreId) ?? CORE_TYPES[0],
    [selectedCoreId],
  );

  // Calculate effective max clock for the current setup
  const effectiveMaxClock = useMemo(() => {
    if (!techProcess || !selectedPackage) return 600;
    return Math.floor(
      Math.min(selectedPackage.maxClock, techProcess.maxClock) *
        buildQualityClockMultiplier(buildQuality),
    );
  }, [techProcess, selectedPackage, buildQuality]);

  const minClock = techProcess?.minClock ?? 100;

  // Clamp clock speed when max changes
  const clampedClock = Math.max(minClock, Math.min(clockSpeed, effectiveMaxClock));

  const designResult = useMemo(() => {
    if (!selectedPackage || !selectedCore || !techProcess) return null;
    return calculateCPUDesign(selectedPackage, selectedCore, techProcess, buildQuality, clampedClock);
  }, [selectedPackage, selectedCore, techProcess, buildQuality, clampedClock]);

  const cpuLevel = Math.floor(gameState.research.cpuExperience / 100);

  const handleSelectCPU = () => {
    if (availableProcesses.length === 0) return;
    setStep('select-process');
  };

  const handleSelectProcess = (processId: string) => {
    setSelectedProcess(processId);
    // Pre-select first brand if available
    if (!selectedBrand && gameState.cpuBrands.length > 0) {
      setSelectedBrand(gameState.cpuBrands[0]);
    }
    // Set first available package
    if (availablePackages.length > 0) {
      setSelectedPackageId(availablePackages[0].id);
    }
    setStep('design');
  };

  const handleAddBrand = () => {
    const trimmed = newBrandName.trim();
    if (!trimmed) return;
    if (gameState.cpuBrands.some((b) => b.toLowerCase() === trimmed.toLowerCase())) return;
    onAddBrand(trimmed);
    setSelectedBrand(trimmed);
    setNewBrandName('');
    setShowAddBrand(false);
  };

  const brandOptions = [
    ...gameState.cpuBrands.map((b) => ({ value: b, label: b })),
    { value: '__add_new__', label: '+ Add new brand...' },
  ];

  if (step === 'select-hardware') {
    const hasCpuDev = gameState.research.completedResearch.includes('cpu-dev');
    return (
      <StyledWindow>
        <WindowHeader>
          <HeaderRow>
            <span>New Hardware</span>
            <CloseButton onClick={onClose}>X</CloseButton>
          </HeaderRow>
        </WindowHeader>
        <WindowContent>
          <CenteredContent>
            <h3 style={{ margin: '0 0 8px' }}>Select Hardware Type</h3>
            <Separator />
            <HardwareOption>
              <Button
                fullWidth
                primary={hasCpuDev}
                disabled={!hasCpuDev}
                onClick={handleSelectCPU}
                style={{ padding: '12px', fontSize: 14 }}
              >
                CPU (Microprocessor)
              </Button>
              {hasCpuDev && (
                <LevelBadge>Level {cpuLevel}</LevelBadge>
              )}
              {!hasCpuDev && (
                <LockedText>Research "CPU Development" first</LockedText>
              )}
            </HardwareOption>
            <HardwareOption>
              <Button fullWidth disabled style={{ padding: '12px', fontSize: 14 }}>
                GPU (Coming Soon)
              </Button>
            </HardwareOption>
          </CenteredContent>
        </WindowContent>
      </StyledWindow>
    );
  }

  if (step === 'select-process') {
    return (
      <StyledWindow>
        <WindowHeader>
          <HeaderRow>
            <span>Select Technological Process</span>
            <CloseButton onClick={() => setStep('select-hardware')}>X</CloseButton>
          </HeaderRow>
        </WindowHeader>
        <WindowContent>
          <CenteredContent>
            <h3 style={{ margin: '0 0 4px' }}>Technological Process</h3>
            <p style={{ margin: '0 0 8px', fontSize: 11, color: '#666' }}>
              Determines clock speed range and design time
            </p>
            <Separator />
            <ProcessGrid>
              {availableProcesses.map((tp) => (
                <ProcessCard key={tp.id} onClick={() => handleSelectProcess(tp.id)}>
                  <ProcessName>{tp.name}</ProcessName>
                  <ProcessStats>
                    <span>Clock: {formatClock(tp.minClock)} - {formatClock(tp.maxClock)}</span>
                    <span>Design time: {tp.designTimeMultiplier}%</span>
                  </ProcessStats>
                </ProcessCard>
              ))}
            </ProcessGrid>
            <Button onClick={() => setStep('select-hardware')} style={{ marginTop: 12 }}>
              Back
            </Button>
          </CenteredContent>
        </WindowContent>
      </StyledWindow>
    );
  }

  // Design step
  return (
    <DesignWindow>
      <WindowHeader>
        <HeaderRow>
          <span>CPU Design - {techProcess?.name} process</span>
          <CloseButton onClick={onClose}>X</CloseButton>
        </HeaderRow>
      </WindowHeader>
      <WindowContent>
        <DesignGrid>
          {/* Row 1: Brand + CPU Name */}
          <GridCell $col="1" $row="1">
            <GroupBox label="CPU brand">
              {showAddBrand || gameState.cpuBrands.length === 0 ? (
                <BrandInputRow>
                  <TextInput
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Brand name..."
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAddBrand} disabled={!newBrandName.trim()}>
                    Add
                  </Button>
                  {gameState.cpuBrands.length > 0 && (
                    <Button size="sm" onClick={() => setShowAddBrand(false)}>
                      Cancel
                    </Button>
                  )}
                </BrandInputRow>
              ) : (
                <Select
                  value={selectedBrand ?? gameState.cpuBrands[0] ?? '__add_new__'}
                  options={brandOptions}
                  onChange={(option: { value: string }) => {
                    if (option.value === '__add_new__') {
                      setShowAddBrand(true);
                    } else {
                      setSelectedBrand(option.value);
                    }
                  }}
                  width="100%"
                />
              )}
            </GroupBox>
          </GridCell>
          <GridCell $col="2 / 4" $row="1">
            <GroupBox label="CPU name">
              <TextInput
                value={cpuName}
                onChange={(e) => setCpuName(e.target.value)}
                placeholder="Product name"
                fullWidth
                maxLength={24}
              />
            </GroupBox>
          </GridCell>

          {/* Row 2: Clock Frequency | Package | Cores */}
          <GridCell $col="1" $row="2">
            <GroupBox label={`Clock frequency: ${formatClock(clampedClock)}`}>
              <SliderRow>
                <SliderWrap>
                  <Slider
                    min={minClock}
                    max={Math.max(minClock + 1, effectiveMaxClock)}
                    step={Math.max(1, Math.floor((effectiveMaxClock - minClock) / 200))}
                    value={clampedClock}
                    onChange={(value) => setClockSpeed(value as number)}
                  />
                </SliderWrap>
              </SliderRow>
              <SliderHint>/{formatClock(effectiveMaxClock)}</SliderHint>
            </GroupBox>
          </GridCell>
          <GridCell $col="2" $row="2">
            <GroupBox label="Package">
              <PackagePickerBtn onClick={() => setShowPackagePicker(true)}>
                {selectedPackage && (
                  <PackageSvg type={selectedPackage.name.includes('DIP') ? 'DIP' : selectedPackage.name.includes('PLCC') ? 'PLCC' : 'PGA'} />
                )}
                <PackageSelectedName>{selectedPackage?.name ?? 'Select...'}</PackageSelectedName>
              </PackagePickerBtn>
            </GroupBox>
          </GridCell>
          <GridCell $col="3" $row="2">
            <GroupBox label="Cores">
              <Select
                value={selectedCoreId}
                options={availableCores.map((c) => ({ value: c.id, label: c.name }))}
                onChange={(option: { value: string }) => setSelectedCoreId(option.value)}
                width="100%"
              />
            </GroupBox>
          </GridCell>

          {/* Row 3: Build Quality (left column only) */}
          <GridCell $col="1" $row="3">
            <GroupBox label={`Build quality: ${buildQuality}%`}>
              <SliderRow>
                <SliderWrap>
                  <Slider
                    min={50}
                    max={100}
                    step={1}
                    value={buildQuality}
                    onChange={(value) => setBuildQuality(value as number)}
                  />
                </SliderWrap>
              </SliderRow>
            </GroupBox>
          </GridCell>

          {/* Row 4: Time + Cost (left) | Production cost (center) | Unit retail price (right) */}
          <GridCell $col="1" $row="4">
            {designResult && (
              <DesignStatsColumn>
                <DesignStatRow>
                  <StatLabel>Time</StatLabel>
                  <StatValue>{designResult.designTimeDays}D</StatValue>
                </DesignStatRow>
                <DesignStatRow>
                  <StatLabel>Cost</StatLabel>
                  <StatValue>${designResult.designCost.toLocaleString()}</StatValue>
                </DesignStatRow>
              </DesignStatsColumn>
            )}
          </GridCell>
          <GridCell $col="2" $row="4">
            {designResult && (
              <GroupBox label="Production cost">
                <BigCost>${designResult.unitCost.toFixed(2)}</BigCost>
              </GroupBox>
            )}
          </GridCell>
          <GridCell $col="3" $row="4">
            <GroupBox label="Unit retail price">
              <PriceRow>
                <PriceInput
                  value={String(price)}
                  $losing={!!designResult && price < designResult.unitCost}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    const num = parseFloat(val);
                    if (val === '' || val === '.') {
                      setPrice(0);
                    } else if (!isNaN(num)) {
                      setPrice(Math.min(MAX_SELL_PRICE, num));
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <span style={{ fontWeight: 700 }}>$</span>
              </PriceRow>
              {designResult && price < designResult.unitCost && (
                <LossWarning>Selling below cost! You will lose ${(designResult.unitCost - price).toFixed(2)}/unit</LossWarning>
              )}
              {designResult && (
                <RecommendedPrice onClick={() => {
                  const rec = Math.min(MAX_SELL_PRICE, Math.round(designResult.unitCost * 2.5 * 100) / 100);
                  setPrice(rec);
                }}>
                  Recommended: ${Math.min(MAX_SELL_PRICE, Math.round(designResult.unitCost * 2.5 * 100) / 100).toFixed(2)}
                </RecommendedPrice>
              )}
            </GroupBox>
          </GridCell>
        </DesignGrid>

        <DesignFooter>
          <Button onClick={() => setStep('select-process')}>Back</Button>
          <FooterRight>
            {designResult && gameState.balance < designResult.designCost && (
              <CostWarning $canAfford={false}>
                Insufficient funds
              </CostWarning>
            )}
            <Button
              primary
              disabled={
                !designResult ||
                !cpuName.trim() ||
                gameState.balance < (designResult?.designCost ?? Infinity)
              }
              style={{ fontWeight: 700, fontSize: 14, padding: '8px 24px' }}
              onClick={() => {
                if (!designResult || !selectedPackage || !selectedCore || !techProcess) return;
                const buildMult = buildQualityBuildMultiplier(buildQuality);
                const cappedPrice = Math.min(MAX_SELL_PRICE, price);
                const product: CPUProduct = {
                  id: crypto.randomUUID(),
                  name: cpuName.trim(),
                  brand: selectedBrand ?? '',
                  techProcessId: techProcess.id,
                  packageId: selectedPackage.id,
                  coreId: selectedCore.id,
                  clockSpeed: clampedClock,
                  buildQuality,
                  price: cappedPrice,
                  unitCost: designResult.unitCost,
                  designCost: designResult.designCost,
                  designTimeDays: designResult.designTimeDays,
                  designStartDate: gameState.gameDate,
                  status: 'designing',
                  designDaysCompleted: 0,
                  totalUnitsSold: 0,
                  totalRevenue: 0,
                  sellStartDate: null,
                  salesHistory: [],
                  daysOnSale: 0,
                  salesBoost: 0,
                  previousPrice: cappedPrice,
                  performance: selectedPackage.performance + selectedCore.performance,
                  stability: selectedPackage.stability + selectedCore.stability,
                  build: Math.round((selectedPackage.build + selectedCore.build) * buildMult * 10) / 10,
                };
                onStartProduction(product);
                onClose();
              }}
            >
              DONE
            </Button>
          </FooterRight>
        </DesignFooter>
      </WindowContent>

      {showPackagePicker && (
        <ModalOverlay onClick={() => setShowPackagePicker(false)}>
          <ModalWindow onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <WindowHeader>
              <HeaderRow>
                <span>Select Package</span>
                <CloseButton onClick={() => setShowPackagePicker(false)}>X</CloseButton>
              </HeaderRow>
            </WindowHeader>
            <WindowContent>
              <PackageList>
                {availablePackages.map((pkg) => {
                  const pkgType = pkg.name.includes('DIP') ? 'DIP' : pkg.name.includes('PLCC') ? 'PLCC' : 'PGA';
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <PackageCard
                      key={pkg.id}
                      $selected={isSelected}
                      onClick={() => {
                        setSelectedPackageId(pkg.id);
                        const core = CORE_TYPES.find((c) => c.id === selectedCoreId);
                        if (core && core.coreIndex > pkg.maxCore) {
                          setSelectedCoreId('single');
                        }
                        setShowPackagePicker(false);
                      }}
                    >
                      <PackageCardLeft>
                        <PackageSvg type={pkgType} />
                        <PackageCardName>{pkg.name}</PackageCardName>
                      </PackageCardLeft>
                      <PackageCardStats>
                        <PkgStatRow><PkgStatLabel>Design Cost</PkgStatLabel><PkgStatVal>${pkg.designCost.toLocaleString()}</PkgStatVal></PkgStatRow>
                        <PkgStatRow><PkgStatLabel>Design Time</PkgStatLabel><PkgStatVal>{pkg.designTime}d</PkgStatVal></PkgStatRow>
                        <PkgStatRow><PkgStatLabel>Unit Cost</PkgStatLabel><PkgStatVal>${pkg.unitCost}</PkgStatVal></PkgStatRow>
                        <PkgStatRow><PkgStatLabel>Performance</PkgStatLabel><PkgStatVal>+{pkg.performance}</PkgStatVal></PkgStatRow>
                        <PkgStatRow><PkgStatLabel>Stability</PkgStatLabel><PkgStatVal>+{pkg.stability}</PkgStatVal></PkgStatRow>
                        <PkgStatRow><PkgStatLabel>Build</PkgStatLabel><PkgStatVal>+{pkg.build}</PkgStatVal></PkgStatRow>
                        <PkgStatRow><PkgStatLabel>Max Clock</PkgStatLabel><PkgStatVal>{formatClock(pkg.maxClock)}</PkgStatVal></PkgStatRow>
                        <PkgStatRow><PkgStatLabel>Max Core</PkgStatLabel><PkgStatVal>{CORE_TYPES[Math.min(pkg.maxCore, CORE_TYPES.length - 1)]?.name ?? 'Single-core'}</PkgStatVal></PkgStatRow>
                      </PackageCardStats>
                    </PackageCard>
                  );
                })}
              </PackageList>
            </WindowContent>
          </ModalWindow>
        </ModalOverlay>
      )}
    </DesignWindow>
  );
}

function PackageSvg({ type }: { type: 'DIP' | 'PLCC' | 'PGA' }) {
  if (type === 'DIP') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="14" y="6" width="20" height="36" rx="4" fill="#2d2d36" />
        <circle cx="24" cy="12" r="3" fill="#1e1e24" />
        <rect x="10" y="10" width="4" height="28" rx="2" fill="#ffd700" opacity="0.8" />
        <rect x="34" y="10" width="4" height="28" rx="2" fill="#ffd700" opacity="0.8" />
      </svg>
    );
  }
  if (type === 'PLCC') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="8" width="32" height="32" rx="6" fill="#2d2d36" />
        <rect x="14" y="14" width="20" height="20" rx="4" fill="#1e1e24" />
        <circle cx="12" cy="12" r="2.5" fill="#ffd700" />
        <rect x="16" y="4" width="16" height="4" rx="2" fill="#aaa" />
        <rect x="16" y="40" width="16" height="4" rx="2" fill="#aaa" />
        <rect x="4" y="16" width="4" height="16" rx="2" fill="#aaa" />
        <rect x="40" y="16" width="4" height="16" rx="2" fill="#aaa" />
      </svg>
    );
  }
  // PGA
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="6" width="36" height="36" rx="6" fill="#1e1e24" />
      <rect x="12" y="12" width="24" height="24" rx="4" fill="#2d2d36" />
      <rect x="10" y="10" width="28" height="28" rx="2" fill="none" stroke="#ffd700" strokeWidth="2.5" strokeDasharray="2 4" opacity="0.7" />
      <circle cx="24" cy="24" r="6" fill="#424250" />
      <circle cx="10" cy="10" r="2.5" fill="#ffd700" />
    </svg>
  );
}

const StyledWindow = styled(Window)`
  width: 480px;
  max-width: 100%;
`;

const DesignWindow = styled(Window)`
  width: 750px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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

  &:active {
    border-style: inset;
  }
`;

const CenteredContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HardwareOption = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LevelBadge = styled.span`
  font-size: 11px;
  color: #006400;
  text-align: center;
  font-weight: 700;
`;

const LockedText = styled.span`
  font-size: 11px;
  color: #999;
  text-align: center;
  font-style: italic;
`;

const ProcessGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
`;

const ProcessCard = styled.div`
  border: 2px outset #dfdfdf;
  background: #fff;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: #000080;
    color: #fff;
  }
`;

const ProcessName = styled.span`
  font-weight: 700;
  font-size: 14px;
`;

const ProcessStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 11px;
  gap: 2px;
`;

const DesignGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px 12px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GridCell = styled.div<{ $col: string; $row: string }>`
  grid-column: ${(p) => p.$col};
  grid-row: ${(p) => p.$row};

  @media (max-width: 768px) {
    grid-column: 1;
    grid-row: auto;
  }
`;

const BrandInputRow = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const SliderHint = styled.span`
  font-size: 11px;
  color: #888;
  margin-top: 2px;
`;

const PackagePickerBtn = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border: 2px inset #dfdfdf;
  background: #fff;

  &:hover {
    background: #f0f0ff;
  }
`;

const DesignStatsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0;
`;

const DesignStatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
`;

const BigCost = styled.div`
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  padding: 4px 0;
`;

const PriceInput = styled(TextInput)<{ $losing: boolean }>`
  color: ${(p) => (p.$losing ? '#cc0000' : '#006400')};
  font-weight: 700;
`;

const LossWarning = styled.div`
  font-size: 11px;
  color: #cc0000;
  font-weight: 700;
  margin-top: 4px;
`;

const RecommendedPrice = styled.div`
  font-size: 11px;
  color: #006400;
  margin-top: 4px;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;

  &:hover {
    color: #008000;
  }
`;

const StatLabel = styled.span`
  color: #666;
`;

const StatValue = styled.span`
  font-weight: 700;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SliderWrap = styled.div`
  flex: 1;
`;


const DesignFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #ccc;
`;

const FooterRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CostWarning = styled.span<{ $canAfford: boolean }>`
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => (p.$canAfford ? '#006400' : '#cc0000')};
`;

const PackageSelectedName = styled.span`
  font-weight: 700;
  font-size: 12px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
`;

const ModalWindow = styled(Window)`
  width: 580px;
  max-width: 95vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`;

const PackageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 55vh;
  overflow-y: auto;
  padding: 2px;
`;

const PackageCard = styled.div<{ $selected: boolean }>`
  border: 2px ${(p) => (p.$selected ? 'inset #000080' : 'outset #dfdfdf')};
  background: ${(p) => (p.$selected ? '#e8e8ff' : '#fff')};
  padding: 6px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: ${(p) => (p.$selected ? '#e8e8ff' : '#f0f0ff')};
  }
`;

const PackageCardLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
`;

const PackageCardName = styled.span`
  font-weight: 700;
  font-size: 11px;
  text-align: center;
  margin-top: 2px;
`;

const PackageCardStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px 12px;
  font-size: 10px;
  flex: 1;
`;

const PkgStatRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 4px;
`;

const PkgStatLabel = styled.span`
  color: #666;
`;

const PkgStatVal = styled.span`
  font-weight: 700;
  text-align: right;
`;
