// project settings 
const SERVER_ADDRESS = "192.168.100.210"
const SERVER_PORT = "8080"
const SERVER = SERVER_ADDRESS+':'+SERVER_PORT

const URL_TYPES = SERVER+"/data.json"


// get all atraction categories from BE
var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", URL_TYPES, false ); // false for synchronous request
xmlHttp.send( null );

console.log(xmlHttp.responseText);

// populate html with categeories 