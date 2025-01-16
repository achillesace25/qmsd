import React, { useState, useEffect } from 'react';
import { Table, Row, Col, Spin, message, Select } from 'antd';
import { db, collection, getDocs } from '../firebase-config';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../styles/Boardpassers.css';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Report = () => {
    const [firestoreData, setFirestoreData] = useState([]);
    const [firestorePagination, setFirestorePagination] = useState({ current: 1, pageSize: 10 });
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [monthChartData, setMonthChartData] = useState([]);
    const [trendMessage, setTrendMessage] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({
        course: [],
        department: [],
        year: [],
        month: [], // New filter for months
    });
    const [uniqueDepartments, setUniqueDepartments] = useState([]); // Store unique departments

    const fetchFirestoreData = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'databaseboard'));
            const firestoreDataArr = [];
            querySnapshot.forEach((doc) => {
                firestoreDataArr.push(...doc.data().data);
            });
            setFirestoreData(firestoreDataArr);

            // Extract unique departments once and store them in state
            const departments = [...new Set(firestoreDataArr.map(item => item.Department))];
            setUniqueDepartments(departments);
        } catch (error) {
            message.error('Error fetching Firestore data');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFirestoreData();
    }, []);

    useEffect(() => {
        if (firestoreData.length > 0) {
            prepareChartData();
            prepareMonthChartData(); // Add month-based chart preparation
        }
    }, [firestoreData, selectedFilters]);

    const prepareChartData = () => {
        const yearCourseData = {};
        const courseNames = new Set();

        firestoreData.forEach(item => {
            const { Year, Course } = item;
            if (Year && Course && (selectedFilters.year.length === 0 || selectedFilters.year.includes(Year))) {
                courseNames.add(Course);
                if (!yearCourseData[Year]) {
                    yearCourseData[Year] = {};
                }
                if (yearCourseData[Year][Course]) {
                    yearCourseData[Year][Course]++; // Increment count for this course and year
                } else {
                    yearCourseData[Year][Course] = 1; // Initialize count for this course and year
                }
            }
        });

        const schoolYears = Object.keys(yearCourseData);

        const datasets = [];

        schoolYears.forEach(year => {
            const yearData = yearCourseData[year];
            Object.keys(yearData).forEach(course => {
                if (!datasets.find((dataset) => dataset.label === course)) {
                    datasets.push({
                        label: course,
                        data: [],
                        fill: false,
                        borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                        tension: 0.1,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                    });
                }

                const dataset = datasets.find((dataset) => dataset.label === course);
                dataset.data.push(yearData[course]);
            });
        });

        const chartConfig = {
            labels: schoolYears.filter(year => selectedFilters.year.includes(year) || selectedFilters.year.length === 0),
            datasets: datasets.filter(dataset => selectedFilters.course.includes(dataset.label) || selectedFilters.course.length === 0),
        };

        setChartData(chartConfig);
    };

    // Prepare Month-based data for the new chart
    const prepareMonthChartData = () => {
        const monthData = {};
        const months = new Set();

        firestoreData.forEach(item => {
            const { Month, Course, Year } = item;
            if (Month && Course && Year && (selectedFilters.month.length === 0 || selectedFilters.month.includes(Month)) && (selectedFilters.year.length === 0 || selectedFilters.year.includes(Year)) && (selectedFilters.course.length === 0 || selectedFilters.course.includes(Course))) {
                months.add(Month);
                if (!monthData[Month]) {
                    monthData[Month] = {};
                }
                if (monthData[Month][Course]) {
                    monthData[Month][Course]++; // Increment count for this course and month
                } else {
                    monthData[Month][Course] = 1; // Initialize count for this course and month
                }
            }
        });

        const datasets = [];

        Object.keys(monthData).forEach(month => {
            const monthCourseData = monthData[month];
            Object.keys(monthCourseData).forEach(course => {
                if (!datasets.find((dataset) => dataset.label === course)) {
                    datasets.push({
                        label: course,
                        data: [],
                        fill: false,
                        borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                        tension: 0.1,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                    });
                }

                const dataset = datasets.find((dataset) => dataset.label === course);
                dataset.data.push(monthCourseData[course]);
            });
        });

        const monthChartConfig = {
            labels: [...months].sort(), // Sort months alphabetically or numerically
            datasets: datasets.filter(dataset => selectedFilters.course.includes(dataset.label) || selectedFilters.course.length === 0),
        };

        setMonthChartData(monthChartConfig);
    };

    // Filter Firestore data based on selected filters (for the table and chart)
    const filteredFirestoreData = firestoreData.filter(item => {
        const { Course, Department, Year, Month } = item;

        // Department filter: include items if the department matches the selected ones
        const departmentMatch = selectedFilters.department.length
            ? selectedFilters.department.includes(Department)
            : true;

        // Course filter: only apply if a course is selected
        const courseMatch = selectedFilters.course.length
            ? selectedFilters.course.includes(Course)
            : true;

        // Year filter: only apply if a year is selected
        const yearMatch = selectedFilters.year.length
            ? selectedFilters.year.includes(Year)
            : true;

        // Month filter: only apply if a month is selected
        const monthMatch = selectedFilters.month.length
            ? selectedFilters.month.includes(Month)
            : true;

        return departmentMatch && courseMatch && yearMatch && monthMatch;
    });

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setSelectedFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleFirestorePaginationChange = (page, pageSize) => {
        setFirestorePagination({
            current: page,
            pageSize,
        });
    };

    // Paginate the data based on current page and pageSize
    const paginatedFirestoreData = filteredFirestoreData
        ? filteredFirestoreData.slice((firestorePagination.current - 1) * firestorePagination.pageSize, firestorePagination.current * firestorePagination.pageSize)
        : [];

    const firestoreColumns = [
        { title: 'Firstname', dataIndex: 'Firstname', key: 'Firstname' },
        { title: 'Lastname', dataIndex: 'Lastname', key: 'Lastname' },
        { title: 'Middleinitial', dataIndex: 'Middleinitial', key: 'Middleinitial' }, // Show Middleinitial
        { title: 'Course', dataIndex: 'Course', key: 'Course' },
        { title: 'Department', dataIndex: 'Department', key: 'Department' },
        { title: 'Year', dataIndex: 'Year', key: 'Year' },
        { title: 'Status', dataIndex: 'Status', key: 'Status' },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h2>Board Passers Data</h2>

            {/* Filter Dropdowns */}
            <Row gutter={16} style={{ marginBottom: '20px' }}>
                <Col span={6}>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select courses"
                        value={selectedFilters.course}
                        onChange={(value) => handleFilterChange('course', value)}
                    >
                        {[...new Set(firestoreData.map(item => item.Course))].map(course => (
                            <Select.Option key={course} value={course}>
                                {course}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col span={6}>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select departments"
                        value={selectedFilters.department}
                        onChange={(value) => handleFilterChange('department', value)}
                    >
                        {[...new Set(firestoreData.map(item => item.Department.trim().toLowerCase()))] // Normalize department names
                            .map((department) => {
                                const originalDepartment = firestoreData.find(item => item.Department.trim().toLowerCase() === department)?.Department || department;
                                return (
                                    <Select.Option key={department} value={department}>
                                        {originalDepartment}
                                    </Select.Option>
                                );
                            })}
                    </Select>
                </Col>
                <Col span={6}>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select year"
                        value={selectedFilters.year}
                        onChange={(value) => handleFilterChange('year', value)}
                    >
                        {[...new Set(firestoreData.map(item => item.Year))].map(year => (
                            <Select.Option key={year} value={year}>
                                {year}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col span={6}>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select month"
                        value={selectedFilters.month}
                        onChange={(value) => handleFilterChange('month', value)}
                    >
                        {[...new Set(firestoreData.map(item => item.Month))].map(month => (
                            <Select.Option key={month} value={month}>
                                {month}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
            </Row>

            {/* Side-by-Side Line Graphs */}
            <Row gutter={16} style={{ marginTop: '20px' }}>
                <Col span={12}>
                    <h3>Year and Course Comparison Chart:</h3>
                    {chartData.labels ? (
                        <div style={{ width: '100%', height: 400 }}>
                            <Line
                                data={chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'Course Passing Rate per Year',
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function (tooltipItem) {
                                                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw} passers`;
                                                },
                                            },
                                        },
                                    },
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Year',
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Number of Passers',
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <Spin />
                    )}
                </Col>
                <Col span={12}>
                    <h3>Monthly Course Comparison Chart:</h3>
                    {monthChartData.labels ? (
                        <div style={{ width: '100%', height: 400 }}>
                            <Line
                                data={monthChartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'Course Passing Rate per Month',
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function (tooltipItem) {
                                                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw} passers`;
                                                },
                                            },
                                        },
                                    },
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Month',
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Number of Passers',
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <Spin />
                    )}
                </Col>
            </Row>

            {/* Firestore Data Table */}
            <h3>Filtered Data Table:</h3>
            <Table
                columns={firestoreColumns}
                dataSource={paginatedFirestoreData}
                pagination={{
                    current: firestorePagination.current,
                    pageSize: firestorePagination.pageSize,
                    onChange: handleFirestorePaginationChange,
                    total: filteredFirestoreData.length, // Ensure total data count for pagination
                }}
                rowKey="studentNumber" // Use a unique field for row keys
                loading={loading}
            />
        </div>
    );
};

export default Report;
