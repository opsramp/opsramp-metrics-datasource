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
  DataFrame,
  TIME_SERIES_VALUE_FIELD_NAME,
  TIME_SERIES_TIME_FIELD_NAME,
  FieldType,
  ArrayVector,
  MutableField,
  Field,
} from '@grafana/data';
import { DataPoint, UserQuery, TABLE_FORMAT } from '../types';

export class DataTransformer {
  getDataFrame(data: any, userQuery: UserQuery): DataFrame {
    if (data?.values) {
      let dataFrame: DataFrame;
      if (userQuery?.dataFormat === TABLE_FORMAT) {
        dataFrame = this.getTableDataFrame(data);
      } else {
        dataFrame = this.getTimeSeriesDataFrame(data, userQuery);
      }

      if (dataFrame.fields.length > 0 && userQuery.legendLabel !== undefined && userQuery.legendLabel !== '') {
        dataFrame = this.getLegendFormatedData(dataFrame, userQuery.legendLabel);
      }
      return dataFrame;
    }
    return {} as DataFrame;
  }

  getHeatmapDataFrame(seriesList: DataFrame[]): DataFrame[] {
    seriesList.sort(this.sortSeries);
    for (let i = seriesList.length - 1; i > 0; i--) {
      const topSeries = seriesList[i].fields.find((s) => s.name === TIME_SERIES_VALUE_FIELD_NAME);
      const bottomSeries = seriesList[i - 1].fields.find((s) => s.name === TIME_SERIES_VALUE_FIELD_NAME);
      if (!topSeries || !bottomSeries) {
        throw new Error('Prometheus heatmap transform error: data should be a time series');
      }

      for (let j = 0; j < topSeries.values.length; j++) {
        const bottomPoint = bottomSeries.values.get(j) || [0];
        topSeries.values.toArray()[j] -= bottomPoint;
      }
    }
    return seriesList;
  }

  private getTimeSeriesDataFrame(data: any, userQuery: UserQuery) {
    let lastTimeStampMs = userQuery.startTs; // in milliseconds
    let val = 0;
    const dps: DataPoint[] = [];

    for (const [time, value] of data?.values) {
      val = parseFloat(value);
      //missing points before last retrieved
      for (let ts = lastTimeStampMs; ts < time * 1000; ts += userQuery.stepInMs) {
        dps.push([ts, null]);
      }
      lastTimeStampMs = time * 1000 + userQuery.stepInMs;
      dps.push([time * 1000, isNaN(val) ? null : val]); //using timestamp in milliseconds
    }

    //missing points after last retrieved
    for (let ts = lastTimeStampMs; ts <= userQuery.endTs; ts += userQuery.stepInMs) {
      dps.push([ts, null]); //timestamp is already in milliseconds
    }

    return {
      fields: [this.getMetricTimeField(dps), this.getMetricValueField(dps)] as Field[],
      name: JSON.stringify(data.metric),
    } as DataFrame;
  }

  private getTableDataFrame(data: any): DataFrame {
    return {
      fields: [
        this.getMetricTimeField(data.values),
        ...this.getMetricTagFields(data.metric),
        this.getMetricValueField(data.values),
      ],
      name: JSON.stringify(data.metric),
    } as DataFrame;
  }

  private getLegendFormatedData(frame: DataFrame, legendLabel: string): DataFrame {
    frame.name = this.getFormattedName(frame.name, legendLabel);
    return frame;
  }

  private sortSeries(s1: DataFrame, s2: DataFrame): number {
    let le1, le2;
    try {
      le1 = this.parseDPValue(s1.name ?? '');
      le2 = this.parseDPValue(s2.name ?? '');
      if (le1 > le2) {
        return 1;
      }
      if (le1 < le2) {
        return -1;
      }
    } catch (err) {
      console.error(err);
    }
    return 0;
  }

  private parseDPValue(value: string): number {
    switch (value) {
      case '+Inf':
        return Number.POSITIVE_INFINITY;
      case '-Inf':
        return Number.NEGATIVE_INFINITY;
      default:
        return parseFloat(value);
    }
  }

  private getFormattedName(frameName?: string, legendLabel?: string) {
    var frameNameObj = JSON.parse(frameName || '{}');
    if (frameNameObj !== undefined && legendLabel !== undefined && frameNameObj.hasOwnProperty(legendLabel)) {
      return frameNameObj[legendLabel];
    }
    return legendLabel;
  }

  private getMetricTimeField(dps?: any) {
    return {
      name: TIME_SERIES_TIME_FIELD_NAME,
      type: FieldType.time,
      config: {},
      values: dps ? new ArrayVector<number>(dps.map((val: any) => val[0])) : new ArrayVector(),
    } as MutableField;
  }

  private getMetricValueField(dps?: any) {
    return {
      name: TIME_SERIES_VALUE_FIELD_NAME,
      type: FieldType.number,
      config: {},
      values: dps ? new ArrayVector<number>(dps.map((val: any) => this.parseDPValue(val[1]))) : new ArrayVector(),
    } as MutableField;
  }

  private getMetricTagFields(meticProperties: any) {
    const metricTagFields: Field[] = [];
    if (meticProperties) {
      // Fields from metric name
      let metric = JSON.parse(meticProperties);
      for (var key in metric) {
        if (metric.hasOwnProperty(key)) {
          metricTagFields.push(this.getMetricTagField(key, metric[key], length));
        }
      }
    }
    return metricTagFields;
  }

  private getMetricTagField(key: string, value: string, length: number) {
    return {
      name: key,
      type: FieldType.string,
      config: {},
      values: new ArrayVector(Array(length).fill(value)),
    } as MutableField;
  }
}
