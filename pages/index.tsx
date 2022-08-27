import { NextPage } from "next"
import { 
  Flex, 
  Heading,
  Container,
  Text,
  Stack,
  Avatar,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Login } from "../components/Login";
import { Review } from "../components/Review";

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
  const [reviews, setReviews] = useState<Review[]>([]);

  const getReviews = async () => {
    const res = await fetch("/api/reviews");
    const { reviews } = await res.json();
    setReviews(reviews)
  }

  useEffect(() => {
    getReviews();

    const refetch = setInterval(() => {
      getReviews()
    }, 10000);

    return () => {
      clearInterval(refetch);
    }
  }, [])

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

          <Login />
          <Review getReviews={getReviews} />
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