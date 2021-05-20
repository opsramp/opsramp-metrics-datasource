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

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  TimeRange,
  DataFrame,
  LoadingState,
  rangeUtil,
  ScopedVars,
} from '@grafana/data';
import { TemplateSrv, getTemplateSrv } from '@grafana/runtime';
import { Query, UserQuery, DataSourceOptions, HEAT_MAP_FORMAT, MetaData } from './types';
import { pipe, merge, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DataTransformer } from './data/datatransfromer';

import * as utils from './utils';
import { DataHandler } from './data/datahandler';

export class DataSource extends DataSourceApi<Query, DataSourceOptions> {
  templateSrv: TemplateSrv;
  ruleMappings: { [index: string]: string };
  timeRange: TimeRange;
  currentTags: MetaData[];
  startTs: number; // In milliseconds
  endTs: number; // In milliseconds
  stepInMs: number; // In milliseconds
  scopeVars: ScopedVars;
  dataPointLimit: number;
  dataHandler: DataHandler;
  dataTransformer: DataTransformer;

  constructor(instanceSettings: DataSourceInstanceSettings<DataSourceOptions>) {
    super(instanceSettings);
    this.templateSrv = getTemplateSrv();
    this.ruleMappings = {};
    this.timeRange = utils.getDefaultTimeRange();
    this.dataPointLimit = 11000;
    this.startTs = 0;
    this.endTs = 0;
    this.stepInMs = 15 * 1000;
    this.scopeVars = {} as ScopedVars;
    this.dataHandler = new DataHandler(instanceSettings);
    this.dataTransformer = new DataTransformer();
    this.currentTags = [] as MetaData[];
    this.start();
  }

  async start() {
    this.currentTags = await this.dataHandler?.getTags();
  }

  // update time related variables
  updateTimeVars(options: DataQueryRequest<Query>) {
    const { range, interval } = options;
    this.startTs = range!.from.valueOf();
    this.endTs = range!.to.valueOf();
    this.stepInMs = rangeUtil.intervalToMs(interval);
  }

  /**
   * returns data to display visualization chart based on options parameter
   * @param options - query options from panel
   */
  query(options: DataQueryRequest<Query>): Observable<DataQueryResponse> {
    //set global variables "from" & "to"
    this.updateTimeVars(options);

    let queryCount = options.targets.length;
    const dataFrames: DataFrame[] = [];
    const QueryResponses = options.targets.map((query: Query) => {
      // queryRequest holds all required properties
      const userQuery = this.getUserQuery(query);

      // pipe all query responses for all queries
      const mapQueryResponse = pipe(
        tap(() => queryCount--), // count to identify completion of all query requests
        map((response: any) => {
          response?.data?.data?.result?.forEach((data: any) => {
            if (data?.values) {
              dataFrames.push(this.dataTransformer.getDataFrame(data, userQuery));
            }
          });

          // Heat map data is a group operation
          if (userQuery?.dataFormat === HEAT_MAP_FORMAT) {
            this.dataTransformer.getHeatmapDataFrame(dataFrames);
          }

          return {
            data: dataFrames,
            key: userQuery?.requestId,
            state: queryCount === 0 ? LoadingState.Done : LoadingState.Loading,
          } as DataQueryResponse;
        })
      );

      return this.dataHandler.getMetrics(userQuery).pipe(mapQueryResponse);
    });

    return merge(...QueryResponses);
  }

  /**
   * returns modified query which incorporates safe request parameters
   *
   * @param query object uses to frame user query options from query editor
   */
  getUserQuery(query: Query): UserQuery {
    const safeStep = this.getSafeStep(query);
    let params = {
      query: this.useTemplateSrv(query, safeStep),
      step: safeStep,
    } as Record<string, any>;
    if (query.latest) {
      params.time = Math.round(this.endTs / 1000);
    } else {
      params.start = Math.round(this.startTs / 1000);
      params.end = Math.round(this.endTs / 1000);
    }

    return {
      legendLabel: this.findLegendProp(query),
      params: params,
      stepInMs: safeStep * 1000,
      requestId: query.requestId,
      dataFormat: query.dataFormat,
      startTs: this.startTs,
      endTs: this.endTs,
      latest: query.latest,
      hide: query.hide,
    } as UserQuery;
  }

  // defines safe step based on selected time ranges
  getSafeStep(query: Query): number {
    // interval from the individual query
    let queryStep = utils.intervalInSeconds(this.templateSrv.replace(query.step, this.scopeVars));
    if (queryStep === 0) {
      queryStep = Math.round(this.stepInMs / 1000);
    }

    if (query.stepFactor > 1) {
      queryStep = queryStep * query.stepFactor;
    }

    // max data points allowed per second
    const maxDpsCount = Math.ceil(Math.round(this.endTs / 1000) - Math.round(this.startTs / 1000));
    // if querystep is feasible to satisfy data point limit use step in query othewise use from global query options
    if (maxDpsCount > 0 && queryStep > 0 && maxDpsCount / queryStep <= this.dataPointLimit) {
      return queryStep;
    } else {
      return Math.round(this.stepInMs / 1000);
    }
  }

  // useful to replace required scoped variables to fit in the selected timerange.
  useTemplateSrv(query: Query, safeStep: number): string {
    // overwrite interval & range scope variables using safeStep
    const scopedVars = Object.assign({}, this.scopeVars, {
      ...utils.getIntervalScopedVars(safeStep),
      ...utils.getRangeScopedVars(this.endTs, this.startTs),
    });

    return this.templateSrv.replace(query?.query, scopedVars);
  }

  // founds legend label to show in the legends, considers variables if it consists
  findLegendProp(query: Query) {
    const legendLabel = query?.legendFormat?.replace('{{', '').replace('}}', '')?.trim();
    return this.templateSrv.replace(legendLabel, this.scopeVars);
  }

  async testDatasource() {
    return this.dataHandler.testDataSource();
  }
}
