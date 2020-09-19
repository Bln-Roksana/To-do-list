const express=require("express");
const bodyParser=require("body-parser");
// const date=require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _=require("lodash");

const app=express();

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

// const items=["Do shopping","Cook food","Prepare lunch for the next day"];
// const workItems=[];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rok:XXXXXXXXXXXXXXXXXXXXXXXXXX.mongodb.net/todolistDB");
// mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema={
  name: String
};

const Item= mongoose.model("Item", itemsSchema);

const item1= new Item({
  name: "do shopping"
});

const item2= new Item({
  name: "cook food"
});

const item3= new Item({
  name: "finish another module of the course"
});

const defaultItems=[item1, item2, item3];

const listSchema={
  name: String,
  items: [itemsSchema]
};

const List=mongoose.model("List", listSchema);

app.get("/", function(req, res){

  // const day=date.getDate(); //run function getDate() here
  Item.find({},function(err, foundItems){
    if (foundItems.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log("I am expriencing some error:", err);
        }else{
          console.log("Array of default items inserted");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });

})

app.post("/", function(req, res){

  const itemName=req.body.newItem;
  const listName=req.body.list;

  const item= new Item({
    name: itemName
  });

  if (listName==="Today") {
    item.save(); // we are using this instead of insert
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }



  // console.log(req.body);
  // console.log(req.body.newItem); //before I can use body, I need to set app.use(bodyPar....)
  // if(req.body.list==="Work"){
  //   workItems.push(item);
  //   res.redirect("/work");
  // }else{
  //   items.push(item);
  //   res.redirect("/");
  // }

})

app.post("/delete", function(req, res){
  const checkedItemId= req.body.deleteBox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err){
        //console.log("Item was deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }


})

app.get("/:type", function(req, res){
  const typeOfList=_.capitalize(req.params.type);


  List.findOne({name: typeOfList}, function(err, foundList){
    if(!err){
      if(!foundList){

        const list= new List({
          name:typeOfList,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+typeOfList);
      }else{
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });

});

// app.get("/work", function(req, res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// })

// app.post("/work", function(req, res){
//     const item=req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// })

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("The server is running..");
})

// app.get("/about",function(req, res){
//   res.render("about"); if your about is about.ejs
// })
