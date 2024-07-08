/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  ensureIsArray,
  isAdhocColumn,
  isPhysicalColumn,
  QueryFormMetric,
  SMART_DATE_ID,
  t,
  validateNonEmpty,
} from '@superset-ui/core';
import {
  ControlPanelConfig,
  D3_TIME_FORMAT_OPTIONS,
  sharedControls,
  Dataset,
  getStandardizedControls,
} from '@superset-ui/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'groupbyColumns',
            config: {
              ...sharedControls.groupby,
              label: t('Columns'),
              description: t('Columns to group by on the columns'),
            },
          },
        ],
        [
          {
            name: 'groupbyRows',
            config: {
              ...sharedControls.groupby,
              label: t('Rows'),
              description: t('Columns to group by on the rows'),
            },
          },
        ],
        [
          {
            name: 'time_grain_sqla',
            config: {
              ...sharedControls.time_grain_sqla,
              visibility: ({ controls }) => {
                const dttmLookup = Object.fromEntries(
                  ensureIsArray(controls?.groupbyColumns?.options).map(
                    option => [option.column_name, option.is_dttm],
                  ),
                );

                return [
                  ...ensureIsArray(controls?.groupbyColumns.value),
                  ...ensureIsArray(controls?.groupbyRows.value),
                ]
                  .map(selection => {
                    if (isAdhocColumn(selection)) {
                      return true;
                    }
                    if (isPhysicalColumn(selection)) {
                      return !!dttmLookup[selection];
                    }
                    return false;
                  })
                  .some(Boolean);
              },
            },
          },
          'temporal_columns_lookup',
        ],
        [
          {
            name: 'metrics',
            config: {
              ...sharedControls.metrics,
              validators: [validateNonEmpty],
              rerender: ['conditional_formatting'],
            },
          },
        ],
        ['adhoc_filters'],
        ['series_limit'],
        [
          {
            name: 'row_limit',
            config: {
              ...sharedControls.row_limit,
              label: t('Cell limit'),
              description: t('Limits the number of cells that get retrieved.'),
            },
          },
        ],
        // TODO(kgabryje): add series_columns control after control panel is redesigned to avoid clutter
        [
          {
            name: 'series_limit_metric',
            config: {
              ...sharedControls.series_limit_metric,
              description: t(
                'Metric used to define how the top series are sorted if a series or cell limit is present. ' +
                  'If undefined reverts to the first metric (where appropriate).',
              ),
            },
          },
        ],
        [
          {
            name: 'order_desc',
            config: {
              type: 'CheckboxControl',
              label: t('Sort Descending'),
              default: true,
              description: t('Whether to sort descending or ascending'),
            },
          },
        ],
      ],
    },
    {
      label: t('Options'),
      expanded: true,
      tabOverride: 'data',
      controlSetRows: [
        [
          {
            name: 'rowTotals',
            config: {
              type: 'CheckboxControl',
              label: t('Show rows total'),
              default: false,
              renderTrigger: true,
              description: t('Display row level total'),
            },
          },
        ],
        [
          {
            name: 'rowSubTotals',
            config: {
              type: 'CheckboxControl',
              label: t('Show rows subtotal'),
              default: false,
              renderTrigger: true,
              description: t('Display row level subtotal'),
            },
          },
        ],
        [
          {
            name: 'colTotals',
            config: {
              type: 'CheckboxControl',
              label: t('Show columns total'),
              default: false,
              renderTrigger: true,
              description: t('Display column level total'),
            },
          },
        ],
        [
          {
            name: 'colSubTotals',
            config: {
              type: 'CheckboxControl',
              label: t('Show columns subtotal'),
              default: false,
              renderTrigger: true,
              description: t('Display column level subtotal'),
            },
          },
        ],
      ],
    },
    {
      label: t('Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'valueFormat',
            config: {
              ...sharedControls.y_axis_format,
              label: t('Value format'),
            },
          },
        ],
        ['currency_format'],
        [
          {
            name: 'date_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Date format'),
              default: SMART_DATE_ID,
              renderTrigger: true,
              choices: D3_TIME_FORMAT_OPTIONS,
              description: t('D3 time format for datetime columns'),
            },
          },
        ],
        [
          {
            name: 'rowSubtotalPosition',
            config: {
              type: 'SelectControl',
              label: t('Rows subtotal position'),
              default: false,
              choices: [
                // [value, label]
                [true, t('Top')],
                [false, t('Bottom')],
              ],
              renderTrigger: true,
              description: t('Position of row level subtotal'),
            },
          },
        ],
        [
          {
            name: 'colSubtotalPosition',
            config: {
              type: 'SelectControl',
              label: t('Columns subtotal position'),
              default: false,
              choices: [
                // [value, label]
                [true, t('Left')],
                [false, t('Right')],
              ],
              renderTrigger: true,
              description: t('Position of column level subtotal'),
            },
          },
        ],
        [
          {
            name: 'conditional_formatting',
            config: {
              type: 'ConditionalFormattingControl',
              renderTrigger: true,
              label: t('Conditional formatting'),
              description: t('Apply conditional color formatting to metrics'),
              mapStateToProps(explore, _, chart) {
                const values =
                  (explore?.controls?.metrics?.value as QueryFormMetric[]) ??
                  [];
                const verboseMap = explore?.datasource?.hasOwnProperty(
                  'verbose_map',
                )
                  ? (explore?.datasource as Dataset)?.verbose_map
                  : explore?.datasource?.columns ?? {};
                const chartStatus = chart?.chartStatus;
                const metricColumn = values.map(value => {
                  if (typeof value === 'string') {
                    return { value, label: verboseMap[value] ?? value };
                  }
                  return { value: value.label, label: value.label };
                });
                return {
                  removeIrrelevantConditions: chartStatus === 'success',
                  columnOptions: metricColumn,
                  verboseMap,
                };
              },
            },
          },
        ],
      ],
    },
  ],
  formDataOverrides: formData => {
    const groupbyColumns = getStandardizedControls().controls.columns.filter(
      col => !ensureIsArray(formData.groupbyRows).includes(col),
    );
    getStandardizedControls().controls.columns =
      getStandardizedControls().controls.columns.filter(
        col => !groupbyColumns.includes(col),
      );
    return {
      ...formData,
      metrics: getStandardizedControls().popAllMetrics(),
      groupbyColumns,
    };
  },
};

export default config;
