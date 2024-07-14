import { useState, useEffect } from "react";
import { idbPromise, getStockOverview } from "./helpers";
import { getWatchlists, addStockToWatchList, addWatchList } from "../services/watchlists";
import decode from "jwt-decode";

export const fetchWatchlists = async (setWatchlists, setCurrentWatchlist, setWatchlistStocks, setWatchlistId, dispatch) => {
    const checkForWatchLists = await idbPromise("watchlist", "get");
    let watchListObjects = {};
    let currentName, watchlistNames, watchlistId;
    if (checkForWatchLists.length > 0) { 
        console.log("checkForWatchLists");
        watchlistNames = checkForWatchLists.map(watchlist => watchlist.watchlist_name);
        currentName = watchlistNames[0];
        watchlistId = checkForWatchLists[0].watchlist_id;
  
        for (let i = 0; i < watchlistNames.length; i++) {
            const watchListItems = checkForWatchLists[i].watchlist;
            watchListObjects[watchlistNames[i]] = watchListItems;
        }
    } else {
        console.log("no checkForWatchLists");
        const token = localStorage.getItem("id_token");
        if (!token) return;
        const decoded = decode(token);
        const userId = decoded?.data.id;
        const userWatchlists = await getWatchlists(userId);
        console.log(userWatchlists, "userWatchlists");
        watchlistNames = Object.keys(userWatchlists);
        currentName = watchlistNames[0];
        watchlistId = userWatchlists[currentName].id;
    
        for (let i = 0; i < watchlistNames.length; i++) {
            const metrics = userWatchlists[watchlistNames[i]].metrics;
            const watchListItems = userWatchlists[watchlistNames[i]].watches;
            const watchListArray = watchListItems.length ? await getStockOverview(watchListItems, metrics) : [];
            watchListObjects[watchlistNames[i]] = watchListArray;
            console.log(watchListArray, "watchListArray");
            idbPromise("watchlist", "put", { watchlist: watchListArray, watchlist_name: watchlistNames[i], watchlist_id: userWatchlists[watchlistNames[i]].id });
        }
    }
  
    setWatchlistId(watchlistId);
    setWatchlists(watchlistNames);
    setCurrentWatchlist(currentName);
    setWatchlistStocks(watchListObjects[currentName]);
    dispatch({
        type: "SET_WATCHLIST",
        watchlist: watchListObjects[currentName]
    });
  };
  
  export const handleAddStock = async (watchlistId, stock, setLoading, setWatchlistStocks, dispatch, handleClose, setError, watchlistStocks, currentWatchlist) => {
    try {
        const res = await addStockToWatchList(watchlistId, stock);
        setLoading(true);
        if (res?.status !== 200) throw new Error(res?.response?.data?.message);
  
        const newStock = await getStockOverview([stock]);
        if (newStock.length === 0) throw new Error("Stock not found");
  
        const updatedWatchlist = [...watchlistStocks, newStock[0]];
        setWatchlistStocks(updatedWatchlist);
        dispatch({
            type: "SET_WATCHLIST",
            watchlist: updatedWatchlist
        });
  
        idbPromise("watchlist", "put", { watchlist: updatedWatchlist, watchlist_name: currentWatchlist, watchlist_id: watchlistId });
        handleClose();
        setLoading(false);
    } catch (e) {
        console.log(e.message);
        setLoading(false);
        setError(e.message);
    }
  };

  export const changeWatchlist = async (watchlist, setWatchlistStocks, setWatchlistId, setCurrentWatchlist, dispatch) => {
    const watchlistData = await idbPromise("watchlist", "get");
    const thisWatchlist = watchlistData.find((watchlistItem) => watchlistItem.watchlist_name === watchlist);
    const thisId = thisWatchlist.watchlist_id;
    setWatchlistId(thisId);
    setWatchlistStocks(thisWatchlist.watchlist);
    setCurrentWatchlist(watchlist);
    dispatch({
        type: "SET_WATCHLIST",
        watchlist: thisWatchlist.watchlist
    });
  }

export const handleCreateWatchlist = async (watchlistName, setWatchlists, watchlists, setError, handleCloseCreate) => {
    try {
        const token = localStorage.getItem("id_token");
        if (!token) return;
        const decoded = decode(token);
        const userId = decoded?.data.id;
        const res = await addWatchList(userId, watchlistName);
        console.log(res)
        if (res?.status !== 200) throw new Error(res?.response?.data?.message);
        const newWatchlists = [...watchlists, watchlistName];
        setWatchlists(newWatchlists);
        idbPromise("watchlist", "put", { watchlist: [], watchlist_name: watchlistName, watchlist_id: res?.data?.id });
        handleCloseCreate();
    } catch (e) {
        setError(e?.message || "An error occurred");
    }
}
