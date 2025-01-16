import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, message, Card, Select } from 'antd';
import { db, collection, getDocs } from '../firebase-config';
import { UserOutlined, CheckCircleOutlined, TeamOutlined, ClockCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import '../styles/Boardpassers.css';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, Title, Tooltip, Legend, ArcElement);

const getCardColor = (status) => {
  switch (status) {
    case 'graduated':
      return 'rgba(76, 175, 80, 0.3)';
    case 'boardPassers':
      return 'rgba(33, 150, 243, 0.3)';
    case 'freshmen':
      return 'rgba(255, 152, 0, 0.3)';
    case 'continuing':
      return 'rgba(255, 87, 34, 0.3)';
    case 'graduating':
      return 'rgba(156, 39, 176, 0.3)';
    default:
      return 'rgba(247, 247, 247, 0.8)';
  }
};

const Home = () => {
  const [firestoreData, setFirestoreData] = useState([]);
  const [acadData, setAcadData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [boardPassersCount, setBoardPassersCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [continuingCount, setContinuingCount] = useState(0);
  const [freshmenCount, setFreshmenCount] = useState(0);
  const [graduatingCount, setGraduatingCount] = useState(0);
  const [graduatedCount, setGraduatedCount] = useState(0);

  const [selectedFilter, setSelectedFilter] = useState('all'); // State for the selected filter

  // Fetch data from databaseboard
  const fetchFirestoreData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'databaseboard'));
      const firestoreDataArr = [];
      querySnapshot.forEach((doc) => {
        firestoreDataArr.push(...doc.data().data);
      });
      setFirestoreData(firestoreDataArr);

      const boardPassers = firestoreDataArr.filter(item => item.STATUS === 'PASSED');
      setBoardPassersCount(boardPassers.length);
      setTotalUsersCount(firestoreDataArr.length);
    } catch (error) {
      message.error('Error fetching Firestore data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data from databaseacad
  const fetchDatabaseAcadData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'databaseacad'));
      const acadDataArr = [];
      querySnapshot.forEach((doc) => {
        acadDataArr.push(...doc.data().data);
      });
      setAcadData(acadDataArr);

      const continuingStudents = acadDataArr.filter(item => item.status === 'continuing');
      setContinuingCount(continuingStudents.length);

      const freshmenStudents = acadDataArr.filter(item => item.status === 'freshman');
      setFreshmenCount(freshmenStudents.length);

      const graduatingStudents = acadDataArr.filter(item => item.status === 'graduating');
      setGraduatingCount(graduatingStudents.length);

      const graduatedStudents = acadDataArr.filter(item => item.status === 'graduated');
      setGraduatedCount(graduatedStudents.length);
    } catch (error) {
      message.error('Error fetching DatabaseAcad data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirestoreData();
    fetchDatabaseAcadData();
  }, []);

  // Update the graphs based on the selected filter
  const handleFilterChange = (value) => {
    setSelectedFilter(value);
  };

  const filteredData = () => {
    if (selectedFilter === 'all') {
      return {
        freshmen: freshmenCount,
        continuing: continuingCount,
        graduating: graduatingCount,
        graduated: graduatedCount,
        boardPassers: boardPassersCount
      };
    }

    const filterMap = {
      graduated: graduatedCount,
      boardPassers: totalUsersCount,  // Assuming this is the total count of board passers.
      freshmen: freshmenCount,
      continuing: continuingCount,
      graduating: graduatingCount
    };

    return {
      [selectedFilter]: filterMap[selectedFilter]
    };
  };

  const chartData = {
    labels: ['Freshmen', 'Continuing', 'Graduating', 'Graduated'],
    datasets: [
      {
        label: 'Student Status Distribution',
        data: [filteredData().freshmen || 0, filteredData().continuing || 0, filteredData().graduating || 0, filteredData().graduated || 0],
        backgroundColor: ['rgba(255, 152, 0, 0.3)', 'rgba(255, 87, 34, 0.3)', 'rgba(156, 39, 176, 0.3)', 'rgba(76, 175, 80, 0.3)'],
      },
    ],
  };

const barData = {
  labels: ['Graduated', 'Board Passers', 'Freshmen', 'Continuing', 'Graduating'],
  datasets: [
    {
      label: 'Student Status Counts',
      data: [
        filteredData().graduated || 0, // Graduated count
        totalUsersCount,// Board Passers count (directly using the state variable)
        filteredData().freshmen || 0, // Freshmen count
        filteredData().continuing || 0, // Continuing count
        filteredData().graduating || 0, // Graduating count
      ],
      backgroundColor: 'rgba(33, 150, 243, 0.3)',
      borderColor: 'rgba(33, 150, 243, 1)',
      borderWidth: 1,
    },
  ],
};


  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Student Analytics</h2>

      {/* Filter Dropdown */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Select
          value={selectedFilter}
          onChange={handleFilterChange}
          style={{ width: 200 }}
        >
          <Select.Option value="all">All</Select.Option>
          <Select.Option value="graduated">Graduated</Select.Option>
          <Select.Option value="boardPassers">Board Passers</Select.Option>
          <Select.Option value="freshmen">Freshmen</Select.Option>
          <Select.Option value="continuing">Continuing</Select.Option>
          <Select.Option value="graduating">Graduating</Select.Option>
        </Select>
      </div>

      {/* Card Section */}
      <Row gutter={16} style={{ marginBottom: '30px' }} justify="center">
        <Col span={4}>
          <Card
            title={<div><UserOutlined /> Graduate</div>}
            bordered={false}
            style={{ backgroundColor: getCardColor('graduated') }}
            hoverable
          >
            {graduatedCount}
          </Card>
        </Col>
        <Col span={4}>
          <Card
            title={<div><CheckCircleOutlined /> Board Passers</div>}
            bordered={false}
            style={{ backgroundColor: getCardColor('boardPassers') }}
            hoverable
          >
            {totalUsersCount}
          </Card>
        </Col>
        <Col span={4}>
          <Card
            title={<div><TeamOutlined /> Freshmen</div>}
            bordered={false}
            style={{ backgroundColor: getCardColor('freshmen') }}
            hoverable
          >
            {freshmenCount}
          </Card>
        </Col>
        <Col span={4}>
          <Card
            title={<div><ClockCircleOutlined /> Continuing</div>}
            bordered={false}
            style={{ backgroundColor: getCardColor('continuing') }}
            hoverable
          >
            {continuingCount}
          </Card>
        </Col>
        <Col span={4}>
          <Card
            title={<div><UserAddOutlined /> Graduating</div>}
            bordered={false}
            style={{ backgroundColor: getCardColor('graduating') }}
            hoverable
          >
            {graduatingCount}
          </Card>
        </Col>
      </Row>

      {/* Graphs Section */}
      <Row gutter={16} justify="center">
        <Col span={10}>
          <h3 style={{ textAlign: 'center' }}>Student Status Distribution (Pie Chart)</h3>
          <div style={{ width: '100%', height: '300px', display: 'flex', justifyContent: 'center' }}>
            <Pie data={chartData} />
          </div>
        </Col>
        <Col span={10}>
          <h3 style={{ textAlign: 'center' }}>Student Status Counts (Bar Chart)</h3>
          <div style={{ width: '100%', height: '300px', display: 'flex', justifyContent: 'center' }}>
            <Bar data={barData} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
