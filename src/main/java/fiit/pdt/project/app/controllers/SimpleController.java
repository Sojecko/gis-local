package fiit.pdt.project.app.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fiit.pdt.project.app.dao.DbConnector; 

@RestController
public class SimpleController {

	/*@RequestMapping("/")
    public String homePage() {
		DbConnector dbc = new DbConnector();
		
		dbc.select();
		
        return "Hello world!\n";
    }*/
}