
//Sign in page 
async function signup(){
    //From FE - fetch the data entered by the user in the html input locks 
    const username = document.getElementById("username").value ;
    const password = document.getElementById("password").value ;

    //pass this to backend
    const response = await axios.post("https://vaishnavirepal.github.io/SecureNotes-Full-Stack-JWT-Authentication-Journal/signup" ,{
        username , password
    } );
    
    //This response will have token and msg passsed from backend , we are interested in the token 
    //Store this token on local storage( for more info -> see the text file )
    alert(response.data.message) ;//msg of successful login/ not passed 

    //localStorage.setItem("token" , userToken) ;
    window.location.href = ("/signin");


}

//Sign in Page 
//Sign in page 
async function signin(){
    //From FE - fetch the data entered by the user in the html input locks 
    const username = document.getElementById("username").value ;
    const password = document.getElementById("password").value ;

    //pass this to backend
    const response = await axios.post("http://localhost:3004/signin" ,{
        username , password
    } );
    
    //This response will have token and msg passsed from backend , we are interested in the token 
    //Store this token on local storage( for more info -> see the text file )
    const token = response.data.token ;

    localStorage.setItem("token" , token) ;
    window.location.href = ("/");


}



//Add Notes
async function addNote(){
    const token = localStorage.getItem("token") ;
    //Give a Push Request 
    const response = await axios.post("http://localhost:3004/notes" , {
        //link - 1st attribute 
        //Bodym - 2nd Attribute 
        //apssing a json file as body parameter 
            note : document.getElementById("inputNote").value ,
            //Mistake : Passing username which isnt asked/needed ; token madhe asta !
                    //And username navacha element nahi tya FE page vr 
            //username : document.getElementById("username").value 
        },
        {
            //Header -- 3rd Attribute 
            headers : {"token" : token}//exlicit key name//headers is plural(headers not header and it holds obj{} -multiple headers )
        }

    );
    
    // //get the user input from frontend
    // const newInput = document.getElementById("inputNote").value ;
    // //create new div n add it there
    // const newDiv = document.createElement("div")//Fixed : It's .createElement and not .createElementById
    // newDiv.innerHTML = newInput ;
    // newDiv.setAttribute("style" , "border : 2px solid black , padding : 10px");

    // document.getElementById("notesSection").appendChild(newDiv) ;
    // 
    getNotes();

    //Also display all other notes with this recently added note 
    document.getElementById("inputNote").value = "";

}

//Get notes 
async function getNotes(){
    const token = localStorage.getItem("token") ;
    //get all notes from backend
    const responseNotes = await axios.get("http://localhost:3004/notes" , {
        //2nd attribute for get is header ; bcz in get we dont have body (we only read n not write)
        headers : {"token" : token}//exlicit key name 
    }) ;
    //it returns a promise

    //now get the data
    const resData = responseNotes.data.notes ; //notes is the obj(arr) passed from the backend  for this user

    //clear input field 
    //document.getElementById("newNote").value = "" ;
    //Now , append all the notes to the FE
    //fix:.length is a property and not func ; so we should do .length and not .length()
    for(let i = 0 ; i < resData.length ; i++ ){
        const newNote = document.createElement("div");
        newNote.innerHTML = resData[i] ;//Fix : resData contains strs , so no .value on it  
        newNote.setAttribute("style" , "border : 2px solid black , padding : 10px");
        document.getElementById("notesSection").appendChild(newNote) ;
    }
}
