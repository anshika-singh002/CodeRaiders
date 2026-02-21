import axios from 'axios';

const API_URL = '/api/problems'; //uses the vite proxy

const authHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token ? { 'Authorization': `Bearer ${user.token}`}:{}; 
};

const getAllProblems = () => axios.get(API_URL);
const getProblemById = (id) => axios.get(`${API_URL}/${id}`);
const createProblem = (problemData) => axios.post(API_URL, problemData, { headers: authHeader() });
const updateProblem = (id, problemData) =>axios.put(`${API_URL}/${id}`, problemData, {headers: authHeader()});
const deleteProblem = (id) => axios.delete(`${API_URL}/${id}`, {headers: authHeader()});
export default { getAllProblems, getProblemById, createProblem, updateProblem, deleteProblem};