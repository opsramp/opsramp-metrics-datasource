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

import { DataSourceInstanceSettings, DataQueryResponse } from '@grafana/data';
import { getBackendSrv, BackendSrvRequest } from '@grafana/runtime';
import { DataSourceOptions, UserQuery, MetaData } from '../types';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

const METRIC_NAME_TAG = '__name__';

export class DataHandler {
  url?: string;
  metricql_path: string;
  metricsAPIVersion: string;
  client_uniqueId: String;

  constructor(instanceSettings: DataSourceInstanceSettings<DataSourceOptions>) {
    this.url = instanceSettings.url;
    this.metricsAPIVersion = '/api/v7/tenants/';
    this.metricql_path = '/metricql/metricsql';
    this.client_uniqueId = instanceSettings.jsonData.client_uniqueId;
  }

  handleRequest<T = BackendSrvRequest>(Options: BackendSrvRequest) {
    return getBackendSrv().fetch<T>(Options);
  }

  async doRequest(url: string, params?: Record<string, any>, requestId?: string) {
    return await getBackendSrv().get(url, params, requestId);
  }

  // Useful to get metrics data whether it is for selected range or latest
  getMetrics(userQuery: UserQuery) {
    if (userQuery?.params?.query === undefined || userQuery?.params?.query === '' || userQuery.hide) {
      return of({}).pipe(delay(500));
    }

    let url = this.url + this.metricql_path + this.metricsAPIVersion + this.client_uniqueId + '/metrics';
    if (userQuery.latest) {
      url = url + '/latest';
    }

    return this.handleRequest({
      url,
      method: 'GET',
      requestId: userQuery.requestId,
      params: userQuery.params,
    }).pipe();
  }

  // Useful to get metric labels
  async getTags(): Promise<MetaData[]> {
    const url = this.url + this.metricql_path + this.metricsAPIVersion + this.client_uniqueId + '/metrics/labels';
    const response = await this.doRequest(url);
    const metrics = [] as MetaData[];
    response?.data?.forEach((name: any) => {
      if (name && name !== METRIC_NAME_TAG) {
        // hide __name__ in available tags
        metrics.push({ label: name, insertText: name || '' } as MetaData);
      }
    });
    return metrics;
  }

  async getTagValues(labelName?: string, startTs?: number, endTs?: number): Promise<MetaData[]> {
    const metric_label_url = this.metricsAPIVersion + this.client_uniqueId + '/metrics/label/' + labelName + '/values';
    let params;
    if (startTs && endTs && endTs > startTs) {
      params = { start: Math.round(startTs / 1000), end: Math.round(endTs / 1000) };
    }
    const response = await this.doRequest(this.url + this.metricql_path + metric_label_url, params);
    const metrics = [] as MetaData[];
    response?.data?.forEach((name: any) => {
      metrics.push({ label: name } as MetaData);
    });
    return metrics;
  }

  async getMetricNames(startTs?: number, endTs?: number): Promise<MetaData[]> {
    return await this.getTagValues(METRIC_NAME_TAG, startTs, endTs);
  }

  async testDataSource() {
    const url = this.url + this.metricql_path + this.metricsAPIVersion + this.client_uniqueId + '/metrics/labels';
    return this.doRequest(url).then((response: DataQueryResponse) => {
      return { status: 'success', message: 'OpsRamp Data source is working' };
    });
  }
}
