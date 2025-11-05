import React from 'react';
import {
  Card,
  Title,
  Text,
  Grid,
  Col,
  Metric,
  AreaChart,
  DonutChart,
  BarList,
} from '@tremor/react';

const Dashboard: React.FC = () => {
  const chartdata = [
    { date: "Jan 23", Revenue: 2890, Profit: 2400 },
    { date: "Feb 23", Revenue: 1890, Profit: 1398 },
    { date: "Mar 23", Revenue: 3890, Profit: 2980 },
    { date: "Apr 23", Revenue: 4890, Profit: 3908 },
    { date: "May 23", Revenue: 3890, Profit: 3800 },
    { date: "Jun 23", Revenue: 2890, Profit: 2800 },
  ];

  const cities = [
    { name: "New York", value: 890 },
    { name: "London", value: 680 },
    { name: "Tokyo", value: 450 },
    { name: "Paris", value: 340 },
    { name: "Berlin", value: 230 },
  ];

  const donutData = [
    { name: "Product A", sales: 9800 },
    { name: "Product B", sales: 4567 },
    { name: "Product C", sales: 3908 },
    { name: "Product D", sales: 2400 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title>Dashboard</Title>
        <Text>Welcome back! Here's an overview of your metrics.</Text>
      </div>

      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Text>Revenue</Text>
          <Metric>$ 34,743</Metric>
        </Card>
        <Card decoration="top" decorationColor="green">
          <Text>Profit</Text>
          <Metric>$ 12,426</Metric>
        </Card>
        <Card decoration="top" decorationColor="yellow">
          <Text>Customers</Text>
          <Metric>2,543</Metric>
        </Card>
        <Card decoration="top" decorationColor="purple">
          <Text>Active Users</Text>
          <Metric>1,429</Metric>
        </Card>
      </Grid>

      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Col numColSpan={1} numColSpanLg={2}>
          <Card>
            <Title>Revenue & Profit Overview</Title>
            <AreaChart
              className="h-72 mt-4"
              data={chartdata}
              index="date"
              categories={["Revenue", "Profit"]}
              colors={["blue", "green"]}
            />
          </Card>
        </Col>
      </Grid>

      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Top Cities</Title>
          <BarList data={cities} className="mt-4" />
        </Card>
        <Card>
          <Title>Product Distribution</Title>
          <DonutChart
            className="h-60 mt-4"
            data={donutData}
            category="sales"
            index="name"
            colors={["blue", "cyan", "indigo", "violet"]}
          />
        </Card>
      </Grid>
    </div>
  );
};

export default Dashboard;