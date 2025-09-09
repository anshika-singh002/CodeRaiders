import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import ProblemList from './components/ProblemList.jsx';
import Register from './components/Register.jsx';
import SubmitCode from './components/SubmitCode.jsx';
import Submissions from './components/Submissions.jsx';
import ProblemDetail from './components/ProblemDetail.jsx';
import CreateProblem from './components/CreateProblem.jsx';
import EditProblem from './components/EditProblem.jsx';
import Navbar from './components/Navbar.jsx';
import UserProfile from './components/UserProfile.jsx';
import Contests from './components/Contests.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './App.css';

function App() {
    const location = useLocation();

    // ✅ A better way to conditionally show the Navbar
    const showNavbar = !['/login', '/register'].includes(location.pathname);

    return (
        <>
            {showNavbar && <Navbar />}

            <Routes>
                {/* Public routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/problems" element={<ProblemList />} /> {/* ✅ Main public route for problems */}
                <Route path="/problems/:problemId" element={<ProblemDetail />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/problems/new" element={<CreateProblem />} />
                    <Route path="/problems/edit/:id" element={<EditProblem />} />
                    <Route path="/problems/:problemId/submit" element={<SubmitCode />} />
                    <Route path="/contests" element={<Contests />} />
                    <Route path="/submissions" element={<Submissions />} />
                    <Route path="/userprofile" element={<UserProfile />} />
                    {/* ❌ The duplicate /problems route has been removed for clarity */}
                </Route>
            </Routes>
        </>
    );
}

export default App;

