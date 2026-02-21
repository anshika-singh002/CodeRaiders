import axios from 'axios';
const API_BASE = '';
const API_URL = `http://localhost:4000`;
const register = (firstname, lastname, email, password, phoneno) => {
    return axios.post(`${API_URL}/register`, {
        firstname,
        lastname,
        email,
        password,
        phoneno
    });
};


const login = (email, password) => {
    return axios.post(`${API_URL}/login`, {
        email,
        password
    })
        .then(response => {
            if (response.data.token) {
                localStorage.setItem("user", JSON.stringify(response.data));
            }
            return response.data;

        });
};

const logout = () => {
    localStorage.removeItem("user");
};

export default {
    register,
    login,
    logout
};