import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase-config'; // Adjust the path if necessary
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Sign in with Firebase Authentication
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success('Login successful!');
      localStorage.setItem('user', values.email); // Store user info or token to persist session
      navigate('/home'); // Redirect to home page after login
    } catch (error) {
      message.error('Login failed! Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Login</Title>

      <Form layout="vertical" onFinish={onFinish} initialValues={{ email: '', password: '' }}>
        {/* Email Field */}
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please input your email!' }]}>
          <Input prefix={<UserOutlined />} placeholder="Enter your email" />
        </Form.Item>

        {/* Password Field */}
        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Login</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
