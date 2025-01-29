import decode from "jwt-decode";
import { idbPromise } from "./helpers";

export type Token = {
  data: {
    id: string;
    username: string;
  };
  exp: number;
};

class AuthService {
  getProfile() {
    return decode(this?.getToken() || "") as Token;
  }

  loggedIn() {
    const token = this.getToken();
    // console.log("here", token);
    // If there is a token and it's not expired, return `true`
    return token && !this.isTokenExpired(token) ? true : false;
  }

  isTokenExpired(token : string) {
    // Decode the token to get its expiration time that was set by the server
    const decoded = decode<Token>(token);
    // If the expiration time is less than the current time (in seconds), the token is expired and we return `true`
    if (decoded?.exp < Date.now() / 1000) {
      localStorage.removeItem("id_token");
      return true;
    }
    // If token hasn't passed its expiration time, return `false`
    return false;
  }

  getToken() {
    return localStorage.getItem("id_token") || "";
  }

  async login(token : string) {
    localStorage.removeItem("id_token");
    await idbPromise("stockWeights", "delete");
    await idbPromise("watchlist", "delete");
    localStorage.setItem("id_token", token);
    window.location.assign("/");
  }

  async logout() {

    const token : Token = decode(localStorage?.getItem("id_token") || "");
    if (!token) {
      localStorage.removeItem("id_token");
      window.location.reload();
    } else {
    await idbPromise("stockWeights", "delete", token?.data?.id);
    await idbPromise("watchlist", "delete", token?.data.id);
    localStorage.removeItem("id_token");
    window.location.reload();
    }
  }
}

export default new AuthService();
