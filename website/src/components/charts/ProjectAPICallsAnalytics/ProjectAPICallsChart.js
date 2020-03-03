import React from 'react'
import { Spin, Statistic } from 'react-saasify'
import { QueryRenderer } from '@cubejs-client/react'
import { Chart, Axis, Legend, Tooltip, Geom } from 'bizcharts'
import { format } from 'date-fns'
import { cubejsApi } from 'lib/cube'

const measureToLabel = {
  'Calls.count': 'API Calls',
  'Calls.errorCount': 'API Errors',
  'Calls.errorPercentage': 'API Error Rate',
  'Calls.averageLatency': 'Average Latency'
}

const stackedChartData = (resultSet) => {
  const data = resultSet
    .pivot()
    .map(({ xValues, yValuesArray }) =>
      yValuesArray.map(([yValues, m]) => ({
        x: resultSet.axisValuesString(
          xValues.map((v) => format(new Date(v), 'yyyy-MM-dd')),
          ', '
        ),
        color: resultSet.axisValuesString(
          yValues.map((v) => measureToLabel[v]),
          ', '
        ),
        measure: m && Number.parseFloat(m)
      }))
    )
    .reduce((a, b) => a.concat(b), [])

  return data
}

const numberRender = ({ resultSet, ...rest }) => (
  <>
    {resultSet.seriesNames().map((s) => (
      <Statistic key={s.key} value={resultSet.totalRow()[s.key]} {...rest} />
    ))}
  </>
)

const lineRender = ({ resultSet, xAxis, yAxis, geom, ...rest }) => (
  <Chart height={400} data={stackedChartData(resultSet)} forceFit {...rest}>
    <Legend
      textStyle={{
        fontFamily: 'Quicksand',
        fontSize: 18,
        fill: '#333',
        fontWeight: 'bold'
      }}
    />
    <Axis name='x' {...xAxis} />
    <Axis name='measure' {...yAxis} />
    <Tooltip crosshairs={{ type: 'y' }} />
    <Geom
      type='line'
      position='x*measure'
      size={2}
      color='color'
      shape='smooth'
      {...geom}
    />
    <Geom
      type='point'
      position='x*measure'
      size={4}
      shape='circle'
      color='color'
      style={{
        stroke: '#fff',
        lineWidth: 1
      }}
      {...geom}
    />
  </Chart>
)

const renderChart = (Component, props) => ({ resultSet, error }) =>
  (resultSet && <Component resultSet={resultSet} {...props} />) ||
  (error && error.toString()) || <Spin />

export const ProjectAPICallsChart = ({
  projectId,
  granularity = 'day',
  dateRange = 'This week',
  measures = ['Calls.count'],
  type = 'line',
  servicePath = null,
  renderProps
}) => (
  <QueryRenderer
    query={{
      measures,
      timeDimensions: [
        {
          dimension: 'Calls.date',
          granularity: type === 'number' ? undefined : granularity,
          dateRange: dateRange === 'All time' ? undefined : dateRange
        }
      ],
      dimensions: [],
      filters: [
        {
          dimension: 'Calls.project',
          operator: 'equals',
          values: [projectId]
        },
        servicePath && {
          dimension: 'Calls.service',
          operator: 'equals',
          values: [servicePath]
        }
      ].filter(Boolean)
    }}
    cubejsApi={cubejsApi}
    render={renderChart(
      type === 'line' ? lineRender : numberRender,
      renderProps
    )}
  />
)
