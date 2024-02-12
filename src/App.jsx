import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  Stack,
  Tag,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";
import { Alchemy, Network, Utils } from "alchemy-sdk";
import { useState } from "react";
import { ethers } from "ethers";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const config = {
  apiKey: "41OudlYcEsCtkZqFwVEID_D3SI6vfJAm",
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

function App() {
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState();
  const [account, setAccount] = useState();

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
    }
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  }

  async function getTokenBalance(address) {
    const data = await alchemy.core.getTokenBalances(address);

    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }
    setHasQueried(true);
    setTokenDataObjects(await Promise.all(tokenDataPromises));
  }

  async function getWalletBalance() {
    if (!account) {
      alert("Please Connect Wallet");
    }
    await getTokenBalance(account);
  }

  async function getQueryBalance() {
    const addr = document.getElementById("inputAddress").value;
    const isAddress = ethers.utils.isAddress(addr);
    const isENS = await alchemy.core.resolveName(addr);
    if (!isAddress && isENS == null) {
      alert("Please type a valid address!");
    } else {
      await getTokenBalance(addr);
    }
  }

  return (
    <Box w="100vw">
      <Stack align="end" m={5}>
        {!account ? (
          <Button
            className="connect"
            variant="outline"
            onClick={connectWallet}
            size="sm"
            colorScheme="teal"
          >
            Connect Wallet
          </Button>
        ) : (
          <Tag
            size="lg"
            fontSize={20}
            color="black"
            // colorScheme="teal"
            className="connect"
            bg="lime"
            borderRadius="5px"
          >
            Connected
          </Tag>
        )}
      </Stack>
      <Center m={10}>
        <Flex
          alignItems={"center"}
          justifyContent="center"
          flexDirection={"column"}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
          <Button
            fontSize={20}
            onClick={getWalletBalance}
            mt={3}
            bg="blue"
            className="connected"
          >
            Click to see your ERC-20 Token Balances
          </Button>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={"center"}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          id="inputAddress"
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
          placeholder="Please type a wallet address"
        />
        <Button
          fontSize={20}
          onClick={getQueryBalance}
          mt={36}
          bgColor="blue"
          className="connected"
        >
          Check ERC-20 Token Balances
        </Button>

        <Heading my={36}>ERC-20 token balances:</Heading>

        {hasQueried ? (
          <div>
            {!tokenDataObjects ? (
              <Alert status="info" variant="subtle">
                <AlertIcon boxSize="20px" />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  Loading Tokens...
                </AlertTitle>
              </Alert>
            ) : (
              <SimpleGrid w={"90vw"} columns={4} spacing={24}>
                {results.tokenBalances.map((e, i) => {
                  return (
                    <Flex
                      flexDir={"column"}
                      color="black"
                      bg="white"
                      w={"10vw"}
                      key={e.id}
                      border="1px"
                      borderColor="gray.200"
                    >
                      <Box>
                        <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                      </Box>
                      <Box>
                        <b>Balance:</b>&nbsp;
                        {Utils.formatUnits(
                          e.tokenBalance,
                          tokenDataObjects[i].decimals
                        ).slice(0, 12)}
                      </Box>
                      <Image className="image" src={tokenDataObjects[i].logo} />
                    </Flex>
                  );
                })}
              </SimpleGrid>
            )}
          </div>
        ) : (
          "Please make a query! This may take a few seconds..."
        )}
      </Flex>
    </Box>
  );
}

export default App;
