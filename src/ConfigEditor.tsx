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

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { DataSourceOptions, SecureJsonData } from './types';

const { FormField, SecretFormField } = LegacyForms;

/**
 * Configuration editor to define
 * API URL,
 * API Authentication key & secret,
 * Unique Client ID
 */
export class ConfigEditor extends PureComponent<DataSourcePluginOptionsEditorProps<DataSourceOptions>> {
  onURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      directUrl: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      client_id: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onAPISecretChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      client_secret: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onAPIKeySecretChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiSecret: event.target.value,
      },
    });
  };

  onClientUniqueIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      client_uniqueId: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onResetAPISecret = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiSecret: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiSecret: '',
      },
    });
  };

  render() {
    const { options } = this.props;
    const { jsonData, secureJsonFields } = options;

    const secureJsonData = (options.secureJsonData || {}) as SecureJsonData;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField
            label="Metrics URL"
            labelWidth={10}
            inputWidth={25}
            onChange={this.onURLChange}
            value={jsonData.directUrl || ''}
            placeholder="http://localhost:9090"
          />
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <div className="gf-form">
              <FormField
                value={jsonData.client_uniqueId || ''}
                label="Client UniqueId"
                placeholder="Client UniqueId(client_{id}) "
                labelWidth={10}
                inputWidth={25}
                onChange={this.onClientUniqueIdChange}
              />
            </div>
          </div>
        </div>

        <div className="gf-form-inline">
          <div className="gf-form">
            <FormField
              value={jsonData.client_id || ''}
              label="Client API Key"
              placeholder="Client API Key"
              labelWidth={10}
              inputWidth={25}
              onChange={this.onAPIKeyChange}
            />
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.apiSecret) as boolean}
              value={secureJsonData.apiSecret || ''}
              label="Client API Secret"
              placeholder="secure json field (backend only)"
              labelWidth={10}
              inputWidth={25}
              onReset={this.onResetAPISecret}
              onChange={this.onAPIKeySecretChange}
            />
          </div>
        </div>
      </div>
    );
  }
}
