//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb://localhost:27017/todoDB", { useNewUrlParser: true });

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list",
});

const item2 = new Item({
  name: "Press the + button to add",
});

const item3 = new Item({
  name: "<- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find({}, (err, results) => {
    if (err) {
      console.log(err);
    }
    if (results.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("The default Items have beed added succesfully");
          res.redirect("/");
        }
      });
    } else {
      res.render("list", { listTitle: "Today", newListItems: results });
    }
  });
});

app.post("/delete", (req, res) => {
  const toRemove = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(toRemove, (err) => {
      console.log(err);
    });

    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: toRemove } } },
      (err, foundList) => {
        if (!err) {
          res.redirect(`/${listName}`);
        }
      }
    );
  }
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const newItem = new Item({
    name: itemName,
  });

  if (listTitle === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listTitle }, (err, listFound) => {
      listFound.items.push(newItem);
      listFound.save();
      res.redirect(`/${listTitle}`);
    });
  }
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, (err, result) => {
    if (!result) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect(`/${customListName}`);
    } else {
      res.render("list", {
        listTitle: result.name,
        newListItems: result.items,
      });
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(0.0.0.0:$PORT, function () {
  console.log("Server started on port 3000");
});

//  <% for (let i=0; i<newListItems.length; i++) { %>
//       <div class="item">
//         <input type="checkbox">
//         <p>
//           <%= newListItems[i].name %>
//         </p>
//       </div>
//       <% } %>
