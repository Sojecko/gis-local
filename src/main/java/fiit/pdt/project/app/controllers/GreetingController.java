package fiit.pdt.project.app.controllers;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
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
	
	@RequestMapping(
		    value = "/route.json", 
		    method = RequestMethod.POST)
	public String process(@RequestBody(required=false) Map<String, Object> payload) {
		if(!payload.equals(null)) {
			System.out.println(payload.values());
			}
		return randomLine();
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
	@RequestMapping(value="/category.json", produces = MediaType.APPLICATION_JSON_VALUE)
	public String categories() {
		
		return cats();
	}
	
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
				"    select leisure as spec, 'leisure' as category ,st_asgeojson(way) as geo, way from planet_osm_polygon where leisure is not null\r\n" + 
				"    union\r\n" + 
				"    select \"natural\" as spec,'natural' as category ,st_asgeojson(way) as geo, way from planet_osm_polygon where \"natural\" is not null\r\n" + 
				"    union\r\n" + 
				"    select historic as spec,'historic' as category ,st_asgeojson(way) as geo, way from planet_osm_polygon where \"historic\" is not null\r\n" + 
				"    union\r\n" + 
				"    select historic as spec,'historic' as category ,st_asgeojson(way) as geo, way from planet_osm_point where \"historic\" is not null\r\n" + 
				"    union\r\n" + 
				"    select leisure as spec,'leisure' as category ,st_asgeojson(way) as geo, way from planet_osm_point where leisure is not null\r\n" + 
				")\r\n" + 
				"SELECT array_to_json(array_agg(row_to_json(f)))::json As feature\r\n" + 
				"     FROM (select d.category, d.geo::json, d.spec\r\n" + 
				"             from planet_osm_polygon p\r\n" + 
				"                      cross join base d\r\n" + 
				"             where 1 = 1\r\n" + 
				"               and p.name like '%Kamenné%'\r\n" + 
				"               and st_dwithin(p.way::geography, d.way::geography, 1000)\r\n" + 
				"          ) As f;");
		return result;
	}
	
	public String cats() {

		return "[\"historic\",\"leisure\",\"natural\"]";
	}
	
	public String randomLine() {
		DbConnector dbc = new DbConnector();
		String result = dbc.query("SELECT array_to_json(array_agg(row_to_json(f)))::json As feature\r\n" + 
				"     FROM (\r\n" + 
				"         select * from (\r\n" + 
				"                           select name, way as geo\r\n" + 
				"                           from planet_osm_line\r\n" + 
				"                           union\r\n" + 
				"                           select name, way as geo\r\n" + 
				"                           from planet_osm_roads\r\n" + 
				"                       ) tmp\r\n" + 
				"        where st_length(geo::geography) > 100\r\n" + 
				"        limit 1\r\n" + 
				"          ) As f;");
		return result;
	}
	

}
