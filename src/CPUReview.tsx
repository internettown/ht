import styled from 'styled-components';
import {
  Window,
  WindowHeader,
  WindowContent,
} from 'react95';
import type { CPUProduct } from './types';
import { CPU_PACKAGES } from './cpuData';
import { computeReviewScore } from './cpuScoring';

interface CPUReviewProps {
  product: CPUProduct;
  companyLogo: string;
  companyName: string;
  isCompetitor?: boolean;
  completedResearch?: string[];
  onClose: () => void;
}

function getPackageName(id: string): string {
  return CPU_PACKAGES.find((p) => p.id === id)?.name ?? id;
}

function generateReviewText(product: CPUProduct, score: number, companyName: string): string {
  const pkg = getPackageName(product.packageId);
  const intro = `${product.name} is ${companyName}'s newest CPU. It uses a ${pkg} package.`;

  if (score >= 90) {
    return `${intro} This is an exceptional chip that delivers outstanding performance at a fair price. ${companyName} has really outdone themselves. A must-buy.`;
  } else if (score >= 70) {
    return `${intro} A solid offering with good performance and reasonable pricing. ${companyName} delivers a competitive product that most buyers will be happy with.`;
  } else if (score >= 50) {
    return `${intro} An average CPU that gets the job done, but nothing special. The price could be better for what you're getting.`;
  } else if (score >= 30) {
    return `${intro} This CPU is a mistake, and so is the outrageous price ${companyName} is asking for it. I could only recommend this product if it was given out for free.`;
  } else {
    return `${intro} A disaster of a product. Poor performance, questionable stability, and a price that's an insult to consumers. Avoid at all costs.`;
  }
}

// Simple minimalist SVG chip illustration
function ChipSVG() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" style={{ display: 'block' }}>
      <rect x="25" y="15" width="70" height="70" rx="8" fill="#1e1e24" />
      <rect x="35" y="25" width="50" height="50" rx="6" fill="#2d2d36" />
      <circle cx="60" cy="50" r="14" fill="#424250" />
      
      {/* Minimal edge pins */}
      <rect x="17" y="30" width="8" height="6" rx="2" fill="#ffd700" opacity="0.8" />
      <rect x="17" y="47" width="8" height="6" rx="2" fill="#ffd700" opacity="0.8" />
      <rect x="17" y="64" width="8" height="6" rx="2" fill="#ffd700" opacity="0.8" />
      
      <rect x="95" y="30" width="8" height="6" rx="2" fill="#ffd700" opacity="0.8" />
      <rect x="95" y="47" width="8" height="6" rx="2" fill="#ffd700" opacity="0.8" />
      <rect x="95" y="64" width="8" height="6" rx="2" fill="#ffd700" opacity="0.8" />
      
      <rect x="40" y="7" width="6" height="8" rx="2" fill="#ffd700" opacity="0.8" />
      <rect x="57" y="7" width="6" height="8" rx="2" fill="#ffd700" opacity="0.8" />
      <rect x="74" y="7" width="6" height="8" rx="2" fill="#ffd700" opacity="0.8" />
      
      <rect x="40" y="85" width="6" height="8" rx="2" fill="#ffd700" opacity="0.8" />
      <rect x="57" y="85" width="6" height="8" rx="2" fill="#ffd700" opacity="0.8" />
      <rect x="74" y="85" width="6" height="8" rx="2" fill="#ffd700" opacity="0.8" />
      
      {/* Orientation dot */}
      <circle cx="42" cy="32" r="3" fill="#ff4d4d" opacity="0.8" />
    </svg>
  );
}

// Circular score gauge
function ScoreGauge({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const pct = score / 100;
  const offset = circumference * (1 - pct);

  // Color based on score
  let color = '#cc0000';
  if (score >= 70) color = '#2e7d32';
  else if (score >= 50) color = '#e6a817';
  else if (score >= 30) color = '#e67817';

  return (
    <GaugeWrap>
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={radius} fill="none" stroke="#e0e0e0" strokeWidth="5" />
        <circle
          cx="42" cy="42" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
        />
      </svg>
      <ScoreNumber $color={color}>{score}</ScoreNumber>
    </GaugeWrap>
  );
}

export default function CPUReview({ product, companyLogo, companyName, isCompetitor, completedResearch, onClose }: CPUReviewProps) {
  const score = computeReviewScore(product, isCompetitor, { completedResearch });
  const reviewText = generateReviewText(product, score, companyName);

  return (
    <ReviewOverlay onClick={onClose}>
      <ReviewWindow onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ReviewHeader>
          <span>{product.name} Review</span>
          <CloseButton onClick={onClose}>X</CloseButton>
        </ReviewHeader>
        <WindowContent style={{ padding: 0 }}>
          <ReviewBody>
            <TopSection>
              <LeftColumn>
                <ChipImageWrap>
                  <ChipSVG />
                </ChipImageWrap>
                <LogoCircle>
                  <LogoImg src={companyLogo} alt={companyName} />
                </LogoCircle>
              </LeftColumn>
              <RightColumn>
                <ReviewText>{reviewText}</ReviewText>
              </RightColumn>
            </TopSection>

            <BottomBar>
              <StatsLeft>
                <StatRow>
                  <StatLabel>Price:</StatLabel>
                  <StatValue>${product.price.toLocaleString()}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Unit Cost:</StatLabel>
                  <StatValue>${product.unitCost.toFixed(2)}</StatValue>
                </StatRow>
              </StatsLeft>
              <StatsRight>
                <StatRow>
                  <StatLabel>Performance:</StatLabel>
                  <StatValue>{product.performance}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Stability:</StatLabel>
                  <StatValue>{product.stability}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Build:</StatLabel>
                  <StatValue>{product.build}</StatValue>
                </StatRow>
              </StatsRight>
              <ScoreGauge score={score} />
            </BottomBar>
          </ReviewBody>
        </WindowContent>
      </ReviewWindow>
    </ReviewOverlay>
  );
}

const ReviewOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 150;
`;

const ReviewWindow = styled(Window)`
  width: 560px;
  max-width: 90vw;
`;

const ReviewHeader = styled(WindowHeader)`
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const ReviewBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const TopSection = styled.div`
  display: flex;
  padding: 16px;
  gap: 16px;
  min-height: 200px;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  width: 140px;
`;

const ChipImageWrap = styled.div`
  background: #1a1a1a;
  padding: 8px;
  border: 2px inset #dfdfdf;
`;

const LogoCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid #333;
`;

const LogoImg = styled.img`
  width: 64px;
  height: 64px;
`;

const RightColumn = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
  border-left: 2px solid #c0c0c0;
  padding-left: 16px;
`;

const ReviewText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: #222;
`;

const BottomBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #e8e8e8;
  border-top: 2px inset #dfdfdf;
`;

const StatsLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatsRight = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatRow = styled.div`
  display: flex;
  gap: 6px;
  font-size: 13px;
`;

const StatLabel = styled.span`
  color: #555;
  font-weight: 400;
`;

const StatValue = styled.span`
  font-weight: 700;
  color: #222;
`;

const GaugeWrap = styled.div`
  position: relative;
  width: 84px;
  height: 84px;
  flex-shrink: 0;
`;

const ScoreNumber = styled.span<{ $color: string }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: ${(p) => p.$color};
`;
