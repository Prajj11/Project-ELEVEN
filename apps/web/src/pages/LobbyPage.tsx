import React, { useState } from 'react';
import { Check, Copy, LogOut, Play, Crown, Bot, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { GameShell, Crest } from '../components/GameShell';
import { socketClient } from '../network/socketClient';
import { useLobbyStore } from '../stores/lobbyStore';

export const LobbyPage: React.FC<{ onLeaveLobby: () => void }> = ({ onLeaveLobby }) => {
  const { currentRoom, errorMessage, setErrorMessage } = useLobbyStore();
  const [copied, setCopied] = useState(false);
  if (!currentRoom) return null;
  const me = currentRoom.players.find(p => p.socketId === socketClient.getSocket()?.id);
  const canStart = currentRoom.status === 'LOBBY' && (currentRoom.isSoloPractice || currentRoom.players.every(p => p.isReady));
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(currentRoom.roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setErrorMessage('Could not copy. Select the room code and copy it manually.'); }
  };
  return <GameShell section="MATCH LOBBY">
    <main className="lobby-main">
      <div className="lobby-heading"><div><p className="eyebrow">THE DRESSING ROOM</p><h1>PICK YOUR SIDE.</h1><p className="muted">{currentRoom.isSoloPractice ? 'Training ground' : 'Private match'} <span className="separator">/</span> 5 vs 5 <span className="separator">/</span> 3 minutes</p></div><div className="invite-card"><span className="input-label">INVITE YOUR SQUAD</span><button onClick={copyCode} aria-label="Copy room code"><strong>{currentRoom.roomCode}</strong>{copied ? <Check size={18} /> : <Copy size={18} />}</button><small aria-live="polite">{copied ? 'Code copied. Send it to your friends.' : 'Share this code to bring friends into the match.'}</small></div></div>
      {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
      <div className="squad-grid">
        {(['blue', 'red'] as const).map(team => {
          const players = currentRoom.players.filter(p => p.teamId === team);
          const selected = me?.teamId === team;
          return <section key={team} className={`squad-card squad-${team} ${selected ? 'squad-selected' : ''}`}>
            <div className="squad-banner"><Crest team={team} large /><div><p className="eyebrow">{team === 'blue' ? 'HOME SIDE' : 'AWAY SIDE'}</p><h2>{team.toUpperCase()} ELEVEN</h2></div><span className="squad-count"><Users size={14} /> {players.length}/{currentRoom.maxHumansPerTeam}</span></div>
            <div className="roster">{Array.from({ length: 5 }, (_, i) => {
              const player = i === 0 ? undefined : players[i - 1];
              const isMe = player?.socketId === me?.socketId;
              return <div className={`roster-row ${isMe ? 'roster-you' : ''}`} key={i}><span className="shirt-number">{String(i + 1).padStart(2, '0')}</span><span className="roster-name"><strong>{i === 0 ? 'The Keeper' : player?.name || ['','', 'The Anchor', 'The Engine', 'The Finisher'][i] || 'The Playmaker'}{isMe && <b>YOU</b>}{player?.isHost && <Crown size={12} />}</strong><small>{i === 0 ? 'GOALKEEPER' : player ? 'PLAYER CONTROLLED' : 'AI TEAMMATE'}</small></span>{player ? <span className={`ready-state ${player.isReady ? 'is-ready' : ''}`}>{player.isReady ? <Check size={14} /> : <span className="waiting-dot" />}{player.isReady ? 'Ready' : 'Preparing'}</span> : <Bot size={17} className="muted" />}</div>;
            })}</div>
            <Button fullWidth variant={selected ? 'secondary' : team} disabled={selected || players.length >= currentRoom.maxHumansPerTeam} onClick={() => { setErrorMessage(null); socketClient.selectTeam(team); }}>{selected ? <><Check size={16} /> YOUR SQUAD</> : players.length >= currentRoom.maxHumansPerTeam ? 'SQUAD FULL' : `JOIN ${team.toUpperCase()} ELEVEN`}</Button>
          </section>;
        })}
        <div className="versus-badge">VS</div>
      </div>
      <div className="lobby-actions" aria-label="Lobby actions"><Button size="lg" variant="outline" onClick={() => { socketClient.leaveRoom(); onLeaveLobby(); }}><LogOut size={16} /> LEAVE LOBBY</Button><p className="muted">{canStart ? 'Squads ready. The pitch is waiting.' : 'Ready up when you’re set. All players must be ready.'}<small>AI teammates fill every open position.</small></p><div>{!currentRoom.isSoloPractice && <Button variant={me?.isReady ? 'secondary' : 'primary'} onClick={() => socketClient.toggleReady()}>{me?.isReady ? 'CANCEL READY' : 'READY UP'}</Button>}{me?.isHost && <Button size="lg" disabled={!canStart} onClick={() => socketClient.startMatch()}><Play size={17} fill="currentColor" /> KICK OFF</Button>}</div></div>
    </main>
  </GameShell>;
};
