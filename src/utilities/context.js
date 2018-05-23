import React from "react";
import {Storage} from "./storage";
import Client from "../connection/connection";

const storage = new Storage()
const client = new Client(storage)

export const AppContext = React.createContext(
    {
        storage: storage,
        client: client
    }
);