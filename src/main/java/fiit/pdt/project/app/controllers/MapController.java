package fiit.pdt.project.app.controllers;

import org.springframework.web.bind.annotation.RequestMapping;

import fiit.pdt.project.app.dao.DbConnector;

public class MapController {

	public MapController() {
		// TODO Auto-generated constructor stub
	}

	@RequestMapping("/map")
    public String homePage() {
		DbConnector dbc = new DbConnector();
		
		dbc.select();
		
        return "Hello world!\n";
    }
}
