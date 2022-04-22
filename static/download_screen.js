const downloadBtn = document.getElementById("downloadBtn");
const linkInput   = document.getElementById("fileLink");


// Download btn listener
downloadBtn.addEventListener('click', function() {
    fileLink = linkInput.value;

    // Update downloads counter
    fetch('/updateDownloads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({fileURL: fileLink})
    })

    // Download the file, create ajax request
    // This block of code is based on https://stackoverflow.com/questions/56652397/res-download-working-with-html-form-submit-but-not-an-axios-post-call
    var req = new XMLHttpRequest();
    req.open('GET', "http://localhost:3000/getFile/" + fileLink, true); 
    req.responseType = 'blob'; 
    // Define on ready action
    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        if (req.status === 200) {
          // Parse original file name from header
          var data = req.response;
          var name = req.getResponseHeader('Content-Disposition').split('filename=')[1];
          name = name.slice(1, -1);
          var defaultFilename = name;
          // Chcek if browser can work with blobs
          if (typeof window.navigator.msSaveBlob === 'function') {
            window.navigator.msSaveBlob(data, defaultFilename);
          // If not create a dummy object for converting and downloading file
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
      else if (req.status === 400) {
        alert("file no longer exists")
      }
    };
    req.send();
})