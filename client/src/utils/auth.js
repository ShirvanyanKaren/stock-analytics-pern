import decode from "jwt-decode";
import { idbPromise } from "./helpers";

class AuthService {
  getProfile() {
    return decode(this.getToken());
  }

  loggedIn() {
    const token = this.getToken();
    // console.log("here", token);
    // If there is a token and it's not expired, return `true`
    return token && !this.isTokenExpired(token) ? true : false;
  }

  isTokenExpired(token) {
    // Decode the token to get its expiration time that was set by the server
    const decoded = decode(token);
    // If the expiration time is less than the current time (in seconds), the token is expired and we return `true`
    if (decoded.exp < Date.now() / 1000) {
      localStorage.removeItem("id_token");
      return true;
    }
    // If token hasn't passed its expiration time, return `false`
    return false;
  }

  getToken() {
    return localStorage.getItem("id_token");
  }

  login(idToken) {
    console.log("here")
    localStorage.setItem("id_token", idToken);
    console.log("idToken", idToken);
    window.location.assign("/");
  }

  logout() {
    const tokenId = decode(localStorage.getItem("id_token"));
    console.log("tokenId", tokenId.data.id);
    idbPromise("stockWeights", "delete", tokenId.data.id);
    console.log(tokenId.data.id)
    localStorage.removeItem("id_token");
    window.location.reload();
  }
}

export default new AuthService();
