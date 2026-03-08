import { useState } from 'react';
import styled from 'styled-components';
import {
  Window,
  WindowHeader,
  WindowContent,
  Button,
  GroupBox,
  Separator,
  Checkbox,
  Slider,
} from 'react95';
import type { GameState, AdType, Continent, MarketingCampaign } from './types';
import { AD_TYPES, CONTINENTS } from './types';

interface MarketingProps {
  gameState: GameState;
  onLaunchCampaign: (campaign: MarketingCampaign) => void;
  onStopCampaign: (campaignId: string) => void;
  onClose: () => void;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

export default function Marketing({ gameState, onLaunchCampaign, onStopCampaign, onClose }: MarketingProps) {
  const [selectedAds, setSelectedAds] = useState<AdType[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<Continent[]>([]);
  const [budgetSlider, setBudgetSlider] = useState(500);

  const marketing = gameState.marketing || { campaigns: [], hype: 0 };
  const activeCampaigns = (marketing.campaigns || []).filter((c) => c.active);

  const toggleAd = (id: AdType) => {
    setSelectedAds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleRegion = (id: Continent) => {
    setSelectedRegions((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  // Calculate daily cost based on selections
  const adCostMult = selectedAds.reduce((sum, id) => {
    const ad = AD_TYPES.find((a) => a.id === id);
    return sum + (ad?.costMultiplier ?? 0);
  }, 0);
  const regionMult = selectedRegions.reduce((sum, id) => {
    const r = CONTINENTS.find((c) => c.id === id);
    return sum + (r?.marketSize ?? 0);
  }, 0);
  const dailyCost = Math.round(budgetSlider * Math.max(adCostMult, 0.1) * Math.max(regionMult, 0.1));

  const canLaunch = selectedAds.length > 0 && selectedRegions.length > 0 && dailyCost > 0;

  const handleLaunch = () => {
    if (!canLaunch) return;
    const campaign: MarketingCampaign = {
      id: `camp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      adTypes: [...selectedAds],
      regions: [...selectedRegions],
      dailyCost,
      startDate: gameState.gameDate,
      active: true,
    };
    onLaunchCampaign(campaign);
    setSelectedAds([]);
    setSelectedRegions([]);
    setBudgetSlider(500);
  };

  // Total daily marketing spend
  const totalDailySpend = activeCampaigns.reduce((s, c) => s + c.dailyCost, 0);

  return (
    <StyledWindow>
      <WindowHeader>
        <HeaderRow>
          <span>Marketing</span>
          <CloseButton onClick={onClose}>X</CloseButton>
        </HeaderRow>
      </WindowHeader>
      <WindowContent>
        <HypeSection>
          <HypeLabel>Hype Level</HypeLabel>
          <HypeBarOuter>
            <HypeBarInner $width={Math.min(100, marketing.hype)} />
          </HypeBarOuter>
          <HypeValue>{Math.round(marketing.hype)}/100</HypeValue>
          <HypeHint>
            Hype boosts sales but decays daily. Time your campaigns before product launches!
          </HypeHint>
        </HypeSection>

        <Separator style={{ margin: '8px 0' }} />

        {activeCampaigns.length > 0 && (
          <>
            <GroupBox label={`Active Campaigns (${activeCampaigns.length})`}>
              <CampaignList>
                {activeCampaigns.map((c) => (
                  <CampaignCard key={c.id}>
                    <CampaignInfo>
                      <CampaignAds>
                        {c.adTypes.map((a) => AD_TYPES.find((t) => t.id === a)?.name).join(', ')}
                      </CampaignAds>
                      <CampaignRegions>
                        {c.regions.map((r) => CONTINENTS.find((ct) => ct.id === r)?.name).join(', ')}
                      </CampaignRegions>
                      <CampaignCost>{formatMoney(c.dailyCost)}/day</CampaignCost>
                    </CampaignInfo>
                    <Button size="sm" onClick={() => onStopCampaign(c.id)}>
                      Stop
                    </Button>
                  </CampaignCard>
                ))}
              </CampaignList>
              <TotalSpend>Total daily spend: {formatMoney(totalDailySpend)}/day</TotalSpend>
            </GroupBox>
            <Separator style={{ margin: '8px 0' }} />
          </>
        )}

        <GroupBox label="New Campaign">
          <SectionLabel>Ad Types</SectionLabel>
          <CheckboxGrid>
            {AD_TYPES.map((ad) => (
              <CheckboxItem key={ad.id}>
                <Checkbox
                  checked={selectedAds.includes(ad.id)}
                  onChange={() => toggleAd(ad.id)}
                  label={ad.name}
                />
                <CostHint>x{ad.costMultiplier}</CostHint>
              </CheckboxItem>
            ))}
          </CheckboxGrid>

          <SectionLabel style={{ marginTop: 10 }}>Regions</SectionLabel>
          <CheckboxGrid>
            {CONTINENTS.map((c) => (
              <CheckboxItem key={c.id}>
                <Checkbox
                  checked={selectedRegions.includes(c.id)}
                  onChange={() => toggleRegion(c.id)}
                  label={c.name}
                />
                <CostHint>x{c.marketSize}</CostHint>
              </CheckboxItem>
            ))}
          </CheckboxGrid>

          <SectionLabel style={{ marginTop: 10 }}>Campaign Budget</SectionLabel>
          <SliderRow>
            <SliderLabel>{formatMoney(100)}</SliderLabel>
            <SliderWrap>
              <Slider
                min={100}
                max={10000}
                step={100}
                value={budgetSlider}
                onChange={(value) => setBudgetSlider(value as number)}
              />
            </SliderWrap>
            <SliderLabel>{formatMoney(10000)}</SliderLabel>
          </SliderRow>
          <BudgetDisplay>Base budget: {formatMoney(budgetSlider)}/day</BudgetDisplay>

          <Separator style={{ margin: '8px 0' }} />

          <CostSummary>
            <CostLine>
              <span>Daily cost:</span>
              <CostValue>{formatMoney(dailyCost)}/day</CostValue>
            </CostLine>
            <CostLine>
              <span>Monthly estimate:</span>
              <CostValue>{formatMoney(dailyCost * 30)}/mo</CostValue>
            </CostLine>
          </CostSummary>

          <LaunchButton
            primary
            disabled={!canLaunch}
            onClick={handleLaunch}
            fullWidth
          >
            Launch Campaign
          </LaunchButton>
        </GroupBox>
      </WindowContent>
    </StyledWindow>
  );
}

const StyledWindow = styled(Window)`
  width: 480px;
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

const HypeSection = styled.div`
  text-align: center;
`;

const HypeLabel = styled.div`
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 4px;
`;

const HypeBarOuter = styled.div`
  width: 100%;
  height: 20px;
  background: #fff;
  border: 2px inset #dfdfdf;
  position: relative;
`;

const HypeBarInner = styled.div<{ $width: number }>`
  height: 100%;
  width: ${(p) => p.$width}%;
  background: linear-gradient(90deg, #ff6b35, #ff2222);
  transition: width 0.3s;
`;

const HypeValue = styled.div`
  font-size: 12px;
  font-weight: 700;
  margin-top: 2px;
  color: #cc3333;
`;

const HypeHint = styled.div`
  font-size: 10px;
  color: #888;
  font-style: italic;
  margin-top: 4px;
`;

const CampaignList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 150px;
  overflow-y: auto;
`;

const CampaignCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px;
  border: 1px solid #ccc;
  background: #fafafa;
`;

const CampaignInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  font-size: 10px;
`;

const CampaignAds = styled.span`
  font-weight: 700;
  color: #333;
`;

const CampaignRegions = styled.span`
  color: #666;
`;

const CampaignCost = styled.span`
  color: #cc0000;
  font-weight: 700;
`;

const TotalSpend = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #cc0000;
  text-align: right;
  margin-top: 4px;
`;

const SectionLabel = styled.div`
  font-weight: 700;
  font-size: 11px;
  margin-bottom: 4px;
  color: #333;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 12px;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
`;

const CostHint = styled.span`
  font-size: 9px;
  color: #888;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SliderWrap = styled.div`
  flex: 1;
`;

const SliderLabel = styled.span`
  font-size: 10px;
  color: #666;
  min-width: 40px;
  text-align: center;
`;

const BudgetDisplay = styled.div`
  font-size: 11px;
  text-align: center;
  color: #444;
  margin-top: 2px;
`;

const CostSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
`;

const CostLine = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
`;

const CostValue = styled.span`
  font-weight: 700;
  color: #cc0000;
`;

const LaunchButton = styled(Button)`
  margin-top: 4px;
`;
