# Grafana Opsramp Metrics Datasource Plugin
The Grafana Opsramp Datasource allows you to visualize metrics from the OpsRamp monitoring service in Grafana.

#### Usage
To visualize OpsRamp metrics the following are the configurable sections.

### Configuration:
![Configuration](https://opsramp-grafana-plugin.s3.us-east-2.amazonaws.com/opsramp-metric-plugin/images/configuration.png)

 - MetricsURL: Opsramp metrics URL. ex https://app.opsramp.net
 - Client UniqueId: Organization Unique ID for which we are configuring dashboards
 - Client API Key : OAuth API Key of target organization
 - Client API Secret : OAuthClient Secret Key of target organization
 
### Query Editor
![QueryEditor](https://opsramp-grafana-plugin.s3.us-east-2.amazonaws.com/opsramp-metric-plugin/images/queryeditor.png)

#### Options:

 - **Metrics:** Shows available metrics to build query.
 - **Query:** Supports all PromQL variables and syntax.
 - **Min Step:** Step defines the interval between neighbourhood data points and supported formats are 30s, 1m, 1h, 1d ..etc.
 - **Resolution:** Resolution parameter multiplies the given interval with constant factor selected from the given range [1, 10] where 1/10 gives the data with step interval equal to 10*Minstep.
 - **Legend:** Legend is useful to view particular tag values from all tag values for each metric instance in the query. By default it shows all tag values and to customize we use {{tagName}} format.
 - **Format:** Timeseries / Table / HeatMap
		*Timeseries* is default one which shows data in either in line or area visualization.
		*Table* format reformats data to show all the tag names against tag          values in the table, by default we get only time and values in table.
		*Heatmap* format reformats data to show the delta between instances in heat maps so that we even see negative values in the heat map buckets which overwrites the default heap map visualization.
 - **Instant:** Useful when we wanted to see latest data in required visualization.
 
#### Sample dashboard
![SampleDashboard](https://opsramp-grafana-plugin.s3.us-east-2.amazonaws.com/opsramp-metric-plugin/images/dashboard.png)

## Deployment in Docker
yarn install
yarn build
docker run -d -p 3000:3000 -v "$(pwd)"/grafana-starter-datasource:/var/lib/grafana/plugins --name=grafana grafana/grafana:7.5.3

