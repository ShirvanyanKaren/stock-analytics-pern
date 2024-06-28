import api from './api';

export const getWatchlists = async (user_id) => {
    try {
        console.log("user_id", user_id)
        const response = await api.get(`/watchlist/${user_id}`);

        return response.data;
    } catch (err) {
        return err;
    }
}

export const addWatchList = async (user_id, watchlist_name) => {
    try {
        console.log("user_id", user_id)
        const response = await api.post(`/watchlist/${user_id}`, 
        { watchlist_name: watchlist_name });
        return response;   
    } catch (err) {
        return err;
    }
}

export const deleteWatchList = async (user_id, watchlist_id) => {
    try {
        const response = await api.delete(`/watchlist/${user_id}`, { data: { watchlist_id } });
        return response.data;
    } catch (err) {
        return err;
    }
}

export const addStockToWatchList = async (watchlist_id, stock_symbol) => {
    try {
        const response = await api.post(`/watchlist/stock/${watchlist_id}`, { stock_symbol });
        return response;
    } catch (err) {
        return err;
    }
}

export const deleteStockFromWatchList = async (watchlist_id, stock_symbol) => {
    try {
        const response = await api.delete(`/watchlist/stock/${watchlist_id}`, { data: { stock_symbol } });
        return response.data;
    } catch (err) {
        return err;
    }
}