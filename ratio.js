(function (root, factory) {
  const ratioTools = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = ratioTools;
  } else {
    root.HoldwiseRatio = ratioTools;
  }
}(globalThis, function () {
  const CONFIG = Object.freeze({
    thresholds: Object.freeze({
      goldFavoredBelow: 50,
      goldZoneBelow: 60,
      holdThrough: 80,
      silverThrough: 100
    }),
    scaleMin: 0,
    scaleMax: 120,
    maxRateAgeMs: 24 * 60 * 60 * 1000
  });

  const recommendations = Object.freeze({
    goldFavored: Object.freeze({
      status: 'Gold-favored',
      badgeClass: 'gold',
      action: 'Gold-favored zone',
      explanation: 'The current gold silver ratio is {ratio}, which means gold is much cheaper than silver. Consider buying gold.',
      nextStep: ''
    }),
    gold: Object.freeze({
      status: 'Gold zone',
      badgeClass: 'gold',
      action: 'Review Gold',
      explanation: 'The current gold silver ratio is {ratio}, which means gold is cheaper than silver. Consider buying gold.',
      nextStep: ''
    }),
    hold: Object.freeze({
      status: 'Hold',
      badgeClass: 'sip',
      action: 'Hold / Monitor',
      explanation: 'The current gold silver ratio is {ratio}, which means gold and silver are similarly valued. Continue your planned investments and avoid switching based on the ratio alone.',
      nextStep: ''
    }),
    silver: Object.freeze({
      status: 'Silver zone',
      badgeClass: 'silver',
      action: 'Review silver',
      explanation: 'The current gold silver ratio is {ratio}, which means silver is cheaper than gold. Consider buying silver.',
      nextStep: ''
    }),
    strongSilver: Object.freeze({
      status: 'Silver-favored',
      badgeClass: 'silver',
      action: 'Silver-favored zone',
      explanation: 'The current gold silver ratio is {ratio}, which means silver is much cheaper than gold. Consider buying silver.',
      nextStep: ''
    })
  });

  const calculateGoldSilverRatio = (goldPricePerGram, silverPricePerGram) => {
    if (!Number.isFinite(goldPricePerGram) || goldPricePerGram <= 0 ||
        !Number.isFinite(silverPricePerGram) || silverPricePerGram <= 0) {
      return null;
    }

    const ratio = goldPricePerGram / silverPricePerGram;
    return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
  };

  const isRateTimestampFresh = (timestamp, now = Date.now()) => {
    const updatedAt = timestamp instanceof Date ? timestamp.getTime() : Date.parse(timestamp);
    return Number.isFinite(updatedAt) && Number.isFinite(now) &&
      updatedAt <= now && now - updatedAt <= CONFIG.maxRateAgeMs;
  };

  const classifyGoldSilverRatio = ratio => {
    if (!Number.isFinite(ratio) || ratio <= 0) return null;

    const { goldFavoredBelow, goldZoneBelow, holdThrough, silverThrough } = CONFIG.thresholds;
    if (!(CONFIG.scaleMax > CONFIG.scaleMin) || !(holdThrough > CONFIG.scaleMin)) return null;
    const key = ratio < goldFavoredBelow ? 'goldFavored'
      : ratio < goldZoneBelow ? 'gold'
        : ratio <= holdThrough ? 'hold'
          : ratio <= silverThrough ? 'silver'
            : 'strongSilver';
    const markerValue = Math.min(CONFIG.scaleMax, Math.max(CONFIG.scaleMin, ratio));

    return {
      key,
      ...recommendations[key],
      markerPosition: (markerValue - CONFIG.scaleMin) / (CONFIG.scaleMax - CONFIG.scaleMin) * 100,
      markerClamped: markerValue !== ratio
    };
  };

  return Object.freeze({
    CONFIG,
    calculateGoldSilverRatio,
    isRateTimestampFresh,
    classifyGoldSilverRatio
  });
}));
