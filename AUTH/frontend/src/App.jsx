import React from 'react';
import { useState } from 'react';
import { Routes, Route, Link, BrowserRouter } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; //the protected page
import ProblemList from './components/ProblemList';
import CreateProblem from './components/CreateProblem';
import EditProblem from './components/EditProblem';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';


function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/problems" element={<ProblemList />} />
        <Route path="/problems/new" element={<CreateProblem />} />
        <Route path="/problems/edit" element={<ProblemList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
