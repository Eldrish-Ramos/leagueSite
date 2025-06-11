function Footer() {
  return (
    <footer className="footer py-3 mt-auto">
      <div className="container text-center">
        <small className="gwen-footer-text">
          &copy; {new Date().getFullYear()} LeagueStats. All rights reserved.
        </small>
      </div>
    </footer>
  );
}

export default Footer;