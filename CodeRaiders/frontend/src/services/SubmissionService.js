import axios from 'axios';

const SUBMISSION_API_URL = '/api/submissions';

const authHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token ? { 'Authorization': `Bearer ${user.token}` } : {};
};

const submitCode = (problemId, language, code) => {
    return axios.post(SUBMISSION_API_URL, {
        problemId,
        language,
        code
    }, { headers: authHeader() });
};

export default {
    submitCode
};