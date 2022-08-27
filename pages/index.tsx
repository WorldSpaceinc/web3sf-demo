import { NextPage } from "next"
import { useAddress, useDisconnect, useMetamask, useSDK } from '@thirdweb-dev/react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from 'next/router';

interface Review {
  user: string;
  review: string;
  rating: number;
}
interface ReviewsProps {
  reviews: Review[];
}

const Home: NextPage<ReviewsProps> = ({ reviews }) => {
  const sdk = useSDK();
  const address = useAddress();
  const connect = useMetamask();
  const disconnect = useDisconnect();
  const { data: session } = useSession();
  const router = useRouter();

  const googleLogin = async () => {
    const res = await signIn("google", { redirect: false });
    router.push(res?.url || "");
  }

  const walletLogin = async () => {
    if (!sdk) {
      throw new Error("No SDK")
    }

    const payload = await sdk.auth.login("thirdweb.com");
    const res = await signIn("credentials", { payload: JSON.stringify(payload), redirect: false });
    router.push(res?.url || "");
  }

  const createReview = async (review: Omit<Review, "user">) => {
    await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(review)
    })
    router.reload();
  }

  return (
    <>
      <div 
        style={{
          flexDirection: "column", 
          display: "flex", 
          padding: "12px", 
          margin: "8px", 
          background: "gray" 
        }}
      >  
        {address ? (
          <>
            <button onClick={disconnect}>Disconnect Wallet</button>
            <button onClick={googleLogin}>Login with Google</button>
            <button onClick={walletLogin}>Login with Wallet</button>
            <button onClick={() => signOut()}>Logout</button>
            <p>Your address: {address}</p>
            <pre>User: {JSON.stringify(session?.user || null)}</pre>
          </>
        ) : (
          <button onClick={connect}>Connect Wallet</button>
        )}
      </div>
      <div style={{ flexDirection: "column", display: "flex" }}>
        <form 
          style={{
            flexDirection: "column", 
            display: "flex", 
            padding: "12px", 
            margin: "8px", 
            background: "gray",
            gap: "4px"
          }}
          onSubmit={(e: any) => {
            e.preventDefault();
            createReview({
              review: e.target.review.value,
              rating: parseInt(e.target.rating.value)
            })
          }}
        >
          <input name="review" placeholder="Description" />
          <input name="rating" type="number" placeholder="Rating" />
          <button type="submit">Create Review</button>
        </form>
        {reviews.map((review, id) => (
          <div key={id} style={{ 
            flexDirection: "column", 
            display: "flex", 
            background: "gray", 
            margin: "8px", 
            padding: "8px" 
          }}>
            <p>
              User: {review.user}<br/>
              Review: {review.review}<br/>
              Rating: {review.rating}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

export async function getServerSideProps() {
  const res = await fetch("http://localhost:3000/api/reviews");
  const { reviews } = await res.json();

  return {
    props: { reviews }
  }
}

export default Home