// create a component that checks for the presence of the authentication token in localStorage.

//If the token exists, it renders the child component (<Outlet />).

//If the token doesn't exist, it redirects the user to the login page.

import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;