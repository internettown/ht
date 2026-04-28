import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Window, WindowHeader, WindowContent, Button, ProgressBar, Separator } from 'react95';

declare const __BUILD_ID__: string;
declare const __APP_VERSION__: string;

const CURRENT_BUILD = __BUILD_ID__;
const DISMISSED_KEY = 'ht_update_dismissed_build';
const ATTEMPTED_KEY = 'ht_update_attempted_build';

// If a previous reload tried to apply a build but we still booted with the
// same CURRENT_BUILD, the reload didn't pick up the new bundle (CDN/cache or
// KV/bundle mismatch). Auto-dismiss that build to avoid an update loop.
(() => {
  try {
    const attempted = localStorage.getItem(ATTEMPTED_KEY);
    if (attempted && attempted !== CURRENT_BUILD) {
      localStorage.setItem(DISMISSED_KEY, attempted);
    }
    localStorage.removeItem(ATTEMPTED_KEY);
  } catch {
    // ignore storage errors
  }
})();

interface VersionInfo {
  buildId: string;
  version: string;
  changelog: string;
}

interface UpdateUtilityProps {
  onSave: () => void;
}

export default function UpdateUtility({ onSave }: UpdateUtilityProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [remoteInfo, setRemoteInfo] = useState<VersionInfo | null>(null);

  const checkForUpdate = useCallback(async () => {
    // Skip update checks in dev mode
    if (import.meta.env.DEV) return;
    try {
      const res = await fetch('/__version', { cache: 'no-store' });
      if (!res.ok) return;
      const data: VersionInfo = await res.json();
      if (!data.buildId || data.buildId === CURRENT_BUILD) return;
      let dismissed = '';
      try { dismissed = localStorage.getItem(DISMISSED_KEY) || ''; } catch { /* ignore */ }
      if (data.buildId === dismissed) return;
      setRemoteInfo(data);
      setUpdateAvailable(true);
    } catch {
      // network error, ignore
    }
  }, []);

  useEffect(() => {
    checkForUpdate();

    const interval = setInterval(checkForUpdate, 30_000);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };

    const onFocus = () => checkForUpdate();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [checkForUpdate]);

  const handleUpdate = () => {
    setUpdating(true);
    onSave();
    if (remoteInfo?.buildId) {
      try { localStorage.setItem(ATTEMPTED_KEY, remoteInfo.buildId); } catch { /* ignore */ }
    }
    setProgress(30);
    setTimeout(() => setProgress(60), 400);
    setTimeout(() => setProgress(90), 800);
    setTimeout(() => {
      setProgress(100);
      window.location.reload();
    }, 1200);
  };

  const handleDismiss = () => {
    if (remoteInfo?.buildId) {
      try { localStorage.setItem(DISMISSED_KEY, remoteInfo.buildId); } catch { /* ignore */ }
    }
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  const currentVer = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '';
  const newVer = remoteInfo?.version || '';
  const changelog = remoteInfo?.changelog || '';

  return (
    <Overlay>
      <StyledWindow>
        <StyledHeader>
          <span>Hardware Tycoon - Update Available</span>
        </StyledHeader>
        <WindowContent>
          {!updating ? (
            <>
              <Message>
                A new update for <b>Hardware Tycoon</b> is available.
              </Message>
              {(currentVer || newVer) && (
                <VersionRow>
                  {currentVer && currentVer !== 'dev' && (
                    <VersionBadge>Current: <b>{currentVer}</b></VersionBadge>
                  )}
                  {newVer && (
                    <VersionBadge $highlight>New: <b>{newVer}</b></VersionBadge>
                  )}
                </VersionRow>
              )}
              {changelog && (
                <>
                  <Separator />
                  <ChangelogLabel>What's new:</ChangelogLabel>
                  <ChangelogText>{changelog}</ChangelogText>
                </>
              )}
              <Separator />
              <SaveNote>
                Your game will be saved automatically before updating.
              </SaveNote>
              <ButtonRow>
                <Button onClick={handleDismiss} style={{ padding: '6px 16px' }}>
                  Later
                </Button>
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
  width: 440px;
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

const VersionRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const VersionBadge = styled.span<{ $highlight?: boolean }>`
  font-size: 12px;
  padding: 2px 8px;
  border: 1px solid ${p => p.$highlight ? '#006400' : '#888'};
  background: ${p => p.$highlight ? '#e8f5e9' : '#f0f0f0'};
  color: ${p => p.$highlight ? '#006400' : '#333'};
`;

const ChangelogLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #555;
  margin: 8px 0 4px;
  text-transform: uppercase;
`;

const ChangelogText = styled.div`
  font-size: 12px;
  line-height: 1.5;
  color: #222;
  background: #fff;
  border: 2px inset #dfdfdf;
  padding: 6px 8px;
  margin-bottom: 8px;
  max-height: 120px;
  overflow-y: auto;
  white-space: pre-wrap;
`;

const SaveNote = styled.p`
  margin: 8px 0 4px;
  font-size: 11px;
  color: #666;
  font-style: italic;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;
