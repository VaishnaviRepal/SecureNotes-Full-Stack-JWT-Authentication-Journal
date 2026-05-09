import express, { Router } from "express" ;
const app = express();

//Import - jsonwebtoken package for tokens
import jwt from "jsonwebtoken" ;

/* The CORS Issue (Crucial)
By default, a browser won't let a website on one "origin" (like a local file or port) talk to a server on another port (3004) for security reasons. You need to tell Express to allow these requests.*/
import cors from "cors";
app.use(cors()); // Put this above your routes

import path from 'path';
import { fileURLToPath } from 'url';

// 1. Get the current folder path dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This tells Express to serve all files in the current directory
app.use(express.static(__dirname));
app.use(express.json()); //FIXED : To let Express read the JSON body 

//Good Practice -> to store using MongoDB , PostgreSql ...
const allNotes =[] ; //array for storing notes of a user 
const users = [] ; //Stores the info of users(passw and name)


//Method for normal get - the one to load the page 
app.get("/" , (req, res)=>{
    //we may pass the acess to frontend for the further process , then get back here
    const htmlPath = path.join(__dirname , "frontend.html") ;
    res.sendFile(htmlPath);
})

//Middleware - for checking Authentiacation 
//A method to check the validity of a token sent by user 
const checkTokenAuth = (req , res , next) => {
    //fetch the token 
    //Check in the data - if this username exists and his passw matches
    
    //Fetch the token in header of request
    const tokenPassedByU = req.headers.token ;

    //Verify the user for the access to other methods 
    const decode = jwt.verify(tokenPassedByU , "cake123" );
    const checkUser = users.find( user => user.username === decode.username);
    if( !checkUser ){
        res.json({
            message : "Unauthorized user "
        })
        return ;
    }
    req.username = decode.username; // 3. IMPORTANT: Save this for the next routes

    next() ;

}

//to load the sign up page 
app.get("/signup" , (req,res) =>{
    const signinPath = path.join(__dirname , "signup.html") ;
    res.sendFile(signinPath);
})

//Method - Sign up --> Creating new account 
app.post("/signup" , (req, res ) =>{
    //fetch the parms sent with the req body - username and passw 
    //.username and .password - here  is the json body passed in the axios func while fetching it from the user input
    const usernameR = req.body.username ;
    const passwR = req.body.password ;

    //Chek if this name for user exists 
    if(users.find( user => (user.username === usernameR ) )){
        res.status(403).json({
            message : "This name for user exists ! "
        })
        return ;
    }
    
    //Store in the arr/database 
    users.push({
        username : usernameR ,
        password : passwR 
    })

    //** We dont create token at sign up , but when logged in   */
    //Genrerate a web token for this user
    //read the text info file for more details
    // const token = jwt.sign({
    //     username : username 
    // } , "cake123") ;
    
    //

    //End the Req-res cycle --> 
    res.json({
        message : "Successfully Signed up !" ,
        // token : token 
    })

    //next(Router = "/signin") ; //Forward the charge to the next ethod after account creation--> signin 
})

//To load the signin page
app.get("/signin" , (req,res) => {
    const signinPage = path.join(__dirname , "signin.html");
    res.sendFile(signinPage) ;
})
//Method - for sign-in / login -> when the account is already created / just created 
app.post("/signin" ,  (req, res ) => {
    //fetch the username and passw sent by user  during login request 
    const usernameR = req.body.username ;
    const passwR = req.body.password ;
 
    //Check in the data - if this username exists and his passw matches
    if(users.find( user => (user.username === usernameR &&  user.password === passwR ) )){
        //Fetch the token in header of request
        //**User doesnt pass token during sign-in , browser gievs it token  */
        //const tokenPassedByU = req.header.token ;

        //Genrerate a web token for this user
        //read the text info file for more details
        const token = jwt.sign({
            username : usernameR
        } , "cake123") ;

        //Verify the user for the access to other methods 
        //**Fix : This doesnot happen during sign-in , as broswer is sending the token for the first time , for this login time  */
        // const decode = jwt.verify(tokenPassedByU , "cake123" );
        // if( !decode.username ){
        //     res.json({
        //         message : "Unauthorized user "
        //     })
        // }

        // else{
        res.status(200).json({
            message : "Successfully Logged in  ! " ,
            token : token
        })
        //} 
        //next() ;
       
    
    }
    

    else{
        res.status(403).json({
            message : "The username or password is invalid "
        })
        return ;
    }

    
    
})


//Method for getting all notes on the screen 
//At backend - Just put the jso file in the resonse 
//Calls checkAuth - for checking the authorization(token validity) before proceeding
app.get("/notes" ,checkTokenAuth , (req , res )=>{ 
    //Fetch the token in header of request
    //const tokenPassedByU = req.headers.token ;
    //display notes of that specific user only 
    //const thisUser = req.username ;
    //const decode = jwt.verify(tokenPassedByU , "cake123" );


    //Use filter : gives an arr with the contents that match the condition
    //get method doesnt have body - so no username ; ut we got it from the checkTokenAuth func called before
    const thisUNotes = allNotes.filter( item => item.username === req.username );
    // We only want to send the strings to the frontend loop
    const onlyStrings = thisUNotes.map(item => item.note);
    res.json(
        {
            notes : onlyStrings 
        });
    //next() ;
})


//Method for creating a note and then adding it to json file 
//Calls checkAuth - for checking the authorization(token validity) before proceeding
//POST == Create
app.post("/notes" , checkTokenAuth , (req,res)=>{
    //get the body passed in request
    //.note - here note is the json body passed in the axios func while fetching it from the user input

    //const tokenPassedByU = req.headers.token ;
    //const decode = jwt.verify(tokenPassedByU , "cake123" );

    const currNote = req.body.note ; 
    //Add it to our array of allNotes (acts as database)
    allNotes.push({
        username : req.username ,//BE already knows who u r from ur token and name isnt passed in the body /no need to use it when we have token  
        note : currNote
    }) ;
    //As we need to end the req-res cycle , we may pass a 'Note added' text response 
    res.json({
        message : "Note added Successfully ! "
    })
})


app.listen(3004) ;
