import React from "react";
// import { NavBar } from "./NavBar";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';

import image from "../images/image.jpg";
import image_2 from "../images/image_2.jpg";
import image_3 from "../images/image_3.jpg";
import image_4 from "../images/image_4.jpg";

import rec_1 from '../images/rec_1.png'
import rec_2 from '../images/rec_2.png'
import rec_3 from '../images/rec_3.png'
import rec_4 from '../images/rec_4.png'

import './land.css'

// import vector from "./vector.svg";

const MacbookPro = () => {
  return (
    <>
    {/* INTRO */}
    <section className="intro bg-white">
<div className="intro_text">
  <h1 className="text-white">WELCOME TO AGRILINK</h1>
    <h4>Empowering Farmers,<br></br>
    Connecting Buyers With <span className="gri">AgriLink</span></h4>
    <span className="start">Your Marketplace for Fresh, Direct-from-Farm Produce!</span>
    <div className="mt-5">GET STARTED</div>
</div>

<div className="intro_img">
    {/* <img src={image} alt='farmer_1'></img> */}
</div>

    </section>
    {/* END INTRO */}

{/* ABOUT */}
<section className="about mt-3 bg-white">
<p className="head">
  Connect Directly with Farmers for freshProduce
</p>

<div className="delivery">
  <div className="delivery_text">
  <h5>Reliable Delivery – Your Farm-to-Table Solution!</h5>
  <span className="text">Enjoy a seamless farm-to-table journey with trusted delivery you can <br></br>
  count on. Check our available delivery services...</span>

  <span className="book">Book Now <i class="bi bi-arrow-right"></i></span>
  </div>

  <div className="delivery_image">
    <img src={image_2} alt="track"></img>
  </div>
</div>

<div className="ai_driven">
  <div className="driven_image">
<img src={image_3} alt="ai_driven"></img>
  </div>

<div className="driven_text">
  <h4>Order Smarter, Not Harder, <br></br>
  AI-Powered Simplicity at Your Fingertips!</h4>

  <p>Our AI-driven system streamlines ordering, making it as easy as a few taps for <br></br>
  quick, hassle-free purchases.</p>

  <span>Get Started <i class="bi bi-arrow-right"></i></span>
</div>
</div>
</section>
{/* END ABOUT */}

{/* TESTIMONY */}
<section className="testmony mt-3">
 <div className="testmony_text">
<h3>Real Stories, Real Impact</h3>
<h5 className="say">What Our Users Are Saying</h5>

<div className="testimonies">
  <div className="james">
    <p>AgriLink has completely transformed 
      how I buy fresh produce. The direct connection to farmers is fantastic, and with the AI recommendations, I always get exactly what I’m looking for in seconds. It’s reliable, easy, 
      and I feel great supporting local farmers!</p>

      <h5>James K., Satisfied Buyer</h5>
  </div>

  <div className="sarah">
    <p>As a farmer, AgriLink has helped me reach
       more buyers directly and showcase the quality of my produce. The AI insights make pricing and selling so much easier, and the platform’s logistics options have taken the hassle out of delivery. 
      This is the future of farming!</p>

      <h5>Sarah M., Small-Scale Farmer</h5>
  </div>
</div>

<div className="million_users">

   <Stack direction="row" className="users">
      <Avatar alt="Remy Sharp" src={rec_1} className="rec_1"/>
      <Avatar alt="Travis Howard" src={rec_2} className="rec_2"/>
      <Avatar alt="Cindy Baker" src={rec_3} className="rec_3" />
      <Avatar alt="Cindy Baker" src={rec_4} className="rec_4" />
    </Stack>
  <div className="join">
    <h4>Join <br></br>+500 Million Users</h4>
  </div>
</div>
  </div> 

<div className="testmony_image">
  <img src={image_4} alt="testimony"></img>
</div>

</section>
{/* END TESTMONY */}

{/* footer */}
<footer>
<h4>AgriLink</h4>
<span>Connecting Farmers & Buyers Directly</span>

<div className="social">
  <div className="links">
    <h4>Quick links</h4>
    <ul>
      <li>About Us</li>
      <li>Contact Us</li>
      <li>Help Center</li>
      <li>FAQs</li>
      <li>Terms & Conditions</li>
    </ul>
  </div>

  <div className="social_links">
    <h4>Stay Connected</h4>

    <ul>
      <li>Facebook</li>
<li>Twitter</li>
<li>Instagram</li>
<li>LinkedIn</li>
    </ul>
  </div>

  <div className="email">
    <h4>Contact</h4>

    <ul>
      <li>support@agrilink.com</li>
      <li>+1 123 456 7890</li>
    </ul>
  </div>
</div>

<p>© 2024 AgriLink. All Rights Rserved</p>
</footer>
{/* END FOOTER */}

    </>
  )
};

export default MacbookPro;
