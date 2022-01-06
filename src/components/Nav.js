function Nav() {
  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }
  return (
    <nav>
      <button onClick={requestAccount} id="connectBtn">
        connec
      </button>
    </nav>
  );
}

export default Nav;
