import {Storage} from "coco-lib/storage"

import fs from "fs";

class LocalStorage extends Storage.Storage {
    constructor(file) {
        super();
        this.file = file

        this.ignore = [
            'messages'
        ]
    }

    load(callback) {
        let self = this

        fs.readFile(this.file, 'utf8', function (err,data) {
            if (err) {
                console.log("db file not exist")
            } else {
                let json = JSON.parse(data)
                for (let t in json) {
                    let data = json[t];

                    for (let i in data) {
                        let row = data[i]
                        row = new Storage.DynamicClass(self[t].rowClass, row)
                        self[t].insert(row)
                    }
                }

                console.log("DB Loaded")
            }

            callback()
        });
    }

    saveTriggers() {
        let self = this

        for(let t in this.tables) {
            if(this.ignore.indexOf(t) > -1) {
                continue
            }

            let table = this[t]

            table.addTrigger(() => {
                self.save()
            })
        }
    }

    save() {
        let data = {}
        for(let t in this.tables) {
            if(this.ignore.indexOf(t) > -1) {
                continue
            }

            let table = this[t]
            data[t] = []

            for(let i in table.rows) {
                let row = table.rows[i]
                data[t].push(row.getData())
            }
        }

        let json = JSON.stringify(data)
        fs.writeFile(this.file, json, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The DB was saved");
        });
    }
}

export default LocalStorage