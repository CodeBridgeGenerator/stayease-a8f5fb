import React from "react";
import { connect } from "react-redux";
import BookingsPage from "./BookingsPage";

const BookingProjectLayoutPage = (props) => {
  return <BookingsPage />;
};

const mapState = (state) => {
  const { user, isLoggedIn } = state.auth;
  return { user, isLoggedIn };
};

const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(BookingProjectLayoutPage);