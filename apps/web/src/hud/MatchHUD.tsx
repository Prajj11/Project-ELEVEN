import React, { useState, useEffect } from 'react';
import { Camera, LogOut, Pause, Play, Settings2, X } from 'lucide-react';
import { useMatchStore } from '../stores/matchStore';
import { useLobbyStore } from '../stores/lobbyStore';
import { useInputStore } from '../stores/inputStore';
import { useSettingsStore } from '../stores/settingsStore';
import { socketClient } from '../network/socketClient';
import { Scoreboard } from './Scoreboard';
import { TacticalPanel } from './TacticalPanel';
import { Minimap } from './Minimap';
import { Button } from '../components/Button';
import { GameDialog } from '../components/GameDialog';
import { ControlGuide } from '../components/GameShell';
export const MatchHUD = () => {
  const shotCharge = useInputStore(s => s.shotCharge);
  const playerName = useLobbyStore(s => s.playerName);
  const snapshot = useMatchStore(s => s.currentSnapshot);
  const assigned = useMatchStore(s => s.assignedPlayerId);
  const goal = useMatchStore(s => s.goalOverlayText);
  const { cameraMode, setCameraMode, showMinimap, toggleMinimap, showBallTracker, toggleBallTracker } = useSettingsStore();
  const [menu, setMenu] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const closeMenu = () => { setMenu(false); setConfirmExit(false); };
  const player = snapshot?.players.find(p => p.id === assigned);
  const paused = snapshot?.phase === 'PAUSED';
  const stamina = Math.max(0, Math.min(100, player?.stamina ?? 100));
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.repeat || document.querySelector('dialog[open]')) return;
      if (e.code === 'Escape') { e.preventDefault(); setMenu(true); }
      if (e.code === 'KeyP') socketClient.togglePause();
    };
    window.addEventListener('keydown', handle); return () => window.removeEventListener('keydown', handle);
  }, []);
  const exit = () => { socketClient.leaveRoom(); useMatchStore.getState().resetMatch(); useLobbyStore.getState().reset(); };
  return <>
    <div className="match-hud">
      <div className="hud-top"><div className="hud-brand"><span className="brand-mark">11</span><span>THE ARENA<small>5V5 FOOTBALL</small></span></div><Scoreboard /><div className="hud-actions"><button aria-label={`Switch to ${cameraMode === 'follow' ? 'tactical' : 'follow'} camera`} title="Switch camera (C)" onClick={() => setCameraMode(cameraMode === 'follow' ? 'tactical' : 'follow')}><Camera size={18} /></button><button aria-label={paused ? 'Resume match' : 'Pause match'} onClick={() => socketClient.togglePause()}>{paused ? <Play size={18} /> : <Pause size={18} />}</button><button aria-label="Open match menu" onClick={() => setMenu(true)}><Settings2 size={18} /></button></div></div>
      <div className="hud-coach"><TacticalPanel /></div>
      {paused && <div className="match-banner"><p className="eyebrow">TAKE A BREATHER</p><h1>TIME OUT.</h1><p>Ready when you are.</p><Button onClick={() => socketClient.togglePause()}><Play size={16} /> BACK TO THE MATCH</Button></div>}
      {goal && !paused && <div className="goal-banner" role="status"><span>WHAT A FINISH.</span><h1>GOAL!</h1><p>{goal}</p></div>}
      {snapshot?.phase === 'KICKOFF' && <div className="kickoff-banner">GET READY. <strong>MAKE IT COUNT.</strong></div>}
      {shotCharge !== null && <div className="shot-meter" role="meter" aria-label="Shot power" aria-valuemin={40} aria-valuemax={100} aria-valuenow={Math.round(40 + shotCharge * 60)}>
        <div><span>SHOT POWER</span><strong>{Math.round(40 + shotCharge * 60)}%</strong></div>
        <div className="shot-meter-track"><i style={{ width: `${40 + shotCharge * 60}%` }} /></div>
        <small>RELEASE SPACE TO SHOOT</small>
      </div>}
      <div className="hud-bottom"><div className="player-status"><div className="player-status-title"><span className="player-number">{String(player?.number ?? 2).padStart(2, '0')}</span><div><small>YOU / {player?.role || 'PLAYER'}</small><strong>{player ? playerName : 'Taking the pitch…'}</strong></div><i className={player?.hasPossession ? 'on-ball' : ''} /></div><div className="stamina-label"><span>SPRINT ENERGY</span><b>{Math.round(stamina)}%</b></div><div className="stamina-track"><i style={{ width: `${stamina}%`, background: stamina < 30 ? '#ffbd69' : undefined }} /></div><p>{player?.hasPossession ? 'ON THE BALL · MAKE YOUR MOVE' : 'FIND SPACE · SUPPORT YOUR SQUAD'}</p></div>
        <div className="hud-controls">{[['WASD', 'MOVE'], ['SHIFT', 'SPRINT'], ['E', 'PASS'], ['SPACE', 'HOLD / SHOOT'], ['Q', 'TACKLE']].map(([key, label]) => <span key={key}><kbd>{key}</kbd>{label}</span>)}<span><kbd>C</kbd>CAMERA</span></div>
        {showMinimap && <Minimap />}
      </div>
    </div>
    {menu && <GameDialog title={confirmExit ? 'Leave match?' : 'Match menu'} onClose={closeMenu}>
      <div className="dialog-heading"><span className="eyebrow">MATCH MENU</span><button aria-label="Close match menu" onClick={closeMenu}><X size={20} /></button></div>
      {confirmExit ? <>
        <h2>LEAVE THE PITCH?</h2>
        <p className="muted">You’ll return to the main menu and cannot rejoin this match.</p>
        <div className="exit-confirm-actions">
          <Button fullWidth onClick={() => setConfirmExit(false)}>STAY IN MATCH</Button>
          <Button variant="danger" fullWidth onClick={exit}><LogOut size={16} /> LEAVE MATCH</Button>
        </div>
      </> : <>
        <h2>STAY IN THE GAME.</h2>
        <p className="muted">{paused ? 'The match is paused.' : 'The match continues while this menu is open.'}</p>
        <ControlGuide />
        <div className="menu-settings">
          <label htmlFor="camera-mode">CAMERA</label>
          <select id="camera-mode" value={cameraMode} onChange={e => setCameraMode(e.target.value as 'follow' | 'tactical')}><option value="follow">Follow the action</option><option value="tactical">Tactical overview</option></select>
          <label className="menu-checkbox"><input type="checkbox" checked={showBallTracker} onChange={toggleBallTracker} /> Show ball tracker</label>
          <label className="menu-checkbox"><input type="checkbox" checked={showMinimap} onChange={toggleMinimap} /> Show live pitch map</label>
        </div>
        <Button fullWidth onClick={() => { if (paused) socketClient.togglePause(); closeMenu(); }}>{paused ? 'RESUME MATCH' : 'BACK TO MATCH'}<Play size={16} /></Button>
        {!paused && <Button variant="secondary" fullWidth onClick={() => { socketClient.togglePause(); closeMenu(); }}><Pause size={16} /> PAUSE MATCH</Button>}
        <div className="menu-leave"><Button variant="outline" fullWidth onClick={() => setConfirmExit(true)}><LogOut size={16} /> LEAVE MATCH</Button></div>
      </>}
    </GameDialog>}
  </>;
};
