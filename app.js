//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

// let posts=[],requestedPost;
mongoose.connect('mongodb://127.0.0.1:27017/blogDB'); //create connection and db
// mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});

const postSchema = new mongoose.Schema({  //building the test schema
  title: String,
  post: String
});


const userSchema = new mongoose.Schema({
  email:String,
  password:String,
  // googleId: String,
  // secret: String
});

const Post = mongoose.model("Post", postSchema);

const User = new mongoose.model("User",userSchema);

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// let composeBtn=document.getElementById("compose");

// console.log(composeBtn);
app.get("/",async function(req,res){
  let posts = await Post.find({});

  // console.log(posts);
res.render("home",{homeText:homeStartingContent, posts:posts});
});

app.post("/",function(req,res){
  composeBtn.onclick(function(){
    res.redirect("/compose");
  })
})

app.get("/about",function(req,res){
  res.render("about",{aboutText:aboutContent});
});

app.get("/contact",function(req,res){
    res.render("contact",{contactText:contactContent});
});

app.get("/compose",function(req,res){
  res.render("compose");
});

app.post("/compose",function(req,res){
  // let postLength = (req.body.post).length;
  // let truncate =req.body.post;
  // const limit=170;
  // if(postLength>limit)
  // {
  //   truncate = (truncate.slice(0,limit))+" ...";
  // }
  // const compose = {
  //   title: req.body.title,
  //   post: req.body.post,
  //   truncatedPost:truncate
  // }

  // posts.push(compose);
  // // console.log(posts);

  const post = new Post({
    title: req.body.title,
    post: req.body.post
  });

  post.save();

  res.redirect("/");
});

app.get("/posts/:postId",async function(req,res){
  // console.log(req.params.title);
 const requestedPostId = (req.params.postId);

 const requestedPost = await Post.findById(requestedPostId).exec();
  
   res.render("post",{title:requestedPost.title,post:requestedPost.post});
         
  // res.render("post",{title:requestedPost.title,post:requestedPost.post});
});

app.get("/register",function(req,res){
  
  res.render("register");
});


app.post("/register",function(req,res){

  // User.register({username: req.body.username},req.body.password,function(err,user){
  //     if(err){
  //         console.log(err);
  //         res.redirect("/register");
  //     } else{
  //         passport.authenticate("local")(req,res,function(){
  //             res.redirect("/secrets");
  //         });
  //     }
  // });

  bcrypt.hash(req.body.password,saltRounds,function(err,hash){
      const newUser = new User({
          email:req.body.username,
         // password:md5(req.body.password)
         password:hash
      });
  
      newUser.save().then(savedUser=>{
          if(savedUser===newUser)
          {
              console.log("New User Saved");
              res.redirect("/");
          }
          else{
              res.send("Some error occured");
          }
  
      });
  });

});

app.get("/login",function(req,res){
  res.render("login");
});


app.post("/login",async function(req,res){

  const user = new User({
      username:req.body.username,
      password: req.body.password
  });


  // req.login(user,function(err){
  //     if(err){
  //         console.log(err);
  //     }else{
  //         passport.authenticate("local")(req,res,function(){
  //             res.redirect("/secrets");
  //         });

  //     }
  // });
  const email = req.body.username;
  //const password=md5(req.body.password);
  const password=(req.body.password);

  const foundUser = await User.findOne({email:email}).exec();

  if(foundUser)
  {

      bcrypt.compare(password,foundUser.password,function(err,matched){
          if(matched){
              res.redirect("/compose");
          }
          else{
                  res.send("Incorrect Password!");
              }
      });
      // if(foundUser.password===password)
      // {
      //     res.render("secrets");
      // }else{
      //     res.send("Incorrect Password!");
      // }
  }
  else{
      res.send("User not found!");
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

