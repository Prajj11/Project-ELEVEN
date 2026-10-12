import React from 'react';
import { ArrowRight, Trophy } from 'lucide-react';
import { Button } from '../components/Button';
import { GameShell, Crest } from '../components/GameShell';
import { useMatchStore } from '../stores/matchStore';
import { socketClient } from '../network/socketClient';
export const ResultsPage: React.FC<{ onReturnToLobby: () => void }> = ({ onReturnToLobby }) => {
  const results = useMatchStore(s => s.finalResults);
  const team = useMatchStore(s => s.assignedTeamId);
  if (!results) return null;
  const { winner, scores, stats } = results;
  const won = winner === team;
  const rows = [
    ['POSSESSION', stats.blue.possessionPercentage, stats.red.possessionPercentage, '%'],
    ['SHOTS', stats.blue.shots, stats.red.shots, ''],
    ['ON TARGET', stats.blue.shotsOnTarget, stats.red.shotsOnTarget, ''],
    ['PASSES COMPLETED', stats.blue.passesCompleted, stats.red.passesCompleted, ''],
    ['TACKLES WON', stats.blue.tacklesWon, stats.red.tacklesWon, ''],
    ['SAVES', stats.blue.saves, stats.red.saves, ''],
  ] as const;
  return <GameShell section="FULL TIME"><main className={`results-main ${won ? 'result-win' : ''}`}><p className="eyebrow"><Trophy size={18} /> FINAL WHISTLE</p><h1>{winner === 'draw' ? 'HONOURS EVEN.' : won ? 'VICTORY.' : 'NEXT TIME.'}</h1><p className="muted">{winner === 'draw' ? 'Nothing between the sides. Settle it on the pitch again.' : won ? 'You showed up. You delivered. This one is yours.' : 'Every match makes you better. Come back stronger.'}</p><div className="result-score"><div><Crest large /><span>BLUE ELEVEN</span></div><strong>{scores.blue}<i>:</i>{scores.red}</strong><div><Crest team="red" large /><span>RED ELEVEN</span></div></div><section className="match-report"><div className="section-kicker"><span>THE MATCH REPORT</span><span>BLUE / RED</span></div>{rows.map(([label, blue, red, suffix]) => <div className="stat-row" key={label}><div><b>{blue}{suffix}</b><span>{label}</span><b>{red}{suffix}</b></div><div className="stat-bars"><i style={{ width: `${blue + red ? blue / (blue + red) * 100 : 50}%` }} /><i style={{ width: `${blue + red ? red / (blue + red) * 100 : 50}%` }} /></div></div>)}</section><Button size="lg" onClick={() => { socketClient.leaveRoom(); useMatchStore.getState().resetMatch(); onReturnToLobby(); }}>BACK TO MAIN MENU<ArrowRight size={18} /></Button></main></GameShell>;
};
