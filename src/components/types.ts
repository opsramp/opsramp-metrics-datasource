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

import { Query } from 'types';
import { DataSource } from '../datasource';

export interface QueryProps {
  datasource: DataSource;
  query: Query;
  onUpdateQuery: Function;
  onRunQuery?: () => void;
  onBlur?: () => void;
}

export interface QueryDataSource {
  metricsURL: string;
  tagsURL: string;
  tagValuesURL: string;
  getMetricFunc: Function;
  getTagsFunc: Function;
  getValuesFunc: Function;
  getDataFunc: Function;
}
