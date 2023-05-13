import react, { useEffect } from "react";
import { useState } from "react";
import { addItem, getItems, deleteItem } from "./Web3Client";
import "./App.css";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
import MiddleHR from "./MiddleHR";
import Footer from "./Footer";
import Navbar from "./Navbar";
import {
  failedTransaction,
  successfulTransaction,
  updateTransactionStatus,
} from "./Utilities";
import Login from "./Login";
import { providers } from "web3";
import { Contract, ethers } from "ethers";

let TodoContract = {
  address: '0x0dE61fbbBa3661C76390457550C1f68b4b6daEf6',
  abi: [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "item",
          "type": "string"
        }
      ],
      "name": "addItem",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "deleteItem",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getItems",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
}


function App() {

  const [name, setName] = useState("");
  const [items, setItems] = useState([]);
  const [LoggedIn, setLoggedIn] = useState(false);
  const [contract, setContract] = useState(null);
  async function logIn() {
    let _contract = await getContract(setContract);
    await getItems(setItems, _contract);
    setLoggedIn(true)
  }
  async function connectWallet() {
    // let destinationWallet = "";
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
    let chainId = await web3Provider.getNetwork();
    console.log({chainId});
    if (chainId.chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
    }
    const signer = web3Provider.getSigner();
    console.log("Signer obtained ", signer);
    return signer;
  }
  const getContract = async (setter) => {
    let signer = await connectWallet();
    if (!signer) return
    let _Contract = new Contract(

      TodoContract.address, TodoContract.abi, signer
    );
    console.log("the contract seems", _Contract);
    if (setter)
      setter(_Contract)
    return _Contract
  };

  function clearTransactionButtons() {
    document.getElementById("initiate").style.transform = "scale(0)";
    document.getElementById("pending").style.transform = "scale(0)";
    document.getElementById("success").style.transform = "scale(0)";
    document.getElementById("rejected").style.transform = "scale(0)";
  }
  //  clearTransactionButtons();

  function pushItem(item = undefined) {
    let stuff = [...items];
    if (item !== undefined) {
      stuff.push(item);
      setItems(stuff);
    } else getItems(setItems, contract);

    successfulTransaction();
  }


  return (
    <div className="main">
      {!LoggedIn ? (
        <div>
          <Navbar />
          <Login onClick={logIn} />
        </div>
      ) : (
        <div
          onLoad={() => setTimeout(() => {
            clearTransactionButtons();
          }, 0)}
        >
          <Navbar />
          <div className="app">
            <div className="addItem">
              <div className="title">
                <div className="title">
                  <div>Add Item</div>
                  <h6>Add Item to Blockchain</h6>
                </div>
              </div>
              <MiddleHR />

              <Form>
                <FormGroup>
                  <Label for="name">Name</Label>
                  <br />
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Type an item name"
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                  <br />
                  <Button
                    color="success"
                    className="btn-scale"
                    onClick={async (e) => {
                      console.log({contract});
                      if (document.getElementById("name").value == "") {
                        alert("Oops!!! \nWrite Item Name first");
                        return;
                      }
                      document.getElementById("name").value = "";
                      updateTransactionStatus("initiate");

                      await addItem(
                        name.toString(),
                        pushItem,
                        failedTransaction,
                        updateTransactionStatus, contract
                      );
                    }}
                  >
                    ADD
                  </Button>{" "}
                </FormGroup>
              </Form>
              <div className="transact_status" id="transact_status">
                <Button id="pending" className="pending" color="warning">
                  Pending
                </Button>
                <Button id="success" className="success" color="success">
                  Success
                </Button>
                <Button id="rejected" className="rejected" color="danger">
                  Rejected !!
                </Button>
                <Button id="initiate" className="initiate" color="info">
                  Initiated
                </Button>
              </div>
            </div>
            <div className="list">
              <div className="heading">
                <div className="title">
                  <div>Items List</div>
                  <h6>Click On Item To Delete it Out</h6>
                </div>

                <MiddleHR />
              </div>
              {!items.length ? (
                <ul className="">
                  <br />
                  <br />
                  <br />
                  <br />
                  <br />
                  <li>
                    <h1>No Items Available</h1>
                  </li>{" "}
                  <br />
                </ul>
              ) : (
                <ul>
                  {items.map((item, index) => {
                    return (
                      <li key={"item no " + index}>
                        {" "}
                        <Button
                          color="danger"
                          key={"itembutton no " + index}
                          onClick={() => {
                            updateTransactionStatus("initiate");

                            console.log("attempt to delete item ", index);

                            setTimeout(async () => {
                              await deleteItem(
                                index,
                                pushItem,
                                updateTransactionStatus, contract
                              );
                              await logIn();


                            }, 1000);
                          }}
                        >
                          {" "}
                          {item}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="title title__scroll">
                <p>Scroll Horizontal for more ( if any )</p>
                <MiddleHR />
              </div>
              <Footer key={"footer1"} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
