import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Window, WindowHeader, WindowContent, Button, ProgressBar } from 'react95';

declare const __BUILD_ID__: string;

const CURRENT_BUILD = __BUILD_ID__;

interface UpdateUtilityProps {
  onSave: () => void;
}

export default function UpdateUtility({ onSave }: UpdateUtilityProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  const checkForUpdate = useCallback(async () => {
    try {
      const res = await fetch('/__version', { cache: 'no-store' });
      if (!res.ok) return;
      const remoteBuild = (await res.text()).trim();
      if (remoteBuild && remoteBuild !== CURRENT_BUILD) {
        setUpdateAvailable(true);
      }
    } catch {
      // network error, ignore
    }
  }, []);

  useEffect(() => {
    // Check on initial load
    checkForUpdate();

    // Check when tab becomes visible
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };

    // Check when window regains focus
    const onFocus = () => checkForUpdate();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [checkForUpdate]);

  const handleUpdate = () => {
    setUpdating(true);
    onSave();
    setProgress(30);
    setTimeout(() => setProgress(60), 400);
    setTimeout(() => setProgress(90), 800);
    setTimeout(() => {
      setProgress(100);
      window.location.reload();
    }, 1200);
  };

  if (!updateAvailable) return null;

  return (
    <Overlay>
      <StyledWindow>
        <StyledHeader>
          <span>Hardware Tycoon - Update Utility</span>
        </StyledHeader>
        <WindowContent>
          {!updating ? (
            <>
              <Message>
                A new update for <b>Hardware Tycoon</b> is available.
              </Message>
              <Message>
                Your game will be saved automatically before updating.
              </Message>
              <ButtonRow>
                <Button primary onClick={handleUpdate} style={{ fontWeight: 700, padding: '6px 24px' }}>
                  Update Now
                </Button>
              </ButtonRow>
            </>
          ) : (
            <>
              <Message>Saving game and applying update...</Message>
              <ProgressBar value={progress} />
            </>
          )}
        </WindowContent>
      </StyledWindow>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 128, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const StyledWindow = styled(Window)`
  width: 420px;
  max-width: 95vw;
`;

const StyledHeader = styled(WindowHeader)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Message = styled.p`
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.4;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
`;
