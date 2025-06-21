import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import client from "../../../services/restClient";
import axios from "axios";
import _ from "lodash";
import entityCreate from "../../../utils/entity";
import { Button } from "primereact/button";
import { SplitButton } from "primereact/splitbutton";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { MultiSelect } from "primereact/multiselect";
import { toast } from "react-toastify";

import AreYouSureDialog from "../../common/AreYouSureDialog";
import UsersDatatable from "./UsersDatatable";
import UsersEditDialogComponent from "./UsersEditDialogComponent";
import UsersCreateDialogComponent from "./UsersCreateDialogComponent";
import UsersFakerDialogComponent from "./UsersFakerDialogComponent";
import UsersSeederDialogComponent from "./UsersSeederDialogComponent";
import SortIcon from "../../../assets/media/Sort.png";
import FilterIcon from "../../../assets/media/Filter.png";
import StaffListDialog from './StaffListDialog';
import { getUsers, deleteUser, createUser, updateUser } from "../../../actions/userActions";

const UsersPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [fields, setFields] = useState([]);
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
  const urlParams = useParams();
  const filename = "users.csv";
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const _getSchema = async () => {
      const _schema = await props.getSchema("users");
      let _fields = _schema.data.map((field, i) => i > 5 && field.field);
      setSelectedHideFields(_fields);
      _fields = _schema.data.map((field, i) => {
        return {
          name: field.field,
          value: field.field,
          type: field?.properties?.type,
        };
      });
      setFields(_fields);
    };
    _getSchema();
    if (location?.state?.action === "create") {
      entityCreate(location, setRecord);
      setShowCreateDialog(true);
    } else if (location?.state?.action === "edit") {
      setShowCreateDialog(true);
    }
  }, []);

  useEffect(() => {
    //on mount
    client
      .service("users")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          $populate: [],
        },
      })
      .then((res) => {
        let results = res.data;
        setData(results);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error fetching users");
      });
  }, []);

  const onClickSaveFilteredfields = (ff) => {
    console.log(ff);
  };

  const onClickSaveHiddenfields = (ff) => {
    console.log(ff);
  };

  const onEditRow = (rowData, rowIndex) => {
    setSelectedUser(rowData);
    setShowEditDialog(true);
  };

  const onCreateResult = (newEntity) => {
    setData([newEntity, ...data]);
  };

  const onFakerCreateResults = (newEntities) => {
    setSelected([]);
    setData([...newEntities, ...data]);
  };

  const onSeederResults = (newEntities) => {
    setSelected([]);
    setData([...newEntities, ...data]);
  };

  const onEditResult = (newEntity) => {
    let _data = [...data];
    const index = _data.findIndex((item) => item._id === newEntity._id);
    _data[index] = newEntity;
    setData(_data);
  };

  const onRowDelete = (rowData, rowIndex) => {
    setSelected([rowData]);
    setShowAreYouSureDialog(true);
  };

  const onRowClick = (e) => {
    navigate(`/users/${e.data._id}`);
  };

  const onMultiDelete = () => {
    setShowAreYouSureDialog(true);
  };

  const onHideAreYouSureDialog = () => {
    setShowAreYouSureDialog(false);
  };

  const onHideEditDialog = () => {
    setShowEditDialog(false);
  };

  const onHideCreateDialog = () => {
    setShowCreateDialog(false);
  };

  const onHideFakerDialog = () => {
    setShowFakerDialog(false);
  };

  const onHideSeederDialog = () => {
    setShowSeederDialog(false);
  };

  const onHandleStaffClick = (user) => {
    setSelectedUser(user);
    setShowStaffDialog(true);
  };

  const deleteAll = () => {
    const promises = selected.map((user) =>
      client.service("users").remove(user._id)
    );
    Promise.all(promises)
      .then(() => {
        const newData = data.filter(
          (item) => !selected.some((s) => s._id === item._id)
        );
        setData(newData);
        setSelected([]);
        toast.success("Successfully deleted selected users");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error deleting selected users");
      });
    setShowAreYouSureDialog(false);
  };

  const pCreatedAt = (rowData, { rowIndex }) => {
    return <p>{rowData.createdAt}</p>;
  };

  const pUpdatedAt = (rowData, { rowIndex }) => {
    return <p>{rowData.updatedAt}</p>;
  };

  const pRole = (rowData, { rowIndex }) => {
    return <p>{rowData.role}</p>;
  };

  const pName = (rowData, { rowIndex }) => {
    return <p>{rowData.name}</p>;
  };

  const pEmail = (rowData, { rowIndex }) => {
    return <p>{rowData.email}</p>;
  };

  const paginatorLeft = (
    <Button
      type="button"
      icon="pi pi-refresh"
      className="p-button-text"
      onClick={() => {
        /* Refresh data logic */
      }}
    />
  );

  const paginatorRight = (
    <Button
      type="button"
      icon="pi pi-cloud"
      className="p-button-text"
      onClick={() => {
        /* Export data logic */
      }}
    />
  );

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
        data.length > 0
          ? setTriggerDownload(true)
          : props.alert({
              title: "Export",
              type: "warn",
              message: "no data to export",
            });
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

  return (
    <div className="mt-5">
      <div className="grid">
        <div className="col-6 flex justify-content-start">
          <h4 className="mb-0 ml-2">
            <span>
              {" "}
              <small>Users</small> /{" "}
            </span>
            <strong>User Lists </strong>
          </h4>
          <SplitButton
            model={menuItems.filter(
              (m) => !(m.icon === "pi pi-trash" && selected?.length === 0),
            )}
            dropdownIcon="pi pi-ellipsis-h"
            buttonClassName="hidden"
            menuButtonClassName="ml-1 p-button-text"
          />
        </div>
        <div className="col-6 flex justify-content-end">
          <>
          {" "}
            <SplitButton
              model={filterMenuItems.filter(
                (m) => !(m.icon === "pi pi-trash" && data?.length === 0),
              )}
              dropdownIcon={
                <img
                  src={FilterIcon}
                  style={{ marginRight: "4px", width: "1em", height: "1em" }}
                />
              }
              buttonClassName="hidden"
              menuButtonClassName="ml-1 p-button-text"
              // menuStyle={{ width: "250px" }}
            ></SplitButton>
            <SplitButton
              model={sortMenuItems.filter(
                (m) => !(m.icon === "pi pi-trash" && data?.length === 0),
              )}
              dropdownIcon={
                <img
                  src={SortIcon}
                  style={{ marginRight: "4px", width: "1em", height: "1em" }}
                />
              }
              buttonClassName="hidden"
              menuButtonClassName="ml-1 p-button-text"
              menuStyle={{ width: "200px" }}
            ></SplitButton>
            <Button
              label="add"
              style={{ height: "30px" }}
              rounded
              loading={loading}
              icon="pi pi-plus"
              onClick={() => setShowCreateDialog(true)}
              role="steps-add-button"
            />
            <Button
              label="Delete"
              icon="pi pi-trash"
              onClick={onMultiDelete}
              disabled={selected.length === 0}
              className="p-button-danger"
            />
          </>
        </div>
      </div>
      <div className="grid align-items-center">
        <div className="col-12" role="users-datatable">
          <UsersDatatable
            items={data}
            selected={selected}
            setSelected={setSelected}
            onEditRow={onEditRow}
            onRowDelete={onRowDelete}
            onRowClick={onRowClick}
            onHandleStaffClick={onHandleStaffClick}
          />
        </div>
      </div>
      <AreYouSureDialog
        header="Delete"
        body="Are you sure you want to delete the selected user(s)?"
        show={showAreYouSureDialog}
        onHide={onHideAreYouSureDialog}
        onYes={deleteAll}
      />
      <UsersEditDialogComponent
        show={showEditDialog}
        onHide={onHideEditDialog}
        user={selectedUser}
        onEditResult={onEditResult}
      />
      <UsersCreateDialogComponent
        show={showCreateDialog}
        onHide={onHideCreateDialog}
        onCreateResult={onCreateResult}
      />
      <UsersFakerDialogComponent
        show={showFakerDialog}
        onHide={onHideFakerDialog}
        onFakerCreateResults={onFakerCreateResults}
      />
      <UsersSeederDialogComponent
        show={showSeederDialog}
        onHide={onHideSeederDialog}
        onSeederResults={onSeederResults}
      />
      <StaffListDialog
        providerId={selectedUser?._id}
        visible={showStaffDialog}
        onHide={() => setShowStaffDialog(false)}
      />
    </div>
  );
};
const mapState = (state) => {
  const { user, isLoggedIn } = state.auth;
  return { user, isLoggedIn };
};
const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
  setOneUser: (id) => dispatch.user.setOneUser(id),
  getSchema: (serviceName) => dispatch.db.getSchema(serviceName),
  getUsers,
  deleteUser,
  createUser,
  updateUser,
});

export default connect(mapState, mapDispatch)(UsersPage);
