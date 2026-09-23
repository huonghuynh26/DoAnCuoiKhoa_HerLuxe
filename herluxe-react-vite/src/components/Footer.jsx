import { Link } from "react-router-dom";

export default function Footer() {
  return <footer className="footer">
    <div className="footer-logo"><Link to="/"><img src="/images/logo1.png" alt="HerLuxe Logo" /></Link></div>
    <div className="footer-line"></div>
    <div className="footer-content">
      <div className="footer-column"><Link to="/about">ABOUT US</Link><Link to="/faq">FAQ</Link><Link to="/contact">CONTACT</Link><Link to="/collections">COLLECTIONS</Link><Link to="/admin">ADMIN</Link></div>
      <div className="footer-column"><h3>CUSTOMER SERVICE</h3><p>support@herluxe.com</p><p>012-345-6789</p></div>
      <div className="footer-column address"><p>123 Nguyen Trai Street,<br />District 1, Ho Chi Minh City,<br />Vietnam</p><div className="footer-social"><a href="https://facebook.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-facebook-f"></i></a><a href="https://instagram.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-instagram"></i></a><a href="https://youtube.com" target="_blank" rel="noreferrer"><i className="fa-brands fa-youtube"></i></a></div></div>
    </div>
    <div className="copyright">2026 HerLuxe. All Rights reserved</div>
  </footer>;
}
