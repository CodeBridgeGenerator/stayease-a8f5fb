import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { SplitButton } from "primereact/splitbutton";
import client from "../../../services/restClient";
import CommentsSection from "../../common/CommentsSection";
import ProjectLayout from "../../Layouts/ProjectLayout";

import { Calendar } from 'primereact/calendar';

const SingleBookingsPage = (props) => {
    const navigate = useNavigate();
    const urlParams = useParams();
    const [_entity, set_entity] = useState({});
  const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);

    const [listingId, setListingId] = useState([]);
const [customerId, setCustomerId] = useState([]);
const [providerId, setProviderId] = useState([]);

    useEffect(() => {
        //on mount
        client
            .service("bookings")
            .get(urlParams.singleBookingsId, { query: { $populate: [            {
                path: "createdBy",
                service: "users",
                select: ["name"],
              },{
                path: "updatedBy",
                service: "users",
                select: ["name"],
              },"listingId","customerId","providerId"] }})
            .then((res) => {
                set_entity(res || {});
                const listingId = Array.isArray(res.listingId)
            ? res.listingId.map((elem) => ({ _id: elem._id, name: elem.name }))
            : res.listingId
                ? [{ _id: res.listingId._id, name: res.listingId.name }]
                : [];
        setListingId(listingId);
const customerId = Array.isArray(res.customerId)
            ? res.customerId.map((elem) => ({ _id: elem._id, name: elem.name }))
            : res.customerId
                ? [{ _id: res.customerId._id, name: res.customerId.name }]
                : [];
        setCustomerId(customerId);
const providerId = Array.isArray(res.providerId)
            ? res.providerId.map((elem) => ({ _id: elem._id, name: elem.name }))
            : res.providerId
                ? [{ _id: res.providerId._id, name: res.providerId.name }]
                : [];
        setProviderId(providerId);
            })
            .catch((error) => {
                console.log({ error });
                props.alert({ title: "Bookings", type: "error", message: error.message || "Failed get bookings" });
            });
    }, [props,urlParams.singleBookingsId]);


    const goBack = () => {
        navigate("/bookings");
    };

      const toggleHelpSidebar = () => {
    setHelpSidebarVisible(!isHelpSidebarVisible);
  };

  const copyPageLink = () => {
    const currentUrl = window.location.href;

    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        props.alert({
          title: "Link Copied",
          type: "success",
          message: "Page link copied to clipboard!",
        });
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        props.alert({
          title: "Error",
          type: "error",
          message: "Failed to copy page link.",
        });
      });
  };

    const menuItems = [
        {
            label: "Copy link",
            icon: "pi pi-copy",
            command: () => copyPageLink(),
        },
        {
            label: "Help",
            icon: "pi pi-question-circle",
            command: () => toggleHelpSidebar(),
        },
    ];

    return (
        <ProjectLayout>
        <div className="col-12 flex flex-column align-items-center">
            <div className="col-12">
                <div className="flex align-items-center justify-content-between">
                <div className="flex align-items-center">
                    <Button className="p-button-text" icon="pi pi-chevron-left" onClick={() => goBack()} />
                    <h3 className="m-0">Bookings</h3>
                    <SplitButton
                        model={menuItems.filter(
                        (m) => !(m.icon === "pi pi-trash" && items?.length === 0),
                        )}
                        dropdownIcon="pi pi-ellipsis-h"
                        buttonClassName="hidden"
                        menuButtonClassName="ml-1 p-button-text"
                    />
                </div>
                
                {/* <p>bookings/{urlParams.singleBookingsId}</p> */}
            </div>
            <div className="card w-full">
                <div className="grid ">

            <div className="col-12 md:col-6 lg:col-3"><label className="text-sm text-gray-600">BookingDate</label><p className="m-0 ml-3" ><Calendar id="bookingDate" value={new Date(_entity?.bookingDate)} disabled={true} hourFormat="12"   /></p></div>
<div className="col-12 md:col-6 lg:col-3"><label className="text-sm text-gray-600">Status</label><p className="m-0 ml-3" >{_entity?.status}</p></div>
<div className="col-12 md:col-6 lg:col-3"><label className="text-sm text-gray-600">Notes</label><p className="m-0 ml-3" >{_entity?.notes}</p></div>
            <div className="col-12 md:col-6 lg:col-3"><label className="text-sm text-gray-600">ListingId</label>
                    {listingId.map((elem) => (
                        <Link key={elem._id} to={`/listings/${elem._id}`}>
                        <div>
                  {" "}
                            <p className="text-xl text-primary">{elem.name}</p>
                            </div>
                        </Link>
                    ))}</div>
<div className="col-12 md:col-6 lg:col-3"><label className="text-sm text-gray-600">CustomerId</label>
                    {customerId.map((elem) => (
                        <Link key={elem._id} to={`/users/${elem._id}`}>
                        <div>
                  {" "}
                            <p className="text-xl text-primary">{elem.name}</p>
                            </div>
                        </Link>
                    ))}</div>
<div className="col-12 md:col-6 lg:col-3"><label className="text-sm text-gray-600">ProviderId</label>
                    {providerId.map((elem) => (
                        <Link key={elem._id} to={`/users/${elem._id}`}>
                        <div>
                  {" "}
                            <p className="text-xl text-primary">{elem.name}</p>
                            </div>
                        </Link>
                    ))}</div>

                    <div className="col-12">&nbsp;</div>
                </div>
            </div>
        </div>
        <div className="mt-2">
            <TabView>
                
                    <TabPanel header="true" leftIcon="pi pi-building-columns mr-2">
                    <ReviewsPage/>
                    </TabPanel>
                    
            </TabView>
        </div>

      <CommentsSection
        recordId={urlParams.singleBookingsId}
        user={props.user}
        alert={props.alert}
        serviceName="bookings"
      />
      <div
        id="rightsidebar"
        className={classNames("overlay-auto z-1 surface-overlay shadow-2 absolute right-0 w-20rem animation-duration-150 animation-ease-in-out", { "hidden" : !isHelpSidebarVisible })}
        style={{ top: "60px", height: "calc(100% - 60px)" }}
      >
        <div className="flex flex-column h-full p-4">
          <span className="text-xl font-medium text-900 mb-3">Help bar</span>
          <div className="border-2 border-dashed surface-border border-round surface-section flex-auto"></div>
        </div>
      </div>
      </div>
        </ProjectLayout>
    );
};

const mapState = (state) => {
    const { user, isLoggedIn } = state.auth;
    return { user, isLoggedIn };
};

const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(SingleBookingsPage);
