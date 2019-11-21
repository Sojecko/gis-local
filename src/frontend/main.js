// project settings 
const SERVER_ADDRESS = "192.168.100.210"
const SERVER_PORT = "8080"
const SERVER = SERVER_ADDRESS+':'+SERVER_PORT

// TODO
const URL_TYPES = SERVER+"/data.json"

// TEMP - MOCKUP URLs
const URL_CATEGORIES_MOCKUP = "file:///home/whoami/SOJEC/gis-local/src/frontend/mock/categories.json"
const URL_POIS_MOCKUP = "file:///home/whoami/SOJEC/gis-local/src/frontend/mock/pois.json"

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
    
    var categories = SynchronousHTTPRequest(URL_CATEGORIES_MOCKUP); // TEMP - change mockup path
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

    let pois = SynchronousHTTPRequest(URL_POIS_MOCKUP)

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

