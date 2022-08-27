import { Flex, Text, Select, Button, useToast } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

interface ReviewProps {
  getReviews: () => void;
}

export const Review: React.FC<ReviewProps> = ({ getReviews }) => {
  const toast = useToast();
  const { data: session } = useSession();

  const createReview = async (review: string) => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ review })
    })
    const { message } = await res.json();
    toast({
      status: "success",
      title: message,
      duration: 5000,
    });
    getReviews();
  }

  if (!session?.user) {
    return null;
  }

  return (
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
  )
}