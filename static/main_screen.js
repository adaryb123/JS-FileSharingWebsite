
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("upload");
const manageL = document.getElementById("manageL");
const downloadL = document.getElementById("downloadL");


uploadBtn.addEventListener("click", function () {
    const uploadForm = new FormData();
   
    // For single file
    uploadForm.append("inputFile", fileInput.files[0])

    body = {
        method: "post",
        body: uploadForm
    };
    
    console.log(body);
    fetch("http://localhost:3000/upload",body)
    .then( res => {
        if (res.ok) {
            console.log("Ok");
        } else {
            console.log("Fetch Failed");
        }
        return res.json();
    })
    .then(data => {
        console.log(data);
        downloadL.value = data.down;
        manageL.value = data.mana;
    })
    .catch(error => console.error(error));

})

/*
function uploadFile(){
    document.getElementById("manage-url").value = "test1";
    document.getElementById("download-url").value = "test2";
}
*/
