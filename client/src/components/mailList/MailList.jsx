import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeOpenText } from "@fortawesome/free-solid-svg-icons";
import "./mailList.css";

// Demo-only: there is no newsletter backend, so this just confirms locally.
const MailList = () => {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="container section">
      <div className="mail">
        <div className="mailText">
          <FontAwesomeIcon icon={faEnvelopeOpenText} className="mailIcon" />
          <div>
            <h2 className="mailTitle">Save time, save money!</h2>
            <p className="mailDesc">Sign up and we will send the best deals straight to your inbox.</p>
          </div>
        </div>
        {subscribed ? (
          <p className="mailThanks">Thanks for subscribing!</p>
        ) : (
          <form
            className="mailForm"
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
          >
            <input className="input" type="email" placeholder="Your email address" required aria-label="Email address" />
            <button className="btn btn-accent" type="submit">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default MailList;
