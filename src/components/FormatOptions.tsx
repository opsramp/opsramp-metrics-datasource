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

import React from 'react';
import { DataFormatOptions, StepFactoroptions } from '../types';
import { QueryProps } from './types';
import { SelectableValue } from '@grafana/data';
import { InlineFormLabel, Select, LegacyForms } from '@grafana/ui';
const { Switch } = LegacyForms;

/**
 * To format data & some of following query options
 * Step, StepFactor, Instant(Latest) - useful to form query
 * Format, Legend - support for visualization
 *
 */
export class FormatOptions extends React.PureComponent<QueryProps> {
  constructor(props: QueryProps) {
    super(props);
  }

  onStepChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { onUpdateQuery, query } = this.props;
    onUpdateQuery({ ...query, step: e.currentTarget.value });
  };

  onStepFactorChange = (option: SelectableValue<number>) => {
    const { onUpdateQuery, query } = this.props;
    onUpdateQuery({ ...query, stepFactor: option.value });
  };

  onInstantChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { onUpdateQuery, query } = this.props;
    onUpdateQuery({ ...query, latest: !query.latest }, true);
  };

  onLegendChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { onUpdateQuery, query } = this.props;
    onUpdateQuery({ ...query, legendFormat: e.currentTarget.value });
  };

  onFormatChange = (option: SelectableValue<string>) => {
    const { onUpdateQuery, query } = this.props;
    onUpdateQuery({ ...query, dataFormat: option.value });
  };

  render() {
    const { query } = this.props;
    return (
      <>
        <div className="gf-form-inline">
          <div className="gf-form">
            <InlineFormLabel
              width={7}
              tooltip={
                <>
                  Controls the interval between the neighbor data points if the possible number of data points is less
                  than 11000. Allowed formats are the 30s, 1m, 1h, 1d ..etc.
                </>
              }
            >
              Min step
            </InlineFormLabel>
            <input
              type="text"
              className="gf-form-input width-8"
              placeholder="15s"
              onChange={this.onStepChange}
              onBlur={this.props.onBlur}
              value={query.step}
            />
          </div>

          <div className="gf-form">
            <div className="gf-form-label">Resolution</div>
            <Select
              isSearchable={false}
              options={StepFactoroptions}
              onChange={this.onStepFactorChange}
              value={query.stepFactor}
              onBlur={this.props.onBlur}
            />
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <InlineFormLabel
              width={7}
              tooltip="Controls the name of the time series, using name or pattern. For example
        {{hostname}} will be replaced with label value for the label hostname."
            >
              Legend
            </InlineFormLabel>
            <input
              type="text"
              className="gf-form-input"
              placeholder="{{label}}"
              value={query.legendFormat}
              onBlur={this.props.onBlur}
              onChange={this.onLegendChange}
            />
          </div>

          <div className="gf-form">
            <div className="gf-form-label width-7">Format</div>
            <Select
              width={16}
              isSearchable={false}
              options={DataFormatOptions}
              onChange={this.onFormatChange}
              value={query.dataFormat}
              onBlur={this.props.onBlur}
            />
            <Switch label="Latest" checked={query.latest} onChange={this.onInstantChange} />
          </div>
        </div>
      </>
    );
  }
}
