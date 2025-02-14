import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, message, Table } from 'antd';
import axios from 'axios';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
    const [transactionType, setTransactionType] = useState('');
    const [transactionForm] = Form.useForm();
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        fetchTransactions();
        fetchPendingTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/transactions/user/${userId}`);
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const fetchPendingTransactions = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/transactions/pending/user/${userId}`);
            setPendingTransactions(response.data);
        } catch (error) {
            console.error('Error fetching pending transactions:', error);
        }
    };

    const handleTransactionOk = async () => {
        try {
            const values = await transactionForm.validateFields();
            const payload = { ...values, userId, type: transactionType };

            if (transactionType === 'trade') {
                payload.offeringItemId = values.offeringItemId;
                payload.requestingItemId = values.requestingItemId;
                payload.requestingUserId = values.requestingUserId;
            }

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

    const handleApproveTransaction = async (transactionId) => {
        try {
            await axios.put(`http://localhost:5000/api/transactions/${transactionId}`, { status: 'completed' });
            message.success('Transaction approved successfully');
            fetchPendingTransactions();
        } catch (error) {
            console.error('Error approving transaction:', error);
            message.error('Failed to approve transaction');
        }
    };

    const handleRejectTransaction = async (transactionId) => {
        try {
            await axios.put(`http://localhost:5000/api/transactions/${transactionId}`, { status: 'canceled' });
            message.success('Transaction rejected successfully');
            fetchPendingTransactions();
        } catch (error) {
            console.error('Error rejecting transaction:', error);
            message.error('Failed to reject transaction');
        }
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
            render: (status) => (status === 'completed' ? 'Pay when meet' : status),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <Button onClick={() => handleCancelTransaction(record.id)}>Cancel</Button>
            ),
        },
    ];

    const pendingTransactionColumns = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Offering Item ID',
            dataIndex: 'offeringItemId',
            key: 'offeringItemId',
        },
        {
            title: 'Requesting Item ID',
            dataIndex: 'requestingItemId',
            key: 'requestingItemId',
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
                <>
                    <Button onClick={() => handleApproveTransaction(record.id)} style={{ marginRight: '10px' }}>Approve</Button>
                    <Button onClick={() => handleRejectTransaction(record.id)}>Reject</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" onClick={() => initiateTransaction('buy')} style={{ marginBottom: '20px' }}>Buy Item</Button>
            <Button type="primary" onClick={() => initiateTransaction('sell')} style={{ marginBottom: '20px', marginLeft: '10px' }}>Sell Item</Button>
            <Button type="primary" onClick={() => initiateTransaction('trade')} style={{ marginBottom: '20px', marginLeft: '10px' }}>Trade Item</Button>
            <h2>Your Transactions</h2>
            <Table dataSource={transactions} columns={transactionColumns} rowKey="id" style={{ marginTop: '20px' }} />
            <h2>Pending Transactions for Your Items</h2>
            <Table dataSource={pendingTransactions} columns={pendingTransactionColumns} rowKey="id" style={{ marginTop: '20px' }} />
            <Modal
                title={`Initiate ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} Transaction`}
                visible={isTransactionModalVisible}
                onOk={handleTransactionOk}
                onCancel={handleTransactionCancel}
            >
                <Form form={transactionForm} layout="vertical">
                    {transactionType === 'trade' ? (
                        <>
                            <Form.Item
                                name="offeringItemId"
                                label="Offering Item ID"
                                rules={[{ required: true, message: 'Please input the offering item ID!' }]}
                            >
                                <Input type="number" />
                            </Form.Item>
                            <Form.Item
                                name="requestingItemId"
                                label="Requesting Item ID"
                                rules={[{ required: true, message: 'Please input the requesting item ID!' }]}
                            >
                                <Input type="number" />
                            </Form.Item>
                            <Form.Item
                                name="requestingUserId"
                                label="Requesting User ID"
                                rules={[{ required: true, message: 'Please input the requesting user ID!' }]}
                            >
                                <Input type="number" />
                            </Form.Item>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default Transactions;
