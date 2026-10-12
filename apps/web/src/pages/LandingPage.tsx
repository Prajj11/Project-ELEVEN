import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, Gamepad2, Users, Target, ChevronRight, Keyboard, Timer } from 'lucide-react';
import { Button } from '../components/Button';
import { GameShell, ControlGuide } from '../components/GameShell';
import { PlayerShowcase } from '../components/PlayerShowcase';
import { socketClient } from '../network/socketClient';
import { useLobbyStore } from '../stores/lobbyStore';

export const LandingPage: React.FC<{ onEnterLobby: () => void }> = ({ onEnterLobby }) => {
  const { playerName, setPlayerName, roomCodeInput, setRoomCodeInput, errorMessage, setErrorMessage, isConnecting } = useLobbyStore();
  const [mode, setMode] = useState<'solo' | 'multiplayer'>('solo');
  const [tab, setTab] = useState<'play' | 'controls'>('play');
  const [loading, setLoading] = useState(false);
  const enter = async (join = false) => {
    if (!playerName.trim()) { setErrorMessage('Choose a player name before you take the pitch.'); return; }
    if (join && roomCodeInput.trim().length !== 6) { setErrorMessage('Enter the six-character code from your captain.'); return; }
    setLoading(true); setErrorMessage(null);
    try {
      const response = join ? await socketClient.joinRoom(roomCodeInput.trim().toUpperCase(), playerName.trim()) : await socketClient.createRoom(playerName.trim(), mode === 'solo');
      if (response.success) onEnterLobby();
      else setErrorMessage(response.error || 'Could not enter the arena. Try again.');
    } catch { setErrorMessage('Connection lost. Please try again.'); }
    finally { setLoading(false); }
  };
  return (
    <GameShell section="MAIN MENU" footer={<span><Keyboard size={14} /> KEYBOARD & MOUSE</span>}>
      <nav className="menu-tabs" aria-label="Main menu">
        <button aria-pressed={tab === 'play'} className={tab === 'play' ? 'active' : ''} onClick={() => setTab('play')}><Gamepad2 size={17} /> PLAY <span>01</span></button>
        <button aria-pressed={tab === 'controls'} className={tab === 'controls' ? 'active' : ''} onClick={() => setTab('controls')}><Keyboard size={17} /> HOW TO PLAY <span>02</span></button>
        <div className="nav-note">SMALL SIDES. <strong>BIG MOMENTS.</strong></div>
      </nav>
      <main className="home-main">
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy"><p className="eyebrow"><span /> WELCOME TO THE ARENA</p><h1>OWN THE<br /><em>PITCH.</em></h1><p className="hero-description">Five players. One team. Every touch counts.<br />Step up and make the next moment yours.</p><div className="hero-specs"><span><strong>5<span>v</span>5</strong> SMALL-SIDED FOOTBALL</span><span><strong>03:00</strong> ALL-OUT ACTION</span></div></div>
          <PlayerShowcase />
          <span className="hero-watermark" aria-hidden="true">ELEVEN</span>
          <div className="hero-bottom"><span>THE ARENA IS YOURS</span><ArrowUpRight size={22} /></div>
        </section>
        <section className="play-panel">
          {tab === 'play' ? <>
            <div className="section-kicker"><span>01 / KICK OFF</span><Gamepad2 size={19} /></div>
            <h2>YOUR GAME.<br />YOUR RULES.</h2>
            <label className="input-label" htmlFor="player-name">PLAYER NAME</label>
            <div className="player-input"><span>11</span><input id="player-name" maxLength={24} value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Your player name" autoComplete="nickname" /></div>
            <p className="input-label mode-label">CHOOSE YOUR MATCH</p>
            <div className="mode-options" role="group" aria-label="Match mode">
              <button disabled={loading} aria-pressed={mode === 'solo'} className={`mode-card ${mode === 'solo' ? 'selected' : ''}`} onClick={() => setMode('solo')}><Target /><span><strong>TRAINING GROUND</strong><small>Go solo. Take on the AI.</small></span><span className="radio-mark" /></button>
              <button disabled={loading} aria-pressed={mode === 'multiplayer'} className={`mode-card ${mode === 'multiplayer' ? 'selected' : ''}`} onClick={() => setMode('multiplayer')}><Users /><span><strong>PLAY WITH FRIENDS</strong><small>Your squad. Your private arena.</small></span><span className="radio-mark" /></button>
            </div>
            {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
            <Button size="lg" fullWidth disabled={loading || isConnecting} onClick={() => enter()}>{loading ? 'ENTERING ARENA…' : mode === 'solo' ? 'START TRAINING' : 'CREATE LOBBY'}<ArrowRight size={20} /></Button>
            {isConnecting && <p className="connection-help" role="status">Connecting to the arena. Play unlocks when connected.</p>}
            <div className="join-divider"><span /> GOT AN INVITE? <span /></div>
            <form className="join-form" onSubmit={e => { e.preventDefault(); if (!loading && !isConnecting) void enter(true); }}><input aria-label="Six-character room code" maxLength={6} value={roomCodeInput} onChange={e => setRoomCodeInput(e.target.value.toUpperCase())} placeholder="ROOM CODE" /><Button type="submit" variant="secondary" disabled={loading || isConnecting}>JOIN<ChevronRight size={16} /></Button></form>
          </> : <>
            <div className="section-kicker"><span>02 / THE PLAYBOOK</span><Keyboard size={19} /></div><h2>MAKE EVERY<br />TOUCH COUNT.</h2><p className="muted">Outscore the opposition before the clock runs out. You control one player; your teammates move with you.</p><ControlGuide /><Button fullWidth onClick={() => setTab('play')}>READY TO PLAY<ArrowRight size={18} /></Button>
          </>}
        </section>
        <section className="feature-strip" aria-label="Match features"><div><span className="feature-icon"><Users /></span><span><strong>BETTER AS A TEAM</strong><p>Up to four players. AI fills the squad.</p></span></div><div><span className="feature-icon"><Target /></span><span><strong>READ THE GAME</strong><p>Adaptive coaches. A new challenge every match.</p></span></div><div><span className="feature-icon"><Timer /></span><span><strong>STRAIGHT INTO THE ACTION</strong><p>Three minutes to leave it all on the pitch.</p></span></div></section>
      </main>
    </GameShell>
  );
};
