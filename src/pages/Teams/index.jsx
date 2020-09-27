import React, { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { useFormatMessage } from 'hooks';
import TeamsCard from 'components/TeamsCard';
import { fetchTeams, teamsCleanUp, fetchTeamUsers } from 'state/actions/teams';
import { fetchUsers, usersCleanUp } from 'state/actions/users';

const Teams = () => {
  const { userData, teamId, teamsList } = useSelector(
    (state) => ({
      userData: state.auth.userData,
      teamsList: state.teams.teamsList,
      teamId: state.teams.teamId,
    }),
    shallowEqual
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!teamId && teamsList.length) {
      const newTeamId = teamsList[0].id;
      dispatch(fetchTeamUsers(newTeamId));
    }
  }, [dispatch, teamId, teamsList]);

  useEffect(() => {
    dispatch(fetchTeams());

    if (userData.isAdmin) {
      dispatch(fetchUsers());
    }

    return () => {
      dispatch(teamsCleanUp());
      dispatch(usersCleanUp());
    };
  }, [dispatch, userData]);

  return (
    <>
      <section className="hero is-hero-bar">
        <div className="hero-body">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h1 className="title">{useFormatMessage('Teams.teams')}</h1>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section is-main-section">
        <div className="columns is-desktop">
          <div className="column">
            <TeamsCard />
          </div>
          <div className="column">
            <TeamsCard isUser />
          </div>
        </div>
      </section>
    </>
  );
};

export default Teams;
