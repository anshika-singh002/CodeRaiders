import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user?.token) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;