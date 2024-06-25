import api from "./api";

export const getPortfolio = async (user_id) => {
    try {
        const response = await api.get(`/portfolios/${user_id}`);
        return response.data;
    } catch (err) {
        return err;
    }
}

