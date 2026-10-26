import { createHmac, randomUUID } from "node:crypto";

// Signs ImageKit client uploads. Only signed-in Firebase users get a signature.
async function isSignedIn(idToken: string) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );
  return res.ok;
}

export async function GET(request: Request) {
  const idToken = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!idToken || !(await isSignedIn(idToken)))
    return Response.json({ error: "No autorizado" }, { status: 401 });

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  if (!privateKey || !publicKey)
    return Response.json({ error: "ImageKit sin configurar" }, { status: 500 });

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const signature = createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  return Response.json({ token, expire, signature, publicKey });
}
