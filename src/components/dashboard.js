import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, message, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;

const Dashboard = () => {
    const [items, setItems] = useState([]);
    const [userItems, setUserItems] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchItems();
        fetchUserItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/items');
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const fetchUserItems = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/items/user', {
                headers: {
                    'x-auth-token': localStorage.getItem('token'),
                },
            });
            setUserItems(response.data);
        } catch (error) {
            console.error('Error fetching user items:', error);
        }
    };

    const handleAdd = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        form.setFieldsValue(item);
        setIsModalVisible(true);
    };

    const handleDelete = async (itemId) => {
        try {
            await axios.delete(`http://localhost:5000/api/items/${itemId}`, {
                headers: {
                    'x-auth-token': localStorage.getItem('token'),
                },
            });
            message.success('Item deleted successfully');
            fetchUserItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            message.error('Failed to delete item');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = { ...values };

            if (editingItem) {
                await axios.put(`http://localhost:5000/api/items/${editingItem.id}`, payload, {
                    headers: {
                        'x-auth-token': localStorage.getItem('token'),
                    },
                });
                message.success('Item updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/items', payload, {
                    headers: {
                        'x-auth-token': localStorage.getItem('token'),
                    },
                });
                message.success('Item added successfully');
            }
            fetchUserItems();
            setIsModalVisible(false);
        } catch (error) {
            console.error('Error saving item:', error);
            message.error('Failed to save item');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div>
            <Button type="primary" onClick={handleAdd} style={{ marginBottom: '20px' }}>
                Create Item
            </Button>
            <h2>Your Items</h2>
            <Row gutter={[16, 16]}>
                {userItems.map((item) => (
                    <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            cover={<img alt={item.name} src={item.image || 'https://via.placeholder.com/150'} />}
                            actions={[
                                <EditOutlined key="edit" onClick={() => handleEdit(item)} />,
                                <DeleteOutlined key="delete" onClick={() => handleDelete(item.id)} />,
                            ]}
                        >
                            <Card.Meta
                                title={item.name}
                                description={
                                    <>
                                        <p>{item.description}</p>
                                        <p>Price: ${item.price}</p>
                                    </>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
            <h2>All Items</h2>
            <Row gutter={[16, 16]}>
                {items.map((item) => (
                    <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            cover={<img alt={item.name} src={item.image || 'https://via.placeholder.com/150'} />}
                        >
                            <Card.Meta
                                title={item.name}
                                description={
                                    <>
                                        <p>{item.description}</p>
                                        <p>Price: ${item.price}</p>
                                    </>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal
                title={editingItem ? 'Edit Item' : 'Create Item'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input the name of the item!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please input the description of the item!' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please input the price of the item!' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Dashboard;
