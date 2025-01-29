import api from "./api";

export const loginUser = async (userData) => {
    try {
        const response = await api.post("/users/login", userData);
        return response;
    } catch (err) {
        return err;
    }
}

export const signupUser = async (userData) => {
    try {
        const response = await api.post("/users/signup", userData);
        return response;
    } catch (err) {
        return err;
    }
}

export const logoutUser = async () => {
    try {
        const response = await api.post("/users/logout");
        return response;
    } catch (err) {
        return err; 
    }
}