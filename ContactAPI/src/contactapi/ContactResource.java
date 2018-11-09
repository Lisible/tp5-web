package contactapi;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.bson.Document;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;
import com.mongodb.util.JSON;
import com.sun.research.ws.wadl.Application;

@Path("/contact")
public class ContactResource {
	
	private String generateRandomId() {
		final char[] chars = "abcdefghijklmnopqrstuvwxyz0123456789".toCharArray();
		StringBuilder sb = new StringBuilder(10);
		Random random = new Random();
		for(int i = 0; i < 6; i++) {
			char c = chars[random.nextInt(chars.length)];
			sb.append(c);
		}
		
		return sb.toString();
	}
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getContacts() {
		MongoClient mongoClient = new MongoClient();
		MongoDatabase db = mongoClient.getDatabase("contact");
		MongoCollection<Document> collection = db.getCollection("contactCollection");
		MongoCursor<Document> it = collection.find().iterator();

		List<Document> list = new ArrayList<Document>();
		while(it.hasNext()) {
			Document doc = it.next();
			list.add(doc);
		}
	
		mongoClient.close();
		
		return Response.status(200).entity(JSON.serialize(list)).type(MediaType.APPLICATION_JSON).build();
	}
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{id}")
	public Response getContact(@PathParam("id") String id) {

		MongoClient mongoClient = new MongoClient();
		MongoDatabase db = mongoClient.getDatabase("contact");
		MongoCollection<Document> collection = db.getCollection("contactCollection");
		FindIterable<Document> it = collection.find(Filters.eq("id", id));	
		Document doc = it.first();
		
		mongoClient.close();
		
		if(doc == null)
			return Response.status(404).entity(new APIResponse(404, "Not found", "Contact not found")).build();
			
		return Response.status(200).entity(doc).build();
	}
	
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response createContact(Contact contact) {
		APIResponse response = null;
		MongoClient mongoClient = null;
		try {			
			mongoClient = new MongoClient();
			MongoDatabase db = mongoClient.getDatabase("contact");
			MongoCollection<Document> collection = db.getCollection("contactCollection");
			
			MyObjectMapperProvider provider = new MyObjectMapperProvider();
			ObjectMapper mapper = provider.getContext(Contact.class);
			String json = mapper.writeValueAsString(contact);
			Document doc = Document.parse(json);
			
			String id = generateRandomId();
			while(collection.count(Filters.eq("id", id)) != 0)
				id = generateRandomId();
			
			doc.append("id", id);
			collection.insertOne(doc);
			
			
			response = new APIResponse(200, "Ok", "Contact successfully created");
		} catch (Exception e) {
			response = new APIResponse(422, "Unprocessable entity", "The given data was ill-formed");
		}
		finally {
			mongoClient.close();
		}
		
		return Response.status(response.getCode()).entity(response).build();
	}
	
	@PUT
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{id}")
	public Response updateContact(@PathParam("id") String id, Contact contact) {
		APIResponse response = null;
		
		MongoClient mongoClient = new MongoClient();
		MongoDatabase db = mongoClient.getDatabase("contact");
		MongoCollection<Document> collection = db.getCollection("contactCollection");
		
		MyObjectMapperProvider provider = new MyObjectMapperProvider();
		ObjectMapper mapper = provider.getContext(Contact.class);
		String json;
		try {
			json = mapper.writeValueAsString(contact);
			BasicDBObject updateFields = (BasicDBObject) JSON.parse(json);
			BasicDBObject setQuery = new BasicDBObject();
			setQuery.append("$set", updateFields);
			
			UpdateResult result = collection.updateOne(Filters.eq("id", id), setQuery);
			if(result.getModifiedCount() == 0)
				response = new APIResponse(404, "Not found", "Contact not found");
			else
				response = new APIResponse(200, "Ok", "Contact successfully updated");
		} catch (JsonProcessingException e) {
			response = new  APIResponse(422, "Unprocessable Entity", "Data is ill-formed");
		}
		
		mongoClient.close();
		return Response.status(response.getCode()).entity(response).build();
	}
	
	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{id}")
	public Response deleteContact(@PathParam("id") String id) {
		APIResponse response = null;
		
		MongoClient mongoClient = new MongoClient();
		MongoDatabase db = mongoClient.getDatabase("contact");
		MongoCollection<Document> collection = db.getCollection("contactCollection");
		
		DeleteResult d = collection.deleteOne(Filters.eq("id", id));
		if(d.getDeletedCount() == 0)
			response = new APIResponse(404, "Not found", "No contact with the given id");
		else
			response = new APIResponse(200, "Ok", "Contact successfully deleted");
		
		mongoClient.close();
		return Response.status(response.getCode()).entity(response).build();
	}
}
