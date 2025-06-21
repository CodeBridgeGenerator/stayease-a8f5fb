import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import _ from "lodash";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { SplitButton } from "primereact/splitbutton";
import client from "../../../services/restClient";
import entityCreate from "../../../utils/entity";
import config from "../../../resources/config.json";
import standard from "../../../resources/standard.json";
import DownloadCSV from "../../../utils/DownloadCSV";
import AreYouSureDialog from "../../common/AreYouSureDialog";
import BookingsDatatable from "./BookingsDataTable";
import BookingsEditDialogComponent from "./BookingsEditDialogComponent";
import BookingsCreateDialogComponent from "./BookingsCreateDialogComponent";
import BookingsFakerDialogComponent from "./BookingsFakerDialogComponent";
import BookingsSeederDialogComponent from "./BookingsSeederDialogComponent";
import SortIcon from "../../../assets/media/Sort.png";
import FilterIcon from "../../../assets/media/Filter.png";
import { Dialog } from "primereact/dialog";
import { Rating } from "primereact/rating";
import { InputTextarea } from "primereact/inputtextarea";

const STATUS_TABS = [
  { label: "All Bookings", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_COLORS = {
  pending: "#fbbf24",
  "in progress": "#38bdf8",
  completed: "#22c55e",
  cancelled: "#ef4444",
};

const STATUS_LABELS = {
  pending: "Pending",
  "in progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const BookingsPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAreYouSureDialog, setShowAreYouSureDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newRecord, setRecord] = useState({});
    const [showFakerDialog, setShowFakerDialog] = useState(false);
    const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
    const [showSeederDialog, setShowSeederDialog] = useState(false);
    const [selectedEntityIndex, setSelectedEntityIndex] = useState(null);
    const [showUpload, setShowUpload] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [selectedFilterFields, setSelectedFilterFields] = useState([]);
    const [selectedHideFields, setSelectedHideFields] = useState([]);
    const [showColumns, setShowColumns] = useState(false);
    const [searchDialog, setSearchDialog] = useState(false);
    const [triggerDownload, setTriggerDownload] = useState(false);
    const urlParams = useParams();
    const filename = "bookings.csv";
    const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);
    const [initialData, setInitialData] = useState([]);
    const [selectedSortOption, setSelectedSortOption] = useState("");
    const [selectedDelete, setSelectedDelete] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [staffList, setStaffList] = useState([]);

    
    

    useEffect(() => {
        const _getSchema = async () => {
            const _schema = await props.getSchema("bookings");
            const _fields = _schema.data.map((field, i) => i > 5 && field.field);
            setSelectedHideFields(_fields);
          };
        _getSchema();
        if (location?.state?.action === "create") {
            entityCreate(location, setRecord);
            setShowCreateDialog(true);
          } else if (location?.state?.action === "edit") {
            setShowCreateDialog(true);
          }
      },[]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const bookingsRes = await client.service("bookings").find({
                    query: {
                        $limit: 10000,
                        listingId: urlParams.singleListingsId,
                        customerId: urlParams.singleUsersId,
                        providerId: urlParams.singleUsersId,
                        $populate: [
                            {
                                path: "createdBy",
                                service: "users",
                                select: ["name"],
                            },
                            {
                                path: "updatedBy",
                                service: "users",
                                select: ["name"],
                            },
                            {
                                path: "listingId",
                                service: "listings",
                                select: ["name"]
                            },
                            {
                                path: "customerId",
                                service: "users",
                                select: ["name"]
                            },
                            {
                                path: "providerId",
                                service: "users",
                                select: ["name"]
                            },
                            {
                                path: "reviewId",
                                service: "reviews"
                            }
                        ]
                    }
                });
                setData(bookingsRes.data);
            } catch (error) {
                console.error(error);
                props.alert({ title: "Bookings", type: "error", message: error.message || "Failed to get Bookings" });
            }
            setLoading(false);
        };
        fetchData();
    }, [showFakerDialog, showDeleteAllDialog, showEditDialog, showCreateDialog]);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await client.service("staffinfo").find({ query: {} });
                setStaffList(res.data || []);
            } catch {
                setStaffList([]);
            }
        };
        fetchStaff();
    }, []);

  const onClickSaveFilteredfields = (ff) => {
    console.log(ff);
  }

   
  const onClickSaveHiddenfields = (ff) => {
    console.log(ff);
  }


    const onEditRow = (rowData, rowIndex) => {
        setSelectedEntityIndex(rowData._id);
        setShowEditDialog(true);
    };

    const onCreateResult = (newEntity) => {
        setData([...data, newEntity]);
    };
    const onFakerCreateResults = (newEntities) => {
        setSelectedEntityIndex();
        setData([...data, ...newEntities]);
    };
    const onSeederResults = (newEntities) => {
        setSelectedEntityIndex();
        setData([...data, ...newEntities]);
    };

    const onEditResult = (newEntity) => {
        let _newData = _.cloneDeep(data);
        _.set(_newData, { _id : selectedEntityIndex},  newEntity);
        setData(_newData);
    };

    const deleteRow = async () => {
        try {
            await client.service("bookings").remove(selectedEntityIndex);
            let _newData = data.filter((data) => data._id !== selectedEntityIndex);
            setData(_newData);
            setSelectedEntityIndex();
            setShowAreYouSureDialog(false)
        } catch (error) {
            console.log({ error });
            props.alert({ title: "Bookings", type: "error", message: error.message || "Failed delete record" });
        }
    };
    const onRowDelete = (index) => {
        setSelectedEntityIndex(index);
        setShowAreYouSureDialog(true);
    };

    const onShowDeleteAll = (rowData, rowIndex) => {
        setShowDeleteAllDialog(true);
    };

    const deleteAll = async () => {
      setLoading(true);
      props.show();
        const countDataItems = data?.length;
        const promises = data.map((e) => client.service("bookings").remove(e._id));
        await Promise.all(
          promises.map((p) =>
            p.catch((error) => {
              props.alert({
                title: "Bookings",
                type: "error",
                message: error.message || "Failed to delete all records",
              });
              setLoading(false);
              props.hide();
              console.log({ error });
            })
          )
        );
        props.hide();
        setLoading(false);
        setShowDeleteAllDialog(false);
        await props.alert({
          title: "Bookings",
          type: "warn",
          message: `Successfully dropped ${countDataItems} records`,
        });
      };

    const onRowClick = ({data}) => {
        
        navigate(`/bookings/${data._id}`);
    };

    const menuItems = [
        {
          label: "Copy link",
          icon: "pi pi-copy",
          command: () => copyPageLink(),
        },
        // {
        //     label: "Share",
        //     icon: "pi pi-share-alt",
        //     command: () => setSearchDialog(true)
        // },
        {
          label: "Import",
          icon: "pi pi-upload",
          command: () => setShowUpload(true),
        },
        {
          label: "Export",
          icon: "pi pi-download",
          command: () => {
            // Trigger the download by setting the triggerDownload state
            data.length> 0 ? setTriggerDownload(true) : props.alert({title : "Export" , type: "warn", message : "no data to export"});
          },
        },
        {
          label: "Help",
          icon: "pi pi-question-circle",
          command: () => toggleHelpSidebar(),
        },
        { separator: true },
    
        {
          label: "Testing",
          icon: "pi pi-check-circle",
          items: [
            {
              label: "Faker",
              icon: "pi pi-bullseye",
              command: (e) => {
                setShowFakerDialog(true);
              },
              show: true,
            },
            {
              label: `Drop ${data?.length}`,
              icon: "pi pi-trash",
              command: (e) => {
                setShowDeleteAllDialog(true);
              },
            },
          ],
        },
        {
          label: "Data seeder",
          icon: "pi pi-database",
          command: (e) => {
            setShowSeederDialog(true);
          },
        },
      ];

      const onMenuSort = (sortOption) => {
        let sortedData;
        switch (sortOption) {
          case "nameAsc":
            sortedData = _.orderBy(data, ["name"], ["asc"]);
            break;
          case "nameDesc":
            sortedData = _.orderBy(data, ["name"], ["desc"]);
            break;
          case "createdAtAsc":
            sortedData = _.orderBy(data, ["createdAt"], ["asc"]);
            break;
          case "createdAtDesc":
            sortedData = _.orderBy(data, ["createdAt"], ["desc"]);
            break;
          default:
            sortedData = data;
        }
        setData(sortedData);
      };

      const filterMenuItems = [
        {
          label: `Filter`,
          icon: "pi pi-filter",
          command: () => setShowFilter(true),
        },
        {
          label: `Clear`,
          icon: "pi pi-filter-slash",
          command: () => setSelectedFilterFields([]),
        },
      ];
    
      const sortMenuItems = [
        {
          label: "Sort by",
          template: (item) => (
            <div
              style={{
                fontWeight: "bold",
                padding: "8px 16px",
                backgroundColor: "#ffffff",
                fontSize: "16px",
              }}
            >
              {item.label}
            </div>
          ),
          command: () => {},
        },
        { separator: true },
        { label: "Name Ascending", command: () => onMenuSort("nameAsc") },
        { label: "Name Descending", command: () => onMenuSort("nameDesc") },
        {
          label: "Created At Ascending",
          command: () => onMenuSort("createdAtAsc"),
        },
        {
          label: "Created At Descending",
          command: () => onMenuSort("createdAtDesc"),
        },
        {
          label: "Reset",
          command: () => setData(_.cloneDeep(initialData)), // Reset to original data if you want
          template: (item) => (
            <div
              style={{
                color: "#d30000",
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                padding: "8px 16px",
                fontSize: "13px",
              }}
            >
              {item.label}
            </div>
          ),
        },
      ];

    const filteredBookings =
      activeTab === "all"
        ? data
        : data.filter((b) => (b.status || "pending").toLowerCase() === activeTab);

    const getStatusBadge = (status) => (
      <span
        style={{
          background: STATUS_COLORS[status] || "#e5e7eb",
          color: status === "pending" ? "#b45309" : status === "in progress" ? "#0369a1" : status === "completed" ? "#15803d" : status === "cancelled" ? "#b91c1c" : "#222",
          padding: "4px 14px",
          borderRadius: 12,
          fontWeight: 600,
          fontSize: 14,
          marginRight: 8,
          display: "inline-block",
          boxShadow: "0 1px 4px #e0e7ef",
          letterSpacing: 0.5,
        }}
      >
        {STATUS_LABELS[status] || status}
      </span>
    );

    const getStatusMessage = (status, booking) => {
        const messageBoxStyle = {
            marginTop: 12,
            padding: '12px 18px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 15,
        };

      switch (status) {
        case "pending":
          return (
                    <div style={{ ...messageBoxStyle, background: '#fffbeb', color: '#b45309' }}>
                        Your booking is pending confirmation from the provider.
            </div>
          );
        case "in progress":
                let staffName = "-";
                if (booking.assignedStaff) {
                    if (typeof booking.assignedStaff === 'object' && booking.assignedStaff.name) {
                        staffName = booking.assignedStaff.name;
                    } else if (typeof booking.assignedStaff === 'string') {
                        const found = staffList.find(s => s._id === booking.assignedStaff);
                        if (found) staffName = found.name;
                    }
                }
          return (
                    <div style={{ ...messageBoxStyle, background: '#f0f9ff', color: '#0369a1' }}>
                        Your service is currently in progress<br />
                        <b>Staff assigned:</b> {staffName}<br />
                        <b>Time slot:</b> {booking.timeSlot || "-"}
            </div>
          );
        case "completed":
          return (
                    <div style={{ ...messageBoxStyle, background: '#f0fdf4', color: '#15803d' }}>
                        This service has been completed. We hope you enjoyed it!
            </div>
          );
        case "cancelled":
          return (
                    <div style={{ ...messageBoxStyle, background: '#fef2f2', color: '#b91c1c' }}>
                        This booking has been cancelled.
            </div>
          );
        default:
          return null;
      }
    };

    const renderBookingCard = (booking) => {
        const status = booking.status?.toLowerCase() || "pending";
        const review = booking.reviewId;
        let staffName = "-";
        if (booking.assignedStaff) {
            if (typeof booking.assignedStaff === 'object' && booking.assignedStaff.name) {
                staffName = booking.assignedStaff.name;
            } else if (typeof booking.assignedStaff === 'string') {
                const found = staffList.find(s => s._id === booking.assignedStaff);
                if (found) staffName = found.name;
            }
        }
        return (
            <div
                key={booking._id}
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    boxShadow: "0 2px 8px #e5e7ef",
                    padding: 28,
                    minWidth: 340,
                    maxWidth: 420,
                    marginBottom: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    border: `2px solid ${STATUS_COLORS[status] || "#e5e7eb"}`,
                    position: "relative",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    {getStatusBadge(status)}
                    <div style={{ color: "#888", fontSize: 14, fontWeight: 500, textAlign: "right" }}>
                        Booked on<br />
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "-"}
                    </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: "#222" }}>{booking.listingId?.name || "Service"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, color: "#2563eb" }}>
                        {booking.providerId?.name || "Provider"}
                    </div>
                    {booking.providerId?.rating && (
                        <span style={{ color: "#fbbf24", fontWeight: 600, fontSize: 15 }}>
                            ★ {booking.providerId.rating.toFixed(1)}
                        </span>
                    )}
                </div>
                <div style={{ color: "#666", fontSize: 15, marginBottom: 8 }}>
                    <div><b>Location</b>: {booking.location || "-"}</div>
                    <div><b>Date</b>: {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : "-"}</div>
                    <div><b>Assigned Staff</b>: {staffName}</div>
                    <div><b>Time Slot</b>: {booking.timeSlot || "-"}</div>
                </div>
                <div style={{ color: "#222", fontSize: 15, marginBottom: 8 }}>
                    <b>Notes</b>:<br />{booking.notes || "-"}
                </div>
                {getStatusMessage(status, booking)}
                {booking.hasReview && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0f9ff', borderRadius: 8 }}>
                        <h4 style={{ margin: 0, marginBottom: 4, color: '#0284c7' }}>Your Review</h4>
                        <Rating value={booking.rating} readOnly cancel={false} stars={5} />
                        <p style={{ margin: '4px 0 0 0', color: '#334155' }}>{booking.comment}</p>
                    </div>
                )}
                
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {status === "pending" && (
                        <Button label="Cancel" className="p-button-danger" onClick={(e) => { e.stopPropagation(); handleBookingAction(booking, "cancelled"); }} />
                    )}
                    {status === "completed" &&
                        (!booking.hasReview ? (
                            <Button
                                label="Leave a review"
                                icon="pi pi-star"
                                className="p-button-info"
                                onClick={() => {
                                    setRating(0);
                                    setReviewText("");
                                    setSelectedBooking(booking);
                                    setShowReviewModal(true);
                                }}
                            />
                        ) : (
                            <Button
                                label="Edit review"
                                icon="pi pi-pencil"
                                className="p-button-secondary p-button-outlined"
                                onClick={() => {
                                    setRating(booking.rating);
                                    setReviewText(booking.comment);
                                    setSelectedBooking(booking);
                                    setShowReviewModal(true);
                                }}
                            />
                        ))}
                </div>
            </div>
        );
    };

    const handleReviewSubmit = async () => {
        if (!selectedBooking || !rating) {
            props.alert({ type: "error", title: "Review", message: "Rating is required" });
            return;
        }
        try {
            setLoading(true);
            await client.service("bookings").patch(selectedBooking._id, {
                hasReview: true,
                rating,
                comment: reviewText,
            });

            const updatedData = data.map((b) => (b._id === selectedBooking._id ? { ...b, hasReview: true, rating, comment: reviewText } : b));
            setData(updatedData);

            props.alert({ type: "success", title: "Review", message: "Review submitted successfully" });
            setShowReviewModal(false);
            setRating(0);
            setReviewText("");
        } catch (error) {
            console.error("Failed to submit review:", error);
            props.alert({ type: "error", title: "Review", message: error.message || "Failed to submit review" });
        }
        setLoading(false);
    };

    const handleBookingAction = async (booking, newStatus) => {
        try {
            setLoading(true);
            await client.service("bookings").patch(booking._id, { status: newStatus });
            const updatedData = data.map((b) => (b._id === booking._id ? { ...b, status: newStatus } : b));
            setData(updatedData);
            props.alert({
                type: "success",
                title: "Booking Updated",
                message: `Booking has been moved to ${newStatus}`,
            });
        } catch (error) {
            console.error("Failed to update booking:", error);
            props.alert({ type: "error", title: "Update Failed", message: error.message || "Failed to update booking" });
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: "100vh", background: "#eaf4fb", padding: 0, margin: 0 }}>
            <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 0 0 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <h2 style={{ fontWeight: 800, fontSize: 28, margin: 0, color: "#222", letterSpacing: 0.5 }}>My Bookings</h2>
                    <button
                        style={{ background: "#38bdf8", color: "#fff", border: 0, borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px #bae6fd" }}
                        onClick={() => navigate("/services")}
                    >
                        + New Booking
                    </button>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            style={{
                                background: activeTab === tab.value ? "#2563eb" : "#f3f4f6",
                                color: activeTab === tab.value ? "#fff" : "#2563eb",
                                border: activeTab === tab.value ? "none" : "1.5px solid #dbeafe",
                                borderRadius: 8,
                                padding: "8px 22px",
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: "pointer",
                                boxShadow: activeTab === tab.value ? "0 2px 8px #e0e7ef" : "none",
                                transition: "all 0.2s",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                {loading ? (
                    <div style={{ textAlign: "center", padding: 40 }}>Loading...</div>
                ) : filteredBookings.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#888", padding: 40 }}>No bookings found.</div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(370px, 1fr))",
                        gap: "24px",
                        alignItems: "start",
                        marginBottom: 32,
                    }}>
                        {filteredBookings.map((booking) => renderBookingCard(booking))}
                    </div>
                )}
                {/* How Booking Works Section */}
                <div style={{ background: "#fff", borderRadius: 16, marginTop: 40, padding: 32, boxShadow: "0 2px 12px #e0e7ef", width: "100%", maxWidth: "100%" }}>
                    <h3 style={{ fontWeight: 800, fontSize: 22, marginBottom: 24, color: "#2563eb", textAlign: "left" }}>How Booking Works</h3>
                    <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "flex-start" }}>
                        <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                            <b>1. Create Booking</b>
                            <div style={{ color: "#666", fontSize: 15, marginTop: 6 }}>
                                Fill out the booking form with your service needs and preferred date
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                            <b>2. Connect via WhatsApp</b>
                            <div style={{ color: "#666", fontSize: 15, marginTop: 6 }}>
                                Communicate directly with service provider to confirm details
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                            <b>3. Mark as Completed</b>
                            <div style={{ color: "#666", fontSize: 15, marginTop: 6 }}>
                                Once service is done, mark the booking as completed in your dashboard
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
                            <b>4. Leave a Review</b>
                            <div style={{ color: "#666", fontSize: 15, marginTop: 6 }}>
                                Share your experience to help other homestay owners
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DownloadCSV
                data={data}
                fileName={filename}
                triggerDownload={triggerDownload}
            />
            <AreYouSureDialog header="Delete" body="Are you sure you want to delete this record?" show={showAreYouSureDialog} onHide={() => setShowAreYouSureDialog(false)} onYes={() => deleteRow()} />
            <BookingsEditDialogComponent entity={_.find(data,{ _id : selectedEntityIndex})} show={showEditDialog} onHide={() => setShowEditDialog(false)} onEditResult={onEditResult} />
            <BookingsCreateDialogComponent entity={newRecord} onCreateResult={onCreateResult} show={showCreateDialog} onHide={() => setShowCreateDialog(false)}  />
            <BookingsFakerDialogComponent show={showFakerDialog} onHide={() => setShowFakerDialog(false)} onFakerCreateResults={onFakerCreateResults} />
            <BookingsSeederDialogComponent show={showSeederDialog} onHide={() => setShowSeederDialog(false)} onSeederResults={onSeederResults} />
            <AreYouSureDialog header={`Drop ${data?.length} records`} body={`Are you sure you want to drop ${data?.length} records?`} show={showDeleteAllDialog} onHide={() => setShowDeleteAllDialog(false)} onYes={() => deleteAll()} loading={loading}/>
            <Dialog header="Leave a Review" visible={showReviewModal} style={{ width: "40vw" }} onHide={() => setShowReviewModal(false)}>
                <div className="p-fluid">
                    <div className="field">
                        <label htmlFor="rating">Rating</label>
                        <Rating value={rating} onChange={(e) => setRating(e.value)} stars={5} cancel={false} />
                    </div>
                    <div className="field">
                        <label htmlFor="comment">Comment</label>
                        <InputTextarea id="comment" value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={5} />
                    </div>
                </div>
                <div className="p-dialog-footer">
                    <Button label="Cancel" icon="pi pi-times" onClick={() => setShowReviewModal(false)} className="p-button-text" />
                    <Button label="Submit" icon="pi pi-check" onClick={handleReviewSubmit} loading={loading} />
                </div>
            </Dialog>
            <div
                id="rightsidebar"
                className={classNames(
                    "overlay-auto z-1 surface-overlay shadow-2 absolute right-0 w-20rem animation-duration-150 animation-ease-in-out",
                    { hidden: !isHelpSidebarVisible, block : isHelpSidebarVisible }
                )}
                style={{ top: "60px", height: "calc(100% - 60px)" }}
            >
                <div className="flex flex-column h-full p-4">
                    <span className="text-xl font-medium text-900 mb-3">Help bar</span>
                    <div className="border-2 border-dashed surface-border border-round surface-section flex-auto"></div>
                </div>
            </div>
        </div>
    );
};
const mapState = (state) => {
    const { user, isLoggedIn } = state.auth;
    return { user, isLoggedIn };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    getSchema: (serviceName) => dispatch.db.getSchema(serviceName),
    show: () => dispatch.loading.show(),
    hide: () => dispatch.loading.hide(),
    
});

export default connect(mapState, mapDispatch)(BookingsPage);
