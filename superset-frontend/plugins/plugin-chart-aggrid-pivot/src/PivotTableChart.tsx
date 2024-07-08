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

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise/styles/ag-grid.css';
import 'ag-grid-enterprise/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';
import { ColDef, SizeColumnsToFitGridStrategy } from 'ag-grid-enterprise';
import {
  styled,
  isSavedMetric,
  CurrencyFormatter,
  getNumberFormatter,
  isDefined,
} from '@superset-ui/core';

const autoSizeStrategy = {
  type: 'fitGridWidth',
};

const pagination = true;
const paginationPageSize = 100;
const paginationPageSizeSelector = [100, 200, 500];

const getCellStyle = (metricName, props, params) => {
  let styles = {};
  if (
    Array.isArray(props.metricColorFormatters) &&
    props.metricColorFormatters.length > 0
  ) {
    const formatter = props.metricColorFormatters.find(
      colorFormatter => colorFormatter.column === metricName,
    );
    if (formatter) {
      styles = {
        ...styles,
        backgroundColor: formatter.getColorFromValue(params.value),
      };
    }
  }
  return styles;
};

const StyledContainer = styled.div`
  text-align: left;
  & .ag-column-drop-cell-button {
    display: none;
  }
`;

const defaultColDefs = {
  filter: true,
  aggFunc: 'sum',
  flex: 1,
};

const TableChart = (props: any) => {
  const defaultFormatter = useMemo(
    () =>
      props.currencyFormat?.symbol
        ? new CurrencyFormatter({
            currency: props.currencyFormat,
            d3Format: props.valueFormat,
          })
        : getNumberFormatter(props.valueFormat),
    [props.valueFormat, props.currencyFormat],
  );
  const rowData = useMemo(() => props.data, [props.data]);
  const colDefs = useMemo<ColDef[]>(
    () => [
      ...props.groupbyRows.map(rowName => ({
        field: rowName,
        headerName: props.verboseMap[rowName],
        rowGroup: true,
        enableRowGroup: true,
        aggFunc: null,
      })),
      ...props.groupbyColumns.map(colName => ({
        field: colName,
        headerName: props.verboseMap[colName],
        pivot: true,
        aggFunc: null,
      })),
      ...props.metrics.map(metric => ({
        field: isSavedMetric(metric) ? metric : metric.label,
        headerName: isSavedMetric(metric)
          ? props.verboseMap[metric]
          : metric.label,
        cellStyle: params =>
          getCellStyle(
            isSavedMetric(metric) ? metric : metric.label,
            props,
            params,
          ),
        aggFunc: 'sum',
        valueFormatter: params =>
          !isDefined(params.value) ? '' : defaultFormatter(params.value),
      })),
    ],
    [defaultFormatter, props],
  );

  return (
    <StyledContainer
      className="ag-theme-balham"
      style={{ height: props.height, width: props.width }}
    >
      <AgGridReact
        defaultColDef={defaultColDefs}
        rowData={rowData}
        columnDefs={colDefs}
        autoSizeStrategy={autoSizeStrategy as SizeColumnsToFitGridStrategy}
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        paginationPageSizeSelector={paginationPageSizeSelector}
        // pivotColumnGroupTotals={'before'}
        // pivotRowTotals={'before'}
        pivotMode
        pivotPanelShow="always"
        rowGroupPanelShow="always"
        grandTotalRow="bottom"
      />
    </StyledContainer>
  );
};

export default TableChart;
