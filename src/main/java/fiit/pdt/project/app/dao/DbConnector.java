package fiit.pdt.project.app.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class DbConnector {
	String url = "jdbc:postgresql://localhost:5432/gis";
    String user = "postgres";
    String password = "";
    
	public DbConnector() {
    }

	public void select() {
		
		

        try (Connection con = DriverManager.getConnection(url, user, password);
                Statement st = con.createStatement();
                ResultSet rs = st.executeQuery("Select distinct d.name  \r\n" + 
                		"from planet_osm_polygon p  \r\n" + 
                		"cross join planet_osm_polygon d  \r\n" + 
                		"where p.name = 'Karlova Ves'  \r\n" + 
                		"  and d.boundary = 'administrative'  \r\n" + 
                		"  and d.ref is not null  \r\n" + 
                		"and st_touches(p.way,d.way)")) {

            if (rs.next()) {
                System.out.println(rs.getString(1));
            }

        } catch (SQLException ex) {
        	System.out.println(ex);
        }
	}
	
	public String query(String statement) {
		String result = "";
		

        try (Connection con = DriverManager.getConnection(url, user, password);
                Statement st = con.createStatement();
                ResultSet rs = st.executeQuery(statement)) {

            while (rs.next()) {
                result += rs.getString(1);
            }
            
            
        } catch (SQLException ex) {
        	System.out.println(ex);
        	return "";
        }
        
        return result;
	}

}
