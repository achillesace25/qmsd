import React, { useState } from 'react';
import { Form, Input, Button, Select, Typography, message, Table } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { auth, db, collection, addDoc } from '../firebase-config'; // Adjust the import based on your file structure
import { createUserWithEmailAndPassword } from 'firebase/auth';

const { Option } = Select;
const { Title } = Typography;

const departments = ["SEICT", "SCJ", "ITE", "SAM", "SLAS", "SOD", "SBM", "SEO", "THS", "SHS"];
const positionData = {
  SEICT: ["Department Chair", "Dean"],
  SCJ: ["Department Chair", "Dean"],
  ITE: ["Department Chair", "Dean"],
  SAM: ["Department Chair", "Dean"],
  SLAS: ["Department Chair", "Dean"],
  SOD: ["Department Chair", "Dean"],
  SBM: ["Department Chair", "Dean"],
  SEO: ["Department Chair", "Dean"],
  THS: ["Department Chair", "Dean"],
  SHS: ["Department Chair", "Dean"]
};

const Account = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(departments[0]); // Set default department
  const [selectedPosition, setSelectedPosition] = useState(positionData[departments[0]][0]); // Set default position based on department

  // Handle department change
  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    setSelectedPosition(positionData[value][0]); // Set default position when department changes
  };

  // Handle position change
  const handlePositionChange = (value) => {
    setSelectedPosition(value);
  };

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    console.log("Form Values: ", values);

    // Create user in Firebase Authentication
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      // Save the account details in Firestore
      await addDoc(collection(db, "accounts"), {
        name: values.name,
        email: values.email,
        department: values.department,
        position: values.position,
        uid: user.uid,  // Save Firebase UID to link the account
      });

      setLoading(false);
      message.success("Account created successfully!");

      // Add new account to the list
      const newAccount = {
        name: values.name,
        email: values.email,
        department: values.department,
        position: values.position,
      };
      setAccounts([...accounts, newAccount]);
    } catch (error) {
      setLoading(false);
      message.error("Account creation failed. Please try again.");
      console.error("Error creating account: ", error);
    }
  };

  // Table Columns
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Position', dataIndex: 'position', key: 'position' },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Title level={2}>Create New Account</Title>

      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          department: departments[0], // Set default department
          position: positionData[departments[0]][0], // Set default position based on department
        }}
      >
        {/* Name Field */}
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please input your full name!' }]} >
          <Input prefix={<UserOutlined />} placeholder="Enter your name" />
        </Form.Item>

        {/* Email Field */}
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]} >
          <Input prefix={<MailOutlined />} placeholder="Enter your email" />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password!' }]} >
          <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
        </Form.Item>

        {/* Department Selection */}
        <Form.Item
          name="department"
          label="Select Department"
          rules={[{ required: true, message: 'Please select a department!' }]} >
          <Select placeholder="Select department" onChange={handleDepartmentChange}>
            {departments.map((dept) => (
              <Option key={dept} value={dept}>{dept}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* Position Selection */}
        <Form.Item
          name="position"
          label="Select Position"
          rules={[{ required: true, message: 'Please select a position!' }]} >
          <Select
            placeholder="Select position"
            value={selectedPosition}
            onChange={handlePositionChange}
          >
            {positionData[selectedDepartment].map((position) => (
              <Option key={position} value={position}>
                {position}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Create Account
          </Button>
        </Form.Item>
      </Form>

      {/* Table for existing accounts */}
      <Title level={3} style={{ marginTop: '40px' }}>Account List</Title>
      <Table
        dataSource={accounts}
        columns={columns}
        rowKey="email" // Use email as a unique key for the row
        pagination={{ pageSize: 5 }} // Limit number of rows per page
      />
    </div>
  );
};

export default Account;
