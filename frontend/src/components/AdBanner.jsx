import React from 'react';

export default function AdBanner() {
  // In production, this would render actual AdMob banner
  // For now, it's a placeholder
  
  return (
    <div className="admob-banner" data-testid="ad-banner">
      <span>AdMob Banner - ID: ca-app-pub-1117855481975276/2635829244</span>
    </div>
  );
}
