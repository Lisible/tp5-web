package contactapi;

import javax.ws.rs.ApplicationPath;

import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.ServerProperties;

@ApplicationPath("/")
public class ContactManager extends ResourceConfig {

	public ContactManager() {
		packages("contactapi");
		
		register(new CorsFilter());
		register(MyObjectMapperProvider.class);
		
		property(ServerProperties.TRACING, "ALL");
	}
}
