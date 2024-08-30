import { useRouteId } from '@/hooks/useRouteId/useRouteId';
import { describe, expect, it } from 'vitest';

describe('useRouteId', () => {
  it('should return the route id', () => {
    const feature = 'job-opportunity';
    expect(useRouteId(feature, 'en')).toEqual('job-opportunity-en');
    expect(useRouteId(feature, 'fi')).toEqual('job-opportunity-fi');
    expect(useRouteId(feature, 'sv')).toEqual('job-opportunity-sv');
  });
});
