// project settings 
const SERVER_ADDRESS = "192.168.100.210"
const SERVER_PORT = "8080"
const SERVER = SERVER_ADDRESS+':'+SERVER_PORT

// TODO
const URL_TYPES = SERVER+"/data.json"

// TEMP - MOCKUP URLs
const URL_CATEGORIES_MOCKUP = "file:///home/whoami/SOJEC/gis-local/src/frontend/mock/categories.json"
const URL_POIS_MOCKUP = "file:///home/whoami/SOJEC/gis-local/src/frontend/mock/pois.json"
const URL_PATH_MOCKUP = "file:///home/whoami/SOJEC/gis-local/src/frontend/mock/path.json"
// TEMP - REPLACE MOCKUP URL's WITH THIS
const URL_CATEGORIE = "categories.json"
const URL_POIS = "pois.json"
const URL_PATH = "path.json"

actualPathID = 0

const colorList = 
[
    "#FF0000","#00FF00","#FFFFFF","#7e0376","#c122ef"
    ,"#e17dee","#972553","#e663b1","#ba9959","#2932ec"
    ,"#b0c029","#af309a","#0066e5","#420776","#d7e1c3"
    ,"#c7e49a","#a6bc09","#fcc671","#8ded7e","#263c8e"
]
const defaultColor = "#000000"
var categoriesHashMap = undefined;
var categoriesNumber = 0;

// DEBUG HELP - lambda debug helper function - debug safe way to reference HTML elements
var HTML_REFERENCE_DEBUG_HELPER = (element = null, elementID) => 
{
    if(typeof(element) === undefined || element == null) // DEBUG HELP
    {
        alert("CAN NOT FIND HTML ELEMENT!\n looking for: \"" + elementID+ "\"");
        throw("CAN NOT FIND HTML ELEMENT!");
    }

    return element;
}

// DEBUG HELP - check if category map was initialzied
var IS_CATEGORY_MAP_INITIALIZED = () =>
{
    if(categoriesHashMap === undefined || categoriesHashMap == null)
    {
        alert("CAN NOT FIND CATEGORY HASH TABLE, HAVE YOU INITIALIZED IT?!");
        throw("CAN NOT FIND CATEGORY HASH TABLE, HAVE YOU INITIALIZED IT?!");
    }
}

// DEBUG HELP - check if category map was initialzied
var GET_COLOR_BY_ID = (inID) =>
{
    return (inID < colorList.length)? colorList[inID] : defaultColor;
}

/* actState:
* 0 - no point selected
* 1 - 1 point selected
* 2 - 2 points selected
*/
var PathStateMachine =
{
    "source" : [0,0],
    "destination" : [0,0],
    "actState" : 0,
    "GetNextState" : function(){this.actState=(++this.actState)%3;}
}

// state machine of path selection implementation
function PathStateMachineSwitch(inPoint)
{
    PathStateMachine.GetNextState();

    switch(PathStateMachine.actState)
    {
        case 0: 
            ResetPath();
            break;
        case 1:
            PathStateMachine.source = [inPoint.lng, inPoint.lat];
            ToggleResetPathButton(true);
            break;
        case 2:
            PathStateMachine.destination = [inPoint.lng, inPoint.lat];
            // true for path from source to destination, false for start and destination from answer
            DrawPath(GetPath(PathStateMachine.source, PathStateMachine.destination, true));
            break;
        default:
            PathStateMachine.actState = 0;
    }
}

function ResetPath()
{
    PathStateMachine.actState = 0;
    PathStateMachine.source = PathStateMachine.destination = [0,0];
    ClearAllPaths();
    ToggleResetPathButton(false);
}

function ToggleResetPathButton(toggle)
{
    let resetButon = document.getElementById('resetPathButton');
    let value = (toggle)? "block" : "none";
    resetButon.style.display=value; // block for displaying
}

function GetPath(inSource, inDestination, pathFromClickedPoints)
{
    receivedPath = SynchronousPOSTHTTPRequest(URL_PATH_MOCKUP, {"source" : inSource, "destination" : inDestination});

    if(pathFromClickedPoints)
    {
        // remove if you dont want to begin route from click
        if(inSource != null && inSource != [0,0])
            receivedPath[0].geo.coordinates.unshift(inSource)

        // remove if you dont want to route end from click
        if(inDestination != null && inDestination != [0,0])
            receivedPath[0].geo.coordinates.push(inDestination)
    }

    return receivedPath[0].geo;
}

function DrawPath(geometryPath)
{
    let pathLayer =
    {
        "id": actualPathID.toString(),
        "type": "line",
        "source": 
        {
            "type": "geojson",
            "data": 
            {
                "type": "Feature",
                "properties": {},
                "geometry": geometryPath
            }
        },
        "layout": {
        "line-join": "round",
        "line-cap": "round"
        },
        "paint": {
        "line-color": "#000",
        "line-width": 4
        }
    }

    map.addLayer(pathLayer);
}

function ClearAllPaths()
{
    if(map.getLayer(actualPathID.toString()) != undefined)
    {
        map.removeLayer(actualPathID.toString());
        actualPathID++;
    }
}

// make synchronous GET HTTP request to inURL
function SynchronousGETHTTPRequest(inURL)
{
    try 
    {
        let xmlHttp = new XMLHttpRequest();

        // false for synchronous request
        xmlHttp.open("GET", inURL, false);
        xmlHttp.send( null );
        return JSON.parse(xmlHttp.responseText);
    }
    catch(err) 
    {
        alert(err);  // DEBUG HELP - try/catch is OPTIONAL
        return null;
    }
}

