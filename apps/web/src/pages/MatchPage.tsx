import React from 'react';
import { FootballScene } from '../game/FootballScene';
import { MatchHUD } from '../hud/MatchHUD';

export const MatchPage: React.FC = () => {
  return (
    <div className="w-full h-[100dvh] relative overflow-hidden bg-slate-950">
      {/* 3D Scene */}
      <FootballScene />

      {/* Floating HUD */}
      <MatchHUD />
    </div>
  );
};
