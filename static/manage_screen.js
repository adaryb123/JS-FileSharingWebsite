const downloadBtn = document.getElementById("downloadBtn");
const linkInput   = document.getElementById("fileLink");
const removeBtn = document.getElementById("removeBtn");
const generateBtn = document.getElementById("generateBtn");
const downloadURLInput = document.getElementById("download_url");

// Download btn listener
downloadBtn.addEventListener('click', function() {
    fileLink = linkInput.value;
    
    // Alert if link is empety
    if (fileLink === "")
      alert("prazdny retazec")

    // Update downloads counter
    fetch('/updateDownloadsInManage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({fileURL: fileLink})
    })

    // Download the file, create ajax request
    var req = new XMLHttpRequest();
    req.open('GET', "http://localhost:3000/getFileInManage/" + fileLink, true); 
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
            // Simulate clicking
            link.click();
          }
        }
      }
      else if (req.status === 400) {
        alert("File no longer exists")
      }
    };
    req.send();
})
// Listener for generate new URL btn
generateBtn.addEventListener('click', function() {
    manageURL = linkInput.value

    // Fetch new URL
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
    .catch(error => {
      alert("Error while fetching new URL")
      console.error(error)
    });

})

// Remove file btn listener
removeBtn.addEventListener('click', function() {
    manageURL = linkInput.value

    // Remove this file from database
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
    }).catch(error => {
      alert("Error while deleting file")
      console.error(error)
    })
    
})