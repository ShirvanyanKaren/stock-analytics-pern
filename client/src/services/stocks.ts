import api from './api';

export const getStocks = async (user_id) => {
    try {
        const response = await api.get(`/stocks/${user_id}`);
        return response.data;
    } catch (err) {
        return err;
    }
}

export const addStock = async (stockInfo) => {
    try {
        const response = await api.post('/stocks', stockInfo);
        return response.data; 
    } catch (err) {
        console.error("Error adding stock:", err);
        return err;
    }
}
