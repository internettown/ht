import { useState } from 'react';
import styled from 'styled-components';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import {
  Button,
  Window,
  WindowHeader,
  WindowContent,
  TextInput,
  Checkbox,
  GroupBox,
  ColorInput,
  Separator,
  Select,
  Slider,
  Tabs,
  Tab,
  TabBody,
} from 'react95';
import htLogo from '/ht.svg';
import type { Difficulty, LogoConfig, GameState } from './types';
import { STARTING_BALANCE, DEFAULT_BANK, DEFAULT_FINANCE, DEFAULT_MARKETING, DEFAULT_COMPETITOR_STATE } from './types';
import { getShapePath, logoConfigToSvg } from './logoUtils';

const SHAPES = [
  { label: 'Circle', value: 'circle' },
  { label: 'Square', value: 'square' },
  { label: 'Diamond', value: 'diamond' },
  { label: 'Triangle', value: 'triangle' },
  { label: 'Hexagon', value: 'hexagon' },
  { label: 'Star', value: 'star' },
  { label: 'Shield', value: 'shield' },
  { label: 'Rounded', value: 'rounded' },
] as const;

const BORDER_STYLES = [
  { label: 'None', value: 'none' },
  { label: 'Thin', value: '2px' },
  { label: 'Medium', value: '4px' },
  { label: 'Thick', value: '6px' },
] as const;

interface NewGameProps {
  onBack: () => void;
  onStart: (state: GameState) => void;
}

function LogoPreview({ config, size = 96 }: { config: LogoConfig; size?: number }) {
  const shape = config.shape;
  const isCircle = shape === 'circle';
  const isRounded = shape === 'rounded';
  const path = getShapePath(shape, size);

  const clipId = `logo-clip-${size}`;
  const borderW = config.borderWidth === 'none' ? 0 : parseInt(config.borderWidth);
  const innerSize = size - borderW * 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: `rotate(${config.rotation}deg)` }}
    >
      <defs>
        <clipPath id={clipId}>
          {isCircle ? (
            <circle cx={size / 2} cy={size / 2} r={size / 2} />
          ) : isRounded ? (
            <rect x={0} y={0} width={size} height={size} rx={size * 0.2} />
          ) : (
            <path d={path} />
          )}
        </clipPath>
      </defs>

      {/* Border */}
      {borderW > 0 && (
        <>
          {isCircle ? (
            <circle cx={size / 2} cy={size / 2} r={size / 2} fill={config.borderColor} />
          ) : isRounded ? (
            <rect x={0} y={0} width={size} height={size} rx={size * 0.2} fill={config.borderColor} />
          ) : (
            <path d={path} fill={config.borderColor} />
          )}
        </>
      )}

      {/* Background */}
      <g clipPath={`url(#${clipId})`}>
        <rect
          x={borderW}
          y={borderW}
          width={innerSize}
          height={innerSize}
          fill={config.bgColor}
          transform={borderW > 0 ? undefined : undefined}
        />
        {borderW > 0 && (
          <rect x={borderW} y={borderW} width={innerSize} height={innerSize} fill={config.bgColor} />
        )}
      </g>

      {/* Icon */}
      {config.iconChar && (
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={config.iconColor}
          fontSize={config.iconSize}
          style={{ transform: `rotate(-${config.rotation}deg)`, transformOrigin: 'center' }}
        >
          {config.iconChar}
        </text>
      )}

      {/* Text overlay */}
      {config.showText && config.text && (
        <text
          x={size / 2}
          y={size * 0.82}
          textAnchor="middle"
          dominantBaseline="central"
          fill={config.textColor}
          fontSize={size * 0.13}
          fontWeight="bold"
          fontFamily="sans-serif"
          style={{ transform: `rotate(-${config.rotation}deg)`, transformOrigin: 'center' }}
        >
          {config.text.slice(0, 6)}
        </text>
      )}
    </svg>
  );
}

