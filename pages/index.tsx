import { NextPage } from "next"
import { ConnectWallet, useAddress, useSDK } from '@thirdweb-dev/react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from 'next/router';
import { 
  Button, 
  Flex, 
  useToast,
  Heading,
  Container,
  Text,
  Stack,
  Avatar,
  Select,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

interface Review {
  user: string;
  review: string;
  rating: number;
  image: string;
}
interface ReviewsProps {
  reviews: Review[];
}

const Home: NextPage<ReviewsProps> = () => {
  const sdk = useSDK();
  const toast = useToast();
  const router = useRouter();
  const address = useAddress();
  const { data: session } = useSession();
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

  const createReview = async (review: string) => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ review })
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

          <Flex 
            as="form"
            direction="column"
            padding="12px"
            bg="gray.200"
            gap={4}
            borderRadius="md"
            align="center"
          >
            {session?.user ? (
              <Flex justify="space-between" width="100%" align="center">
                <Stack direction="row" align="center" spacing={5}>
                  <Avatar src={session.user.image || ""} />
                  <Text fontWeight="medium">
                    {(session.user as any).address || session.user.email}
                  </Text>
                </Stack>
                <Button 
                  onClick={() => signOut()} 
                  width="200px"
                  bg="white"
                  _hover={{
                    bg: "gray.100"
                  }}
                >
                  Logout
                </Button>
              </Flex>
            ) : (
              <>
                <Button 
                  bg="white"
                  onClick={googleLogin} 
                  leftIcon={<Icon as={FcGoogle} />}
                  width="200px"
                  _hover={{
                    bg: "gray.100"
                  }}
                >
                  Login with Google
                </Button>
                {address ? (
                  <Button
                    onClick={walletLogin}
                    width="200px"
                    bg="white"
                    _hover={{
                      bg: "gray.100"
                    }}
                  >
                    Login with Wallet
                  </Button>
                ) : (
                  <ConnectWallet />
                )}
              </>
            )}
          </Flex>

          {address && session?.user && (
            <Flex 
              as="form"
              direction="column"
              padding="12px"
              bg="gray.200"
              gap={4}
              borderRadius="md"
              onSubmit={(e: any) => {
                e.preventDefault();
                createReview(e.target.review.value)
              }}
            >
              <Text fontWeight="bold">
                How good was this session?
              </Text>
              <Select name="review" bg="white">
                <option value="Life changing">Life changing</option>
                <option value="Helpful for sure">Helpful for sure</option>
                <option value="Aight">Aight</option>
                <option value="Waste of time">Waste of time</option>
              </Select>
              <Button type="submit" colorScheme="purple">Submit Review</Button>
            </Flex>
          )}
        </Flex>

        <Heading fontWeight="600" textAlign="center" mb="24px">
          Reviews
        </Heading>
  
        <Stack spacing={8} mb="64px">
          {reviews.map((review, id) => (
            <Flex 
              key={id} 
              border="2px solid #EAEAEA"
              borderRadius="md"
              padding="12px"
              gap={4}
            >
              <Avatar src={review.image || ""} />
              <Stack spacing={0}>
                <Text fontWeight="bold">
                  {review.review}<br/>
                </Text>
                <Text fontSize="14px" color="gray.500">
                  {review.user}<br/>
                </Text>
              </Stack>
            </Flex>
          ))}
        </Stack>
      </Container>
    </>
  )
}

export default Home;