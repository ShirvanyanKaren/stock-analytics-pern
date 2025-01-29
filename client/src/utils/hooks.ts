import { idbPromise, getStockOverview } from "./helpers";
import { getWatchlists, addStockToWatchList, addWatchList } from "../services/watchlists";
import decode from "jwt-decode";
import { AxiosResponse } from "axios";
import { Dispatch, SetStateAction } from "react";


type fetchWatchlistArgs = {
    watchlist?: string;
    setWatchlists: (watchlists: string[]) => void;
    setCurrentWatchlist: (currentWatchlist: string) => void;
    setWatchlistStocks: Dispatch<SetStateAction<any[]>>;
    setWatchlistId: Dispatch<SetStateAction<string>>;
    dispatch: (action: any) => void;
};

type WatchList = {
    watchlistName: string;
    watchlistId: string;
    watchlist: any[];
};
type AddStockArgs = {
  watchlistId: string;
  stock: string;
  setLoading: (loading: boolean) => void;
  setWatchlistStocks: (watchlistStocks: any[]) => void;
  dispatch: (action: any) => void;
  handleClose: () => void;
  setError: (error: string) => void;
  watchlistStocks: any[];
  currentWatchlist: string;
};

export const fetchWatchlists = async ({ setWatchlists, setCurrentWatchlist, setWatchlistStocks, setWatchlistId, dispatch }: fetchWatchlistArgs) => {
    const checkForWatchLists = await idbPromise("watchlist", "get") as WatchList[];
    let watchListObjects: { [key: string]: any[] } = {};
    let currentName, watchlistNames, watchlistId;
    if (checkForWatchLists?.length > 0) { 
        watchlistNames = checkForWatchLists?.map(watchlist => watchlist.watchlistName);
        currentName = watchlistNames[0];
        watchlistId = checkForWatchLists[0].watchlistId;
  
        for (let i = 0; i < watchlistNames.length; i++) {
            const watchListItems = checkForWatchLists[i].watchlist;
            watchListObjects[watchlistNames[i]] = watchListItems;
        }
    } else {
        const token = localStorage.getItem("id_token");
        if (!token) return;
        const decoded = decode(token) as { data: { id: string } };
        const userId = decoded?.data.id;
        const userWatchlists = await getWatchlists(userId) as { [key: string]: any };
        watchlistNames = Object.keys(userWatchlists);
        currentName = watchlistNames[0];
        watchlistId = userWatchlists[currentName].id;
    
        for (let i = 0; i < watchlistNames.length; i++) {
            const metrics = userWatchlists[watchlistNames[i]].metrics;
            const watchListItems = userWatchlists[watchlistNames[i]].watches;
            const watchListArray = watchListItems.length ? await getStockOverview(watchListItems, metrics) : [];
            watchListObjects[watchlistNames[i]] = watchListArray;

            idbPromise("watchlist", "put", { watchlist: watchListArray, watchlistName: watchlistNames[i], watchlistId: userWatchlists[watchlistNames[i]].id });
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

  
  export const handleAddStock = async ({ watchlistId, stock, setLoading, setWatchlistStocks, dispatch, handleClose, setError, watchlistStocks, currentWatchlist }: AddStockArgs) => {
    try {
        console.log("stock", stock);
        console.log("watchlistId", watchlistId);
        const res = await addStockToWatchList(watchlistId, stock) as any;
        setLoading(true);
        if (res?.status !== 200) throw new Error(res?.response?.data?.message);
  
        const newStock = await getStockOverview([stock] , {
            ratios: {},
            financials: {},
            stockPerformance:{}
          } );
        if (!newStock || newStock?.length === 0) throw new Error("Stock not found");
  
        const updatedWatchlist = [...watchlistStocks, newStock[0]];
        setWatchlistStocks(updatedWatchlist);
        dispatch({
            type: "SET_WATCHLIST",
            watchlist: updatedWatchlist
        });
  
        idbPromise("watchlist", "put", { watchlist: updatedWatchlist, watchlistName: currentWatchlist, watchlistId: watchlistId });
        handleClose();
        setLoading(false);
    } catch (e: Error | any) {
        setLoading(false);
        setError(e?.message || "An error occurred");
    }
  };

  export const changeWatchlist = async ({ watchlist, setWatchlistId, setWatchlistStocks, setCurrentWatchlist, dispatch }: fetchWatchlistArgs) => {
    const watchlistData = await idbPromise("watchlist", "get") as WatchList[];
    console.log("watchlist", watchlist);
    console.log("watchlistData", watchlistData);
    const thisWatchlist = watchlistData.find((watchlistItem) => watchlistItem.watchlistName === watchlist);
    const thisId = thisWatchlist?.watchlistId;
    setWatchlistId(thisId || "");
    setWatchlistStocks(thisWatchlist?.watchlist || []);
    setCurrentWatchlist(watchlist || "");
    dispatch({
        type: "SET_WATCHLIST",
        watchlist: thisWatchlist?.watchlist
    });
  }


export const handleCreateWatchlist = async (watchlistName: string, setWatchlists: (watchlists: string[]) => void, watchlists: string[], handleCloseCreate: () => void, setError: (error: string) => void) => {
    try {
        const token = localStorage.getItem("id_token");
        if (!token) return;
        const decoded = decode(token) as { data: { id: string } };
        const userId = decoded?.data.id;
        const res = await addWatchList(userId, watchlistName) as AxiosResponse;
        if (res?.status !== 200) throw new Error(res?.data?.message);
        const newWatchlists = [...watchlists, watchlistName];
        setWatchlists(newWatchlists);
        idbPromise("watchlist", "put", { watchlist: [], watchlistName: watchlistName, watchlistId: res?.data?.id });
        handleCloseCreate();
    } catch (e: Error | any) {
        setError(e?.message || "An error occurred");
    }
}
