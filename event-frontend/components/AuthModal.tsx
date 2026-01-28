'use client';

import React, { useState } from 'react';
import { Modal, Tabs, Form, Input, Button, message, Alert } from 'antd';
import { useMutation } from '@apollo/client/react';
import { LOGIN_MUTATION, SIGNUP_MUTATION } from '@/lib/graphql/mutations';
import { useAuth } from '@/context/AuthContext';
import { LoginResponse, SignupResponse } from '@/lib/graphql/types';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const { login } = useAuth();
  const [loginFormInstance] = Form.useForm();
  const [registerFormInstance] = Form.useForm();

  const [loginMutation, { loading: loginLoading, error: loginError }] = useMutation<LoginResponse>(LOGIN_MUTATION);
  const [signupMutation, { loading: signupLoading, error: signupError }] = useMutation<SignupResponse>(SIGNUP_MUTATION);

  const handleLogin = async (values: any) => {
    try {
      const { data } = await loginMutation({
        variables: {
          loginInput: {
            email: values.email,
            password: values.password,
          },
        },
      });

      if (data?.login) {
        login(data.login.accessToken, data.login.refreshToken, data.login.user);
        message.success('Successfully logged in!');
        onLoginSuccess();
        onClose();
        loginFormInstance.resetFields();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (values: any) => {
    try {
      const { data } = await signupMutation({
        variables: {
          userInput: {
            email: values.email,
            name: values.name,
            password: values.password,
          },
        },
      });

      if (data?.signup) {
        login(data.signup.accessToken, data.signup.refreshToken, data.signup.user);
        message.success('Successfully registered!');
        onLoginSuccess();
        onClose();
        registerFormInstance.resetFields();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'login') {
      registerFormInstance.resetFields();
    } else {
      loginFormInstance.resetFields();
    }
  };

  const loginFormView = (
    <Form form={loginFormInstance} onFinish={handleLogin} layout="vertical">
      <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
        <Input.Password />
      </Form.Item>
      {loginError && <Alert description={loginError.message} type="error" showIcon className="mb-4" />}
      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loginLoading}>
          Login
        </Button>
      </Form.Item>
    </Form>
  );

  const registerFormView = (
    <Form form={registerFormInstance} onFinish={handleRegister} layout="vertical">
      <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
        <Input type="email" />
      </Form.Item>
      <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }, { min: 6, message: 'Password must be at least 6 characters' }]}>
        <Input.Password />
      </Form.Item>
      {signupError && <Alert description={signupError.message} type="error" showIcon className="mb-4" />}
      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={signupLoading}>
          Register
        </Button>
      </Form.Item>
    </Form>
  );

  const items = [
    { key: 'login', label: 'Login', children: loginFormView },
    { key: 'register', label: 'Register', children: registerFormView },
  ];

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Welcome" destroyOnHidden={true}>
      <Tabs activeKey={activeTab} onChange={onTabChange} items={items} />
    </Modal>
  );
};

export default AuthModal;
