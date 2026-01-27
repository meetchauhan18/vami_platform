// local imports
import BaseService from "@/core/services/BaseService.js";
import { LoginRequestSchema, RegisterRequestSchema } from "./auth.schema.js";

// Auth related
class AuthService extends BaseService {
  constructor() {
    super("/auth");
  }

  register(payload) {
    return this.post("register", payload, {
      requestSchema: RegisterRequestSchema,
    });
  } 

  login(payload) {
    return this.post("login", payload, {
      requestSchema: LoginRequestSchema,
    });
  }

  profile() {
    return this.get("profile");
  }

  refreshToken() {
    return this.post("refresh-token");
  }

  logout() {
    return this.post("logout");
  }
}

export default new AuthService();
