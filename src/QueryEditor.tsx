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

import defaults from 'lodash/defaults';
import React, { PureComponent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { QueryOptions } from './components/QueryOptions';
import { FormatOptions } from './components/FormatOptions';
import { DataSourceOptions, Query, defaultQuery } from './types';

type Props = QueryEditorProps<DataSource, Query, DataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  query: Query;
  constructor(props: Props) {
    super(props);
    const query = Object.assign({}, props.query);
    this.query = query;
    this.state = {
      legendFormat: query.legendFormat,
    };
  }

  onUpdateQuery = (updatedQuery: Query, runQuery?: boolean) => {
    const { onChange, onRunQuery } = this.props;
    onChange(updatedQuery);
    if (runQuery) {
      onRunQuery();
    }
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { datasource, onRunQuery, onBlur } = this.props;

    return (
      <div>
        <QueryOptions
          query={query}
          onRunQuery={onRunQuery}
          onUpdateQuery={this.onUpdateQuery}
          onBlur={onBlur}
          datasource={datasource}
        />
        <FormatOptions datasource={datasource} query={query} onUpdateQuery={this.onUpdateQuery} onBlur={onRunQuery} />
      </div>
    );
  }
}
