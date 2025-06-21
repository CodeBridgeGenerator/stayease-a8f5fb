import React from 'react';
import { connect } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children, isLoggedIn, isAuthLoading, redirectPath }) => {
    if (isAuthLoading) return <div style={{textAlign:'center',marginTop:100}}>Loading...</div>;
    if (!isLoggedIn) return <Navigate to={redirectPath} replace />;
    return children ? children : <Outlet />;
};

const mapState = (state) => {
    const { isLoggedIn, isAuthLoading } = state.auth;
    return { isLoggedIn, isAuthLoading };
};

export default connect(mapState, null)(ProtectedRoute);
