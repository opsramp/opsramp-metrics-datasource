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

let Prism = require('./prismjs');
import { DOMUtil, SuggestionsState } from '@grafana/ui';
import { MetaData } from '../types';
import {
  METRIC_FUNCTIONS,
  METRIC_QUERY_RANGE_CONTEXT,
  METRIC_QUERY_TAG_CONTEXT,
  TAG_NAMES,
  TAG_VALUES,
  METRIC_TEXT,
  TAG_NAME_TEXT,
  TAG_VALUE_TEXT,
  FUNCTIONS_TEXT,
  RANGE_TEXT,
} from './constants';

// prism languages
export const getLanguages = function () {
  return Prism.languages;
};

export const metricsContextSuggestions = function (items: MetaData[]) {
  return {
    suggestions: [
      {
        prefixMatch: true,
        label: FUNCTIONS_TEXT,
        items: METRIC_FUNCTIONS.map((mFunc) => {
          return { label: mFunc } as MetaData;
        }),
      },
      {
        label: METRIC_TEXT,
        items,
      },
    ],
  };
};

export const tagNameSuggestions = function (items: MetaData[]) {
  return {
    context: METRIC_QUERY_TAG_CONTEXT + '-' + TAG_NAMES,
    suggestions: [
      {
        label: TAG_NAME_TEXT,
        items,
      },
    ],
  };
};

export const tagValueSuggestions = function (items: MetaData[]) {
  return {
    context: METRIC_QUERY_TAG_CONTEXT + '-' + TAG_VALUES,
    suggestions: [
      {
        label: TAG_VALUE_TEXT,
        items,
      },
    ],
  };
};

export const completeSuggestion = function (
  suggestion: string,
  { typeaheadContext, typeaheadText }: SuggestionsState
): string {
  switch (typeaheadContext) {
    case METRIC_QUERY_TAG_CONTEXT + '-' + TAG_NAMES: {
      const nextChar = DOMUtil.getNextCharacter();
      if (!nextChar || nextChar === '}' || nextChar === ',') {
        suggestion += '=';
      }
      break;
    }

    case METRIC_QUERY_TAG_CONTEXT + '-' + TAG_VALUES: {
      if (!typeaheadText.match(/^(!?=~?"|")/)) {
        suggestion = `"${suggestion}`;
      }
      if (DOMUtil.getNextCharacter() !== '"') {
        suggestion = `${suggestion}"`;
      }
      break;
    }

    default:
  }

  return suggestion;
};

export const rangeContextSuggestions = function () {
  return {
    context: METRIC_QUERY_RANGE_CONTEXT,
    suggestions: [
      {
        label: RANGE_TEXT,
        items: ['$__interval', '$__rate_interval', '1m', '5m', '10m', '30m', '1h', '1d'].map((mFunc) => {
          return { label: mFunc } as MetaData;
        }),
      },
    ],
  };
};

export const isTagValueStart = function (text: string) {
  return text?.match(/^(=|=~|!=|!~)/);
};

export const cleanText = function (text: string) {
  return text.trimLeft().replace(/"$/, '').replace(/^"/, '');
};