export default function NewGame({ onBack, onStart }: NewGameProps) {
  const [companyName, setCompanyName] = useState('');
  const [founderFirst, setFounderFirst] = useState('');
  const [founderLast, setFounderLast] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [bankruptcy, setBankruptcy] = useState(true);
  const [competitors, setCompetitors] = useState(true);
  const [infiniteMoney, setInfiniteMoney] = useState(false);
  const [logoTab, setLogoTab] = useState(0);

  const [logo, setLogo] = useState<LogoConfig>({
    shape: 'circle',
    bgColor: '#1a3a6b',
    iconChar: '\u2338',
    iconColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 'none',
    iconSize: 40,
    rotation: 0,
    text: '',
    textColor: '#ffffff',
    showText: false,
  });

  const updateLogo = (patch: Partial<LogoConfig>) => setLogo((prev) => ({ ...prev, ...patch }));

  const founderFull = `${founderFirst} ${founderLast}`.trim();
  const founderLen = founderFull.length;

  return (
    <Wrapper>
      <StyledWindow>
        <StyledWindowHeader>
          <HeaderIcon src={htLogo} alt="" />
          <span>New Game - Hardware Tycoon</span>
        </StyledWindowHeader>
        <WindowContent>
          <ScrollArea>
            {/* Company & Founder */}
            <GroupBox label="Company Details">
              <FieldRow>
                <Label>Company Name</Label>
                <TextInput
                  value={companyName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCompanyName(e.target.value.slice(0, 28))
                  }
                  placeholder="Enter company name..."
                  fullWidth
                />
                <CharCount>{companyName.length}/28</CharCount>
              </FieldRow>
              <FieldRow>
                <Label>Founder First Name</Label>
                <TextInput
                  value={founderFirst}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = e.target.value;
                    if (`${val} ${founderLast}`.trim().length <= 40) {
                      setFounderFirst(val);
                    }
                  }}
                  placeholder="First name..."
                  fullWidth
                />
              </FieldRow>
              <FieldRow>
                <Label>Founder Last Name</Label>
                <TextInput
                  value={founderLast}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = e.target.value;
                    if (`${founderFirst} ${val}`.trim().length <= 40) {
                      setFounderLast(val);
                    }
                  }}
                  placeholder="Last name..."
                  fullWidth
                />
                <CharCount>{founderLen}/40</CharCount>
              </FieldRow>
            </GroupBox>

            {/* Difficulty */}
            <GroupBox label="Difficulty">
              <DifficultyRow>
                {([
                  ['easy', 'Easy'],
                  ['normal', 'Normal'],
                  ['hard', 'Hard'],
                  ['veryhard', 'Very Hard'],
                ] as const).map(([val, label]) => (
                  <DifficultyButton
                    key={val}
                    primary={difficulty === val}
                    onClick={() => setDifficulty(val)}
                  >
                    {label}
                  </DifficultyButton>
                ))}
              </DifficultyRow>
              <DifficultyDesc>
                {difficulty === 'easy' && 'Relaxed pace. Forgiving market and generous funding.'}
                {difficulty === 'normal' && 'Balanced experience. Standard market conditions.'}
                {difficulty === 'hard' && 'Tough competition. Tight budgets and demanding consumers.'}
                {difficulty === 'veryhard' && 'Brutal. Razor-thin margins, aggressive rivals, no mercy.'}
              </DifficultyDesc>
            </GroupBox>

            {/* Logo Creator */}
            <GroupBox label="Company Logo">
              <LogoSection>
                <LogoPreviewArea>
                  <LogoPreview config={logo} size={96} />
                </LogoPreviewArea>

                <Tabs value={logoTab} onChange={(_val: number) => setLogoTab(_val)}>
                  <Tab value={0}>Shape</Tab>
                  <Tab value={1}>Icon</Tab>
                  <Tab value={2}>Colors</Tab>
                  <Tab value={3}>Border</Tab>
                  <Tab value={4}>Text</Tab>
                </Tabs>
                <TabBody>
                  {logoTab === 0 && (
                    <TabContent>
                      <ShapeGrid>
                        {SHAPES.map((s) => (
                          <ShapeButton
                            key={s.value}
                            primary={logo.shape === s.value}
                            onClick={() => updateLogo({ shape: s.value })}
                          >
                            <LogoPreview
                              config={{ ...logo, shape: s.value, borderWidth: 'none', iconChar: '', showText: false }}
                              size={32}
                            />
                            <ShapeLabel>{s.label}</ShapeLabel>
                          </ShapeButton>
                        ))}
                      </ShapeGrid>
                      <FieldRow>
                        <Label>Rotation: {logo.rotation}°</Label>
                        <Slider
                          min={0}
                          max={360}
                          step={15}
                          value={logo.rotation}
                          onChange={(val: number) => updateLogo({ rotation: val })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                    </TabContent>
                  )}

                  {logoTab === 1 && (
                    <TabContent>
                      <EmojiPickerWrapper>
                        <Button
                          size="sm"
                          onClick={() => updateLogo({ iconChar: '' })}
                          style={{ marginBottom: 8 }}
                        >
                          Clear Icon
                        </Button>
                        <EmojiPicker
                          onEmojiClick={(emojiData: EmojiClickData) =>
                            updateLogo({ iconChar: emojiData.emoji })
                          }
                          width="100%"
                          height={300}
                          searchPlaceholder="Search emoji..."
                          previewConfig={{ showPreview: false }}
                        />
                      </EmojiPickerWrapper>

                      <FieldRow>
                        <Label>Icon Size: {logo.iconSize}px</Label>
                        <Slider
                          min={16}
                          max={72}
                          step={2}
                          value={logo.iconSize}
                          onChange={(val: number) => updateLogo({ iconSize: val })}
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                    </TabContent>
                  )}

                  {logoTab === 2 && (
                    <TabContent>
                      <ColorRow>
                        <Label>Background</Label>
                        <ColorInput
                          value={logo.bgColor}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateLogo({ bgColor: e.target.value })
                          }
                        />
                      </ColorRow>
                      <ColorRow>
                        <Label>Icon Color</Label>
                        <ColorInput
                          value={logo.iconColor}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateLogo({ iconColor: e.target.value })
                          }
                        />
                      </ColorRow>
                      <QuickColors>
                        {['#1a3a6b', '#8b0000', '#006400', '#4b0082', '#ff8c00', '#000000', '#2f4f4f', '#800080'].map(
                          (c) => (
                            <QuickColorBtn
                              key={c}
                              style={{ backgroundColor: c }}
                              onClick={() => updateLogo({ bgColor: c })}
                            />
                          )
                        )}
                      </QuickColors>
                    </TabContent>
                  )}

                  {logoTab === 3 && (
                    <TabContent>
                      <FieldRow>
                        <Label>Border Width</Label>
                        <Select
                          options={BORDER_STYLES.map((b) => ({ label: b.label, value: b.value }))}
                          value={logo.borderWidth}
                          onChange={(option: { value: string }) =>
                            updateLogo({ borderWidth: option.value })
                          }
                          menuMaxHeight={160}
                          width={160}
                        />
                      </FieldRow>
                      <ColorRow>
                        <Label>Border Color</Label>
                        <ColorInput
                          value={logo.borderColor}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateLogo({ borderColor: e.target.value })
                          }
                        />
                      </ColorRow>
                    </TabContent>
                  )}

                  {logoTab === 4 && (
                    <TabContent>
                      <FieldRow>
                        <Checkbox
                          label="Show text on logo"
                          checked={logo.showText}
                          onChange={() => updateLogo({ showText: !logo.showText })}
                        />
                      </FieldRow>
                      {logo.showText && (
                        <>
                          <FieldRow>
                            <Label>Text (6 chars max)</Label>
                            <TextInput
                              value={logo.text}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateLogo({ text: e.target.value.slice(0, 6) })
                              }
                              placeholder="e.g. ACME"
                              fullWidth
                            />
                          </FieldRow>
                          <ColorRow>
                            <Label>Text Color</Label>
                            <ColorInput
                              value={logo.textColor}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateLogo({ textColor: e.target.value })
                              }
                            />
                          </ColorRow>
                        </>
                      )}
                    </TabContent>
                  )}
                </TabBody>
              </LogoSection>
            </GroupBox>

            {/* Options */}
            <GroupBox label="Game Options">
              <OptionsColumn>
                <Checkbox
                  label="Enable Bankruptcy"
                  checked={bankruptcy}
                  onChange={() => setBankruptcy(!bankruptcy)}
                />
                <Checkbox
                  label="Enable Competitors"
                  checked={competitors}
                  onChange={() => setCompetitors(!competitors)}
                />
                <Checkbox
                  label="Infinite Money"
                  checked={infiniteMoney}
                  onChange={() => setInfiniteMoney(!infiniteMoney)}
                />
              </OptionsColumn>
            </GroupBox>

            <Separator />

            <BottomRow>
              <Button onClick={onBack} style={{ minWidth: 90 }}>
                &lt; Back
              </Button>
              <Button
                primary
                disabled={!companyName.trim() || !founderFirst.trim() || !founderLast.trim()}
                style={{ minWidth: 120 }}
                size="lg"
                onClick={() => {
                  const logoSvg = logoConfigToSvg(logo);
                  const state: GameState = {
                    companyName: companyName.trim(),
                    founderName: `${founderFirst.trim()} ${founderLast.trim()}`,
                    difficulty,
                    bankruptcy,
                    competitors,
                    infiniteMoney,
                    logoSvg,
                    logoConfig: logo,
                    balance: infiniteMoney ? Infinity : STARTING_BALANCE[difficulty],
                    gameDate: '1970-01-01T00:00:00.000Z',
                    research: {
                      completedResearch: [],
                      currentResearch: null,
                      currentResearchPoints: 0,
                      researchQueue: [],
                      dailyBudget: 175,
                      cpuExperience: 0,
                    },
                    bank: { ...DEFAULT_BANK },
                    cpuBrands: [],
                    products: [],
                    finance: { ...DEFAULT_FINANCE },
                    marketing: { ...DEFAULT_MARKETING },
                    competitorState: { ...DEFAULT_COMPETITOR_STATE },
                  };
                  localStorage.setItem('ht-current-game', JSON.stringify(state));
                  localStorage.setItem('ht-company-logo', logoSvg);
                  onStart(state);
                }}
              >
                Done
              </Button>
            </BottomRow>
          </ScrollArea>
        </WindowContent>
      </StyledWindow>
    </Wrapper>
  );
}

