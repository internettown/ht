import { useState } from 'react';
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
  Checkbox,
  TextInput,
} from 'react95';
import type { GameState } from './types';
import {
  MAX_LOAN_BASE,
  MAX_LOAN_YEARLY_INCREASE,
  TAX_RATE,
  LOAN_INTEREST_RATE,
} from './types';

interface BankProps {
  gameState: GameState;
  onTakeLoan: (amount: number) => void;
  onRepayLoan: (amount: number) => void;
  onToggleAutoTax: (auto: boolean) => void;
  onPayTax: () => void;
  onRepayBailout: (amount: number) => void;
  onClose: () => void;
}

function getMaxLoan(gameState: GameState): number {
  const startDate = new Date('1970-01-01');
  const currentDate = new Date(gameState.gameDate);
  const yearsElapsed = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  return MAX_LOAN_BASE + yearsElapsed * MAX_LOAN_YEARLY_INCREASE[gameState.difficulty];
}

function formatMoney(amount: number): string {
  if (!isFinite(amount)) return '$Infinity';
  return '$' + Math.round(amount).toLocaleString();
}

export default function Bank({
  gameState,
  onTakeLoan,
  onRepayLoan,
  onToggleAutoTax,
  onPayTax,
  onRepayBailout,
  onClose,
}: BankProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [loanAmountStr, setLoanAmountStr] = useState('');
  const [repayAmountStr, setRepayAmountStr] = useState('');
  const [bailoutRepayStr, setBailoutRepayStr] = useState('');

  const { bank } = gameState;
  const maxLoan = getMaxLoan(gameState);
  const hasActiveLoan = bank.loanBalance > 0;
  const availableLoan = Math.max(0, maxLoan - (bank.loanPrincipal || 0));
  const monthlyInterest = Math.round(bank.loanBalance * LOAN_INTEREST_RATE);
  const projectedTax = Math.round(bank.yearlyIncome * TAX_RATE);

  const parseMoney = (s: string, max: number) => {
    const n = parseInt(s.replace(/[^0-9]/g, ''), 10);
    if (isNaN(n)) return 0;
    return Math.min(Math.max(0, n), max);
  };

  const loanAmount = parseMoney(loanAmountStr, availableLoan);
  const repayAmount = parseMoney(repayAmountStr, Math.min(bank.loanBalance, gameState.balance));
  const bailoutRepayAmount = parseMoney(bailoutRepayStr, Math.min(bank.bailoutOwed, gameState.balance));

  return (
    <StyledWindow>
      <WindowHeader>
        <HeaderRow>
          <span>Bank</span>
          <CloseBtn onClick={onClose}>X</CloseBtn>
        </HeaderRow>
      </WindowHeader>
      <WindowContent>
        <Tabs value={activeTab} onChange={(val: number) => setActiveTab(val)}>
          <Tab value={0}>Loans</Tab>
          <Tab value={1}>Taxes</Tab>
          <Tab value={2}>Other</Tab>
        </Tabs>

        {activeTab === 0 && (
          <TabBody>
            <Section>
              <SectionTitle>Loan Status</SectionTitle>
              <InfoRow>
                <Label>Current Loan:</Label>
                <Value negative={hasActiveLoan}>
                  {formatMoney(bank.loanBalance)}
                </Value>
              </InfoRow>
              <InfoRow>
                <Label>Monthly Interest (2%):</Label>
                <Value negative={monthlyInterest > 0}>
                  {formatMoney(monthlyInterest)}
                </Value>
              </InfoRow>
              <InfoRow>
                <Label>Max Loan Available:</Label>
                <Value>{formatMoney(maxLoan)}</Value>
              </InfoRow>
              <Separator />

              <SectionTitle>Take a Loan</SectionTitle>
              {availableLoan > 0 ? (
                <>
                  <InfoRow>
                    <Label>Available to borrow:</Label>
                    <Value>{formatMoney(availableLoan)}</Value>
                  </InfoRow>
                  <InputRow>
                    <TextInput
                      value={loanAmountStr}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLoanAmountStr(e.target.value)
                      }
                      placeholder="Enter amount"
                      style={{ width: 160 }}
                    />
                    <Button
                      onClick={() => {
                        if (loanAmount > 0) {
                          onTakeLoan(loanAmount);
                          setLoanAmountStr('');
                        }
                      }}
                      disabled={loanAmount <= 0}
                      primary
                    >
                      Take Loan
                    </Button>
                  </InputRow>
                  <QuickButtons>
                    {[100_000, 250_000, 500_000].filter(v => v <= availableLoan).map((val) => (
                      <Button
                        key={val}
                        size="sm"
                        onClick={() => setLoanAmountStr(String(val))}
                      >
                        {formatMoney(val)}
                      </Button>
                    ))}
                    <Button size="sm" onClick={() => setLoanAmountStr(String(availableLoan))}>
                      Max
                    </Button>
                  </QuickButtons>
                </>
              ) : (
                <HintText>You've borrowed the maximum ({formatMoney(maxLoan)}).</HintText>
              )}

              {hasActiveLoan && (
                <>
                  <Separator />
                  <SectionTitle>Repay Loan</SectionTitle>
                  <InputRow>
                    <TextInput
                      value={repayAmountStr}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRepayAmountStr(e.target.value)
                      }
                      placeholder="Enter amount"
                      style={{ width: 160 }}
                    />
                    <Button
                      onClick={() => {
                        if (repayAmount > 0) {
                          onRepayLoan(repayAmount);
                          setRepayAmountStr('');
                        }
                      }}
                      disabled={repayAmount <= 0}
                      primary
                    >
                      Repay
                    </Button>
                  </InputRow>
                  <QuickButtons>
                    <Button
                      size="sm"
                      onClick={() =>
                        setRepayAmountStr(String(Math.min(bank.loanBalance, gameState.balance)))
                      }
                    >
                      Repay All
                    </Button>
                  </QuickButtons>
                </>
              )}
            </Section>
          </TabBody>
        )}

        {activeTab === 1 && (
          <TabBody>
            <Section>
              <SectionTitle>Tax Information</SectionTitle>
              <InfoRow>
                <Label>Tax Rate:</Label>
                <Value>{(TAX_RATE * 100).toFixed(0)}% on income</Value>
              </InfoRow>
              <InfoRow>
                <Label>Income This Year:</Label>
                <Value>{formatMoney(bank.yearlyIncome)}</Value>
              </InfoRow>
              <InfoRow>
                <Label>Projected Tax:</Label>
                <Value negative={projectedTax > 0}>{formatMoney(projectedTax)}</Value>
              </InfoRow>
              <Separator />

              {bank.taxDue > 0 && !bank.taxPaidThisYear && (
                <>
                  <SectionTitle>Tax Due (Year {bank.taxYear})</SectionTitle>
                  <InfoRow>
                    <Label>Amount Due:</Label>
                    <Value negative>{formatMoney(bank.taxDue)}</Value>
                  </InfoRow>
                  <HintText>
                    Pay before April or incur a 33% late penalty!
                  </HintText>
                  <Button
                    onClick={onPayTax}
                    primary
                    disabled={gameState.balance < bank.taxDue}
                    fullWidth
                  >
                    Pay Tax ({formatMoney(bank.taxDue)})
                  </Button>
                  {gameState.balance < bank.taxDue && (
                    <HintText style={{ color: '#cc0000' }}>
                      Insufficient funds to pay tax.
                    </HintText>
                  )}
                </>
              )}

              {(bank.taxDue === 0 || bank.taxPaidThisYear) && (
                <PaidBox>No tax currently due.</PaidBox>
              )}

              <Separator />
              <CheckboxRow>
                <Checkbox
                  checked={bank.autoPayTax}
                  onChange={() => onToggleAutoTax(!bank.autoPayTax)}
                  label="Automatically pay tax on the first day of the year"
                />
              </CheckboxRow>
            </Section>
          </TabBody>
        )}

        {activeTab === 2 && (
          <TabBody>
            <Section>
              <SectionTitle>Bailout</SectionTitle>
              {bank.bailoutOwed > 0 ? (
                <>
                  <InfoRow>
                    <Label>Bailout Owed:</Label>
                    <Value negative>{formatMoney(bank.bailoutOwed)}</Value>
                  </InfoRow>
                  <InputRow>
                    <TextInput
                      value={bailoutRepayStr}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setBailoutRepayStr(e.target.value)
                      }
                      placeholder="Enter amount"
                      style={{ width: 160 }}
                    />
                    <Button
                      onClick={() => {
                        if (bailoutRepayAmount > 0) {
                          onRepayBailout(bailoutRepayAmount);
                          setBailoutRepayStr('');
                        }
                      }}
                      disabled={bailoutRepayAmount <= 0}
                      primary
                    >
                      Repay
                    </Button>
                  </InputRow>
                </>
              ) : (
                <PaidBox>No bailout to repay.</PaidBox>
              )}
            </Section>
          </TabBody>
        )}
      </WindowContent>
    </StyledWindow>
  );
}

export { getMaxLoan };

const StyledWindow = styled(Window)`
  width: 480px;
  max-width: 100%;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  padding: 0 2px;
  font-family: inherit;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 13px;
  font-weight: 700;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
`;

const Label = styled.span`
  color: #444;
`;

const Value = styled.span<{ negative?: boolean }>`
  font-weight: 700;
  color: ${(p) => (p.negative ? '#cc0000' : '#006400')};
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuickButtons = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const HintText = styled.p`
  font-size: 11px;
  color: #666;
  margin: 0;
`;

const CheckboxRow = styled.div`
  font-size: 12px;
`;

const PaidBox = styled.div`
  font-size: 12px;
  color: #006400;
  padding: 8px;
  text-align: center;
  border: 2px inset #dfdfdf;
  background: #f0fff0;
`;
