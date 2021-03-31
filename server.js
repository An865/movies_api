const http = require('http'),
fs = require('fs'),
url = require('url');

//create server and execut request handler each time server gets a request
http.createServer((request, response) => {
    //determine if incoming requests contains 'documentation'
    let address = request.url,
    parsedAddress = url.parse(address, true);
    filepath = '';
    
    //log any errors to log.txt
    fs.appendFile('log.txt', 'URL: ' + address + '\nTimestamp: ' + new Date() + '\n\n', (error) => {
        //log to terminal console
        if (error){
            console.log(error);
        } else {
            console.log('Added to log.');
        }
    });

    //if parsed address includes 'documentation' assign to file path else assign index.html
    if(parsedAddress.pathname.includes('documentation')){
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }

    //read file assigned to filePath and after reading throw error if one occurs
    fs.readFile(filePath, (error, data) =>{
        if(error){
            throw error;
        }
        // write head, data, and end response
        response.writeHead(200, {'Content-Type':'text/html'});
        response.write(data);
        response.end();
    });
})
//listen on port 8080
.listen(8080);
