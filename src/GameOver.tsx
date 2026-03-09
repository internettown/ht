import { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Window, WindowHeader, WindowContent, Button, Separator } from 'react95';
import type { GameState } from './types';
import { computeReviewScore } from './CPUReview';
import { MILESTONES } from './Milestones';

interface GameOverProps {
  gameState: GameState;
  onMainMenu: () => void;
}

// --- Score calculation ---

interface ScoreBreakdown {
  revenue: number;
  revenueScore: number;
  balance: number;
  balanceScore: number;
  productsReleased: number;
  productsScore: number;
  totalUnitsSold: number;
  unitsScore: number;
  avgReviewScore: number;
  reviewScore: number;
  researchCompleted: number;
  researchScore: number;
  milestonesCompleted: number;
  milestoneScore: number;
  difficultyMultiplier: number;
  totalScore: number;
  grade: string;
}

function calculateScore(gs: GameState): ScoreBreakdown {
  const revenue = gs.products.reduce((s, p) => s + p.totalRevenue, 0);
  const revenueScore = Math.min(2000, Math.floor(Math.sqrt(revenue) / 10));

  const balance = gs.balance === Infinity ? 0 : gs.balance;
  const balanceScore = Math.min(500, Math.floor(Math.sqrt(Math.max(0, balance)) / 5));

  const released = gs.products.filter(p => p.status !== 'designing');
  const productsReleased = released.length;
  const productsScore = Math.min(500, productsReleased * 25);

  const totalUnitsSold = gs.products.reduce((s, p) => s + p.totalUnitsSold, 0);
  const unitsScore = Math.min(1000, Math.floor(Math.sqrt(totalUnitsSold) / 3));

  const reviewScores = released.map(p => computeReviewScore(p));
  const avgReviewScore = reviewScores.length > 0
    ? Math.round(reviewScores.reduce((a, b) => a + b, 0) / reviewScores.length)
    : 0;
  const reviewScore = Math.min(500, Math.floor(avgReviewScore * 5));

  const researchCompleted = gs.research.completedResearch.length;
  const researchScore = Math.min(500, researchCompleted * 10);

  const milestonesCompleted = MILESTONES.filter(m => m.check(gs)).length;
  const milestoneScore = milestonesCompleted * 30;

  const difficultyMultiplier =
    gs.difficulty === 'veryhard' ? 2.0 :
    gs.difficulty === 'hard' ? 1.5 :
    gs.difficulty === 'normal' ? 1.0 :
    0.8; // easy

  const raw = revenueScore + balanceScore + productsScore + unitsScore + reviewScore + researchScore + milestoneScore;
  const totalScore = Math.round(raw * difficultyMultiplier);

  const grade =
    totalScore >= 5000 ? 'S' :
    totalScore >= 4000 ? 'A+' :
    totalScore >= 3000 ? 'A' :
    totalScore >= 2000 ? 'B+' :
    totalScore >= 1500 ? 'B' :
    totalScore >= 1000 ? 'C+' :
    totalScore >= 500 ? 'C' :
    totalScore >= 250 ? 'D' : 'F';

  return {
    revenue, revenueScore,
    balance, balanceScore,
    productsReleased, productsScore,
    totalUnitsSold, unitsScore,
    avgReviewScore, reviewScore,
    researchCompleted, researchScore,
    milestonesCompleted, milestoneScore,
    difficultyMultiplier,
    totalScore,
    grade,
  };
}

// --- Cutscene phases ---
type Phase = 'black' | 'year-scroll' | 'message' | 'stats' | 'score' | 'grade' | 'done';

const YEAR_SCROLL_DURATION = 4000;
const MESSAGE_DELAY = 1000;
const STATS_DELAY = 800;
const SCORE_DELAY = 600;
const GRADE_DELAY = 800;

