import { NextPage } from "next"
import { useAddress, useDisconnect, useMetamask, useSDK } from '@thirdweb-dev/react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from 'next/router';
import { 
  Button, 
  Flex, 
  Input,
  useToast,
  Heading,
  Container,
  Text,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
interface Review {
  user: string;
  review: string;
  rating: number;
}
interface ReviewsProps {
  reviews: Review[];
}

const Home: NextPage<ReviewsProps> = () => {
  const sdk = useSDK();
  const address = useAddress();
  const connect = useMetamask();
  const disconnect = useDisconnect();
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const getReviews = async () => {
      const res = await fetch("/api/reviews");
      const { reviews } = await res.json();
      setReviews(reviews)
    }

    getReviews();
  }, [])

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
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(review)
    })
    const { message } = await res.json();
    toast(message);
    router.reload();
  }

  return (
    <>
      <Container maxW="3xl">
        <Flex
          textAlign="center"
          direction="column"
          gap={{ base: 8, md: 14 }}
          py={{ base: 12, md: 24 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            WEB3SF Workshop <br />
            <Text as={"span"} color={"purple.400"}>
              Adding a POAP Reward to a Customer Review App
            </Text>
          </Heading>
          <Text color={"gray.500"}>
            Take a moment to login and review our workshop and you will receive a
            commemorative digital collectible.
          </Text>

          <Stack spacing={0}>
            <Flex 
              direction="column"
              padding="12px"
              marginTop="12px"
              borderRadius="md"
              border="2px solid #EAEAEA"
              borderBottomRadius={session?.user ? "0px" : "md"}
              gap={4}
            >  
              {address ? (
                <>
                  <Text color="gray.600">Address: {address}</Text>
                  <Button onClick={disconnect}>Disconnect Wallet</Button>
                  {session?.user ? (
                      <Button onClick={() => signOut()}>Logout</Button>
                  ) : (
                    <>
                      <Button onClick={googleLogin}>Login with Google</Button>
                      <Button onClick={walletLogin}>Login with Wallet</Button>
                    </>
                  )}
                </>
              ) : (
                <Button onClick={connect}>Connect Wallet</Button>
              )}
            </Flex>
            {address && session?.user && (
              <Flex 
                direction="column"
                padding="12px"
                borderRadius="md"
                border="2px solid #EAEAEA"
                borderTopRadius="0px"
                borderTop="transparent"
                gap={4}
              >
                <Flex 
                  as="form"
                  direction="column"
                  padding="12px"
                  bg="gray.200"
                  gap={4}
                  borderRadius="md"
                  onSubmit={(e: any) => {
                    e.preventDefault();
                    createReview({
                      review: e.target.review.value,
                      rating: parseInt(e.target.rating.value)
                    })
                  }}
                >
                  <Textarea name="review" bg="white" placeholder="Review" />
                  <Input name="rating" bg="white" type="number" placeholder="Rating" />
                  <Button type="submit" colorScheme="purple">Submit Review</Button>
                </Flex>
              </Flex>
            )}
          </Stack>
        </Flex>

        <Heading fontWeight="600" textAlign="center" mb="24px">
          Reviews
        </Heading>
  
        <Stack spacing={8} mb="64px">
          {reviews.map((review, id) => (
            <Flex 
              key={id} 
              direction="column"
              border={review.user.startsWith("0x") ? "2px solid gray" : "2px solid #EAEAEA"}
              borderRadius="md"
              padding="12px"
            >
              <Text>
                User: {review.user}<br/>
                Review: {review.review}<br/>
                Rating: {review.rating}
              </Text>
            </Flex>
          ))}
        </Stack>
      </Container>
    </>
  )
}

export default Home;