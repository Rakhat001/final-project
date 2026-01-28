'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, message, Card, Typography, Upload } from 'antd';
import { useMutation } from '@apollo/client/react';
import { CREATE_EVENT_MUTATION } from '@/lib/graphql/mutations';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { UploadFile, UploadProps } from 'antd';

const { Title, Text } = Typography;

export default function CreateEventPage() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const [createEvent, { loading, error }] = useMutation<any>(CREATE_EVENT_MUTATION);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadInProgress = React.useRef(false);

  useEffect(() => {
    if (isInitialized && !user) {
        message.warning('Please login to create an event');
        router.push('/');
    }
  }, [user, isInitialized, router]);

  const handleUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const uploadProps: UploadProps = {
    beforeUpload: async (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Image must be smaller than 10MB!');
        return Upload.LIST_IGNORE;
      }

      if (uploadInProgress.current) {
        return Upload.LIST_IGNORE;
      }

      uploadInProgress.current = true;
      setUploading(true);

      try {
        const url = await handleUpload(file);
        setImageUrl(url);
        setFileList([{
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: url,
        }]);
        message.success('Image uploaded successfully!');
      } catch (err: any) {
        console.error('Upload error in component:', err);
        message.error(err.message || 'Failed to upload image');
        setFileList([]);
        setImageUrl('');
      } finally {
        setUploading(false);
        uploadInProgress.current = false;
      }

      return false;
    },
    fileList,
    onRemove: () => {
      setFileList([]);
      setImageUrl('');
      uploadInProgress.current = false;
    },
    listType: 'picture-card',
    maxCount: 1,
  };

  const onFinish = async (values: any) => {
    try {

      const { data } = await createEvent({
        variables: {
          createEventInput: {
            title: values.title,
            description: values.description,
            date: values.date.toISOString(),
            img: imageUrl || undefined,
          },
        },
      });

      if (data?.createEvent) {
        message.success('Event created successfully!');
        router.push('/');
      }
    } catch (err: any) {
      console.error('Event creation error:', err);
      message.error(err.message || 'Failed to create event. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mb-4">
            <ArrowLeftOutlined /> Back to Home
        </Link>
        <Title level={1} className="!mb-2">Create New Event</Title>
        <Text type="secondary">Share your experience with the world.</Text>
      </div>

      <Card variant="borderless" className="shadow-lg rounded-2xl overflow-hidden">
        <Form
          layout="vertical"
          onFinish={onFinish}
          size="large"
          className="p-4"
        >
          <Form.Item
            label="Event Title"
            name="title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="e.g. Summer Music Festival" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea rows={6} placeholder="Describe what makes this event special..." />
          </Form.Item>

          <Form.Item
            label="Event Date"
            name="date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker showTime className="w-full" />
          </Form.Item>

          <Form.Item label="Event Image" className="mb-6">
            <Upload {...uploadProps}>
              {fileList.length === 0 && (
                <div className="flex flex-col items-center justify-center">
                  <PlusOutlined className="text-2xl mb-2" />
                  <div className="text-sm">Upload Image</div>
                </div>
              )}
            </Upload>
            {uploading && <div className="text-sm text-muted-foreground mt-2">Uploading...</div>}
          </Form.Item>

          <Form.Item className="mb-0 mt-8">
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading || uploading} 
              disabled={uploading}
              size="large" 
              className="h-12 text-lg font-medium bg-primary hover:bg-indigo-600 border-none"
            >
              Publish Event
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
