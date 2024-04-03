import {
    SAVE_USER,
    SET_STOCK_WEIGHTS,
  } from "./actions";
  
  // initial state of the store
  export const initialState = {
    user: [],
    currencyRates: [],
    stockWeights: {},
  };
  
  // export the reducer function
  export const reducer = (state = initialState, action) => {
    switch (action.type) {
      case SAVE_USER:
        console.log("SAVE_USER action dispatched with payload:", action.payload);
        console.log(action.payload);
        return {
          ...state,
          user: { id: action.payload },
        };
      case SET_STOCK_WEIGHTS:
        console.log("SET_STOCK_WEIGHTS action dispatched with payload:", action.payload);
        return {
          ...state,
          stockWeights: action.payload,
        };
      default:
        return state;
    }
  };
  


