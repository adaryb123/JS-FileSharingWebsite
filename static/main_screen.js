
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("upload");
const manageL = document.getElementById("manageL");
const downloadL = document.getElementById("downloadL");
const formUpload = document.getElementById("uploadForm")

uploadBtn.addEventListener("click", function () {
    const uploadForm = new FormData(formUpload);

    // For single file
    uploadForm.append("inputFile", fileInput.files[0])

    body = {
        method: "post",
        body: uploadForm
    };
    
    //console.log(body);
    fetch("http://localhost:3000/upload",body)
    .then( res => {
        if (res.ok) {
           // console.log("Ok");
        } else {
            console.log("Fetch Failed");
        }
        return res.json();
    })
    .then(data => {
        //console.log(data);
        downloadL.value = data.download;
        manageL.value = data.manage;
    })
    .catch(error => console.error(error));

})