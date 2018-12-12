import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { injectIntl, withExtendedRouter, checkAuthParams, buildSnsUrl } from 'src/utils';
import { SN_TYPES } from 'src/lib/consts';
import { ModalDialog } from 'src/app/components';
import SnComponent from './SnComponent';
import LinkedAccountItem from './LinkedAccountItem';

const authTypes = Object.values(SN_TYPES);

@inject('ui')
@inject('auth')
@inject('common')
@withExtendedRouter
@injectIntl
@observer
class LinkedAccounts extends Component {
  componentDidMount() {
    const { location = {} } = this.props;
    const { query } = location;
    if (query && query.sn) {
      // link in process, SN redirected here with params in URL
      const result = checkAuthParams(this.props);
      if (result.isNotEmpty) {
        // only if authData is not empty
        return this.linkAccount(query.sn, result.authData);
      }
    }
  }

  localise = (key) => {
    const { intl } = this.props;
    return intl.formatMessage({ id: `user.profile.settings.connectedWithAccount.${key}` });
  };

  handleResponse = sn => (response) => {
    switch (sn) {
      case SN_TYPES.VK:
        return this.redirectToVk();
      case SN_TYPES.ESIA:
        return this.showConfirmationDialog();
      case SN_TYPES.LEADER_ID:
        return this.handleredirectToLD();
      default:
        // for google and facebook
        return this.linkAccount(sn, response);
    }
  };

  handleFailure = (error) => {
    this.props.ui.setLastError(error);
  };

  linkAccount = async (sn, data) => {
    try {
      const { auth: authStore } = this.props;
      await authStore.linkAccount(sn, { auth: data });
      await this.refreshProfile();
    } catch (error) {
      this.handleFailure(error);
    }
  };

  unlinkAccount = sn => async () => {
    try {
      const { auth: authStore } = this.props;
      await authStore.unlinkAccount(sn);
      await this.refreshProfile();
    } catch (error) {
      this.handleFailure(error);
    }
  };

  refreshProfile = async () => {
    try {
      const { auth } = this.props;
      await auth.refreshOwnProfile();
    } catch (error) {
      this.handleFailure(error);
    }
  };

  redirectToVk = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const { common: { snApps } } = this.props;
    const { vk: { appId } } = snApps;
    const redirectUri = `${window.location.origin}/settings?sn=vk`;
    const vkAuthUrl = 'https://oauth.vk.com/authorize?display=popup&' +
      `state=${encodeURIComponent(redirectUri)}&` +
      `client_id=${appId}&scope=email&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return window.location.replace(vkAuthUrl);
  };

  handleRedirectToEsia = async (submit) => {
    if (!submit || typeof window === 'undefined') {
      return;
    }
    const { common, auth: { basicAuth } } = this.props;
    const redirectUri = `${window.location.origin}/settings?sn=esia`;
    const authUrl = `//${common.backend}/init-esia-auth?authorization=${encodeURIComponent(basicAuth)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.replace(authUrl);
  };

  handleredirectToLD = () => {
    const { common: { backend }, auth: { basicAuth } } = this.props;
    const authUrl = buildSnsUrl({ snName: SN_TYPES.LEADER_ID, options: { basicAuth, backend } });

    if (typeof window === 'undefined' || !authUrl) {
      return;
    }

    window.location.replace(authUrl);
  };

  showConfirmationDialog = () => {
    const { ui, intl } = this.props;
    ui.showConfirmationDialog({
      custom: (
        <ModalDialog
          header={intl.formatMessage({ id: 'user.profile.settings.connectedWithAccount.modalEsia.title' })}
          body={
            <p>
              {intl.formatMessage({ id: 'user.profile.settings.connectedWithAccount.modalEsia.message' })}
            </p>
          }
          showCancelButton
          confirmButtonText={intl.formatMessage({ id: 'common.texts.yes' })}
          cancelButtonText={intl.formatMessage({ id: 'common.texts.no' })}
        />
      ),
      handler: this.handleRedirectToEsia,
    });
  };

  render() {
    const { auth: { user: { linkedAccounts = {} } } } = this.props;
    return (
      <React.Fragment>
        <h2 className="title">{this.localise('title')}</h2>
        <Row>
          <Col md={4} className="bold pb-1">{this.localise('connectedWith.title')}</Col>
          <Col md={8}>
            {
              authTypes.map(item => (Object.prototype.hasOwnProperty.call(linkedAccounts, item)
                ? <Button
                    key={item}
                    className="social-form"
                    onClick={this.unlinkAccount(item)}
                  >
                    <LinkedAccountItem sn={item} />
                  </Button>
                : <SnComponent
                    key={item}
                    sn={item}
                    onResponse={this.handleResponse(item)}
                    onFailure={this.handleFailure}
                  />
              ))
            }
            <div>
              {this.localise('ifManager')},&nbsp;
              <Link to="/register-company" className="btn-link red-link">
                {this.localise('readInstructions')}
              </Link>
            </div>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default LinkedAccounts;
