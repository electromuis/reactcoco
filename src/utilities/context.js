import React from "react";
import {Storage} from "./storage";
import Client from "../connection/client";

const storage = new Storage()
const client = new Client(storage)
client.init()

console.log("Initated")

export const AppContext = React.createContext(
    {
        storage: storage,
        client: client
    }
);