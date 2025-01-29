import api from './api';



export const getWatchlists = async (userId: string) => {
    try {
        const response = await api.get(`/watchlist/${userId}`);

        return response.data;
    } catch (err) {
        return err;
    }
}

export const addWatchList = async (userId: string, watchlistName: string) => {
    try {
        const response = await api.post(`/watchlist/${userId}`, 
        { watchlistName: watchlistName });
        return response;   
    } catch (err) {
        return err;
    }
}

export const deleteWatchList = async (userId: string, watchlistId: string) => {
    try {
        const response = await api.delete(`/watchlist/${userId}`, { data: { watchlistId } });
        return response.data;
    } catch (err) {
        return err;
    }
}

export const addStockToWatchList = async (watchlistId: string, stockSymbol: string) => {
    try {
        const response = await api.post(`/watchlist/stock/${watchlistId}`, { stockSymbol });
        return response;
    } catch (err) {
        return err;
    }
}

export const deleteStockFromWatchList = async (watchlistId: string, stockSymbol: string) => {
    try {
        const response = await api.delete(`/watchlist/stock/${watchlistId}`, { data: { stockSymbol } });
        return response.data;
    } catch (err) {
        return err;
    }
}