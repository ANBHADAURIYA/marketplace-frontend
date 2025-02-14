// src/components/Transactions.js
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, message, Table } from 'antd';
import axios from 'axios';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
    const [transactionType, setTransactionType] = useState('');
    const [transactionForm] = Form.useForm();

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/transactions/user/1'); // Assuming userId is 1
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const handleTransactionOk = async () => {
        try {
            const values = await transactionForm.validateFields();
            const payload = { ...values, userId: 1, type: transactionType }; // Assuming a static userId for demonstration
            await axios.post('http://localhost:5000/api/transactions', payload);
            message.success('Transaction initiated successfully');
            fetchTransactions();
            setIsTransactionModalVisible(false);
        } catch (error) {
            console.error('Error initiating transaction:', error);
            message.error('Failed to initiate transaction');
        }
    };

    const handleTransactionCancel = () => {
        setIsTransactionModalVisible(false);
    };

    const initiateTransaction = (type) => {
        setTransactionType(type);
        transactionForm.resetFields();
        setIsTransactionModalVisible(true);
    };

    const transactionColumns = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Item ID',
            dataIndex: 'itemId',
            key: 'itemId',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <Button onClick={() => handleCancelTransaction(record.id)}>Cancel</Button>
            ),
        },
    ];

    const handleCancelTransaction = async (transactionId) => {
        try {
            await axios.put(`http://localhost:5000/api/transactions/${transactionId}`, { status: 'canceled' });
            message.success('Transaction canceled successfully');
            fetchTransactions();
        } catch (error) {
            console.error('Error canceling transaction:', error);
            message.error('Failed to cancel transaction');
        }
    };

    return (
        <div>
            <Button type="primary" onClick={() => initiateTransaction('buy')} style={{ marginBottom: '20px' }}>Buy Item</Button>
            <Button type="primary" onClick={() => initiateTransaction('sell')} style={{ marginBottom: '20px', marginLeft: '10px' }}>Sell Item</Button>
            <Button type="primary" onClick={() => initiateTransaction('trade')} style={{ marginBottom: '20px', marginLeft: '10px' }}>Trade Item</Button>
            <Table dataSource={transactions} columns={transactionColumns} rowKey="id" style={{ marginTop: '20px' }} />
            <Modal
                title={`Initiate ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} Transaction`}
                visible={isTransactionModalVisible}
                onOk={handleTransactionOk}
                onCancel={handleTransactionCancel}
            >
                <Form form={transactionForm} layout="vertical">
                    <Form.Item
                        name="itemId"
                        label="Item ID"
                        rules={[{ required: true, message: 'Please input the item ID!' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        name="quantity"
                        label="Quantity"
                        rules={[{ required: true, message: 'Please input the quantity!' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Transactions;
