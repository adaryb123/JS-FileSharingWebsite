const downloadBtn = document.getElementById("downloadBtn");
const linkInput   = document.getElementById("fileLink");
/*const dateInput   = document.getElementById("upload_date");
const timesInput   = document.getElementById("times_downloaded");
const downloadInput = document.getElementById("download_url");*/

downloadBtn.addEventListener('click', function() {
    fileLink = linkInput.value;

    var req = new XMLHttpRequest();
    req.open('GET', "http://localhost:3000/getFileInManage/" + fileLink, true); 
    req.responseType = 'blob'; 
    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        if (req.status === 200) {
          var data = req.response;
          var name = req.getResponseHeader('Content-Disposition').split('filename=')[1];
          name = name.slice(1, -1);
          // console.log(name);
          var defaultFilename = name;
          // console.log(name);
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

    // console.log();
})