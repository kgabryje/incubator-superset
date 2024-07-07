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

import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import {
  SizeColumnsToFitGridStrategy,
  ColDef,
  IAggFuncParams,
} from 'ag-grid-community';
import { ensureIsArray } from '@superset-ui/core';

const autoSizeStrategy = {
  type: 'fitGridWidth',
};

const pagination = true;
const paginationPageSize = 100;
const paginationPageSizeSelector = [100, 200, 500];

const TableChart = (props: any) => {
  const [rowData, setRowData] = useState(props.data);
  const [colDefs, setColDefs] = useState<ColDef[]>(
    props.columns.map(col => ({
      field: col.key,
      headerName: col.label,
      valueFormatter: p => (p.value ? col.formatter?.(p.value) : 'N/A'),
    })),
  );
  console.log(props);
  return (
    <div
      className="ag-theme-balham"
      style={{ height: props.height, width: props.width, textAlign: 'left' }}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        autoSizeStrategy={autoSizeStrategy as SizeColumnsToFitGridStrategy}
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        paginationPageSizeSelector={paginationPageSizeSelector}
        pinnedBottomRowData={props.totals ? [props.totals] : []}
        onColumnMoved={e => {
          // console.log(e);
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
    </div>
  );
};

export default TableChart;
