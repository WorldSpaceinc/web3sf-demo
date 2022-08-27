import { 
  Button, 
  Flex, 
  Text,
  Stack,
  Avatar,
  Icon,
} from "@chakra-ui/react";
import { ConnectWallet, useAddress, useSDK } from "@thirdweb-dev/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FcGoogle } from "react-icons/fc";

export const Login: React.FC = () => {
  const sdk = useSDK();
  const router = useRouter();
  const address = useAddress();
  const { data: session } = useSession();

  const loginWithGoogle = async () => {
    const res = await signIn("google", { redirect: false });
    router.push(res?.url || "");
  }

  const loginWithWallet = async () => {
    if (!sdk) {
      throw new Error("No SDK")
    }

    const payload = await sdk.auth.login("thirdweb.com");
    const res = await signIn("credentials", { payload: JSON.stringify(payload), redirect: false });
    router.push(res?.url || "");
  }
  
  return (
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
            onClick={loginWithGoogle} 
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
              onClick={loginWithWallet}
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
  )
}