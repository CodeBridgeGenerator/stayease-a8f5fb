import AppSideBar from "./appSideBar/AppSideBar.js";

/*

import ProductsPage from "../ProductsPage/ProductsPage";
import ListingsPage from "../ListingsPage/ListingsPage";
import BookingsPage from "../BookingsPage/BookingsPage";
import ReviewsPage from "../ReviewsPage/ReviewsPage";
~cb-add-import~

~cb-add-services-card~

case "products":
                return <ProductsPage />;
case "listings":
                return <ListingsPage />;
case "bookings":
                return <BookingsPage />;
case "reviews":
                return <ReviewsPage />;
~cb-add-thurthy~

*/

const AppLayout = (props) => {
  const { children, activeKey, activeDropdown } = props;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] mt-20 bg-white">
      <AppSideBar activeKey={activeKey} activeDropdown={activeDropdown} />
      <div className="flex-1 ml-2">{children}</div>
    </div>
  );
};

export default AppLayout;
