export const addItem = async (
  item,
  itemsUpdator = undefined,
  txRejectionFunction = undefined,
  messageUpdator, contract
) => {
  try {
    console.log("\nAdding item on contract ", contract,item);
    messageUpdator("pending");
    let gas =await contract.estimateGas.addItem(item);
    console.log(gas);
    let res = await contract.addItem(item,{
      gasLimit:gas
    })
    await res.wait();

    itemsUpdator(item);
    messageUpdator("success");
    console.log("Item Added");
    messageUpdator("success");

  }
  catch (err) {
    console.log(err);
    if (err?.code?.toString() === "4001") {
      console.log("Transaction Rejected", err);
      if (txRejectionFunction !== undefined) {
        txRejectionFunction();
      }
    }
  }


};

export const deleteItem = async (
  itemNumber,
  updateItems = undefined,
  messageUpdator, contract
) => {
  console.log("\nDeleting item on contract ", contract);
  messageUpdator("pending");
  let gas =await contract.estimateGas.deleteItem(itemNumber);

  const res = await contract
    .deleteItem(itemNumber,{
      gasLimit:gas
    })
  console.log("Item deleted");
  updateItems();
  return;

};

export const getItems = async (setItems, contract) => {
  try {
    console.log("\nattempt to get items on ", contract, "methods", contract.getItems);
    let r = await contract.getItems()
    console.log("in get  Items, items got", r);
    setItems(r);
    return r;

  }
  catch (e) {
    console.log(e);

    setItems([])
  }

};
