import { User } from "@prisma/client";
import JWT from "jsonwebtoken";
import { JWTUser } from "../interfaces";

const JWT_SECRET = process.env.JWT_SECRET;

class JWTService {
  public static generateTokenForUser(user: User) {
    const payload: JWTUser = {
      id: user.id,
      email: user.email,
    };

    const token = JWT.sign(payload, JWT_SECRET!, { algorithm: "HS256" });
    return token;
  }

  public static decodeToken(token: string) {
    try {
      return JWT.verify(token, JWT_SECRET!, {
        algorithms: ["HS256"],
      }) as JWTUser;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export default JWTService;
