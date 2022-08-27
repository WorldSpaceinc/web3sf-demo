import { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession } from "next-auth"
import { getNextAuthConfig } from "./auth/[...nextauth]"
import { PrismaClient } from '@prisma/client'
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

const prisma = new PrismaClient();

const privateKey = process.env.THIRDWEB_AUTH_PRIVATE_KEY || "";
const sdk = ThirdwebSDK.fromPrivateKey(privateKey, "avalanche-fuji");

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const reviews = await prisma.review.findMany();
    return res.json({ reviews: reviews.reverse() });
  }

  if (req.method === "POST") {
    const session = await unstable_getServerSession(req, res, getNextAuthConfig(req, res));
  
    if (!session) {
      res.status(401).json({ message: "Not authorized." });
      return;
    }
  
    const { review } = req.body;

    await prisma.review.create({
      data: { 
        user: (session.user as any)?.address || session.user?.email || "", 
        image: session.user?.image || "",
        review,
      },
    })

    const address = (session.user as any).address;
    if (address) {
      const contract = sdk.getEditionDrop(process.env.EDITION_DROP_ADDRESS || "");
      const balance = await contract.balanceOf(address, 0);

      if (balance.toNumber() === 0) {
        contract.claimTo(address, 0, 1);
        return res.status(200).json({
          message: "Successfully signed in. You've also received an NFT for joining!"
        });
      }
    }

    return res.status(200).json({
      message: "Successfully signed in."
    });
  }

  return res.status(400).end();
}

export default handler