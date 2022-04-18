
const downloadBtn = document.getElementById("downloadBtn");
const linkInput   = document.getElementById("fileLink");

downloadBtn.addEventListener('click', function() {
    fileLink = linkInput.value;

    body = {
        method: "get",
    };
    //window.open("http://localhost:3000/getFile/" + fileLink);


/*
    fetch("http://localhost:3000/getFile/" + fileLink, body)
    .then(response => response.blob())
    .then(blob => {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "filename.xlsx";
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();    
        a.remove();  //afterwards we remove the element again         
    });*/

    var req = new XMLHttpRequest();
    req.open('GET', "http://localhost:3000/getFile/" + fileLink, true); 
    req.responseType = 'blob'; 
    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        if (req.status === 200) {
          var data = req.response;
          var name = req.getResponseHeader('Content-Disposition').split('filename=')[1];
          name = name.slice(1, -1);
          console.log(name);
          var defaultFilename = name;
          console.log(name);
          if (typeof window.navigator.msSaveBlob === 'function') {
            window.navigator.msSaveBlob(data, defaultFilename);
          } else {
            var blob = data;
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = defaultFilename;
  
            document.body.appendChild(link);
  
            link.click();
          }
        }
      }
    };
    req.send();

    console.log();
})