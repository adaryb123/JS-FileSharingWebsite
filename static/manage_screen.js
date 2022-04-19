const downloadBtn = document.getElementById("downloadBtn");
const linkInput   = document.getElementById("fileLink");
const removeBtn = document.getElementById("removeBtn");
const generateBtn = document.getElementById("generateBtn");
const downloadURLInput = document.getElementById("download_url");

downloadBtn.addEventListener('click', function() {
    fileLink = linkInput.value;
    /*
    fetch('/updateDownloads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({fileURL: fileLink})
    })*/

    var req = new XMLHttpRequest();
    req.open('GET', "http://localhost:3000/getFileInManage/" + fileLink, true); 
    req.responseType = 'blob'; 
    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        if (req.status === 200) {
          var data = req.response;
          var name = req.getResponseHeader('Content-Disposition').split('filename=')[1];
          name = name.slice(1, -1);
          var defaultFilename = name;
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
})

generateBtn.addEventListener('click', function() {
    manageURL = linkInput.value

    fetch('/updateURL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({fileURL: manageURL})
      })
      .then( res => {
        if (res.ok) {
        } else {
            console.log("Fetch Failed");
        }
        return res.json();
    })
    .then(data => {
        downloadURLInput.value = data.URL;
    })
    .catch(error => console.error(error));

})


removeBtn.addEventListener('click', function() {
    manageURL = linkInput.value

    fetch('/removeFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({fileURL: manageURL}),
    })
    .then(response => {
      if (response.redirected) {
          window.location.href = response.url;
      }
    })
    
})