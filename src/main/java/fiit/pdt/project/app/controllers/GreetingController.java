package fiit.pdt.project.app.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import fiit.pdt.project.app.dao.DbConnector;

@RestController
public class GreetingController {

	@RequestMapping("/greeting")
    public String greeting(@RequestParam(name="name", required=false, defaultValue="World") String name) {
        return "greeting " + name;
    }
	
	@RequestMapping("/data.json")
	public String data() {
		
		return supermarkets();
	}
	
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
		System.out.println("{ \"arr\": " + result + " }");
		
		return "{\"arr\": " + result + "}";
	}
	

}
