import { useParams } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";

// Route /payment/:id — :id is the inbox-quote (signed agreement) _id.
// CheckoutForm resolves the agreement, saves the order and redirects to Mollie.
const Payment = () => {
  const { id } = useParams();
  return <CheckoutForm id={id} />;
};

export default Payment;