// make synchronous POST HTTP request to inURL
function SynchronousPOSTHTTPRequest(inURL, inBody)
{
    try 
    {
        let xmlHttp = new XMLHttpRequest();

        // false for synchronous request
        xmlHttp.open("POST", inURL, false);
        xmlHttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xmlHttp.send(JSON.stringify(inBody));
        return JSON.parse(xmlHttp.responseText);
    }
    catch(err) 
    {
        alert(err);  // DEBUG HELP - try/catch is OPTIONAL
        return null;
    }
}

function HideCategory(inCateg, map)
{
    IS_CATEGORY_MAP_INITIALIZED()

    // look for target category
    let targetCat = categoriesHashMap[inCateg];

    if(targetCat == undefined || targetCat == null)
        return

    const targetLayerPolyID = targetCat.categoryID.toString()+"poly"
    const targetLayerPointID = targetCat.categoryID.toString()+"point"
    
    map.setLayoutProperty(targetLayerPolyID, 'visibility', 'none');
    map.setLayoutProperty(targetLayerPointID, 'visibility', 'none');
}

function ShowCategory(inCateg, map)
{
    IS_CATEGORY_MAP_INITIALIZED()

    // look for target category
    let targetCat = categoriesHashMap[inCateg];

    if(targetCat == undefined || targetCat == null)
        return

    const targetLayerPolyID = targetCat.categoryID.toString()+"poly"
    const targetLayerPointID = targetCat.categoryID.toString()+"point"
    
    map.setLayoutProperty(targetLayerPolyID, 'visibility', 'visible');
    map.setLayoutProperty(targetLayerPointID, 'visibility', 'visible');
}

// get all categories from BE
function PopulateCategories()
{
    const categoryTableID = "categoryTable"
    let categoryTable = document.getElementById(categoryTableID);
    categoryTable = HTML_REFERENCE_DEBUG_HELPER(categoryTable, categoryTableID); // OPTIONAL
    
    var categories = SynchronousGETHTTPRequest(URL_CATEGORIES_MOCKUP); // TEMP - change mockup path
    categoriesHashMap = [];
    categoriesNumber = 0;

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
        newCheckbox.checked = true;
        newCheckbox.id = categoriesNumber;
        newCheckbox.addEventListener( 'change', function() {
            if(this.checked) {
                ShowCategory(category, map)
            } else {
                HideCategory(category, map);
            }
           
        });
        checkBoxCell.appendChild(newCheckbox);

        // add new category into category hashMap
        let targetColor = GET_COLOR_BY_ID(categoriesNumber);
        categoriesHashMap[category] = {categoryID : categoriesNumber, objectNum : 0, objects : [], checkbox : newCheckbox, color : targetColor};
        categoriesNumber++;
    }

    return true;
}

// get list of object from catehory and insert it as features
function AddObjectToMap(inCategory, map)
{
    if(inCategory.lenght < 1)
        return;

    // get list of object from catehory and insert it as features    
    let polyFeatures = [];
    let pointFeatures = [];

    for(let object of inCategory.objects)
    {
        if(object.geo.type == "Polygon")
            polyFeatures.push(object.geo.coordinates[0]);
        else if(object.geo.type == "Point")
            pointFeatures.push(object.geo.coordinates);
    }

    map.addLayer({
        'id': inCategory.categoryID.toString()+"poly",
        'type': 'fill',
        'source': 
        {
            'type': 'geojson',
            'data': 
            {
                'type': 'Feature',
                'geometry': 
                {
                    'type': 'Polygon',
                    'coordinates': polyFeatures
                }
            }
        },
        'layout': {},
        'paint': 
        {
            'fill-color': inCategory.color,
            'fill-opacity': 0.8
        }
    });

    map.addLayer({
        'id': inCategory.categoryID.toString()+"point",
        'type': 'circle',
        'source': 
        {
            'type': 'geojson',
            'data': 
            {
                'type': 'Feature',
                'geometry': 
                {
                    'type': 'Polygon',
                    'coordinates': [pointFeatures]
                }
            }
        },
        'layout': {},
        "paint": 
        {
            "circle-radius": 6,
            "circle-color": inCategory.color,
        },
    });

    
    return null;
}

// get all pois from BE
function PopulateMap()
{
    IS_CATEGORY_MAP_INITIALIZED() // OPTIONAL - recommended

    let pois = SynchronousGETHTTPRequest(URL_POIS_MOCKUP)

    poisMapID = "poisMap";
    let poisMap = document.getElementById(poisMapID);
    poisMap = HTML_REFERENCE_DEBUG_HELPER(poisMap, poisMapID); // OPTIONAL

  
    // populate map and hashmap
    for(let pointOfInt of pois)
    {
        // add points to categories
        if(pointOfInt.category !== undefined && categoriesHashMap[pointOfInt.category] !== undefined) 
        {        
            categoriesHashMap[pointOfInt.category].objects.push(pointOfInt);
            categoriesHashMap[pointOfInt.category].objectNum++
        }
    }

    // add objects on map
    for(let category in categoriesHashMap)
    {
        AddObjectToMap(categoriesHashMap[category], map);
    }
}

// Map initialization
mapboxgl.accessToken = 'pk.eyJ1IjoidGtyYW1hciIsImEiOiJjajhhcHNmd2MwZ281MzNwODc3ankxNWE1In0.iOn_FeucyCXBjefGaTfPRQ';
var map = new mapboxgl.Map({
  container: 'poisMap',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [17.1075418, 48.1486046],//[17.1042326, 48.1492818],
  zoom: 13.8
});

map.on("load", function()
{
    // get all categories from BE
    if(PopulateCategories())
    {
        // get all pois from BE
        PopulateMap();
    }
});

// set next path find state on map click
map.on('click', function (click) {
    let clickCoords = click.lngLat;
    PathStateMachineSwitch(clickCoords)  
});

