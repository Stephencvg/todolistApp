import express from "express";
import bodyParser from "body-parser";
import mongoose, { Schema } from "mongoose";
import _ from "lodash"



// import _, { result } from "lodash"


const app = express();
const port = 3000;

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))


// local database

// let lists = []

// connect to mongoose

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log("Connected to mongoDB database")

//   app.listen(port, () => {
//     console.log(`Server started on port ${port}`)
//   })
// }).catch((err) => {
//   console.log(err)
//   console.log("Database connection failed")

//   process.exit(1)
// })

// cloude database

mongoose.connect("mongodb+srv://Stephen11:stephen@cluster0.q3lewcu.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to mongoDB database")

  app.listen(port, () => {
    console.log(`Server started on port ${port}`)
  })
}).catch((err) => {
  console.log(err)
  console.log("Database connection failed")

  process.exit(1)
})

// Creating the schema
const todolistSchema = new mongoose.Schema({
  name: String
});

// Creating model 
const Item = mongoose.model("Item", todolistSchema);

const item1 = new Item({
  name: "This is to do list"
});

const item2 = new Item({
  name: "Welcome to do list"
});

const defaulItems = [item1, item2]
// Schema for custom route 
const customSchema = {
  name: String,
  items: [todolistSchema]
}

// model for custom route
const List = mongoose.model("List", customSchema)

app.post("/delete", (req, res) => {
  const checkItemId = req.body["check"];
  const listName = req.body["listName"];

  if (listName === "Today") {
      Item.findByIdAndRemove(checkItemId).then(() => {
    console.log("Successfully deleted")
  }).catch((err => {
    console.log(err)
  }))
  res.redirect("/")
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}).then(() => {
      console.log("custome List deleted successfully")
      res.redirect("/" + listName)
    }).catch((err => {
      console.log(err)
    }))
  }

})

app.get("/", (req, res) => {
  const option = {
    weekday: "long",
    year: "numeric",
    day: "numeric",
    month: "long"
  };

  Item.find().then((items) => {
    // console.log(items)
    if (items === 0) {
      Item.insertMany(defaulItems).then(() => {
        console.log("Default items added successfully to the todolistDB")
      }).catch((err => {
        console.log(err)
      }))
      res.redirect("/")
    } else {
      let today = new Date();
      let day = today.toLocaleDateString("en-US", option)
      res.render("index.ejs", { currentDay: day, toDos: items, header: "Welcome to Daily To do List", currentYear: new Date().getFullYear() })
    }


  }).then((err => {
    console.log(err)
  }))


})

// To get Custom route
app.get("/:customList", (req, res) => {
  const customRoute = _.capitalize(req.params.customList)
  // console.log(route)

  List.findOne({ name: customRoute }).then((result) => {
    if (result) {
      res.render("index.ejs", { currentDay: result.name, toDos: result.items, header: "Welcome to Daily To do List", currentYear: new Date().getFullYear() })
    } else {
      const list = new List({
        name: customRoute,
        items: [defaulItems]
      })
      list.save()
      res.redirect("/" + customRoute)
    }

  }).catch((err => {
    console.log(err)
  }))

})
app.post("/", (req, res) => {
  const input = req.body["todo"]
  const listName = req.body["list"]
  const listNameString = listName.trim()

  const inputs = new Item({
    name: input
  })
  if (listNameString === "Today") {
    inputs.save()
    // const list = input;
    // items.push(list)
    res.redirect("/")
  } else {
    List.findOne({ name: listName }).then((foundItem) => {
      if (foundItem != null) {
        foundItem.items.push(inputs)
        
        foundItem.save();
        res.redirect("/" + listName)
      } else {
        res.redirect("/")
      }
    }).catch(err => {
      console.log(err)
      console.log('There is a error with a particular variable')
    })
  }

})


