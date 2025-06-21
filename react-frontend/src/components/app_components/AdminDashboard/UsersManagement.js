import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import client from '../../../services/restClient';
import AdminSidebar from './AdminSidebar';
import { FaPlus } from 'react-icons/fa';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [staffDialog, setStaffDialog] = useState(false);
    const [addUserDialog, setAddUserDialog] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'customer', password: '' });
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await client.service('users').find({
                query: {
                    $sort: { createdAt: -1 },
                    role: { $in: ['customer', 'provider'] },
                },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to load users', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
        }
        setLoading(false);
    };

    const fetchStaff = async (providerId) => {
        try {
            const response = await client.service('staffinfo').find({
                query: {
                    providerId: providerId,
                    $sort: { createdAt: -1 },
                },
            });
            setStaff(response.data);
        } catch (error) {
            console.error('Failed to load staff', error);
        }
    };

    const openNewUserDialog = () => {
        setNewUser({ name: '', email: '', role: 'customer', password: '' });
        setAddUserDialog(true);
    };

    const hideNewUserDialog = () => {
        setAddUserDialog(false);
    };

    const handleInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        setNewUser({ ...newUser, [name]: val });
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
            toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill out all fields.' });
            return;
        }
        try {
            await client.service('users').create(newUser);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
            hideNewUserDialog();
            fetchUsers();
        } catch (error) {
            console.error('Failed to create user', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to create user' });
        }
    };

    const addUserDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideNewUserDialog} />
            <Button label="Add" icon="pi pi-check" className="p-button-text" onClick={handleCreateUser} />
        </>
    );

    const showStaffDialog = (user) => {
        setSelectedUser(user);
        fetchStaff(user._id);
        setStaffDialog(true);
    };

    const hideStaffDialog = () => {
        setStaffDialog(false);
        setSelectedUser(null);
        setStaff([]);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between align-items-center">
                <div className="flex gap-2">
                    <Button onClick={openNewUserDialog} style={{ background: '#7c3aed', color: '#fff', border: 0 }}>
                        <FaPlus className="mr-2" />
                        Add New User
                    </Button>
                </div>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
                </span>
            </div>
        );
    };
    
    const nameBodyTemplate = (rowData) => {
        const initials = rowData.name ? rowData.name.split(' ').map((n) => n[0]).join('') : '?';
        return (
            <div className="flex align-items-center gap-2">
                <Avatar label={initials} shape="circle" style={{ backgroundColor: '#e0e7ff', color: '#6366f1' }} />
                <span className="font-semibold">{rowData.name}</span>
            </div>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-button-text" tooltip="Edit User" />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" tooltip="Delete User" />
                {rowData.role === 'provider' && (
                    <Button 
                        icon="pi pi-users" 
                        className="p-button-rounded p-button-info p-button-text" 
                        onClick={() => showStaffDialog(rowData)} 
                        tooltip="View Staff"
                    />
                )}
            </div>
        );
    };
    
    const header = renderHeader();

    const roleOptions = [
        { label: 'Customer', value: 'customer' },
        { label: 'Provider', value: 'provider' },
    ];

    return (
        <>
            <Toast ref={toast} />
            <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fd' }}>
                <AdminSidebar />
                <div style={{ flex: 1, padding: '2rem' }}>
                    <h2 style={{ fontWeight: 800, fontSize: 26, marginBottom: '1.5rem' }}>Users Management</h2>
                    <div className="card">
                        <DataTable 
                            value={users} 
                            paginator 
                            rows={10} 
                            header={header} 
                            loading={loading} 
                            globalFilter={globalFilter} 
                            emptyMessage="No users found." 
                            dataKey="_id"
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        >
                            <Column field="name" header="Name" body={nameBodyTemplate} sortable filter filterPlaceholder="Search by name" />
                            <Column field="email" header="Email" sortable filter filterPlaceholder="Search by email" />
                            <Column field="role" header="Role" sortable filter filterPlaceholder="Search by role"/>
                            <Column header="Actions" body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                        </DataTable>
                    </div>

                    <Dialog visible={addUserDialog} style={{ width: '450px' }} header="Add New User" modal className="p-fluid" footer={addUserDialogFooter} onHide={hideNewUserDialog}>
                        <div className="field">
                            <label htmlFor="name">Name</label>
                            <InputText id="name" value={newUser.name} onChange={(e) => handleInputChange(e, 'name')} required autoFocus />
                        </div>
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <InputText id="email" value={newUser.email} onChange={(e) => handleInputChange(e, 'email')} required />
                        </div>
                        <div className="field">
                            <label htmlFor="password">Password</label>
                            <Password id="password" value={newUser.password} onChange={(e) => handleInputChange(e, 'password')} required toggleMask />
                        </div>
                        <div className="field">
                            <label htmlFor="role">Role</label>
                            <Dropdown id="role" value={newUser.role} options={roleOptions} onChange={(e) => handleInputChange(e, 'role')} placeholder="Select a Role" />
                        </div>
                    </Dialog>

                    <Dialog visible={staffDialog} style={{ width: '50vw', maxWidth: '600px' }} header={`${selectedUser?.name}'s Staff`} modal className="p-fluid" onHide={hideStaffDialog}>
                        <DataTable value={staff} emptyMessage="No staff found for this provider.">
                            <Column field="name" header="Name" sortable></Column>
                            <Column field="email" header="Email" sortable></Column>
                            <Column field="position" header="Position" sortable></Column>
                        </DataTable>
                    </Dialog>
                </div>
            </div>
        </>
    );
};

export default UsersManagement; 