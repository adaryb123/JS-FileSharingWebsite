const downloadBtn = document.getElementById("downloadBtn");
const linkInput   = document.getElementById("fileLink");

downloadBtn.addEventListener('click', function() {
    fileLink = linkInput.value;

    //update downloads counter
    fetch('/updateDownloads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({fileURL: fileLink})
    })

    //download the file
    var req = new XMLHttpRequest();
    req.open('GET', "http://localhost:3000/getFile/" + fileLink, true); 
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