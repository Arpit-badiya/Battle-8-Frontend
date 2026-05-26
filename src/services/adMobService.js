// import mobileAds, {
//   AdEventType,
//   InterstitialAd,
//   RewardedAd,
//   RewardedAdEventType,
//   TestIds,
// } from 'react-native-google-mobile-ads';

// const isTestMode = process.env.EXPO_PUBLIC_ADMOB_TEST_MODE !== 'false';

// export const rewardedAdUnitId = isTestMode
//   ? TestIds.REWARDED
//   : process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID || TestIds.REWARDED;

// export const interstitialAdUnitId = isTestMode
//   ? TestIds.INTERSTITIAL
//   : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || TestIds.INTERSTITIAL;

// let initialized = false;
// let lastInterstitialShownAt = 0;

// export const initializeAds = async () => {
//   if (initialized) return;
//   await mobileAds().initialize();
//   initialized = true;
// };

// export const showRewardedAd = async ({ placement = 'earn_coins' } = {}) => {
//   await initializeAds();

//   return new Promise((resolve, reject) => {
//     const rewarded = RewardedAd.createForAdRequest(rewardedAdUnitId, {
//       requestNonPersonalizedAdsOnly: true,
//       keywords: ['gaming', 'esports', 'battle royale'],
//     });
//     let earned = false;

//     const cleanup = [];
//     const dispose = () => cleanup.forEach((unsubscribe) => unsubscribe?.());

//     cleanup.push(
//       rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
//         earned = true;
//       })
//     );

//     cleanup.push(
//       rewarded.addAdEventListener(AdEventType.LOADED, () => {
//         rewarded.show();
//       })
//     );

//     cleanup.push(
//       rewarded.addAdEventListener(AdEventType.CLOSED, () => {
//         dispose();
//         if (!earned) {
//           reject(new Error('Watch the full ad to earn rewards.'));
//           return;
//         }
//         resolve({
//           completed: true,
//           adUnitId: rewardedAdUnitId,
//           placement,
//           adEventId: `admob:${placement}:${Date.now()}:${Math.random().toString(36).slice(2)}`,
//         });
//       })
//     );

//     cleanup.push(
//       rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
//         dispose();
//         reject(error);
//       })
//     );

//     rewarded.load();
//   });
// };

// export const maybeShowInterstitial = async ({ minIntervalMs = 180000 } = {}) => {
//   if (Date.now() - lastInterstitialShownAt < minIntervalMs) return false;
//   await initializeAds();

//   return new Promise((resolve) => {
//     const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
//       requestNonPersonalizedAdsOnly: true,
//     });
//     const cleanup = [];
//     const dispose = () => cleanup.forEach((unsubscribe) => unsubscribe?.());

//     cleanup.push(interstitial.addAdEventListener(AdEventType.LOADED, () => {
//       lastInterstitialShownAt = Date.now();
//       interstitial.show();
//     }));
//     cleanup.push(interstitial.addAdEventListener(AdEventType.CLOSED, () => {
//       dispose();
//       resolve(true);
//     }));
//     cleanup.push(interstitial.addAdEventListener(AdEventType.ERROR, () => {
//       dispose();
//       resolve(false);
//     }));

//     interstitial.load();
//   });
// };

export const showRewardedAd = async () => {
  console.log("Ads temporarily disabled");
  return {
    rewarded: false,
  };
};

export const showInterstitialAd = async () => {
  console.log("Interstitial temporarily disabled");
  return false;
};