export default function GameOver({ gameState, onMainMenu }: GameOverProps) {
  const [phase, setPhase] = useState<Phase>('black');
  const [visibleStats, setVisibleStats] = useState(0);
  const [countedScore, setCountedScore] = useState(0);
  const [showGrade, setShowGrade] = useState(false);
  const score = useRef(calculateScore(gameState)).current;
  const animFrame = useRef(0);

  // Phase progression
  useEffect(() => {
    if (phase === 'black') {
      const t = setTimeout(() => setPhase('year-scroll'), 800);
      return () => clearTimeout(t);
    }
    if (phase === 'year-scroll') {
      const t = setTimeout(() => setPhase('message'), YEAR_SCROLL_DURATION + 500);
      return () => clearTimeout(t);
    }
    if (phase === 'message') {
      const t = setTimeout(() => setPhase('stats'), MESSAGE_DELAY + 2000);
      return () => clearTimeout(t);
    }
    if (phase === 'stats') {
      // Reveal stats one by one
      const statCount = 7;
      const timers: ReturnType<typeof setTimeout>[] = [];
      for (let i = 1; i <= statCount; i++) {
        timers.push(setTimeout(() => setVisibleStats(i), STATS_DELAY * i));
      }
      timers.push(setTimeout(() => setPhase('score'), STATS_DELAY * (statCount + 1)));
      return () => timers.forEach(clearTimeout);
    }
    if (phase === 'score') {
      // Count up animation
      const target = score.totalScore;
      const duration = 1500;
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        // Ease out
        const eased = 1 - Math.pow(1 - progress, 3);
        setCountedScore(Math.round(target * eased));
        if (progress < 1) {
          animFrame.current = requestAnimationFrame(animate);
        } else {
          setTimeout(() => setPhase('grade'), SCORE_DELAY);
        }
      };
      animFrame.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animFrame.current);
    }
    if (phase === 'grade') {
      const t = setTimeout(() => {
        setShowGrade(true);
        setTimeout(() => setPhase('done'), GRADE_DELAY);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [phase, score.totalScore]);

  const diffLabel =
    gameState.difficulty === 'veryhard' ? 'Very Hard' :
    gameState.difficulty === 'hard' ? 'Hard' :
    gameState.difficulty === 'normal' ? 'Normal' : 'Easy';

  const stats = [
    { label: 'Total Revenue', value: '$' + score.revenue.toLocaleString(), pts: score.revenueScore },
    { label: 'Final Balance', value: '$' + score.balance.toLocaleString(), pts: score.balanceScore },
    { label: 'CPUs Released', value: String(score.productsReleased), pts: score.productsScore },
    { label: 'Total Units Sold', value: score.totalUnitsSold.toLocaleString(), pts: score.unitsScore },
    { label: 'Avg Review Score', value: String(score.avgReviewScore) + '/100', pts: score.reviewScore },
    { label: 'Research Completed', value: String(score.researchCompleted), pts: score.researchScore },
    { label: 'Milestones', value: `${score.milestonesCompleted}/${MILESTONES.length}`, pts: score.milestoneScore },
  ];

  const gradeColor =
    score.grade === 'S' ? '#FFD700' :
    score.grade.startsWith('A') ? '#006400' :
    score.grade.startsWith('B') ? '#2c6fbb' :
    score.grade.startsWith('C') ? '#8B4513' :
    score.grade === 'D' ? '#cc6600' : '#cc0000';

  return (
    <Overlay $visible={phase !== 'black'}>
      {/* Black screen fade */}
      <BlackScreen $fade={phase !== 'black'} />

      {/* Year scroll */}
      {(phase === 'year-scroll' || phase === 'message' || phase === 'stats' || phase === 'score' || phase === 'grade' || phase === 'done') && (
        <YearScrollContainer $done={phase !== 'year-scroll'}>
          <YearScroll $duration={YEAR_SCROLL_DURATION}>
            {Array.from({ length: 42 }, (_, i) => (
              <YearText key={i} $highlight={1970 + i === 2010}>
                {1970 + i}
              </YearText>
            ))}
          </YearScroll>
        </YearScrollContainer>
      )}

      {/* Message */}
      {(phase === 'message' || phase === 'stats' || phase === 'score' || phase === 'grade' || phase === 'done') && (
        <MessageContainer>
          <FadeInText $delay={0}>The year is 2011.</FadeInText>
          <FadeInText $delay={600}>After 41 years, <CompanyHighlight>{gameState.companyName}</CompanyHighlight> closes its doors.</FadeInText>
          <FadeInText $delay={1200}>Here is how you did.</FadeInText>
        </MessageContainer>
      )}

      {/* Stats window */}
      {(phase === 'stats' || phase === 'score' || phase === 'grade' || phase === 'done') && (
        <StatsContainer>
          <StatsWindow>
            <StatsHeader>
              <span>Final Report - {gameState.companyName}</span>
            </StatsHeader>
            <StatsContent>
              <CompanyRow>
                <CompanyInfo>
                  <CompanyName>{gameState.companyName}</CompanyName>
                  <FounderName>Founded by {gameState.founderName} in 1970</FounderName>
                  <DiffBadge>{diffLabel} Mode {score.difficultyMultiplier !== 1 && `(${score.difficultyMultiplier}x)`}</DiffBadge>
                </CompanyInfo>
              </CompanyRow>

              <Separator />

              <StatsTable>
                <thead>
                  <tr>
                    <StatTH style={{ textAlign: 'left' }}>Category</StatTH>
                    <StatTH>Value</StatTH>
                    <StatTH>Points</StatTH>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s, i) => (
                    <StatRow key={s.label} $visible={visibleStats > i}>
                      <StatTD>{s.label}</StatTD>
                      <StatTD style={{ textAlign: 'center', fontWeight: 700 }}>{s.value}</StatTD>
                      <StatTD style={{ textAlign: 'right', color: '#006400', fontWeight: 700 }}>+{s.pts}</StatTD>
                    </StatRow>
                  ))}
                </tbody>
              </StatsTable>

              {(phase === 'score' || phase === 'grade' || phase === 'done') && (
                <>
                  <Separator />
                  <ScoreRow>
                    <ScoreLabel>FINAL SCORE</ScoreLabel>
                    <ScoreValue>{countedScore.toLocaleString()}</ScoreValue>
                  </ScoreRow>
                </>
              )}

              {showGrade && (
                <GradeContainer>
                  <GradeLetter $color={gradeColor}>{score.grade}</GradeLetter>
                </GradeContainer>
              )}

              {phase === 'done' && (
                <ButtonRow>
                  <Button primary onClick={onMainMenu} style={{ padding: '8px 32px', fontWeight: 700, fontSize: 14 }}>
                    Main Menu
                  </Button>
                </ButtonRow>
              )}
            </StatsContent>
          </StatsWindow>
        </StatsContainer>
      )}
    </Overlay>
  );
}

