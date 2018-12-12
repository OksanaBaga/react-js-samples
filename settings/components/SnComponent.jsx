import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Button } from 'react-bootstrap';
import { FacebookLogin } from 'react-facebook-login-component';
import GoogleLogin from 'react-google-login';

import { injectIntl, PropTypes } from 'src/utils';
import { SN_TYPES } from 'src/lib/consts';
import LinkedAccountItem from './LinkedAccountItem';

@inject('common')
@injectIntl
@observer
class SnComponent extends Component {
  static propTypes = {
    sn: PropTypes.string.isRequired,
    onResponse: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
  };

  render() {
    const { intl, common: { snApps }, sn, onResponse, onFailure } = this.props;
    const { appId } = snApps[sn];
    switch (sn) {
      case SN_TYPES.FACEBOOK:
        return (
          <div>
            <FacebookLogin
              className="social-form"
              socialId={appId}
              language={intl.locale}
              scope="public_profile,email"
              xfbml
              fields="name,email"
              version="v2.5"
              responseHandler={onResponse}
            >
              <LinkedAccountItem sn={sn} />
            </FacebookLogin>
          </div>
        );
      case SN_TYPES.GOOGLE:
        return (
          <div>
            <GoogleLogin
              className="social-form"
              clientId={appId}
              style={{}}
              onSuccess={onResponse}
              onFailure={onFailure}
            >
              <LinkedAccountItem sn={sn} />
            </GoogleLogin>
          </div>
        );
      case SN_TYPES.VK:
        return (
          <div>
            <Button
              className="social-form"
              onClick={onResponse}
            >
              <LinkedAccountItem sn={sn} />
            </Button>
          </div>
        );
      case SN_TYPES.ESIA:
        return (
          <div>
            <Button
              className="social-form"
              onClick={onResponse}
            >
              <LinkedAccountItem sn={sn} />
            </Button>
          </div>
        );
      case SN_TYPES.LEADER_ID:
        return (
          <div>
            <Button
              className="social-form"
              onClick={onResponse}
            >
              <LinkedAccountItem sn={sn} />
            </Button>
          </div>
        );
      default:
        return null;
    }
  }
}

export default SnComponent;
