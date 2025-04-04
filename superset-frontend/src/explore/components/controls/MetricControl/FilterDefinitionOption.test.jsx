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
import { render, screen, cleanup } from 'spec/helpers/testing-library';
import FilterDefinitionOption from 'src/explore/components/controls/MetricControl/FilterDefinitionOption';
import { AGGREGATES } from 'src/explore/constants';
import AdhocMetric, {
  EXPRESSION_TYPES,
} from 'src/explore/components/controls/MetricControl/AdhocMetric';

// Add cleanup after each test
afterEach(async () => {
  cleanup();
  // Wait for any pending effects to complete
  await new Promise(resolve => setTimeout(resolve, 0));
});

const sumValueAdhocMetric = new AdhocMetric({
  expressionType: EXPRESSION_TYPES.SIMPLE,
  column: { type: 'VARCHAR(255)', column_name: 'source' },
  aggregate: AGGREGATES.SUM,
});

describe('FilterDefinitionOption', () => {
  it('renders a StyledColumnOption given a column', async () => {
    render(<FilterDefinitionOption option={{ column_name: 'a_column' }} />);
    await expect(screen.getByText('a_column')).toBeVisible();
  });

  it('renders a StyledColumnOption given an adhoc metric', async () => {
    render(<FilterDefinitionOption option={sumValueAdhocMetric} />);
    await expect(screen.getByText('SUM(source)')).toBeVisible();
  });

  it('renders the metric name given a saved metric', async () => {
    render(
      <FilterDefinitionOption
        option={{ saved_metric_name: 'my_custom_metric' }}
      />,
    );
    await expect(screen.getByText('my_custom_metric')).toBeVisible();
  });
});
