import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import initilization from "../../../utils/init";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";


const getSchemaValidationErrorsStrings = (errorObj) => {
    let errMsg = {};
    for (const key in errorObj.errors) {
      if (Object.hasOwnProperty.call(errorObj.errors, key)) {
        const element = errorObj.errors[key];
        if (element?.message) {
          errMsg[key] = element.message;
        }
      }
    }
    return errMsg.length ? errMsg : errorObj.message ? { error : errorObj.message} : {};
};

const ReviewsCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [bookingId, setBookingId] = useState([])
const [customerId, setCustomerId] = useState([])
const [providerId, setProviderId] = useState([])

    useEffect(() => {
        let init  = {};
        if (!_.isEmpty(props?.entity)) {
            init = initilization({ ...props?.entity, ...init }, [bookingId,customerId,providerId], setError);
        }
        set_entity({...init});
        setError({});
    }, [props.show]);

    const validate = () => {
        let ret = true;
        const error = {};
          
            if (_.isEmpty(_entity?.comment)) {
                error["comment"] = `Comment field is required`;
                ret = false;
            }
        if (!ret) setError(error);
        return ret;
    }

    const onSave = async () => {
        if(!validate()) return;
        let _data = {
            bookingId: _entity?.bookingId?._id,customerId: _entity?.customerId?._id,providerId: _entity?.providerId?._id,rating: _entity?.rating,comment: _entity?.comment,
            createdBy: props.user._id,
            updatedBy: props.user._id
        };

        setLoading(true);

        try {
            
        const result = await client.service("reviews").create(_data);
        const eagerResult = await client
            .service("reviews")
            .find({ query: { $limit: 10000 ,  _id :  { $in :[result._id]}, $populate : [
                {
                    path : "bookingId",
                    service : "bookings",
                    select:["bookingDate"]},{
                    path : "customerId",
                    service : "users",
                    select:["name"]}
            ] }});
        props.onHide();
        props.alert({ type: "success", title: "Create info", message: "Info Reviews updated successfully" });
        props.onCreateResult(eagerResult.data[0]);
        } catch (error) {
            console.log("error", error);
            setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
            props.alert({ type: "error", title: "Create", message: "Failed to create in Reviews" });
        }
        setLoading(false);
    };

    

    

    useEffect(() => {
                    // on mount bookings
                    client
                        .service("bookings")
                        .find({ query: { $limit: 10000, $sort: { createdAt: -1 }, _id : urlParams.singleBookingsId } })
                        .then((res) => {
                            setBookingId(res.data.map((e) => { return { name: e['bookingDate'], value: e._id }}));
                        })
                        .catch((error) => {
                            console.log({ error });
                            props.alert({ title: "Bookings", type: "error", message: error.message || "Failed get bookings" });
                        });
                }, []);

useEffect(() => {
                    // on mount users
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

    const bookingIdOptions = bookingId.map((elem) => ({ name: elem.name, value: elem.value }));
const customerIdOptions = customerId.map((elem) => ({ name: elem.name, value: elem.value }));
const providerIdOptions = providerId.map((elem) => ({ name: elem.name, value: elem.value }));

    return (
        <Dialog header="Create Reviews" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: "40vw" }} className="min-w-max scalein animation-ease-in-out animation-duration-1000" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto"
            style={{ maxWidth: "55vw" }} role="reviews-create-dialog-component">
            <div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="bookingId">BookingId:</label>
                <Dropdown id="bookingId" value={_entity?.bookingId?._id} optionLabel="name" optionValue="value" options={bookingIdOptions} onChange={(e) => setValByKey("bookingId", {_id : e.value})}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["bookingId"]) ? (
              <p className="m-0" key="error-bookingId">
                {error["bookingId"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="customerId">CustomerId:</label>
                <Dropdown id="customerId" value={_entity?.customerId?._id} optionLabel="name" optionValue="value" options={customerIdOptions} onChange={(e) => setValByKey("customerId", {_id : e.value})}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["customerId"]) ? (
              <p className="m-0" key="error-customerId">
                {error["customerId"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="providerId">ProviderId:</label>
                <Dropdown id="providerId" value={_entity?.providerId?._id} optionLabel="name" optionValue="value" options={providerIdOptions} onChange={(e) => setValByKey("providerId", {_id : e.value})}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["providerId"]) ? (
              <p className="m-0" key="error-providerId">
                {error["providerId"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="rating">Rating:</label>
                <InputNumber id="rating" className="w-full mb-3 p-inputtext-sm" value={_entity?.rating} onChange={(e) => setValByKey("rating", e.value)}  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["rating"]) ? (
              <p className="m-0" key="error-rating">
                {error["rating"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="comment">Comment:</label>
                <InputText id="comment" className="w-full mb-3 p-inputtext-sm" value={_entity?.comment} onChange={(e) => setValByKey("comment", e.target.value)}  required  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["comment"]) ? (
              <p className="m-0" key="error-comment">
                {error["comment"]}
              </p>
            ) : null}
          </small>
            </div>
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

export default connect(mapState, mapDispatch)(ReviewsCreateDialogComponent);
