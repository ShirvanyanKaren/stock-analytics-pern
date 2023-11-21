
import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { Outlet } from "react-router-dom";
import { Provider } from "react-redux";
import { StoreProvider } from "./utils/GlobalState";
import Header from "./components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap";
import "./App.scss";
import store from "./utils/store";
import AppPar from "./tsParticles/Particles";

const httpLink = createHttpLink({
    uri: "http://localhost:5000/graphql",
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem("jwtToken");
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        },
    };
}
);

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

console.log(store.user);

function App() {
    return (
        <ApolloProvider client={client}>
            <StoreProvider>
            <Provider store={store}>
                <AppPar className="particles"/>
                <Header />
                <div className="App">
                    <Outlet />
                </div>
            </Provider>
            </StoreProvider>
        </ApolloProvider>
    );
}

export default App;