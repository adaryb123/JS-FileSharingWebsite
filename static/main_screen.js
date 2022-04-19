
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("upload");
const manageL = document.getElementById("manageL");
const downloadL = document.getElementById("downloadL");
const formUpload = document.getElementById("uploadForm")

uploadBtn.addEventListener("click", function () {
    const uploadForm = new FormData(formUpload);

    uploadForm.append("inputFile", fileInput.files[0])

    body = {
        method: "post",
        body: uploadForm
    };
    
    fetch("http://localhost:3000/upload",body)
    .then( res => {
        if (res.ok) {
        } else {
            console.log("Fetch Failed");
        }
        return res.json();
    })
    .then(data => {
        downloadL.value = data.download;
        manageL.value = data.manage;
    })
    .catch(error => console.error(error));

})