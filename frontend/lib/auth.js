import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_TOKEN);

export async function createToken(user){

    return await new SignJWT({
        id:user.id,
        role:user.role,
        email:user.email
    })
    .setProtectedHeader({alg:"HS256"})
    .setExpirationTime("7d")
    .sign(secret)

}

export async function verifyToken(token){

    const {payload}=await jwtVerify(token,secret)

    return payload

}