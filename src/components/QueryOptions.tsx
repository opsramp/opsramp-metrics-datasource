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

import _ from 'lodash';
import React from 'react';
import { ButtonCascader, CascaderOption } from '@grafana/ui';
import { QueryBuilder } from './QueryBuilder';
import { QueryProps } from './types';

interface QueryOptionsState {
  metricLabels: any[];
  metricsLoaded: boolean;
  metricsText: string;
}

export class QueryOptions extends React.PureComponent<QueryProps, QueryOptionsState> {
  constructor(props: QueryProps) {
    super(props);

    this.state = {
      metricLabels: [],
      metricsLoaded: false,
      metricsText: 'Loading metrics..',
    };
  }

  componentDidMount() {
    this.loadMetrics();
  }

  // load metrics
  loadMetrics = async () => {
    const { datasource } = this.props;

    const metricNames = await datasource.dataHandler?.getMetricNames(datasource?.startTs, datasource?.endTs);
    const cascadeOpts = [] as CascaderOption[];

    const metricSuffixOpts: any[] = [];
    let metricSuffix = '';
    metricNames.forEach((metric) => {
      metricSuffix = metric.label.substr(
        0,
        metric.label.indexOf('_') > 0 ? metric.label.indexOf('_') : metric.label.length
      );
      if (!metricSuffixOpts.includes(metricSuffix)) {
        metricSuffixOpts.push(metricSuffix);
      }
    });

    metricSuffixOpts.sort();
    metricSuffixOpts.forEach((metricSuffix) => {
      const fields: any[] = [];
      metricNames.forEach((metric) => {
        if (metric.label.startsWith(metricSuffix) && metric.label !== metricSuffix) {
          fields.push({
            label: metric.label,
            value: metric.label,
            children: [],
          });
        }
      });
      cascadeOpts.push({
        label: metricSuffix,
        value: metricSuffix,
        children: fields,
      });
    });

    this.setState({
      metricLabels: cascadeOpts,
      metricsLoaded: true,
      metricsText: cascadeOpts && cascadeOpts.length > 0 ? 'Metrics' : 'No Metrics',
    });
  };

  onChangeMetrics = (values: string[], selectedOptions: CascaderOption[]) => {
    let metricLabel;
    if (selectedOptions.length === 1) {
      const selectedOption = selectedOptions[0];
      if (!selectedOption.children || selectedOption.children.length === 0) {
        metricLabel = selectedOption.value;
      } else {
        // ignore inside elements
        return;
      }
    } else {
      metricLabel = selectedOptions[1].value;
    }

    const { onUpdateQuery, query } = this.props;
    onUpdateQuery({ ...query, query: metricLabel }, true);
  };

  render() {
    const { datasource, query } = this.props;
    const { metricLabels, metricsLoaded, metricsText } = this.state;
    const selectionDisabled = !(metricsLoaded && metricLabels && metricLabels.length > 0);

    return (
      <>
        <div className="gf-form-inline gf-form-inline--xs-view-flex-column flex-grow-1">
          <div className="gf-form flex-shrink-0 min-width-5">
            <ButtonCascader options={metricLabels} disabled={selectionDisabled} onChange={this.onChangeMetrics}>
              {metricsText}
            </ButtonCascader>
          </div>
          <div className="gf-form gf-form--grow flex-shrink-1 min-width-15">
            <QueryBuilder
              query={query}
              datasource={datasource}
              onUpdateQuery={this.props.onUpdateQuery}
              onRunQuery={this.props.onRunQuery}
              onBlur={this.props.onBlur}
            />
          </div>
        </div>
      </>
    );
  }
}
