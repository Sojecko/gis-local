package fiit.pdt.project.app.controllers;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import fiit.pdt.project.app.dao.DbConnector;

@RestController
public class GreetingController {
	
	@CrossOrigin
	@RequestMapping("/greeting")
    public String greeting(@RequestParam(name="name", required=false, defaultValue="World") String name) {
        return "greeting " + name;
    }
	
	@CrossOrigin
	@RequestMapping(value="/data.json", produces = MediaType.APPLICATION_JSON_VALUE)
	public String data() {
		
		return supermarkets();
	}
	
	@CrossOrigin
	@RequestMapping(value="/pois.json", produces = MediaType.APPLICATION_JSON_VALUE)
	public String pointsOfInterest() {
		
		return pois();
	}
	
	@CrossOrigin
	@RequestMapping("/map")
    public String homePage() {
		
		DbConnector dbc = new DbConnector();
		dbc.select();
		
        return "Hello world!\n";
    }
	
	//@RequestMapping("/supermarkets")
	public String supermarkets() {
		DbConnector dbc = new DbConnector();
		String result = dbc.query("SELECT array_to_json(array_agg(row_to_json(f)))::json As feature\r\n" + 
				"     FROM (select name, st_asgeojson(st_transform(way, 4326))::json geo, replace(lower(name),' ', '-') as shopClass\r\n" + 
				"from planet_osm_point\r\n" + 
				"where shop = 'supermarket'\r\n" + 
				"          ) As f;");
		
		return result;
	}
	
	public String pois() {
		DbConnector dbc = new DbConnector();
		String result = dbc.query("with base as (\r\n" + 
				"    select leisure as spec, 'leisure' as name ,st_asgeojson(way) as geo, way from planet_osm_polygon where leisure is not null\r\n" + 
				"    union\r\n" + 
				"    select \"natural\" as spec,'natural' as name ,st_asgeojson(way) as geo, way from planet_osm_polygon where \"natural\" is not null\r\n" + 
				"    union\r\n" + 
				"    select historic as spec,'historic' as name ,st_asgeojson(way) as geo, way from planet_osm_polygon where \"historic\" is not null\r\n" + 
				"    union\r\n" + 
				"    select historic as spec,'historic' as name ,st_asgeojson(way) as geo, way from planet_osm_point where \"historic\" is not null\r\n" + 
				"    union\r\n" + 
				"    select leisure as spec,'leisure' as name ,st_asgeojson(way) as geo, way from planet_osm_point where leisure is not null\r\n" + 
				")\r\n" + 
				"SELECT array_to_json(array_agg(row_to_json(f)))::json As feature\r\n" + 
				"     FROM (select d.name, d.geo::json, d.spec\r\n" + 
				"             from planet_osm_polygon p\r\n" + 
				"                      cross join base d\r\n" + 
				"             where 1 = 1\r\n" + 
				"               and p.name like '%Kamenné%'\r\n" + 
				"               and st_dwithin(p.way::geography, d.way::geography, 1000)\r\n" + 
				"          ) As f;");
		return result;
	}
	

}
