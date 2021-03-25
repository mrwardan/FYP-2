const dbUser = [{
        username: "wardan",
        password: "123"
    },
    {
        username: "emad",
        password: "321"
    },
    {
        username: "redhwan",
        password: "111"
    }
]



function hide(id) {
    document.getElementById(id).style.display = 'none';
}




function display(id, type) {
    document.getElementById(id).style.display = type;
}

function showNextPage(nextPage, currentPage) {
    display(currentPage, 'none');
    display(nextPage, 'block');

}

function showPreviousPage(backpage, currentPage) {
    display(currentPage, 'none');
    display(backpage, 'block');

}

function Log(id, id2) {

    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    let matchUser;




    for (let index = 0; index < dbUser.length; index++) {

        let found = dbUser[index].username.value = true;

        let User = dbUser[index].username;
        let passw = dbUser[index].password;




        if ((username === User && password === passw) && found) {
            // console.log("HEYYYYYYY:::"+username)
            // console.log(password)
            matchUser = dbUser[index];
            alert('Welcome Back ' + matchUser.username);
            document.getElementById(id2).style.display = "none";
            // console.log("HERE :"  username)




        } else if (found != true)

        {
            console.log(password)
            alert('Wrong password ');
            break;

        }
    }



    if (matchUser) {
        showNextPage('Userinfo', 'signin');
    }



}

let key;


function preview_image(event) {
    var reader = new FileReader();
    reader.onload = function () {
        var output = document.getElementById('output_image');
        output.src = reader.result;
        // console.log("show "+output )
    }
    reader.readAsDataURL(event.target.files[0]);
}


dou = ["file", "file1", "file2", "file3", "file4", "file5", "file6", "file7", "file8", "file9", "file10", "file11","file12","file13"];
let validation = new Array(5);
let uplo = document.querySelector('#uupload');

function documentsOftheUser() { // to make sure that require documents are uploaded
    let sumbit1 = document.querySelector('#sumbit');
    let s = document.querySelector("#Ofletter");
    let q = document.querySelector("#done");
    let qp = document.querySelector("#thank");
    let er = document.querySelector('#ptoRed');
    let classToggle = document.querySelector('#alert');
    //    let w = document.getElementById(dou[0]);
    //     console.log(w.value)

    for (let i = 0; i < dou.length; i++) {
        w = null;
        w = document.getElementById(dou[i]);
        if (w.value) {
            validation[i] = w.value;
        } else {
            validation[i] = null;
        }
        console.log(validation[i])
    }

    var thereIsNull = validation.some(function (el) {
        return el == null;

    });
    // console.log(otherThanNull);
    if (thereIsNull) {
        s.style.border = 'solid green';
        er.style.border = 'solid green';
        sumbit1.style.backgroundColor = 'green';
        display(classToggle.id, 'block')
    } else {
        sumbit1.style.background = 'green';
        q.style.backgroundColor = 'green';
        qp.style.border = 'solid green';
        display('Ofletter', 'none')
        showNextPage('thank', 'Ofletter')


    }
}

// function choosingFile(id, index) {
//     let uplode = document.getElementsByClassName(id);

//     // let notVis = document.getElementById('output_image');
//     // let sss = notVis.style.display = 'block';


 
//     uplode[index].click();
//     // submitphoto();
    



// function removeImg(id, index) {

//     let file = document.getElementById(id);
//     let notVis = document.getElementById('output_image');
//     notVis.src = '';
//     notVis.style.display = 'none';
//     file.value = null;
// }

function submitphoto() {

    let photo = document.getElementById('youmust');
    photo.style.display = 'none';

}

let i = 0;

function add2address() {
    console.log("wardan")
    while (i < 2) {
        i++;
        var row = document.getElementById("myadd2");
        var x = row.insertCell(i);
        x.innerHTML = `

             <textarea name="Address" rows="4" cols="22"></textarea>          

         `;
        i++;
    }



}

function addtablee() {
    for (let i = 0; i < dou.length; i++) {


        var row = document.getElementById("ad2");
        var x = row.insertCell(i);

        x.innerHTML = `

                 <td> dou[i] </td>

         `;
        i++;
    }

}
function getDate()
{
    // const day = document.querySelector('').value;
    document.querySelector("#Birthday_Day").addEventListener("click", function(){
        // document.getElementById("demo").innerHTML = "Hello World";
            const day_value = document.querySelector("#Birthday_Day").value;
            console.log(day_value);
        
      });
    document.querySelector("#Birthday_Month").addEventListener("click", function(){
        // document.getElementById("demo").innerHTML = "Hello World";
            const month = document.querySelector("#Birthday_Month").value;
            console.log(month);
        
      });
    document.querySelector("#Birthday_Year").addEventListener("click", function(){
        // document.getElementById("demo").innerHTML = "Hello World";
            const year = document.querySelector("#Birthday_Year").value;
            console.log(year);
        
      });
   

}