package contactapi;

import javax.ws.rs.ext.ContextResolver;

import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

public class MyObjectMapperProvider implements ContextResolver<ObjectMapper> {

	final ObjectMapper defaultObjectMapper;
	
	public MyObjectMapperProvider() {
		defaultObjectMapper = createDefaultMapper();
	}
	
	@Override
	public ObjectMapper getContext(Class<?> type) {
		return defaultObjectMapper;
	}

    private static ObjectMapper createDefaultMapper() {
        final ObjectMapper result = new ObjectMapper();
        result.enable(SerializationFeature.INDENT_OUTPUT);
        result.setVisibility(PropertyAccessor.FIELD, Visibility.ANY);

        return result;
    }

}