/* ---- Styled Components ---- */

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 16px;
`;

const StyledWindow = styled(Window)`
  width: 520px;
  max-width: 95vw;
  max-height: 90vh;
`;

const StyledWindowHeader = styled(WindowHeader)`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderIcon = styled.img`
  width: 16px;
  height: 16px;
  filter: invert(1);
`;

const ScrollArea = styled.div`
  max-height: calc(90vh - 60px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 700;
`;

const CharCount = styled.span`
  font-size: 11px;
  color: #888;
  text-align: right;
`;

const DifficultyRow = styled.div`
  display: flex;
  gap: 4px;
`;

const DifficultyButton = styled(Button)`
  flex: 1;
  font-size: 12px;
`;

const DifficultyDesc = styled.p`
  font-size: 11px;
  color: #444;
  margin: 8px 0 0 0;
  min-height: 28px;
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LogoPreviewArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 16px 16px;
  border: 2px inset;
`;

const ShapeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-bottom: 8px;
`;

const ShapeButton = styled(Button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  min-height: 56px;
`;

const ShapeLabel = styled.span`
  font-size: 10px;
`;

const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const QuickColors = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
`;

const QuickColorBtn = styled.button`
  width: 24px;
  height: 24px;
  border: 2px outset #dfdfdf;
  cursor: pointer;
  padding: 0;

  &:active {
    border-style: inset;
  }
`;

const TabContent = styled.div`
  min-height: 100px;
`;

const EmojiPickerWrapper = styled.div`
  margin-bottom: 8px;

  .EmojiPickerReact {
    --epr-bg-color: #c0c0c0;
    --epr-category-label-bg-color: #c0c0c0;
    --epr-search-input-bg-color: #fff;
    border: 2px inset #dfdfdf;
    font-family: inherit;
  }
`;

const OptionsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
`;
