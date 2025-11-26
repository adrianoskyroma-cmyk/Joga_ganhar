import React, { useEffect } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export default function AdBanner() {
  useEffect(() => {
    const showBanner = async () => {
      try {
        await AdMob.showBanner({
          adId: 'ca-app-pub-1117855481975276/2635829244',
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.TOP_CENTER,
        });
        console.log('Banner ad shown successfully');
      } catch (error) {
        console.error('Banner ad error:', error);
        // Fallback to placeholder in web
      }
    };

    showBanner();

    // Cleanup on unmount
    return () => {
      AdMob.removeBanner().catch(err => console.log('Banner removal error:', err));
    };
  }, []);

  return (
    <div className="admob-banner" data-testid="ad-banner">
      <span style={{fontSize: '10px', color: '#666'}}>AdMob Banner</span>
    </div>
  );
}
