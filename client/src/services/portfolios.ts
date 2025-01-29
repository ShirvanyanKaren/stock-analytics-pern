import api from "./api";

export const getPortfolio = async (userId: string) => {
    try {
        const response = await api.get(`/portfolios/${userId}`);
        return response.data;
    } catch (err) {
        return err;
    }
}