// --- Animations ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
  0% { opacity: 0; transform: scale(0.3); }
  60% { opacity: 1; transform: scale(1.15); }
  100% { opacity: 1; transform: scale(1); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradeStamp = keyframes`
  0% { opacity: 0; transform: scale(3) rotate(-15deg); }
  40% { opacity: 1; transform: scale(1.1) rotate(2deg); }
  60% { transform: scale(0.95) rotate(-1deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const scrollYears = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

// --- Styled components ---

const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
`;

const BlackScreen = styled.div<{ $fade: boolean }>`
  position: absolute;
  inset: 0;
  background: #000;
  z-index: 1;
  opacity: ${p => p.$fade ? 0 : 1};
  transition: opacity 1.5s ease;
  pointer-events: none;
`;

const YearScrollContainer = styled.div<{ $done: boolean }>`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  overflow: hidden;
  height: 80px;
  z-index: 2;
  opacity: ${p => p.$done ? 0 : 1};
  transition: opacity 0.8s ease;
  mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
`;

const YearScroll = styled.div<{ $duration: number }>`
  display: flex;
  gap: 48px;
  white-space: nowrap;
  animation: ${scrollYears} ${p => p.$duration}ms linear forwards;
  width: max-content;
  padding-left: 50vw;
`;

const YearText = styled.span<{ $highlight: boolean }>`
  font-size: 48px;
  font-weight: 700;
  font-family: inherit;
  color: ${p => p.$highlight ? '#FFD700' : '#444'};
  ${p => p.$highlight && css`
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  `}
`;

const MessageContainer = styled.div`
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const FadeInText = styled.div<{ $delay: number }>`
  font-size: 18px;
  color: #ccc;
  font-family: inherit;
  text-align: center;
  opacity: 0;
  animation: ${fadeIn} 0.8s ease forwards;
  animation-delay: ${p => p.$delay}ms;
`;

const CompanyHighlight = styled.span`
  color: #fff;
  font-weight: 700;
`;

const StatsContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 4;
  opacity: 0;
  animation: ${slideUp} 0.6s ease forwards;
  animation-delay: 200ms;
`;

const StatsWindow = styled(Window)`
  width: 500px;
  max-width: 95vw;
`;

const StatsHeader = styled(WindowHeader)`
  display: flex;
  align-items: center;
`;

const StatsContent = styled(WindowContent)`
  padding: 16px 20px;
`;

const CompanyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CompanyName = styled.div`
  font-size: 18px;
  font-weight: 700;
`;

const FounderName = styled.div`
  font-size: 11px;
  color: #666;
`;

const DiffBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #555;
  background: #e8e8e8;
  border: 1px solid #aaa;
  padding: 1px 6px;
  align-self: flex-start;
  margin-top: 2px;
`;

const StatsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
`;

const StatTH = styled.th`
  font-size: 11px;
  color: #666;
  font-weight: 700;
  padding: 2px 4px 4px;
  border-bottom: 1px solid #aaa;
  text-align: right;
`;

const StatRow = styled.tr<{ $visible: boolean }>`
  opacity: ${p => p.$visible ? 1 : 0};
  transform: translateY(${p => p.$visible ? 0 : 8}px);
  transition: opacity 0.3s ease, transform 0.3s ease;
`;

const StatTD = styled.td`
  font-size: 12px;
  padding: 4px;
  border-bottom: 1px solid #eee;
`;

const ScoreRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  opacity: 0;
  animation: ${fadeIn} 0.5s ease forwards;
`;

const ScoreLabel = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #333;
`;

const ScoreValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #000;
  font-family: inherit;
`;

const GradeContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
`;

const GradeLetter = styled.div<{ $color: string }>`
  font-size: 64px;
  font-weight: 700;
  color: ${p => p.$color};
  font-family: inherit;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.15);
  animation: ${gradeStamp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
  opacity: 0;
  animation: ${fadeIn} 0.5s ease forwards;
  animation-delay: 300ms;
`;
