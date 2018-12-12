import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button } from 'react-bootstrap';
import GoogleLogin from 'react-google-login';

import { injectIntl, PropTypes } from 'src/utils';

const scope = 'https://www.googleapis.com/auth/contacts.readonly';

@inject('common')
@inject('user')
@injectIntl
@observer
class GoogleEmailInvitation extends Component {
  static propTypes = {
    getContacts: PropTypes.func.isRequired,
    setAuthData: PropTypes.func.isRequired,
    handleError: PropTypes.func.isRequired,
    authData: PropTypes.shape({ accessToken: PropTypes.string }),
  };

  onSuccess = (authData) => {
    const { setAuthData, getContacts, user: userStore } = this.props;
    userStore.clearList();
    setAuthData(authData);
    return getContacts();
  };

  render() {
    const {
      intl,
      common: { snApps: { google: { appId } } },
      handleError, authData, getContacts,
    } = this.props;
    const { onSuccess } = this;
    return (
      authData
        ? <React.Fragment>
            <Button className="sn-btn btn-sm btn-bordered-black full-width" onClick={getContacts}>
              Gmail ({authData.profileObj.email})
            </Button>
            <GoogleLogin
              className="social-form"
              clientId={appId}
              style={{}}
              scope={scope}
              onSuccess={onSuccess}
              onFailure={handleError}
            >
              {intl.formatMessage({ id: 'user.profile.settings.inviteUsers.changeAccount' })}
            </GoogleLogin>
          </React.Fragment>
        : <GoogleLogin
            className="sn-btn btn-md btn-bordered-red"
            clientId={appId}
            style={{}}
            scope={scope}
            onSuccess={onSuccess}
            onFailure={handleError}
          >
            Gmail
          </GoogleLogin>
    );
  }
}

export default GoogleEmailInvitation;
