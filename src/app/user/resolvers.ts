import axios from "axios";
import { prismaClient } from "../../client/db";
import { GraphQLContext } from "../../interfaces";
import JWTService from "../../services/jwt";

interface GoogleTokenResult {
  iss?: string;
  azp?: string;
  aud?: string;
  sub?: string;
  email: string;
  email_verified: string;
  nbf?: string;
  name: string;
  picture?: string;
  given_name: string;
  family_name?: string;
  iat?: string;
  exp?: string;
  jti?: string;
  alg?: string;
  kid?: string;
  typ?: string;
}

const queries = {
  verifyGoogleToken: async (_parent: any, { token }: { token: string }) => {
    const googleToken = token;
    const googleOAuthUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
    googleOAuthUrl.searchParams.set("id_token", googleToken);

    const { data } = await axios.get<GoogleTokenResult>(
      googleOAuthUrl.toString(),
      {
        responseType: "json",
      }
    );

    const user = await prismaClient.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      await prismaClient.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageUrl: data.picture,
        },
      });
    }

    const userInDb = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (!userInDb) {
      throw new Error("No user found with this email!");
    }

    const userToken = JWTService.generateTokenForUser(userInDb);

    return userToken;
  },
  getCurrentUser: async (_parent: any, _args: any, ctx: GraphQLContext) => {
    console.log(ctx);
    const id = ctx.user?.id;
    if (!id) return null;

    const user = await prismaClient.user.findUnique({ where: { id } });
    return user;
  },
};

export const resolvers = { queries };
