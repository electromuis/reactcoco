import React from "react";
import {Storage} from "coco-lib/storage";
import Client from "../connection/client";


let storage = new Storage()


const client = new Client(storage)


client.init()

console.log("Initated")

export const AppContext = React.createContext(
    {
        storage: storage,
        client: client
    }
);