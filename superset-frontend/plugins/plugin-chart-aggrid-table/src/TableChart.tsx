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
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { ColDef, SizeColumnsToFitGridStrategy } from 'ag-grid-community';
import { ensureIsArray, t, styled } from '@superset-ui/core';

const autoSizeStrategy = {
  type: 'fitGridWidth',
};

const pagination = true;
const paginationPageSize = 100;
const paginationPageSizeSelector = [100, 200, 500];
const comparisonLabels = [t('Main'), '#', '△', '%'];

const getCellStyle = (col, props, params) => {
  let styles = {};
  if (col.isNumeric) {
    styles = { ...styles, textAlign: 'right' };
  }
  if (!col.isNumeric && !params.value) {
    styles = { ...styles, color: 'gray' };
  }
  if (props.columnColorFormatters) {
    const formatter = props.columnColorFormatters.find(
      colorFormatter => colorFormatter.column === col.key,
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
  const rowData = useMemo(() => props.data, [props.data]);
  const colDefs = useMemo<ColDef[]>(() => {
    if (props.isUsingTimeComparison) {
      return props.columns.reduce((acc, col) => {
        if (col.isMetric) {
          if (comparisonLabels.some(label => col.key.startsWith(`${label} `))) {
            const [label, ...rest] = col.key.split(' ');
            const group = acc.find(
              colGroup => colGroup.headerName === rest.join(' '),
            );
            const config = {
              field: col.key,
              headerName: label,
              valueFormatter: p => (p.value ? col.formatter?.(p.value) : 0),
              columnGroupShow: label === comparisonLabels[0] ? null : 'open',
              cellStyle: params => getCellStyle(col, props, params),
            };
            if (!group) {
              acc.push({
                headerName: rest.join(' '),
                openByDefault: true,
                marryChildren: true,
                children: [config],
              });
            } else {
              group.children.push(config);
            }
          }
        } else {
          acc.push({
            field: col.key,
            headerName: col.label,
            valueFormatter: p =>
              p.value ? col.formatter?.(p.value) : col.isNumeric ? 0 : 'N/A',
            cellStyle: params => getCellStyle(col, props, params),
          });
        }
        return acc;
      }, []);
    }
    return props.columns.map((col, index) => ({
      field: col.key,
      headerName: col.label,
      valueFormatter: p => (p.value ? col.formatter?.(p.value) : 'N/A'),
      cellStyle: params => getCellStyle(col, props, params),
      // pivot: index === 2,
      // rowGroup: index === 0 || index === 1,
      // aggFunc: index === 3 || index === 4 ? 'sum' : null,
    }));
  }, [props.columns]);

  console.log(props);
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
        pinnedBottomRowData={props.totals ? [props.totals] : []}
        onColumnMoved={e => {
          if (e.finished && e.toIndex) {
            const newCols = [...props.columns];
            const fromIndex = ensureIsArray(props.columns).findIndex(
              col => col.key === e.column?.getColId(),
            );
            const element = newCols[fromIndex];
            newCols.splice(fromIndex, 1);
            newCols.splice(e.toIndex, 0, element);
            props.setControlValue?.(
              'groupby',
              newCols.filter(col => !col.isMetric).map(col => col.key),
            );
          }
        }}
      />
    </StyledContainer>
  );
};

export default TableChart;
