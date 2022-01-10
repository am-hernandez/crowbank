import github from "../img/github.png";

function Footer() {
  return (
    <footer>
      <div id="footerInfo">
        <span>developed by am.hernandez</span>
        <a href="https://github.com/am-hernandez">
          <img src={github} alt="github logo" />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
