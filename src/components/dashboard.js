import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, message, Row, Col, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

const Dashboard = () => {
    const [items, setItems] = useState([]);
    const [userItems, setUserItems] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [search, setSearch] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [order, setOrder] = useState('');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchItems();
        fetchUserItems();
    }, [search, minPrice, maxPrice, sortBy, order]);

    const fetchItems = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/items', {
                params: { search, minPrice, maxPrice, sortBy, order }
            });
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
                params: { userId }
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
            fetchItems(); // Fetch all items after updating or adding a product
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
        <div style={{ margin: '24px 48px 24px 48px' }}>
            <Button type="primary" onClick={handleAdd} style={{ marginBottom: '20px' }}>
                Create Item
            </Button>
            <div style={{ marginBottom: '20px' }}>
                <Input
                    placeholder="Search items"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '200px', marginRight: '10px' }}
                />
                <Input
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    style={{ width: '100px', marginRight: '10px' }}
                />
                <Input
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={{ width: '100px', marginRight: '10px' }}
                />
                <Select
                    placeholder="Sort By"
                    value={sortBy}
                    onChange={(value) => setSortBy(value)}
                    style={{ width: '120px', marginRight: '10px' }}
                >
                    <Option value="price">Price</Option>
                    <Option value="createdAt">Date Added</Option>
                </Select>
                <Select
                    placeholder="Order"
                    value={order}
                    onChange={(value) => setOrder(value)}
                    style={{ width: '120px', marginRight: '10px' }}
                >
                    <Option value="asc">Ascending</Option>
                    <Option value="desc">Descending</Option>
                </Select>
            </div>
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
                                title={`${item.name} (ID: ${item.id})`} // Display item ID in the title
                                description={
                                    <>
                                        <p>{item.description}</p>
                                        <p>Price: ${item.price}</p>
                                        <p>Date Added: {new Date(item.createdAt).toLocaleDateString()}</p>
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
                                title={`${item.name} (ID: ${item.id})`} // Display item ID in the title
                                description={
                                    <>
                                        <p>{item.description}</p>
                                        <p>Price: ${item.price}</p>
                                        <p>Date Added: {new Date(item.createdAt).toLocaleDateString()}</p>
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
