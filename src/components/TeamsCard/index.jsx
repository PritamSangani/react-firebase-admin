/* eslint-disable no-nested-ternary */
/* eslint-disable react/forbid-prop-types */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import ClipLoader from 'react-spinners/ClipLoader';
import Select from 'react-select';

import { useFormatMessage } from 'hooks';
import MediaCard from 'components/MediaCard';
import ConfirmationModal from 'components/ConfirmationModal';
import TeamModal from 'components/TeamModal';
import {
  deleteTeam,
  addUser,
  removeUser,
  fetchTeamUsers,
} from 'state/actions/teams';
import { closeModal, openModal } from 'utils';

import './TeamsCard.scss';

const TeamsCard = ({ isUser }) => {
  const {
    success,
    loading,
    isAdmin,
    deleted,
    teamId,
    usersList,
    dataList,
  } = useSelector(
    (state) => ({
      isAdmin: state.auth.userData.isAdmin,
      success: state.teams.success,
      loading: isUser ? state.teams.loadingUsers : state.teams.loadingTeams,
      deleted: state.teams.deleted,
      teamId: state.teams.teamId,
      usersList: state.users.data
        .filter((value) => !value.teams?.includes(state.teams.teamId))
        .map((value) => {
          return {
            label: value.name,
            value,
          };
        }),
      dataList: isUser ? state.teams.usersList : state.teams.teamsList,
    }),
    shallowEqual
  );

  const dispatch = useDispatch();

  const [search, setSearch] = useState('');

  const selectCustomStyles = {
    control: (provided) => ({
      ...provided,
      border: provided.border,
      boxShadow: 'none',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 40 }),
  };

  const data = search
    ? dataList.filter((el) => {
        const clonedElem = { ...el };
        delete clonedElem.id;
        delete clonedElem.isAdmin;
        delete clonedElem.logoUrl;
        delete clonedElem.teams;
        delete clonedElem.users;
        delete clonedElem.description;
        delete clonedElem.createdAt;
        delete clonedElem.createdBy;
        return Object.values(clonedElem).some((field) =>
          field.toLowerCase().includes(search.toLowerCase())
        );
      })
    : dataList;

  const availableTeamsMessage = useFormatMessage('TeamsCard.allTeams');

  const teamUsersMessage = useFormatMessage('TeamsCard.allUsers');

  const addTeamMessage = useFormatMessage('TeamsCard.addTeam');

  const addUserMessage = useFormatMessage('TeamsCard.addUser');

  const searchByMessage = useFormatMessage('TeamsCard.searchBy');

  const confirmMessage = useFormatMessage('TeamsCard.confirm');

  const deleteMessage = useFormatMessage('TeamsCard.delete');

  const permDeleteUserMessage = useFormatMessage('TeamsCard.permDeleteUser');

  const permDeleteTeamMessage = useFormatMessage('TeamsCard.permDeleteTeam');

  const cancelMessage = useFormatMessage('TeamsCard.cancel');

  const [deleteModal, setDeleteModal] = useState({
    id: null,
    isOpen: false,
  });

  const [addModal, setAddModal] = useState({
    id: null,
    isOpen: false,
  });

  const [isEditing, setIsEditing] = useState(false);

  const onCloseDeleteModalHandler = () => {
    closeModal(setDeleteModal);
    setIsEditing(false);
  };

  const onCloseAddModalHandler = () => {
    closeModal(setAddModal);
    setIsEditing(false);
  };

  useEffect(() => {
    if (deleted && !loading) {
      onCloseDeleteModalHandler();
    }
  }, [deleted, loading]);

  useEffect(() => {
    if (success && !loading) {
      onCloseAddModalHandler();
    }
  }, [success, loading]);

  const onRemoveButtonClickHandler = (id) => {
    openModal(setDeleteModal, id);
  };

  const onAddButtonClickHandler = (id) => {
    openModal(setAddModal, id);
  };

  const onModifyButtonClickHandler = (id) => {
    openModal(setAddModal, id);
    setIsEditing(true);
  };

  const onDeleteHandler = () => {
    const { id } = deleteModal;
    if (isUser) {
      dispatch(removeUser(teamId, id));
    } else {
      dispatch(deleteTeam(id));
      const team = dataList.find((value) => value.id !== id);
      if (team) {
        dispatch(fetchTeamUsers(team.id));
      }
    }
  };

  const onAddHandler = (value) => {
    dispatch(addUser(teamId, value));
  };

  return (
    <>
      {deleteModal.isOpen && (
        <ConfirmationModal
          isActive={deleteModal.isOpen}
          isLoading={loading}
          confirmButtonMessage={deleteMessage}
          title={confirmMessage}
          body={isUser ? permDeleteUserMessage : permDeleteTeamMessage}
          cancelButtonMessage={cancelMessage}
          onConfirmation={onDeleteHandler}
          onCancel={onCloseDeleteModalHandler}
        />
      )}
      {addModal.isOpen && (
        <TeamModal
          isActive={addModal.isOpen}
          onCancel={onCloseAddModalHandler}
          isEditing={isEditing}
        />
      )}
      <div className="card has-height-medium">
        <header className="card-header">
          <p className="card-header-title">
            <span className="icon">
              {isUser ? (
                <i className="mdi mdi-account-supervisor default" />
              ) : (
                <i className="mdi mdi-account-group default" />
              )}
            </span>
            <span>{!isUser ? availableTeamsMessage : teamUsersMessage}</span>
          </p>
          {isAdmin && !isUser && (
            <button
              type="button"
              className="button"
              onClick={onAddButtonClickHandler}
            >
              <span className="icon">
                <i className="mdi mdi-account-multiple-plus default" />
              </span>
              <span>{addTeamMessage}</span>
            </button>
          )}
        </header>
        <div>
          <div className="field-body">
            <div className="field">
              <div className="control is-expanded">
                <input
                  placeholder={searchByMessage}
                  type="text"
                  className="input search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <div className="control is-expanded">
                <div style={{ minWidth: '220px' }}>
                  {isUser && isAdmin && (
                    <Select
                      options={usersList}
                      placeholder={addUserMessage}
                      isClearable
                      onChange={(selectedInput) => {
                        onAddHandler(selectedInput.value);
                      }}
                      value={[]}
                      styles={selectCustomStyles}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="card-content ps ps--active-y"
          style={{
            padding: '0px 1.5rem',
            overflow: 'auto',
            maxHeight: '700px',
          }}
        >
          {loading ? (
            <ClipLoader />
          ) : (
            <div className="media-list">
              {data &&
                data.map((value) => (
                  <MediaCard
                    content={value}
                    key={value.id}
                    onDeleteHandler={onRemoveButtonClickHandler}
                    onModifyHandler={onModifyButtonClickHandler}
                    isUser={isUser}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

TeamsCard.propTypes = {
  isUser: PropTypes.bool,
};

TeamsCard.defaultProps = {
  isUser: false,
};

export default TeamsCard;
