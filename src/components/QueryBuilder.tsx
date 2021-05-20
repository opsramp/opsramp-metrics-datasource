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
import { QueryProps } from './types';
import { MetaData } from '../types';
import { QueryField, TypeaheadInput, TypeaheadOutput, BracesPlugin, SlatePrism } from '@grafana/ui';
import { Plugin, Node } from 'slate';
import {
  completeSuggestion,
  getLanguages,
  metricsContextSuggestions,
  tagNameSuggestions,
  tagValueSuggestions,
  rangeContextSuggestions,
  isTagValueStart,
  cleanText,
} from '../language/language';
import { METRIC_QUERY_TAG_CONTEXT, TAG_VALUES, METRIC_QUERY_RANGE_CONTEXT } from '../language/constants';

interface QueryBuildertate {
  tagID?: string;
  tagValues: MetaData[];
}

// Plugin syntax to support query language
const plugins = [
  BracesPlugin(),
  SlatePrism(
    {
      onlyIn: (node: Node) => node.object === 'block' && node.type === 'code_block',
      getSyntax: () => 'promql',
    },
    ...getLanguages()
  ),
] as Plugin[];

export class QueryBuilder extends React.PureComponent<QueryProps, QueryBuildertate> {
  constructor(props: QueryProps) {
    super(props);
    this.state = {
      tagID: undefined,
      tagValues: [] as MetaData[],
    };
  }

  onExprChange = (val: string) => {
    const { onUpdateQuery, query } = this.props;
    onUpdateQuery({ ...query, query: val });
  };

  onTypeahead = async (typeahead: TypeaheadInput): Promise<TypeaheadOutput> => {
    const { datasource } = this.props;
    const { tagID } = this.state;

    // wrapper classes based on input text value
    if (typeahead?.wrapperClasses?.length > 0) {
      // metric filters inside {} & range filters inside []
      if (typeahead.wrapperClasses.includes(METRIC_QUERY_RANGE_CONTEXT)) {
        // range filter context
        return rangeContextSuggestions();
      } else if (typeahead.wrapperClasses.includes(METRIC_QUERY_TAG_CONTEXT)) {
        // metric filters context
        if (
          (typeahead.text && isTagValueStart(typeahead.text)) ||
          typeahead.wrapperClasses.includes(TAG_VALUES) ||
          (tagID !== undefined && tagID === typeahead?.labelKey)
        ) {
          // tag values context
          if (typeahead?.labelKey && tagID !== typeahead?.labelKey) {
            // previous tag & current tag is not the same to get tag values
            this.setState({
              tagID: typeahead.labelKey,
              tagValues: await datasource?.dataHandler.getTagValues(typeahead.labelKey),
            });
          }
          return tagValueSuggestions(this.state.tagValues);
        } else {
          // tag names context
          return tagNameSuggestions(datasource.currentTags);
        }
      }
    }

    // context with metrics & functions
    return metricsContextSuggestions(await datasource?.dataHandler.getMetricNames());
  };

  render() {
    return (
      <QueryField
        additionalPlugins={plugins}
        portalOrigin="opsramp-query-ds"
        onTypeahead={this.onTypeahead}
        onWillApplySuggestion={completeSuggestion}
        query={this.props.query.query}
        onChange={this.onExprChange}
        onRunQuery={this.props.onRunQuery}
        onBlur={this.props.onBlur}
        cleanText={cleanText}
        placeholder="Enter a query (run with Shift+Enter)"
      />
    );
  }
}
