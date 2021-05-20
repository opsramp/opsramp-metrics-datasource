/*
 * This computer program is the confidential information and proprietary trade
 * secret of OpsRamp, Inc. Possessions and use of this program must
 * conform strictly to the license agreement between the user and
 * OpsRamp, Inc., and receipt or possession does not convey any rights
 * to divulge, reproduce, or allow others to use this program without specific
 * written authorization of OpsRamp, Inc.
 *
 * Copyright 2019 OpsRamp, Inc. All Rights Reserved.
 */
import { dateTime, TimeRange, rangeUtil } from '@grafana/data';

/**
 * return default time range fron current timestamp
 */
export const getDefaultTimeRange = function (): TimeRange {
  const now = dateTime();
  return {
    from: dateTime(now).subtract(6, 'hour'),
    to: now,
    raw: { from: 'now-6h', to: 'now' },
  };
};

//TODO test recent changes
/**
 * returns interval in seconds if value is convertible, otherwise returns default interval.
 * @param value string interval
 */
export const intervalInSeconds = function (value: string): number {
  try {
    const val = rangeUtil.intervalToSeconds(value);
    return val > 0 ? val : 0;
  } catch (e) {
    console.error('failed to convert %s to seconds', value, e);
  }
  return 0;
};

/**
 * @param endTs number - to timestamp from timerange selection
 * @param startTs number - from timestamp from timerange selection
 */
export const getRangeScopedVars = function (endTs: number, startTs: number) {
  const msRange = endTs - startTs;
  const sRange = Math.round(msRange / 1000);
  return {
    __range_ms: { text: msRange, value: msRange },
    __range_s: { text: sRange, value: sRange },
    __range: { text: sRange + 's', value: sRange + 's' },
  };
};

/**
 * returns safe interval variables
 * @param safeInterval
 */
export const getIntervalScopedVars = function (safeInterval: number) {
  return {
    __interval: { text: safeInterval + 's', value: safeInterval + 's' },
    __interval_ms: { text: safeInterval * 1000, value: safeInterval * 1000 },
  };
};
