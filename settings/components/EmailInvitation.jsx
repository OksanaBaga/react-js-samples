import React, { Component } from 'react';
import { action, observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Row, Col } from 'react-bootstrap';

import { injectIntl, withExtendedRouter } from 'src/utils';
import { ModalDialog } from 'src/app/components';
import { EMAIL_PROVIDERS } from 'src/lib/consts';

import GoogleEmailInvitation from './GoogleEmailInvitation';
import ContactsList from './ContactsList';

@inject('ui')
@inject('auth')
@inject('common')
@inject('user')
@withExtendedRouter
@injectIntl
@observer
class EmailInvitation extends Component {
  componentDidMount() {
    this.props.user.clearList();
  }

  @action
  onSelectUser = (evt) => {
    const { target: { id: username } } = evt;
    if (this.usersToInvite.has(username)) {
      this.usersToInvite.delete(username);
    } else {
      this.usersToInvite.set(username);
    }
  };

  getContacts = provider => action(async () => {
    try {
      const { user: userStore } = this.props;
      userStore.clearList();
      await userStore
        .fetchEmailContacts({
          provider,
          accessToken: this.authData.get(provider).accessToken,
        });
      this.openInviteModal();
    } catch (error) {
      this.handleError(error);
    }
  });

  setAuthData = provider => action((authData) => {
    switch (provider) {
      // google return specific object as response
      // and mobx cannot mount observer
      case EMAIL_PROVIDERS.GOOGLE:
        authData = {
          accessToken: authData.accessToken,
          profileObj: authData.profileObj,
        };
        break;
      default:
        break;
    }
    this.authData.set(provider, authData);
  });

  openInviteModal = () => {
    const { props: { ui, intl } } = this;
    const customComponent = (
      <ModalDialog
        header={intl.formatMessage({ id: 'user.profile.settings.inviteUsers.selectContacts' })}
        body={
          <ContactsList
            usersToInvite={this.usersToInvite}
            onSelect={this.onSelectUser}
          />
        }
        confirmButtonText={intl.formatMessage({ id: 'user.profile.settings.inviteUsers.invite' })}
      />
    );

    ui.showConfirmationDialog({
      handler: this.handleInvite,
      custom: customComponent,
    });
  };

  handleInvite = async () => {
    if (this.usersToInvite.size > 0) {
      try {
        const { user: userStore, ui, intl } = this.props;
        await userStore.inviteUsersByEmail(this.usersToInvite.keys());
        userStore.clearList();
        ui.setLastResult(intl.formatMessage({ id: 'user.profile.settings.inviteUsers.success' }));
        this.usersToInvite.clear();
      } catch (error) {
        this.handleError(error);
      }
    }
  };

  handleError = (error) => {
    this.props.ui.setLastError(error);
  };

  @observable authData = new Map();
  @observable usersToInvite = new Map();

  renderProviders = () => Object
    .values(EMAIL_PROVIDERS)
    .map((provider) => {
      switch (provider) {
        case EMAIL_PROVIDERS.GOOGLE:
          return (
            <GoogleEmailInvitation
              key={provider}
              authData={this.authData.get(provider)}
              getContacts={this.getContacts(provider)}
              setAuthData={this.setAuthData(provider)}
              handleError={this.handleError}
            />
          );
        default:
          return null;
      }
    });

  render() {
    const { intl } = this.props;
    return (
      <React.Fragment>
        <h2 className="title">
          {intl.formatMessage({ id: 'user.profile.settings.inviteUsers.title' })}
        </h2>
        <Row>
          <Col md={4} className="bold pb-1">
            {intl.formatMessage({ id: 'user.profile.settings.inviteUsers.provider' })}
          </Col>
          <Col md={8}>
            {this.renderProviders()}
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default EmailInvitation;
