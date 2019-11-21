// project settings 
const SERVER_ADDRESS = "192.168.100.210"
const SERVER_PORT = "8080"
const SERVER = SERVER_ADDRESS+':'+SERVER_PORT

const URL_TYPES = SERVER+"/data.json"

// TEMP - MOCKUP URLs
const URL_CATEGORIES_MOCKUP = "file:///home/whoami/SOJEC/gis-local/src/frontend/mock/categories.json"
const URL_POIS_MOCKUP = "file:///home/whoami/SOJEC/gis-local/src/frontend/mock/pois.json"

var categoriesHashMap = undefined
var categoriesNumber = 0


// make synchronous HTTP request to inURL
function SynchronousHTTPRequest(inURL)
{
    try 
    {
        var xmlHttp = new XMLHttpRequest();

        // false for synchronous request
        xmlHttp.open("GET", inURL, false);
        xmlHttp.send( null );
        return JSON.parse(xmlHttp.responseText);
    }
    catch(err) 
    {
        alert(err);  // DEBUG HELP
        return null;
    }
}

// get all categories from BE
function PopulateCategories()
{
    var categories = SynchronousHTTPRequest(URL_CATEGORIES_MOCKUP); // TEMP - change mockup path
    
    const categoryTableID = "categoryTable"
    let categoryTable = document.getElementById(categoryTableID);
    if(typeof(categoryTable) == 'undefined' || categoryTable == null) // DEBUG HELP
    {
        alert("CAN NOT FIND HTML TABLE FOR CATEGORIES!\n looking for: \"" + categoryTableID+ "\"");
        return false;
    }

    categoriesHashMap = []
    categoriesNumber = 0

    // populate categeories
    for( let category of categories )
    {
        // add new category into categoryTable
        let newRow = categoryTable.insertRow(0);
        let checkBoxCell = newRow.insertCell(0);
        let categoryNameCell = newRow.insertCell(1);    

        categoryNameCell.innerHTML = category;
        var newCheckbox = document.createElement('input');
        newCheckbox.type = "checkbox";
        newCheckbox.checked = true
        newCheckbox.id = categoriesNumber;
        checkBoxCell.appendChild(newCheckbox);

        // TODO - add check functionality

        // add new category into category hashMap
        categoriesHashMap[category] = {newCheckbox, objectNum : 0, objects : []};
        categoriesNumber++;
       
        console.log(categoriesHashMap[category]);
    }

    return true;
}

// get all pois from BE
function PopulateMap()
{
    let pois = SynchronousHTTPRequest(inURL)

    // populate categeories
    for(let pointOfInt of pois)
    {
        console.log(pointOfInt)
    }
}

// get all categories from BE
PopulateCategories();
