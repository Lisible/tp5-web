package contactapi;

public class APIResponse {
	private int code;
	private String type;
	private String message;
	
	public APIResponse(int code, String type, String message) {
		this.code = code;
		this.type = type;
		this.message = message;
	}

	public int getCode() {
		return code;
	}
}
