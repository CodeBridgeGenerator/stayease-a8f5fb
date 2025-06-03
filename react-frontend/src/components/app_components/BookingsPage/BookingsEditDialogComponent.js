import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from 'primereact/tag';
import moment from "moment";
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';


const getSchemaValidationErrorsStrings = (errorObj) => {
    let errMsg = {};
    for (const key in errorObj.errors) {
        if (Object.hasOwnProperty.call(errorObj.errors, key)) {
            const element = errorObj.errors[key];
            if (element?.message) {
                errMsg.push(element.message);
            }
        }
    }
    return errMsg.length ? errMsg : errorObj.message ? errorObj.message : null;
};

const BookingsCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [listingId, setListingId] = useState([])
const [customerId, setCustomerId] = useState([])
const [providerId, setProviderId] = useState([])

    useEffect(() => {
        set_entity(props.entity);
    }, [props.entity, props.show]);

     useEffect(() => {
                    //on mount listings
                    client
                        .service("listings")
                        .find({ query: { $limit: 10000, $sort: { createdAt: -1 }, _id : urlParams.singleListingsId } })
                        .then((res) => {
                            setListingId(res.data.map((e) => { return { name: e['name'], value: e._id }}));
                        })
                        .catch((error) => {
                            console.log({ error });
                            props.alert({ title: "Listings", type: "error", message: error.message || "Failed get listings" });
                        });
                }, []);
 useEffect(() => {
                    //on mount users
                    client
                        .service("users")
                        .find({ query: { $limit: 10000, $sort: { createdAt: -1 }, _id : urlParams.singleUsersId } })
                        .then((res) => {
                            setCustomerId(res.data.map((e) => { return { name: e['name'], value: e._id }}));
                        })
                        .catch((error) => {
                            console.log({ error });
                            props.alert({ title: "Users", type: "error", message: error.message || "Failed get users" });
                        });
                }, []);

    const onSave = async () => {
        let _data = {
            listingId: _entity?.listingId?._id,
customerId: _entity?.customerId?._id,
providerId: _entity?.providerId?._id,
bookingDate: _entity?.bookingDate,
status: _entity?.status,
notes: _entity?.notes,
        };

        setLoading(true);
        try {
            
        await client.service("bookings").patch(_entity._id, _data);
        const eagerResult = await client
            .service("bookings")
            .find({ query: { $limit: 10000 ,  _id :  { $in :[_entity._id]}, $populate : [
                {
                    path : "listingId",
                    service : "listings",
                    select:["name"]},{
                    path : "customerId",
                    service : "users",
                    select:["name"]}
            ] }});
        props.onHide();
        props.alert({ type: "success", title: "Edit info", message: "Info bookings updated successfully" });
        props.onEditResult(eagerResult.data[0]);
        } catch (error) {
            console.log("error", error);
            setError(getSchemaValidationErrorsStrings(error) || "Failed to update info");
            props.alert({ type: "error", title: "Edit info", message: "Failed to update info" });
        }
        setLoading(false);
    };

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="save" className="p-button-text no-focus-effect" onClick={onSave} loading={loading} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    const setValByKey = (key, val) => {
        let new_entity = { ..._entity, [key]: val };
        set_entity(new_entity);
        setError({});
    };

    const listingIdOptions = listingId.map((elem) => ({ name: elem.name, value: elem.value }));
const customerIdOptions = customerId.map((elem) => ({ name: elem.name, value: elem.value }));
const providerIdOptions = providerId.map((elem) => ({ name: elem.name, value: elem.value }));

    return (
        <Dialog header="Edit Bookings" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: "40vw" }} className="min-w-max scalein animation-ease-in-out animation-duration-1000" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto"
            style={{ maxWidth: "55vw" }} role="bookings-edit-dialog-component">
                <div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="listingId">ListingId:</label>
                <Dropdown id="listingId" value={_entity?.listingId?._id} optionLabel="name" optionValue="value" options={listingIdOptions} onChange={(e) => setValByKey("listingId", {_id : e.value})}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["listingId"]) && (
              <p className="m-0" key="error-listingId">
                {error["listingId"]}
              </p>
            )}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="customerId">CustomerId:</label>
                <Dropdown id="customerId" value={_entity?.customerId?._id} optionLabel="name" optionValue="value" options={customerIdOptions} onChange={(e) => setValByKey("customerId", {_id : e.value})}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["customerId"]) && (
              <p className="m-0" key="error-customerId">
                {error["customerId"]}
              </p>
            )}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="providerId">ProviderId:</label>
                <Dropdown id="providerId" value={_entity?.providerId?._id} optionLabel="name" optionValue="value" options={providerIdOptions} onChange={(e) => setValByKey("providerId", {_id : e.value})}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["providerId"]) && (
              <p className="m-0" key="error-providerId">
                {error["providerId"]}
              </p>
            )}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="bookingDate">BookingDate:</label>
                <Calendar id="bookingDate" value={_entity?.bookingDate ? new Date(_entity?.bookingDate) : null} onChange={ (e) => setValByKey("bookingDate", e.value)} showTime hourFormat="24"  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["bookingDate"]) && (
              <p className="m-0" key="error-bookingDate">
                {error["bookingDate"]}
              </p>
            )}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="status">Status:</label>
                <InputText id="status" className="w-full mb-3 p-inputtext-sm" value={_entity?.status} onChange={(e) => setValByKey("status", e.target.value)}  required  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["status"]) && (
              <p className="m-0" key="error-status">
                {error["status"]}
              </p>
            )}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="notes">Notes:</label>
                <InputText id="notes" className="w-full mb-3 p-inputtext-sm" value={_entity?.notes} onChange={(e) => setValByKey("notes", e.target.value)}  required  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["notes"]) && (
              <p className="m-0" key="error-notes">
                {error["notes"]}
              </p>
            )}
          </small>
            </div>
                <div className="col-12">&nbsp;</div>
                <small className="p-error">
                {Array.isArray(Object.keys(error))
                ? Object.keys(error).map((e, i) => (
                    <p className="m-0" key={i}>
                        {e}: {error[e]}
                    </p>
                    ))
                : error}
            </small>
            </div>
        </Dialog>
    );
};

const mapState = (state) => {
    const { user } = state.auth;
    return { user };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(BookingsCreateDialogComponent);
