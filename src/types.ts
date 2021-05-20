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

import { DataQuery, DataSourceJsonData, SelectableValue } from '@grafana/data';
import _ from 'lodash';

export interface Query extends DataQuery { 
  query?: string;
  requestId?: string;
  step: string;
  stepFactor: number;
  dataFormat: string;
  legendFormat?: string;
  latest: boolean;
}

export interface UserQuery {
  legendLabel?: string;
  dataFormat?: string;
  params: Record<string, any> | null;
  requestId?: string;
  stepInMs: number;
  startTs: number;
  endTs: number;
  latest?: boolean;
  hide: boolean;
}

/**
 * These are options configured for each DataSource instance
 */
export interface DataSourceOptions extends DataSourceJsonData {
  path?: string;
  timeInterval?: string;
  directUrl: string;
  client_id: string;
  client_uniqueId: string;
  httpMethod: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface SecureJsonData {
  apiSecret?: string;
}

/**
 * Data format selection parameters
 */
export const TIMESERIES_FORMAT = 'timeseries';
export const TABLE_FORMAT = 'table';
export const HEAT_MAP_FORMAT = 'heatmap';

export const DataFormatOptions: Array<SelectableValue<string>> = [
  { label: 'Time series', value: TIMESERIES_FORMAT },
  { label: 'Table', value: TABLE_FORMAT },
  { label: 'Heatmap', value: HEAT_MAP_FORMAT },
];
export const defaultDataFormat = DataFormatOptions?.[0]?.value || 'time_series';

/**
 * Step factor selection parameters
 */
export const StepFactoroptions: Array<SelectableValue<number>> = _.map([1, 2, 3, 4, 5, 10], (value: number) => ({
  value,
  label: '1/' + value,
}));
export const defaultStepFactor = StepFactoroptions?.[0]?.value || 1;

/** data point format */
export type DataPoint = [number, any];

/**
 *  To display default query in query editor
 */
export const defaultQuery: Partial<Query> = {
  stepFactor: defaultStepFactor,
  dataFormat: defaultDataFormat,
};

export type MetaData = {
  label: string;
};
