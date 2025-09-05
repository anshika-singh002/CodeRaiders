import React from 'react';
import Login from './components/Login.jsx';
import { Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard.jsx'; // The protected page
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

 return (
   <>
     {location.pathname !== '/dashboard' && <Navbar />}  

     <Routes>
       {/* Public routes */}
       <Route path="/register" element={<Register />} />
       <Route path="/login" element={<Login />} />
       <Route path="/problems" element={<ProblemList />} />
       
       {/* Protected routes */}
       <Route element={<ProtectedRoute />}>
         <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/problems/new" element={<CreateProblem />} />
         <Route path="/problems/edit/:id" element={<EditProblem />} />
         <Route path="/problems/:problemId" element={<ProblemDetail />} />
         <Route path="/problems/:problemId/submit" element={<SubmitCode />} />
         <Route path="/contests" element={<Contests />} />
         <Route path="/submissions" element={<Submissions />} />
         <Route path="/userprofile" element={<UserProfile />} />
       </Route>
     </Routes>
   </>
 );
}

export default App;