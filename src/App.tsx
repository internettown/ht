import { useState, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import styled, { createGlobalStyle } from 'styled-components';
import original from 'react95/dist/themes/original';
import { Button, Window, WindowHeader, WindowContent, Separator } from 'react95';
import htLogo from '/ht.svg';
import NewGame from './NewGame';
import Dashboard from './Dashboard';
import GameOver from './GameOver';
import type { GameState } from './types';
import { DEFAULT_BANK, DEFAULT_MARKETING, DEFAULT_COMPETITOR_STATE } from './types';

const AUTOSAVE_KEY = 'ht-autosave';
const SAVE_KEY = 'ht-current-game';

function loadSavedGame(): GameState | null {
  // Try autosave first (most recent), then manual save
  const raw = localStorage.getItem(AUTOSAVE_KEY) || localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as GameState;
    // Restore Infinity balance for infinite money mode
    if (state.infiniteMoney) {
      state.balance = Infinity;
    }
    // Migrate old saves missing research
    if (!state.research) {
      state.research = {
        completedResearch: [],
        currentResearch: null,
        currentResearchPoints: 0,
        researchQueue: [],
        dailyBudget: 175,
        cpuExperience: 0,
      };
    }
    // Migrate old saves missing researchQueue
    if (!state.research.researchQueue) {
      state.research.researchQueue = [];
    }
    // Migrate old saves missing bank
    if (!state.bank) {
      state.bank = { ...DEFAULT_BANK };
    }
    if (!state.cpuBrands) {
      state.cpuBrands = [];
    }
    if (!state.products) {
      state.products = [];
    }
    if (!state.marketing) {
      state.marketing = { ...DEFAULT_MARKETING };
    }
    if (!state.competitorState) {
      state.competitorState = { ...DEFAULT_COMPETITOR_STATE };
    }
    return state;
  } catch {
    return null;
  }
}

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('https://unpkg.com/react95@4.0.0/dist/fonts/ms_sans_serif.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('https://unpkg.com/react95@4.0.0/dist/fonts/ms_sans_serif_bold.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
  }

  body {
    font-family: 'ms_sans_serif';
    background-color: #008080;
    -webkit-text-size-adjust: 100%;
    overscroll-behavior: none;
  }

  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const StyledWindow = styled(Window)`
  width: 420px;
  max-width: 95vw;
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

const Content = styled(WindowContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 32px;
  overflow-y: auto;
`;

const Logo = styled.img`
  width: 128px;
  height: 128px;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 2px 0;
  font-family: 'ms_sans_serif', sans-serif;
`;

const Subtitle = styled.p`
  font-size: 12px;
  color: #444;
  margin: 0 0 16px 0;
  font-family: 'ms_sans_serif', sans-serif;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 16px;
`;

const StyledButton = styled(Button)`
  width: 100%;
  font-size: 14px;
  padding: 8px 0;
`;

// --- Error Boundary (crash screen) ---

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Hardware Tycoon crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ThemeProvider theme={original}>
          <GlobalStyle />
          <CrashWrapper>
            <CrashWindow>
              <CrashWindowHeader>
                <span>Hardware Tycoon - Fatal Error</span>
              </CrashWindowHeader>
              <CrashContent>
                <CrashIcon>X</CrashIcon>
                <CrashTitle>Hardware Tycoon has crashed</CrashTitle>
                <CrashMessage>
                  An unexpected error occurred and the game cannot continue.
                </CrashMessage>
                <CrashDetails>
                  {this.state.error?.message || 'Unknown error'}
                </CrashDetails>
                <CrashActions>
                  <Button primary size="lg" onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                  <Button size="lg" onClick={() => {
                    localStorage.removeItem('ht-autosave');
                    localStorage.removeItem('ht-current-game');
                    window.location.reload();
                  }}>
                    Clear Save &amp; Refresh
                  </Button>
                </CrashActions>
                <CrashHint>
                  Your autosave is preserved. Try refreshing first.
                  Only clear your save if refreshing doesn't fix the crash.
                </CrashHint>
              </CrashContent>
            </CrashWindow>
          </CrashWrapper>
        </ThemeProvider>
      );
    }

    return this.props.children;
  }
}

const CrashWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const CrashWindow = styled(Window)`
  width: 440px;
  max-width: 95vw;
`;

const CrashWindowHeader = styled(WindowHeader)`
  background: #aa0000;
`;

const CrashContent = styled(WindowContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 32px;
  text-align: center;
`;

const CrashIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #cc0000;
  color: white;
  font-size: 28px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const CrashTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 16px;
`;

const CrashMessage = styled.p`
  margin: 0 0 8px;
  font-size: 12px;
  color: #444;
`;

const CrashDetails = styled.pre`
  background: #f0f0f0;
  border: 1px solid #888;
  padding: 8px 12px;
  font-size: 11px;
  color: #cc0000;
  max-width: 100%;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0 0 16px;
  max-height: 80px;
  overflow-y: auto;
`;

const CrashActions = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const CrashHint = styled.p`
  font-size: 11px;
  color: #666;
  margin: 0;
`;

// --- App ---

type Screen = 'menu' | 'newgame' | 'dashboard' | 'gameover';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameState, setGameState] = useState<GameState | null>(null);

  const hasSave = !!loadSavedGame();

  const handleStart = (state: GameState) => {
    setGameState(state);
    setScreen('dashboard');
  };

  const handleLoad = () => {
    const saved = loadSavedGame();
    if (saved) {
      setGameState(saved);
      setScreen('dashboard');
    }
  };

  const handleGameOver = (finalState: GameState) => {
    setGameState(finalState);
    // Clear the save so they can't reload into a finished game
    localStorage.removeItem(AUTOSAVE_KEY);
    localStorage.removeItem(SAVE_KEY);
    setScreen('gameover');
  };

  return (
    <ErrorBoundary>
      <GlobalStyle />
      <ThemeProvider theme={original}>
        {screen === 'menu' && (
          <Wrapper>
            <StyledWindow>
              <StyledWindowHeader>
                <HeaderIcon src={htLogo} alt="" />
                <span>Hardware Tycoon: Community Edition</span>
              </StyledWindowHeader>
              <Content>
                <Logo src={htLogo} alt="Hardware Tycoon logo" />
                <Title>Hardware Tycoon</Title>
                <Subtitle>Community Edition</Subtitle>
                <Separator />
                <ButtonGroup>
                  <StyledButton primary size="lg" onClick={() => setScreen('newgame')}>
                    New Game
                  </StyledButton>
                  <StyledButton
                    size="lg"
                    onClick={handleLoad}
                    disabled={!hasSave}
                  >
                    Load Game
                  </StyledButton>
                </ButtonGroup>
              </Content>
            </StyledWindow>
          </Wrapper>
        )}
        {screen === 'newgame' && (
          <NewGame
            onBack={() => setScreen('menu')}
            onStart={handleStart}
          />
        )}
        {screen === 'dashboard' && gameState && (
          <Dashboard
            initialState={gameState}
            onQuit={() => setScreen('menu')}
            onGameOver={handleGameOver}
          />
        )}
        {screen === 'gameover' && gameState && (
          <GameOver
            gameState={gameState}
            onMainMenu={() => setScreen('menu')}
          />
        )}
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
