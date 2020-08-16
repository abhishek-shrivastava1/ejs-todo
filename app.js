//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.listen(port, function() {
    console.log(`Server started on port ${port}`);
});

mongoose.connect("mongodb+srv://admin-abhishek:Abhi_123@cluster0.hb3no.mongodb.net/todolistDb", { useUnifiedTopology: true, useNewUrlParser: true }, (err) => {
    if (err) {
        console.log("error while connecting to mongodb");
    } else {
        console.log("connected to mongo db");
    }
});

const itemSchema = {
    name: String
}

const Item = mongoose.model("Item", itemSchema)
const item = new Item({ name: "Welcome to todo list" });
const item2 = new Item({ name: "hit + to add item " });
const item3 = new Item({ name: "<-- Hit this to complete item" });
const defaultItems = [item, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
    Item.find((err, allItems) => {
        if (allItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log("error occured");
                } else {
                    console.log("sucess");
                }
            });
            res.redirect("/")
        }
        res.render("list", { listTitle: "Today", newListItems: allItems });
    });
});

app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    console.log(listName);
    const item = new Item({ name: itemName });
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, (err, result) => {
            console.log(result);
            result.items.push(item);
            result.save()
            res.redirect(`/${listName}`);
        })
    }
});

app.get("/about", function(req, res) {
    res.render("about");
});

app.post("/delete", (req, res) => {
    const listName = req.body.listName.trim();
    console.log(listName);
    if (listName === "Today") {
        Item.findByIdAndRemove(req.body.item.trim(), (err) => {
            if (err) {
                console.log(err);
                console.log("error occured");
                res.redirect("/");
            } else {
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: req.body.item.trim() } } }, (err, result) => {
            res.redirect(`/${listName}`)
        })
    }
});

app.get("/:newParam", (req, res) => {
    const newItem = _.capitalize(req.params.newParam);
    console.log(newItem);
    List.findOne({ name: newItem }, (err, result) => {
        console.log(result);
        if (!err) {
            if (!result) {
                const newList = new List({
                    name: newItem,
                    items: defaultItems
                });
                newList.save();
                res.redirect(`/${newItem}`);
            } else {
                res.render("list", { listTitle: result.name, newListItems: result.items });
            }
        }
    })
});