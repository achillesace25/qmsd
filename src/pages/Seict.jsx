import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Tabs, Table, Progress, Spin } from "antd";
import { UserOutlined, BarChartOutlined, DashboardOutlined, TrophyOutlined } from "@ant-design/icons"; // Added TrophyOutlined icon
import { db, collection, getDocs } from "../firebase-config"; // Import Firestore functions

const { TabPane } = Tabs;

const Seict = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data for KPIs
  const kpiData = [
    { title: "Total Students", value: 1200, icon: <UserOutlined />, color: "#1890ff" },
    { title: "Average Performance", value: "78%", icon: <DashboardOutlined />, color: "#52c41a" },
    { title: "Target Completion", value: "85%", icon: <BarChartOutlined />, color: "#faad14" },
    { title: "Total Graduates", value: 500, icon: <UserOutlined />, color: "#ff4d4f" }, // New card for total graduates
    { title: "Total Board Passers", value: 320, icon: <TrophyOutlined />, color: "#ffbf00" }, // New card for board passers
  ];

  // Mock data for chart - replaced with a basic bar chart using Progress
  const chartData = [
    { year: "2020", performance: 70 },
    { year: "2021", performance: 75 },
    { year: "2022", performance: 80 },
    { year: "2023", performance: 85 },
  ];

  const tableColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Year", dataIndex: "year", key: "year" },
    { title: "Performance", dataIndex: "performance", key: "performance", render: (text) => `${text}%` },
    { title: "Attendance", dataIndex: "attendance", key: "attendance" },
  ];

  // Fetching data from Firestore (mock data for now)
  useEffect(() => {
    const fetchTableData = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "students"));
        const data = querySnapshot.docs.map(doc => doc.data());
        setTableData(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTableData();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <h2>SEICT Department Dashboard</h2>

      {/* KPI Cards */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        {kpiData.map((item) => (
          <Col span={8} key={item.title}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.icon}
                valueStyle={{ color: item.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tabs for Analytics */}
      <Tabs defaultActiveKey="1">
        <TabPane tab="Analytics" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <Card>
                <h3>Performance Trends</h3>
                {chartData.map((data) => (
                  <Row key={data.year} style={{ marginBottom: 8 }}>
                    <Col span={24}>
                      <Progress
                        percent={data.performance}
                        status="active"
                        strokeColor="#1890ff"
                        format={() => `${data.year}: ${data.performance}%`}
                      />
                    </Col>
                  </Row>
                ))}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Statistics" key="2">
          <Card>
            <h3>Student Statistics</h3>
            <Spin spinning={loading}>
              <Table dataSource={tableData} columns={tableColumns} rowKey="name" />
            </Spin>
          </Card>
        </TabPane>

        <TabPane tab="Performance" key="3">
          <Row gutter={16}>
            <Col span={12}>
              <Card>
                <h3>Target Completion</h3>
                <Progress percent={85} status="active" />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <h3>Average Performance</h3>
                <Progress type="dashboard" percent={78} />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Seict;
