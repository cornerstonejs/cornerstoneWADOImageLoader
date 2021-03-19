import dataSetCacheManager from './dataSetCacheManager.js';

describe('#getInfo', () => {
  it('should return cache info for an empty cache', function() {
    const cacheInfo = dataSetCacheManager.getInfo();

    expect(cacheInfo.cacheSizeInBytes).toEqual(0);
    expect(cacheInfo.numberOfDataSetsCached).toEqual(0);
  });
});
